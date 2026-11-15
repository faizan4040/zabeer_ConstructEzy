import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isValidLatLng, quoteDelivery, toPublicQuote } from "@/lib/delivery"
import z from "zod"

const schema = z.object({
  items: z.array(z.object({
    productId: z.string().length(24),
    variantId: z.string().length(24).optional(),
    qty: z.number().min(1).optional(),
    isSample: z.boolean().optional(),
  })).min(1),
  location: z.object({ lat: z.number(), lng: z.number() }).optional().nullable(),
  // location na ho to address se geocode try karenge
  address: z.string().optional(),
})

// POST → checkout pe buyer ke liye delivery charge (buyer ↔ supplier distance × ₹/km)
export async function POST(request) {
  try {
    await connectDB()
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return response(false, 400, "Invalid cart items.")

    let { items, location, address } = parsed.data
    let resolvedFrom = isValidLatLng(location) ? "gps" : null

    if (!resolvedFrom && address && address.trim().length > 5) {
      try {
        const { geocodeAddress } = await import("@/lib/geocode")
        const coords = await geocodeAddress(address)
        if (isValidLatLng(coords)) {
          location = coords
          resolvedFrom = "address"
        }
      } catch {
        // geocode fail → buyer se GPS location maangenge
      }
    }

    const quote = await quoteDelivery(items, resolvedFrom ? location : null)
    return response(true, 200, "Delivery quote.", {
      ...toPublicQuote(quote),
      location: resolvedFrom ? location : null,
      resolvedFrom,
    })
  } catch (error) {
    return catchError(error)
  }
}
