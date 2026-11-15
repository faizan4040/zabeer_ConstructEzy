import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import { isValidLatLng, shopCoords } from "@/lib/delivery"
import ShopModel from "@/models/Shop.model"
import UserModel from "@/models/User.model"
import z from "zod"

async function getShop(auth) {
  const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
  if (!user?.shop) return null
  return ShopModel.findOne({ _id: user.shop, deletedAt: null })
}

// GET → shop ki saved location
export async function GET() {
  try {
    await connectDB()
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const shop = await getShop(auth)
    if (!shop) return response(false, 400, "No shop linked to this account.")

    const coords = shopCoords(shop)
    return response(true, 200, "Shop location.", {
      enabled: !!coords,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      address: shop.locationAddress || "",
      updatedAt: shop.locationUpdatedAt,
    })
  } catch (error) {
    return catchError(error)
  }
}

const schema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().max(300).optional().default(""),
})

// PUT { lat, lng, address? } → shop location save (browser GPS se)
export async function PUT(request) {
  try {
    await connectDB()
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const parsed = schema.safeParse(await request.json())
    if (!parsed.success || !isValidLatLng(parsed.data)) {
      return response(false, 400, "Invalid location.")
    }

    const shop = await getShop(auth)
    if (!shop) return response(false, 400, "No shop linked to this account.")

    const { lat, lng, address } = parsed.data
    shop.location = { type: "Point", coordinates: [lng, lat] }
    shop.locationAddress = address.trim()
    shop.locationUpdatedAt = new Date()
    await shop.save()

    return response(true, 200, "Shop location saved.", { enabled: true, lat, lng, address: shop.locationAddress })
  } catch (error) {
    return catchError(error)
  }
}
