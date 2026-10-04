import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    // Only admins can access this dashboard
    const authResult = await isAuthenticated("admin");
    if (!authResult.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 400 });
    }

    // NOTE: your User role enum uses "laber" (not "partner") for
    // labour partners — see role enum in User.model.js
    const totalPartners = await User.countDocuments({ role: "laber" });
    const totalApprovedPartners = await User.countDocuments({
      role: "laber",
      partnerStatus: "approved",
    });
    const totalPendingPartners = await User.countDocuments({
      role: "laber",
      partnerStatus: "pending",
    });
    const totalRejectedPartners = await User.countDocuments({
      role: "laber",
      partnerStatus: "rejected",
    });

    // Users who have completed at least steps 1-3 (labour details,
    // documents, bank) and are awaiting admin review
    const pendingPartnerUsers = await User.find({
      role: "laber",
      partnerStatus: "pending",
      partnerOnBoardingSteps: { $gte: 3 },
    });

    const partnerIds = pendingPartnerUsers.map((p) => p._id);

    const partnerLabours = await Labour.find({
      owner: { $in: partnerIds },
    });

    const categoryMap = new Map(
      partnerLabours.map((l) => [String(l.owner), l.category])
    );

    const pendingPartnersReviews = pendingPartnerUsers.map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      category: categoryMap.get(String(p._id)),
    }));

    // FIX: Full labour profiles pending FINAL review must only include
    // labours whose owner has ALREADY cleared:
    //   1) partner review  (partnerStatus === "approved")
    //   2) video KYC       (videoKycStatus === "approved")
    // Without this owner-status match, a Labour doc (status: "pending"
    // by schema default from the moment it's created) would show up
    // here immediately at registration — before partner review or KYC
    // even happen — which was the original bug.
    //
    // populate() with `match` sets owner to null for any Labour doc
    // whose owner doesn't satisfy the match condition (instead of
    // excluding it from the array), so we filter those out manually.
    const pendingLaboursRaw = await Labour.find({
      status: "pending",
    }).populate({
      path: "owner",
      match: {
        role: "laber",
        partnerStatus: "approved",
        videoKycStatus: "approved",
      },
    });

    const pendingLabours = pendingLaboursRaw.filter((l) => l.owner !== null);

    return NextResponse.json(
      {
        pendingLabours,
        stats: {
          totalPartners,
          totalApprovedPartners,
          totalPendingPartners,
          totalRejectedPartners,
        },
        pendingPartnersReviews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: `admin dashboard error ${error}` },
      { status: 500 }
    );
  }
}












