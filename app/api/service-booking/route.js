import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceListing from "@/models/ServiceListing.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import { calcAmounts, slotHoldFilter } from "@/lib/serviceWallet";
import { TIME_SLOTS, slotStart } from "@/lib/serviceConstants";
import { z } from "zod";

const schema = z.object({
  listingId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().refine((s) => TIME_SLOTS.includes(s), "Invalid slot"),
  address: z.object({
    fullAddress: z.string().min(5), landmark: z.string().optional(),
    city: z.string().min(2), pincode: z.string().regex(/^[0-9]{6}$/),
  }),
  contactPhone: z.string().regex(/^[0-9]{10}$/),
  paymentMethod: z.enum(["online", "cash"]),
  paymentMode: z.enum(["upi", "card", "netbanking", "wallet", ""]).optional(),
});

const newCode = () => "CE" + Math.floor(10000 + Math.random() * 90000);

export async function POST(req) {
  try {
    const auth = await isAuthenticated();
    if (!auth.isAuth) return response(false, 401, "Please login to book.");
    await connectDB();

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return response(false, 400, parsed.error.issues[0]?.message || "Invalid data", parsed.error.flatten());
    const d = parsed.data;

    const date = new Date(`${d.date}T00:00:00+05:30`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) return response(false, 400, "Pick a future date.");
    if (slotStart(d.date, d.timeSlot) < new Date(Date.now() + 30 * 60 * 1000))
      return response(false, 400, "This time slot has passed. Choose a later slot.");

    const listing = await ServiceListing.findOne({ _id: d.listingId, deletedAt: null, isActive: true });
    if (!listing) return response(false, 404, "Service not available.");

    const clash = await ServiceBooking.exists({ listing: listing._id, date, timeSlot: d.timeSlot, ...slotHoldFilter() });
    if (clash) return response(false, 409, "This slot is already booked. Choose another.");

    const money = calcAmounts(listing.price); // price hamesha DB se
    let booking;
    for (let i = 0; i < 4; i++) { // bookingCode unique hai, clash par dobara try
      try {
        booking = await ServiceBooking.create({
          bookingCode: newCode(),
          user: auth.userId, listing: listing._id, labourUser: listing.linkedLabourUser,
          serviceTitle: listing.title, serviceImage: listing.photo, labourName: listing.labourName, labourPhone: listing.phone,
          date, timeSlot: d.timeSlot, address: d.address, contactPhone: d.contactPhone, ...money,
          paymentMethod: d.paymentMethod, paymentMode: d.paymentMethod === "cash" ? "cash" : d.paymentMode || "",
          paymentStatus: d.paymentMethod === "cash" ? "cash_due" : "pending",
          status: d.paymentMethod === "cash" ? "confirmed" : "pending_payment",
        });
        break;
      } catch (e) { if (e.code !== 11000 || i === 3) throw e; }
    }
    if (d.paymentMethod === "cash") await ServiceListing.updateOne({ _id: listing._id }, { $inc: { bookingCount: 1 } });
    return response(true, 200, "Booking created", booking);
  } catch (e) { return catchError(e); }
}

// User ki apni bookings: ?status=upcoming|completed|cancelled
export async function GET(req) {
  try {
    const auth = await isAuthenticated();
    if (!auth.isAuth) return response(false, 401, "Unauthorized");
    await connectDB();
    const s = new URL(req.url).searchParams.get("status");
    const q = { user: auth.userId };
    if (s === "upcoming") q.status = { $in: ["pending_payment", "confirmed", "in_progress"] };
    else if (s === "completed") q.status = "completed";
    else if (s === "cancelled") q.status = "cancelled";
    return response(true, 200, "OK", await ServiceBooking.find(q).sort({ createdAt: -1 }).lean());
  } catch (e) { return catchError(e); }
}
