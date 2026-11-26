import { isAuthenticated } from "@/lib/authentication";
import { orderNotification } from "@/email/orderNotification";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import { prepareOrderItems } from "@/lib/orderDelivery";
import z from "zod";

export async function POST(request) {
    try {

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

        // ✅ Razorpay fields (payment_id/order_id/signature) yahan REQUIRED nahi —
        // COD me koi online-payment-verification hoti hi nahi
        const orderSchema = zSchema.pick({
            name: true, email: true, phone: true, address: true, country: true, state: true, city: true,
            pincode: true, landmark: true, ordernote: true
        }).extend({
            userId: z.string().optional(),
            subtotal: z.number().nonnegative(),
            discount: z.number().nonnegative(),
            couponDiscount: z.number().nonnegative(),
            totalAmount: z.number().nonnegative(),
            deliveryCharge: z.number().nonnegative().optional().default(0),
            customerLocation: z.object({ lat: z.number(), lng: z.number() }).optional().nullable(),
            products: z.array(productSchema)
        })

        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error })
        }

        const validateData = validate.data

        // ✅ COD me payment-verification step hi nahi hai — seedha 'on_hold' (jaisa
        // online-payment verified hone par hota tha), kyunki cash baad me collect hoga
        const initialStatus = 'on_hold'

        // Sample price/qty lock, return rules, server-side delivery charge
        const fullAddress = `${validateData.address}, ${validateData.city}, ${validateData.state} ${validateData.pincode}, India`
        const prepared = await prepareOrderItems({
            products: validateData.products,
            customerLocation: validateData.customerLocation,
            city: validateData.city,
            addressString: fullAddress,
            strict: true,
        })
        if (prepared.error) return response(false, 400, prepared.error)

        const productsWithStatus = prepared.items.map((item) => ({
            ...item,
            status: initialStatus,
        }))

        // COD me paisa baad me aata hai → total server ke numbers se banao
        const serverSubtotal = prepared.itemsSubtotal
        const couponDiscount = Math.min(validateData.couponDiscount || 0, serverSubtotal)
        const serverTotal = Math.round((Math.max(serverSubtotal - couponDiscount, 0) + prepared.deliveryCharge) * 100) / 100

        // ✅ Unique order_id — Razorpay ki jagah khud generate karna padega
        const codOrderId = `COD${Date.now()}${Math.floor(Math.random() * 1000)}`

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
            subtotal: serverSubtotal,
            discount: validateData.discount,
            couponDiscount,
            deliveryCharge: prepared.deliveryCharge,
            totalAmount: serverTotal,
            payment_id: `COD-${codOrderId}`,  // real payment_id nahi hai, placeholder
            order_id: codOrderId,
            status: initialStatus,
            paymentMode: 'cod',              // ✅ yahi field shopowner-dashboard me COD dikhayega
            paymentStatus: 'Pending',        // delivery-boy cash collect karke isko baad me 'Paid' karega
        });

        // ✅ Same nearest-shop assignment jo online-order me hota hai — hubahu wahi
        if (true) {
            try {
                const { geocodeAddress } = await import("@/lib/geocode")
                const { assignAllItems } = await import("@/lib/itemAssignment")

                // checkout GPS (ya pehle se geocoded) location ho to dobara geocode nahi
                const coords = prepared.location || await geocodeAddress(fullAddress)

                if (coords) {
                    newOrder.customerLocation = coords
                    newOrder.deliveryLocation = { type: "Point", coordinates: [coords.lng, coords.lat] }
                    await newOrder.save()
                    await assignAllItems(newOrder._id)
                }
            } catch (assignError) {
                console.error("Shop assignment failed:", assignError)
            }
        }

        try {
            const mailData = {
                order_id: codOrderId,
                orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${codOrderId}`
            }
            await sendMail('Order placed successfully.', validateData.email, orderNotification(mailData))
        } catch (error) {
        }

        return response(true, 200, 'Order placed successfully.', { order_id: codOrderId })

    } catch (error) {
        return catchError(error)
    }
}