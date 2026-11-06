import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceCategory from "@/models/ServiceCategory.model";
import ServiceListing from "@/models/ServiceListing.model";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(60), slug: z.string().min(2).max(80),
  parent: z.string().nullable(), image: z.string(), sortOrder: z.coerce.number(), isActive: z.boolean(),
}).partial();

export async function PUT(req, ctx) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    const { id } = await ctx.params;
    await connectDB();
    const p = schema.safeParse(await req.json());
    if (!p.success) return response(false, 400, "Invalid data");
    const doc = await ServiceCategory.findByIdAndUpdate(id, p.data, { new: true });
    return doc ? response(true, 200, "Updated", doc) : response(false, 404, "Not found");
  } catch (e) { return catchError(e); }
}

export async function DELETE(_req, ctx) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    const { id } = await ctx.params;
    await connectDB();
    const kids = await ServiceCategory.find({ parent: id, deletedAt: null }).select("_id").lean();
    const ids = [id, ...kids.map((k) => k._id)];
    const used = await ServiceListing.countDocuments({
      deletedAt: null, $or: [{ category: { $in: ids } }, { subCategory: { $in: ids } }],
    });
    if (used) return response(false, 400, `${used} labour card(s) use this category. Move or delete them first.`);
    await ServiceCategory.updateMany({ _id: { $in: ids } }, { deletedAt: new Date() });
    return response(true, 200, "Category deleted");
  } catch (e) { return catchError(e); }
}
