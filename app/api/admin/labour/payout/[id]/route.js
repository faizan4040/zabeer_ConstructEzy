import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/authentication";
import { payoutBooking, syncPayout } from "@/lib/labourPayout";

// body: { action: "pay" | "sync" }
export async function POST(req, context) {
  try {
    const { id } = await context.params;

    const session = await isAuthenticated("admin");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { action } = await req.json().catch(() => ({}));
    const result = action === "sync" ? await syncPayout(id) : await payoutBooking(id);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ message: `payout error ${error}` }, { status: 500 });
  }
}