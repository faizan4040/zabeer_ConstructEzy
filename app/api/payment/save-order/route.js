import { isAuthenticated } from "@/lib/authentication";
import { orderNotification } from "@/email/orderNotification";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import { fullAddressOf, orderProductSchema, priceOrder } from "@/lib/orderPricing";
import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import z from "zod";

export async function POST(request) {
    try{
       
    await connectDB()
    const auth = await isAuthenticated('customer')
    const payload = await request.json()

    const orderSchema = zSchema.pick({
        name: true, email: true, phone: true, address: true, country: true, state: true, city: true,
        pincode: true, landmark:true, ordernote: true
    }).extend({
        userId: z.string().optional(),
        razorpay_payment_id: z.string().min(3, 'Payment id is required.'),
        razorpay_order_id: z.string().min(3, 'Order id is required.'),
        razorpay_signature: z.string().min(3, 'Signature id is required.'),
        couponCode: z.string().optional().nullable(),
        customerLocation: z.object({ lat: z.number(), lng: z.number() }).optional().nullable(),
        products: z.array(orderProductSchema).min(1)
    })

    const validate = orderSchema.safeParse(payload)
    if(!validate.success) {
        return response(false, 400, 'Invalid or missing fields.', {error: validate.error})
    }

    const validateData = validate.data 

    // 1. signature — proves this payment belongs to this Razorpay order
    const verification = validatePaymentVerification({
        order_id: validateData.razorpay_order_id,
        payment_id: validateData.razorpay_payment_id,
    },validateData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)
    if (!verification) {
        return response(false, 400, 'Payment verification failed.')
    }

    // same Razorpay order saved twice (double click / retry) → return the existing order
    const already = await OrderModel.exists({ order_id: validateData.razorpay_order_id })
    if (already) return response(true, 200, 'Order placed successfully.')

    // 2. price the cart on the server (DB prices, server coupon, server delivery)
    const fullAddress = fullAddressOf(validateData)
    const priced = await priceOrder({
        products: validateData.products,
        customerLocation: validateData.customerLocation,
        city: validateData.city,
        addressString: fullAddress,
        couponCode: validateData.couponCode,
        strict: false,
    })

    // 3. amount actually paid must match the server total (₹1 tolerance for rounding)
    const razInstance = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    const rzpOrder = await razInstance.orders.fetch(validateData.razorpay_order_id)
    const paidRupees = Number(rzpOrder?.amount || 0) / 100
    if (priced.error || rzpOrder?.currency !== 'INR' || Math.abs(paidRupees - priced.totalAmount) > 1) {
        console.error(`[save-order] AMOUNT MISMATCH order=${validateData.razorpay_order_id} payment=${validateData.razorpay_payment_id} paid=${paidRupees} server=${priced.totalAmount} error=${priced.error || ''}`)
        return response(false, 400, `Payment amount did not match your order total. Please contact support with payment id ${validateData.razorpay_payment_id} for a refund.`)
    }

    const initialStatus = 'on_hold'
    const prepared = priced

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
    subtotal: priced.subtotal,
    discount: priced.discount,
    couponDiscount: priced.couponDiscount,
    deliveryCharge: prepared.deliveryCharge,
    totalAmount: priced.totalAmount,
    payment_id: validateData.razorpay_payment_id,
    order_id: validateData.razorpay_order_id,               
    status: initialStatus,
    paymentStatus: 'Paid'
    });

    // ✅ NEW — nearest-shop assignment (sirf payment-verified orders ke liye)
    {
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