import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import Labour from "@/models/Labour.model";
import User from "@/models/User.model";
import { splitFare, rateFor } from "@/lib/bookingHelpers";
import { notifyUser, notifyAdmins } from "@/lib/bookingNotify";

const CATEGORIES = [
  "all", "helpers", "masons", "electricians", "plumbers", "carpenters", "painters",
  "tile-experts", "welders", "jcb-operators", "contractors", "engineers",
];

export async function POST(req) {
  try {
    await connectDB();

    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "Please login" }, { status: 401 });
    }

    const {
      labourId, // optional. Without it the booking goes to admin for manual assignment
      category,
      pricingType, // "hourly" | "daily"
      quantity,
      visitAt,
      paymentMethod, // "cash" | "online"
      workAddress,
      siteDetails,
      workLocation,
      mobileNumber,
    } = await req.json();

    if (!workAddress || !workLocation?.latitude || !workLocation?.longitude) {
      return NextResponse.json({ message: "Work address is required" }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(String(mobileNumber || ""))) {
      return NextResponse.json({ message: "Enter a valid mobile number" }, { status: 400 });
    }
    if (!["cash", "online"].includes(paymentMethod)) {
      return NextResponse.json({ message: "Select a payment method" }, { status: 400 });
    }
    if (!["hourly", "daily"].includes(pricingType)) {
      return NextResponse.json({ message: "Select hourly or daily" }, { status: 400 });
    }

    const visitDate = new Date(visitAt);
    if (isNaN(visitDate.getTime()) || visitDate.getTime() < Date.now() - 5 * 60 * 1000) {
      return NextResponse.json({ message: "Select a valid future visit time" }, { status: 400 });
    }

    const qty = Math.floor(Number(quantity));
    const maxQty = pricingType === "hourly" ? 24 : 365;
    if (!qty || qty < 1 || qty > maxQty) {
      return NextResponse.json({ message: "Invalid hours / days" }, { status: 400 });
    }

    let labour = null;
    if (labourId) {
      labour = await Labour.findOne({ _id: labourId, status: "approved", isActive: true });
      if (!labour) {
        return NextResponse.json({ message: "This labour is not available" }, { status: 404 });
      }
      if (String(labour.owner) === String(session.userId)) {
        return NextResponse.json({ message: "You cannot book yourself" }, { status: 400 });
      }
    }

    const finalCategory = labour ? labour.category : category;
    if (!CATEGORIES.includes(finalCategory)) {
      return NextResponse.json({ message: "Select a category" }, { status: 400 });
    }

    // stop duplicate open bookings
    const dup = labour
      ? { user: session.userId, labourProfile: labour._id, bookingStatus: { $in: ["requested", "confirmed"] } }
      : { user: session.userId, labourProfile: null, category: finalCategory, bookingStatus: "unassigned" };
    const existing = await Booking.findOne(dup);
    if (existing) {
      return NextResponse.json(
        { message: "You already have an open booking for this. Check My Bookings.", booking: existing },
        { status: 409 }
      );
    }

    let ratePerUnit = 0;
    let fare = 0;
    if (labour) {
      ratePerUnit = rateFor(labour, pricingType);
      if (!ratePerUnit) {
        return NextResponse.json(
          { message: `This labour does not work ${pricingType === "hourly" ? "per hour" : "per day"}` },
          { status: 400 }
        );
      }
      fare = Math.round(ratePerUnit * qty);
    }

    const customer = await User.findById(session.userId).select("name");

    const booking = await Booking.create({
      user: session.userId,
      labour: labour ? labour.owner : null,
      labourProfile: labour ? labour._id : null,
      userName: customer?.name || "",
      userMobileNumber: mobileNumber,
      labourName: labour ? labour.fullName : "",
      labourMobileNumber: labour ? labour.phone : "",
      category: finalCategory,
      workAddress,
      siteDetails: siteDetails || "",
      workLocation: { type: "Point", coordinates: [Number(workLocation.longitude), Number(workLocation.latitude)] },
      visitAt: visitDate,
      pricingType,
      duration: qty,
      ratePerUnit,
      fare,
      ...splitFare(fare),
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "cash" : "pending",
      bookingStatus: labour ? "requested" : "unassigned",
      requestedAt: new Date(),
    });

    const payload = { bookingId: String(booking._id), status: booking.bookingStatus };
    await Promise.all([labour ? notifyUser(labour.owner, payload) : null, notifyAdmins(payload)]);

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `create booking error ${error}` }, { status: 500 });
  }
}





















