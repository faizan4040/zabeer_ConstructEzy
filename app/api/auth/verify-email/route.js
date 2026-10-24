import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/User.model";

export const runtime = "nodejs";

const send = (success, status, message) =>
  NextResponse.json({ success, statusCode: status, message }, { status });

export async function POST(request) {
  console.log("[verify-email] request aayi");

  try {
    // 1. Body padho
    let token;
    try {
      ({ token } = await request.json());
    } catch {
      return send(false, 400, "Invalid request body.");
    }

    if (!token || typeof token !== "string") {
      return send(false, 400, "Invalid or missing token.");
    }

    // 2. Secret key check
    if (!process.env.SECRET_KEY) {
      console.error("[verify-email] SECRET_KEY missing");
      return send(false, 500, "Server configuration error.");
    }

    // 3. Token verify
    let userId;
    try {
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId;
    } catch (err) {
      console.error("[verify-email] token error:", err?.code || err?.message);
      if (err?.code === "ERR_JWT_EXPIRED") {
        return send(false, 401, "Link expired. Please request a new verification email.");
      }
      return send(false, 401, "Invalid verification link. Please request a new one.");
    }

    if (!userId || !isValidObjectId(userId)) {
      return send(false, 400, "Invalid user id.");
    }

    // 4. Database
    await connectDB();
    console.log("[verify-email] DB connected");

    const user = await UserModel.findById(userId);
    if (!user) {
      return send(false, 404, "User not found.");
    }

    if (user.isEmailVerified) {
      return send(true, 200, "Email already verified.");
    }

    user.isEmailVerified = true;
    await user.save();

    console.log("[verify-email] verified:", userId);
    return send(true, 200, "Email verified successfully.");
  } catch (error) {
    console.error("[verify-email] error:", error);
    const msg =
      process.env.NODE_ENV === "development"
        ? error?.message || "Email verification failed."
        : "Email verification failed.";
    return send(false, 500, msg);
  }
}