import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import { slotHoldFilter } from "@/lib/serviceWallet";

export async function GET(req, ctx) {
  try {
    const { id } = await ctx.params;
    const ymd = new URL(req.url).searchParams.get("date");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd || "")) return response(false, 400, "Invalid date");
    await connectDB();
    const rows = await ServiceBooking.find({
      listing: id, date: new Date(`${ymd}T00:00:00+05:30`), ...slotHoldFilter(),
    }).select("timeSlot").lean();
    return response(true, 200, "OK", rows.map((r) => r.timeSlot));
  } catch (e) { return catchError(e); }
}