// // import { auth } from "@/auth";
// import { isAuthenticated } from "@/lib/authentication";
// import connectDb from "@/lib/databaseConnection";
// import Booking from "@/models/Booking.model";
// import User from "@/models/User.model";
// import axios from "axios";
// import { NextResponse } from "next/server";

// const DURATION_DAYS = { day: 1, week: 7, month: 30, year: 365 };
// const DURATION_DISCOUNT = { day: 0, week: 0.05, month: 0.10, year: 0.20 };

// export async function POST(req) {
//     try {
//         await connectDb()
//         const session = await auth()
//         if (!session?.user?.id) {
//             return NextResponse.json(
//                 { message: "unauthorize" },
//                 { status: 400 }
//             )
//         }

//         const {
//             labourId,
//             category,
//             pricingType,
//             hours,
//             durationKey,
//             workAddress,
//             workLocation,
//             mobileNumber,
//         } = await req.json()


//         if (!labourId || !category || !pricingType || !workAddress || !workLocation?.latitude || !workLocation?.longitude) {
//             return NextResponse.json(
//                 { message: "missing required details" },
//                 { status: 400 }
//             )
//         }

//         const user = await User.findOne({ email: session.user.email })
//         const labour = await User.findOne({
//             _id: labourId,
//             role: "laber",
//             partnerStatus: "approved"
//         })

//         if (!labour) {
//             return NextResponse.json(
//                 { message: "labour not found" },
//                 { status: 400 }
//             )
//         }

//         const existing = await Booking.findOne({
//             user: user._id,
//             bookingStatus: {
//                 $in: ["requested", "awaiting_payment", "confirmed", "started"]
//             }
//         })
//         console.log(existing)

//         if (existing) {
//             return NextResponse.json(
//                 existing
//             )
//         }

//         let fare = 0;
//         let duration = 0;
//         let ratePerUnit = 0;

//         if (pricingType === "hourly") {
//             if (!labour.hourlyRate || !hours || hours <= 0) {
//                 return NextResponse.json(
//                     { message: "invalid hourly booking details" },
//                     { status: 400 }
//                 )
//             }
//             duration = hours;
//             ratePerUnit = labour.hourlyRate;
//             fare = Math.round(labour.hourlyRate * hours);

//         } else if (pricingType === "daily") {
//             if (!labour.dailyRate || !durationKey || !DURATION_DAYS[durationKey]) {
//                 return NextResponse.json(
//                     { message: "invalid daily booking details" },
//                     { status: 400 }
//                 )
//             }
//             const days = DURATION_DAYS[durationKey];
//             const discount = DURATION_DISCOUNT[durationKey];
//             const rawTotal = labour.dailyRate * days;
//             duration = days;
//             ratePerUnit = labour.dailyRate;
//             fare = Math.round(rawTotal - rawTotal * discount);

//         } else {
//             return NextResponse.json(
//                 { message: "invalid pricingType" },
//                 { status: 400 }
//             )
//         }

//         const booking = await Booking.create({
//             user: user._id,
//             labour: labour._id,
//             category,
//             workAddress,

//             workLocation: {
//                 type: "Point",
//                 coordinates: [workLocation.longitude, workLocation.latitude]
//             },

//             fare,
//             pricingType,
//             duration,
//             ratePerUnit,

//             userMobileNumber: mobileNumber,
//             labourMobileNumber: labour.phone,

//             bookingStatus: "requested"
//         })

//         await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
//             event: "new-booking",
//             userId: labourId,
//             data: booking
//         })


//         return NextResponse.json(
//             booking, { status: 200 }
//         )


//     } catch (error) {
//         return NextResponse.json(
//             { message: `create booking error ${error}` },
//             { status: 500 }
//         )
//     }
// }