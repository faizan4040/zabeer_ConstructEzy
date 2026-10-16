import mongoose from "mongoose"

// One selected attribute value on a variant — e.g. { label: "Weight", value: "25kg" }
const variantAttributeSchema = new mongoose.Schema({
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
}, { _id: false })

const ProductVariantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    // Replaces the old hardcoded color + size fields.
    // Dynamic per category: Cement -> Weight, CPVC Pipe -> Diameter, Paint -> Color, Wire -> Gauge...
    attributes: {
        type: [variantAttributeSchema],
        required: true,
        validate: {
            validator: (val) => Array.isArray(val) && val.length > 0,
            message: 'At least one attribute (e.g. Size) is required.',
        }
    },

    brand: {
        type: String,
        trim: true,
    },

    // Not relevant for hardware/construction items — kept optional for
    // any future clothing-style category, never required.
    gender: {
        type: String,
        enum: ['men', 'women', 'kids'],
        required: false,
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

    sku: {
        type: String,
        required: true,
        unique: true,
    },

    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },

    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            required: true
        },
    ],

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, {timestamps: true})

const ProductVariantModel = mongoose.models.ProductVariant || mongoose.model
('ProductVariant', ProductVariantSchema, 'productvariants');

export default ProductVariantModel;




