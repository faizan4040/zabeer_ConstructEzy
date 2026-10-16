import {z} from "zod";

export const zSchema = z.object({
     email: z
     .string()
     .email({message: "Invalid email address"}),

     password: z
     .string()
     .min(8, "Password must be at least 8 characters")
     .regex(/[a-z]/, "Password must contain at least one lowercase letter")
     .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
     .regex(/[0-9]/, "Password must contain at least one number")
     .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
     .regex(/^\S+$/, "Password must not contain spaces"),

   name: z
     .string()
     .min(2, "Name is required")
     .max(50, "Name must be at most 50 characters")
     .regex(/^[a-zA-Z0-9\s'&/().,-]+$/, "Name contains invalid characters"),

     otp: z.string().regex(/^\d{6}$/, {
     message: "OTP must be a 6-digit number",
     }),
     _id: z.string().min(3, '_id is required.'),
     alt: z.string().min(3, 'Alt is required.'),
     title: z.string().min(3, 'Title is required.'),
     slug: z.string().min(3, 'Slug is required.'),

     category: z.string().min(1, 'Category is required'),
     mrp: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     sellingPrice: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     discountPercentage: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     description: z.string().min(1, 'Description is required.'),
     media: z.array(z.string()),
     product: z.string().min(3, 'Product is required'),
     color: z.string().min(3, 'Color is required'),
     size: z.string().min(1, 'Size is required'),
     brand: z.string().min(1, 'Brand is required'),
     attributes: z.array(
          z.object({
               label: z.string().min(1, 'Attribute label is required'),
               value: z.string().min(1, 'Attribute value is required'),
          })
     ).min(1, 'Please select at least one option (e.g. Size).'),
     stock: z.coerce.number({ required_error: "Stock is required" }).min(0, "Stock cannot be negative"),
     sku: z.string().min(3, 'SKU is required'),
     code: z.string().min(3, 'Code is required'),
     minShoppingAmount: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     amount: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     validity: z.coerce.date(),
     productId: z.string().min(3, "Product id is required"),
     userId: z.string().min(3, "User id is required"),
     rating: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     review: z.string().min(3, 'Review is required.'),
     phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
     country:  z.string().min(3, 'Country is required.'),
     address:  z.string().min(3, 'Address is required.'),
     state:  z.string().min(3, 'State is required.'),
     city:  z.string().min(3, 'City is required.'),
     pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
     landmark:  z.string().min(3, 'Landmark is required.'),
     ordernote: z
               .string()
               .optional()
               .refine(val => !val || val.trim().length >= 3, {
               message: "Order note must be at least 3 characters",
               }),
               
     });

// ============================================
// WAREHOUSE SCHEMA (BASE)
// ============================================
export const warehouseSchema = z.object({
  _id: z.string().optional(),

  name: z.string().min(2, "Warehouse name is required").max(100),
  location: z.string().min(2, "Location is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(3, "Zip code is required"),
  country: z.string().min(2, "Country is required"),

  phone: z.string().regex(/^\d{10}$/, "Valid 10-digit phone number required"),
  email: z.string().email("Invalid email address"),

  manager: z.string().min(2, "Manager name is required"),
  capacity: z.number().positive("Capacity must be greater than 0"),

  currentStock: z.number().default(0).optional(),

  status: z.enum(["active", "inactive", "maintenance"]).default("active"),

  isReturnable: z.boolean().optional().default(true),

  slug: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
})

// ============================================
// CREATE WAREHOUSE SCHEMA (POST)
// ============================================
export const createWarehouseSchema = warehouseSchema.omit({
  _id: true,
  currentStock: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

// ============================================
// UPDATE WAREHOUSE SCHEMA (PUT)
//  _id MUST be required here
// ============================================
export const updateWarehouseSchema = warehouseSchema
  .pick({
    _id: true,
    name: true,
    location: true,
    address: true,
    city: true,
    state: true,
    zipCode: true,
    country: true,
    phone: true,
    email: true,
    manager: true,
    capacity: true,
    status: true,
  })
  .extend({
    _id: z.string().min(1, "Warehouse ID is required"),
  })



  
export const manualOrderSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10),
  address: z.string().min(1),

  productName: z.string().min(1),
  category: z.string().min(1),

  qty: z.coerce.number().min(1),
  price: z.coerce.number().min(0),

  media: z.string().url().optional().or(z.literal('')),
})

// ============================================
// CATEGORY ATTRIBUTE TEMPLATE (used when Admin adds/edits a Subcategory)
// ============================================
export const categoryAttributeSchema = z.object({
  label: z.string().min(1, 'Attribute label is required').max(40),
  presets: z.array(z.string().min(1)).default([]),
  allowCustom: z.boolean().default(true),
})

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required'),
  parent: z.string().nullable().optional(),
  attributes: z.array(categoryAttributeSchema).optional().default([]),
})











