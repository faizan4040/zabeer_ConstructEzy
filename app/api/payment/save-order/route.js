import { isAuthenticated } from "@/lib/authentication";
import { orderNotification } from "@/email/orderNotification";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import { prepareOrderItems } from "@/lib/orderDelivery";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import z from "zod";

export async function POST(request) {
    try{
       
    await connectDB()
    const auth = await isAuthenticated('customer')
    const payload = await request.json()

    const productSchema = z.object({
        productId: z.string().length(24, 'Invalid product id format'),
        variantId: z.string().length(24, 'Invalid variant id format'),
        name: z.string().min(1),
        qty: z.number().min(1),
        mrp: z.number().nonnegative(),
        sellingPrice: z.number().nonnegative(),
        isSample: z.boolean().optional().default(false),
        customSize: z.object({ height: z.number(), width: z.number(), unit: z.string().optional() }).optional().nullable()
    })

    const orderSchema = zSchema.pick({
        name: true, email: true, phone: true, address: true, country: true, state: true, city: true,
        pincode: true, landmark:true, ordernote: true
    }).extend({
        userId: z.string().optional(),
        razorpay_payment_id: z.string().min(3, 'Payment id is required.'),
        razorpay_order_id: z.string().min(3, 'Order id is required.'),
        razorpay_signature: z.string().min(3, 'Signature id is required.'),
        subtotal: z.number().nonnegative(),
        discount: z.number().nonnegative(),
        couponDiscount: z.number().nonnegative(),
        totalAmount: z.number().nonnegative(),
        deliveryCharge: z.number().nonnegative().optional().default(0),
        customerLocation: z.object({ lat: z.number(), lng: z.number() }).optional().nullable(),
        products: z.array(productSchema)
    })

    const validate = orderSchema.safeParse(payload)
    if(!validate.success) {
        return response(false, 400, 'Invalid or missing fields.', {error: validate.error})
    }


    const validateData = validate.data 

    // payment verification
    const verification = validatePaymentVerification({
        order_id: validateData.razorpay_order_id,
        payment_id: validateData.razorpay_payment_id,
    },validateData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

    let paymentVerification = false
    if(verification) {
        paymentVerification = true
    }

    const initialStatus = paymentVerification ? 'on_hold' : 'unverified'

    // Sample/return rules + server-side delivery charge. Payment ho chuka hai,
    // isliye strict=false — yahan order kabhi fail nahi karte.
    const fullAddress = `${validateData.address}, ${validateData.city}, ${validateData.state} ${validateData.pincode}, India`
    const prepared = await prepareOrderItems({
        products: validateData.products,
        customerLocation: validateData.customerLocation,
        city: validateData.city,
        addressString: fullAddress,
        strict: false,
    })

    if (Math.abs((validateData.deliveryCharge || 0) - prepared.deliveryCharge) > 1) {
        console.warn(`[save-order] delivery charge mismatch for ${validateData.razorpay_order_id}: client=${validateData.deliveryCharge} server=${prepared.deliveryCharge}`)
    }

    const productsWithStatus = prepared.items.map((item) => ({
        ...item,
        status: initialStatus,
    }))

    const newOrder = await OrderModel.create({
    user: auth.isAuth ? auth.userId : null,                      
    name: validateData.name,
    email: validateData.email,
    phone: validateData.phone,
    address: validateData.address,
    country: validateData.country,
    state: validateData.state,
    city: validateData.city,
    pincode: validateData.pincode,
    landmark: validateData.landmark,
    ordernote: validateData.ordernote,
    products: productsWithStatus,
    subtotal: validateData.subtotal,
    discount: validateData.discount,
    couponDiscount: validateData.couponDiscount || 0,  
    deliveryCharge: prepared.deliveryCharge,
    totalAmount: validateData.totalAmount,
    payment_id: validateData.razorpay_payment_id,
    order_id: validateData.razorpay_order_id,               
    status: initialStatus,
    paymentStatus: paymentVerification ? 'Paid' : 'Failed'
    });

    // ✅ NEW — nearest-shop assignment (sirf payment-verified orders ke liye)
    if (paymentVerification) {
        try {
            const { geocodeAddress } = await import("@/lib/geocode")
            const { assignAllItems } = await import("@/lib/itemAssignment")

            const coords = prepared.location || await geocodeAddress(fullAddress)

            if (coords) {
                newOrder.customerLocation = coords
                newOrder.deliveryLocation = { type: "Point", coordinates: [coords.lng, coords.lat] }
                await newOrder.save()
                await assignAllItems(newOrder._id)
            }
            // geocode fail ho jaaye to bhi order ban chuka hai — sirf shop-assignment
            // skip hogi, admin baad me manually assign kar sakta hai
        } catch (assignError) {
            console.error("Shop assignment failed:", assignError)
            // checkout fail nahi hona chahiye isliye — order already ban chuka hai
        }
    }

    try{
        const mailData = {
            order_id: validateData.razorpay_order_id,
            orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${validateData.razorpay_order_id}`
        }

        await sendMail('Order placed successfully.', validateData.email, orderNotification(mailData))

    } catch(error){
    
    }

    return response(true, 200, 'Order placed successfully.')
       
    } catch(error) {
       return catchError(error)
    }
}