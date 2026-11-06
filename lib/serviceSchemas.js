import { z } from "zod";

// route.js files se sirf HTTP handlers export hone chahiye, isliye schema yahan hai
export const listingSchema = z.object({
  title: z.string().min(3), labourName: z.string().min(2),
  photo: z.string().optional(), category: z.string().min(1),
  subCategory: z.string().nullable().optional(),
  shortDescription: z.string().max(200).optional(), description: z.string().optional(),
  price: z.coerce.number().positive(), experienceYears: z.coerce.number().min(0).optional(),
  avgDurationMins: z.coerce.number().min(0).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional().or(z.literal("")),
  city: z.string().optional(), whatsIncluded: z.array(z.string()).optional(),
  process: z.array(z.object({ title: z.string(), description: z.string().optional() })).optional(),
  badges: z.array(z.string()).optional(), isVerified: z.boolean().optional(),
  hasWarranty: z.boolean().optional(), linkedLabourUser: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
