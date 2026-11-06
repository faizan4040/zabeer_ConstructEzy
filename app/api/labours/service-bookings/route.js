import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";

export async function GET() {
  try {
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    const items = await ServiceBooking.find({ labourUser: auth.userId }).sort({ createdAt: -1 }).limit(100).lean();
    return response(true, 200, "OK", items);
  } catch (e) { return catchError(e); }
}
