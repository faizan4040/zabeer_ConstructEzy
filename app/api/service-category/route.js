import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceCategory from "@/models/ServiceCategory.model";
import { z } from "zod";

// PUBLIC: sidebar ke liye tree (All Services > Plumbing > sub...)
export async function GET() {
  try {
    await connectDB();
    const all = await ServiceCategory.find({ deletedAt: null, isActive: true })
      .sort({ sortOrder: 1, name: 1 }).lean();
    const tree = all.filter((c) => !c.parent).map((c) => ({
      ...c,
      children: all.filter((s) => String(s.parent) === String(c._id)),
    }));
    return response(true, 200, "OK", tree);
  } catch (e) { return catchError(e); }
}

const schema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80),
  parent: z.string().nullable().optional(),
  image: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
});

export async function POST(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return response(false, 400, "Invalid data", parsed.error.flatten());
    const d = parsed.data;
    const cat = await ServiceCategory.create({ ...d, slug: d.slug.toLowerCase(), parent: d.parent || null });
    return response(true, 200, "Category added", cat);
  } catch (e) { return catchError(e); }
}
