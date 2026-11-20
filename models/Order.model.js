import { orderstatus } from "@/lib/utils";
import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: orderstatus, required: true },
  changedBy: { type: String, enum: ["system", "delivery_partner", "shopowner", "courier", "customer"], required: true },
  changedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  note: { type: String, default: "" },
  at: { type: Date, default: Date.now },
}, { _id: false })

//  NEW — per-item shop-assignment tracking (nearest-shop notification ke liye)
const itemAssignmentSchema = new mongoose.Schema({
  status: { type: String, enum: ["unassigned", "pending", "accepted", "escalated"], default: "unassigned" },
  currentShop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
  currentRadiusKm: { type: Number, default: 3 },
  notifiedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  attemptedShops: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String, required: true },
    ordernote: { type: String, required: false },

    paymentMode: { type: String, enum: ["online", "cod"], default: "online" },
    paymentStatus: { type: String, enum: ["Paid", "Pending", "Refunded", "Failed"], default: "Pending" },

    customerLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
    },

    // NEW — GeoJSON Point, geospatial $nearSphere query ke liye (customerLocation
    // plain {lat,lng} hai jo geo-query me kaam nahi karta, isliye ye alag field hai)
    deliveryLocation: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },

    paymentQRId: { type: String, default: null },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            mrp: { type: Number, required: true },
            sellingPrice: { type: Number, required: true },
            status: { type: String, enum: orderstatus, default: "on_hold" },
            statusHistory: [statusHistorySchema],

            labelCode: { type: String, default: null, index: true },
            labelGeneratedAt: { type: Date, default: null },
            shippedAt: { type: Date, default: null },
            deliveredAt: { type: Date, default: null },
            deliveryOtp: { type: String, default: null },

            isReturnable: { type: Boolean, default: true },
            returnRequested: { type: Boolean, default: false },

            // ── Buy a Sample ──
            isSample: { type: Boolean, default: false },

            // Height × Width the customer entered (doors, windows...). null when not needed.
            customSize: {
                type: new mongoose.Schema({
                    height: { type: Number, required: true },
                    width: { type: Number, required: true },
                    unit: { type: String, default: "inch" },
                }, { _id: false }),
                default: null,
            },

            // ── Delivery (internal — buyer ko deliveredBy nahi dikhate) ──
            deliveryType: { type: String, enum: ["free", "paid_supplier", "constructezy"], default: "free" },
            deliveredBy: { type: String, enum: ["supplier", "constructezy"], default: "supplier" },
            deliveryRatePerKm: { type: Number, default: 0 },
            deliveryDistanceKm: { type: Number, default: null },

            // NEW — is item ko kis shop ko notify kiya gaya, radius, timeout, etc.
            itemAssignment: { type: itemAssignmentSchema, default: () => ({}) },
        }
    ],

    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    subtotal: { type: Number, required: true },
    discount: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    // server-side calculated (lib/delivery.js → quoteDelivery), totalAmount me included
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    payment_id: { type: String, required: true },
    order_id: { type: String, required: true },
    status: { type: String, enum: orderstatus, default: "on_hold" },
    statusHistory: [statusHistorySchema],

    deleteAt: { type: Date, default: null, index: true }
}, { timestamps: true })

//  NEW — 2dsphere index, deliveryLocation pe $nearSphere geo-query ke liye zaroori
orderSchema.index({ deliveryLocation: "2dsphere" })

const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders')
export default OrderModel