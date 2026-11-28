import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { zSchema } from "@/lib/zodSchema";
import Razorpay from "razorpay";
import z from "zod";
import { fullAddressOf, orderProductSchema, priceOrder } from "@/lib/orderPricing";

// Razorpay order is created for the SERVER-calculated total (DB prices + server coupon
// + server delivery charge). The browser never decides how much is charged.
export async function POST(request) {
    try{
        await connectDB()
        const payload = await request.json()

        const schema = zSchema.pick({ address: true, state: true, city: true, pincode: true }).extend({
            products: z.array(orderProductSchema).min(1, 'Your cart is empty.'),
            couponCode: z.string().optional().nullable(),
            customerLocation: z.object({ lat: z.number(), lng: z.number() }).optional().nullable(),
        })

        const validate = schema.safeParse(payload)
        if(!validate.success){
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }
        const data = validate.data

        const priced = await priceOrder({
            products: data.products,
            customerLocation: data.customerLocation,
            city: data.city,
            addressString: fullAddressOf(data),
            couponCode: data.couponCode,
            strict: true,
        })
        if (priced.error) return response(false, 400, priced.error)

        const amountPaise = Math.round(priced.totalAmount * 100)
        if (amountPaise < 100) return response(false, 400, 'Order amount must be at least ₹1.')

        const razInstance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const orderDetail = await razInstance.orders.create({
            amount: amountPaise,
            currency: 'INR',
            notes: { couponCode: priced.couponCode || '' },
        })

        return response(true, 200, 'Order id generated.', {
            order_id: orderDetail.id,
            amount: amountPaise,
            subtotal: priced.subtotal,
            discount: priced.discount,
            couponDiscount: priced.couponDiscount,
            deliveryCharge: priced.deliveryCharge,
            totalAmount: priced.totalAmount,
        })

    } catch(error) {
       return catchError(error)
    }
}
