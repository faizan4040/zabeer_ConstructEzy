import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceListing from "@/models/ServiceListing.model";
import ServiceCategory from "@/models/ServiceCategory.model";
import { listingSchema } from "@/lib/serviceSchemas";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// PUBLIC: ?category=slug&q=&minPrice=&maxPrice=&rating=&city=&sort=&page=&limit=
export async function GET(req) {
  try {
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const q = { deletedAt: null, isActive: true };

    const slug = sp.get("category");
    if (slug && slug !== "all") {
      // exact slug; warna "electricians" -> "electrician" / naam "Electrician" se bhi match (home page cards)
      const root = slug.replace(/-/g, " ").replace(/e?s$/i, "");
      const cat =
        (await ServiceCategory.findOne({ slug, deletedAt: null }).lean()) ||
        (await ServiceCategory.findOne({
          deletedAt: null,
          $or: [{ slug: slug.replace(/s$/i, "") }, { name: new RegExp(`^${esc(root)}`, "i") }],
        }).lean());
      if (!cat) return response(true, 200, "OK", { items: [], total: 0 });
      const kids = await ServiceCategory.find({ parent: cat._id }).select("_id").lean();
      const ids = [cat._id, ...kids.map((k) => k._id)];
      (q.$and ||= []).push({ $or: [{ category: { $in: ids } }, { subCategory: { $in: ids } }] });
    }
    const search = (sp.get("q") || "").trim();
    if (search) (q.$and ||= []).push({ $or: [{ title: new RegExp(esc(search), "i") }, { labourName: new RegExp(esc(search), "i") }] });
    if (sp.get("minPrice") || sp.get("maxPrice")) {
      q.price = {};
      if (sp.get("minPrice")) q.price.$gte = Number(sp.get("minPrice"));
      if (sp.get("maxPrice")) q.price.$lte = Number(sp.get("maxPrice"));
    }
    if (sp.get("rating")) q.rating = { $gte: Number(sp.get("rating")) };
    if (sp.get("city")) q.city = sp.get("city");

    const sortMap = { popularity: { bookingCount: -1 }, rating: { rating: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } };
    const sort = sortMap[sp.get("sort")] || sortMap.popularity;
    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const limit = Math.min(50, parseInt(sp.get("limit") || "12"));

    const [items, total] = await Promise.all([
      ServiceListing.find(q).sort(sort).skip((page - 1) * limit).limit(limit)
        .select("-description -process -phone").populate("category", "name slug").lean(),
      ServiceListing.countDocuments(q),
    ]);
    return response(true, 200, "OK", { items, total, page, limit });
  } catch (e) { return catchError(e); }
}

export async function POST(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const parsed = listingSchema.safeParse(await req.json());
    if (!parsed.success) return response(false, 400, parsed.error.issues[0]?.message || "Invalid data", parsed.error.flatten());
    const d = parsed.data;
    const doc = await ServiceListing.create({ ...d, subCategory: d.subCategory || null, linkedLabourUser: d.linkedLabourUser || null });
    return response(true, 200, "Labour added", doc);
  } catch (e) { return catchError(e); }
}
