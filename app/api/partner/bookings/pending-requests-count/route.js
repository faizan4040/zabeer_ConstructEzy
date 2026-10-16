import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";

// Same URL as before so PartnerDashboard keeps working.
// Now returns the number of upcoming (confirmed) jobs.
export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated("laber");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }
    const count = await Booking.countDocuments({ labour: session.userId, bookingStatus: "confirmed" });
    return NextResponse.json(count, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `count error ${error}` }, { status: 500 });
  }
}




// import { NextResponse } from "next/server";
// import connectDB from "@/lib/databaseConnection";
// import { isAuthenticated } from "@/lib/authentication";
// import User from "@/models/User.model";
// import Booking from "@/models/Booking.model";

// export async function GET(req) {
//   try {
//     await connectDB();

//     const session = await isAuthenticated("laber");
//     if (!session.isAuth) {
//       return NextResponse.json({ message: "unauthorized" }, { status: 400 });
//     }

//     const partner = await User.findById(session.userId);
//     if (!partner) {
//       return NextResponse.json({ message: "partner not found" }, { status: 400 });
//     }

//     const count = await Booking.countDocuments({
//       labour: partner._id,
//       bookingStatus: "requested",
//     });

//     return NextResponse.json(count, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: `fetch pending req count error ${error}` },
//       { status: 500 }
//     );
//   }
// }