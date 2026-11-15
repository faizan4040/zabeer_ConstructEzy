import mongoose from "mongoose"
import "./Media.model"

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    category:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Category',
       required: true
    },

    isReturnable: {
    type: Boolean,
    default: true,
    },

    mrp: {
        type: Number,
        required: true,
    },

    sellingPrice: {
        type: Number,
        required: true,
    },

    discountPercentage: {
        type: Number,
        required: true,
    },

    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            required: true
        },
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null,   // null = admin ka product, ObjectId = us shop owner ka product
    },

    description: {
        type: String,
        required: true
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

    // ── Buy a Sample (optional, seller toggle) ──
    // Enable hone par product page pe "Buy a Sample" button dikhta hai.
    // Sample qty hamesha 1, aur sirf sample hi returnable hai (7 din, delivery ke baad).
    sampleEnabled: {
        type: Boolean,
        default: false,
    },
    samplePrice: {
        type: Number,
        default: null,
        min: 0,
    },
    // e.g. "1 kg pack", "2 tiles" — buyer ko batata hai sample me kya milega
    sampleNote: {
        type: String,
        trim: true,
        default: "",
    },

    // ── Delivery option (see lib/delivery.js) ──
    // free / paid_supplier → supplier khud deliver karta hai
    // constructezy → ConstructEzy deliver karta hai (buyer ko kabhi nahi dikhaya jata)
    deliveryType: {
        type: String,
        enum: ["free", "paid_supplier", "constructezy"],
        default: "free",
    },
    // sirf paid_supplier ke liye — supplier ka ₹/km rate
    deliveryRatePerKm: {
        type: Number,
        default: 0,
        min: 0,
    },

    masterProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null,
        index: true,
    },

}, {timestamps: true})


productSchema.index({ category: 1 })
productSchema.index({ shop: 1 })
const ProductModel = mongoose.models.Product || mongoose.model('Product', 
productSchema, 'products')
export default ProductModel


