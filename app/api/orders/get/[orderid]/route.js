import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OrderModel from "@/models/Order.model";
import MediaModel from "@/models/Media.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import mongoose from "mongoose";

export async function GET(request, { params }) {
    try{

        await connectDB()
        const getParams = await params
        const orderid = getParams.orderid

        if(!orderid){
            return response(false, 404, 'Order not found')
        }

        // order-details page order_id (Razorpay / COD id) bhejta hai; _id bhi support
        const lookup = mongoose.isValidObjectId(orderid) ? { _id: orderid } : { order_id: orderid }
        const orderData = await OrderModel.findOne(lookup).populate('products.productId', 'name slug').populate
        ({
            path: 'products.variantId',
            populate: {path: 'media'}
        }).lean()

        if(!orderData) {
            return response(false, 404, 'Order not found.')
        }

        // deliveredBy / deliveryType internal hai — buyer ko nahi bhejte
        orderData.products = (orderData.products || []).map(({ deliveredBy, deliveryType, ...rest }) => rest)

        return response(true, 200, 'Order found.', orderData)

    }catch (error) {
        return catchError(error)
    }
}









// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import OrderModel from "@/models/Order.model";
// import MediaModel from "@/models/Media.model";
// import ProductModel from "@/models/Product.model";
// import ProductVariantModel from "@/models/ProductVariant.model";

// export async function GET(request, { params }) {
//     try{

//         await connectDB()
//         const getParams = await params
//         const orderid = getParams.orderid

//         if(!orderid){
//             return response(false, 404, 'Order not found')
//         }

//         const orderData = await OrderModel.findOne({ order_id: orderid }).populate('products.productId', 'name slug').populate
//         ({
//             path: 'products.variantId',
//             populate: {path: 'media'}
//         }).lean()

//         if(!orderData) {
//             return response(false, 404, 'Order not found.')
//         }

//         return response(true, 200, 'Order found.', orderData)

//     }catch (error) {
//         return catchError(error)
//     }
// }