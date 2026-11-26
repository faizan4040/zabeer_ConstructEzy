import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { zSchema } from "@/lib/zodSchema";
import Razorpay from "razorpay";
import { checkServiceArea, NOT_SERVICEABLE_MESSAGE } from "@/lib/serviceArea";

export async function POST(request) {
    try{
        await connectDB()
        const payload = await request.json()
        const schema = zSchema.pick({
            amount: true
        })

        const validate = schema.safeParse(payload)

        if(!validate.success){
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const {amount} = validate.data

        // Payment lene se pehle hi service area check — bahar ke shehar ka paisa capture na ho
        const loc = payload?.customerLocation
        const area = checkServiceArea({ lat: loc?.lat ?? null, lng: loc?.lng ?? null, city: payload?.city })
        if (area.serviceable === false) {
            return response(false, 400, NOT_SERVICEABLE_MESSAGE)
        }

        const razInstance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const razOption = {
            amount: Math.round(Number(amount) * 100), // paise must be an integer
            currency: 'INR'
        }

        const orderDetail = await razInstance.orders.create(razOption)
        const order_id = orderDetail.id

        return response(true, 200, 'Order id generated.', order_id)


    } catch(error) {
       return catchError(error)
    }
}