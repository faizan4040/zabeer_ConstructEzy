import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import LabourReview from "@/models/LabourReview.model";
import { recalcLabourRating } from "@/lib/labourRating";

// body: { bookingId, rating (1-5), title?, review? }
export async function POST(req) {
  try {
    await connectDB();

    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "Please login" }, { status: 401 });
    }

    const { bookingId, rating, title, review } = await req.json();
    if (!mongoose.isValidObjectId(bookingId)) {
      return NextResponse.json({ message: "Invalid booking" }, { status: 400 });
    }
    const stars = Math.round(Number(rating));
    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json({ message: "Select a rating from 1 to 5" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || String(booking.user) !== String(session.userId)) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    if (booking.bookingStatus !== "completed") {
      return NextResponse.json({ message: "You can review only after the work is completed" }, { status: 400 });
    }
    if (!booking.labourProfile) {
      return NextResponse.json({ message: "No labour on this booking" }, { status: 400 });
    }
    if (booking.reviewed) {
      return NextResponse.json({ message: "You already reviewed this booking" }, { status: 409 });
    }

    await LabourReview.create({
      booking: booking._id,
      labourProfile: booking.labourProfile,
      labour: booking.labour,
      user: session.userId,
      rating: stars,
      title: String(title || "").slice(0, 100),
      review: String(review || "").slice(0, 1000),
    });

    await Booking.updateOne({ _id: booking._id }, { $set: { reviewed: true } });
    await recalcLabourRating(booking.labourProfile);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ message: "You already reviewed this booking" }, { status: 409 });
    }
    return NextResponse.json({ message: `labour review error ${error}` }, { status: 500 });
  }
}
