import { z } from "zod"

// Client + server dono pe safe (koi env / model import nahi).
// Shop product add/edit me "Buy a Sample" + delivery fields ka validation.

export const LISTING_OPTION_DEFAULTS = {
  sampleEnabled: false,
  samplePrice: "",
  sampleNote: "",
  deliveryType: "free",
  deliveryRatePerKm: "",
}

const num = z.union([z.number(), z.string()]).transform((v) => (v === "" || v == null ? null : Number(v)))

export const listingOptionsSchema = z
  .object({
    sampleEnabled: z.boolean().optional().default(false),
    samplePrice: num.optional().nullable(),
    sampleNote: z.string().max(120).optional().default(""),
    deliveryType: z.enum(["free", "paid_supplier", "constructezy"]).optional().default("free"),
    deliveryRatePerKm: num.optional().nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.sampleEnabled && !(Number.isFinite(v.samplePrice) && v.samplePrice > 0)) {
      ctx.addIssue({ code: "custom", path: ["samplePrice"], message: "Sample price is required when Buy a Sample is on." })
    }
    if (v.deliveryType === "paid_supplier" && !(Number.isFinite(v.deliveryRatePerKm) && v.deliveryRatePerKm > 0)) {
      ctx.addIssue({ code: "custom", path: ["deliveryRatePerKm"], message: "Enter your delivery charge per km." })
    }
  })
  .transform((v) => ({
    sampleEnabled: !!v.sampleEnabled,
    samplePrice: v.sampleEnabled ? v.samplePrice : null,
    sampleNote: v.sampleEnabled ? (v.sampleNote || "").trim() : "",
    deliveryType: v.deliveryType,
    deliveryRatePerKm: v.deliveryType === "paid_supplier" ? v.deliveryRatePerKm : 0,
  }))

export function pickListingOptions(payload = {}) {
  return {
    sampleEnabled: payload.sampleEnabled,
    samplePrice: payload.samplePrice,
    sampleNote: payload.sampleNote,
    deliveryType: payload.deliveryType,
    deliveryRatePerKm: payload.deliveryRatePerKm,
  }
}

// Buyer-facing label — "constructezy" ka zikr kabhi nahi
export function deliveryLabel(delivery) {
  if (!delivery || delivery.mode !== "paid") return "Free Delivery"
  return `Paid Delivery · ₹${delivery.ratePerKm}/km`
}
