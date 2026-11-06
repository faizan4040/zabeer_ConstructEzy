import mongoose from "mongoose";
import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import UserModel from "@/models/User.model";
import Labour from "@/models/Labour.model";
import { NextResponse } from "next/server";

const ownerKey = (d) => String(d?.owner || d?.user || d?.partner || d?.userId || d?.partnerId || "");
const toIds = (arr) => [...new Set(arr.filter((x) => x && mongoose.isValidObjectId(x)).map(String))].map((x) => new mongoose.Types.ObjectId(x));

// READ-ONLY. Register wale labour ko kai jagah se dhundhta hai:
//  1) Labour profile wale   2) role "laber" wale users   3) onboarding shuru kar chuke users
//  4) jinke documents / bank record bane hain.
export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized. Admin account se login karo.");
    await connectDB();

    const sp = new URL(req.url).searchParams;
    const start = parseInt(sp.get("start") || "0"), size = Math.min(500, parseInt(sp.get("size") || "10"));
    const g = (sp.get("globalFilter") || "").trim().toLowerCase();

    const profiles = await Labour.find().lean();
    const profileByOwner = new Map(profiles.map((p) => [String(p.owner), p]));

    const PartnerDocs = await import("@/models/partnerDocs.model").then((m) => m.default || null).catch(() => null);
    const PartnerBank = await import("@/models/PartnerBank.model").then((m) => m.default || null).catch(() => null);
    const docs = PartnerDocs ? await PartnerDocs.find({}).lean().catch(() => []) : [];
    const banks = PartnerBank ? await PartnerBank.find({}).lean().catch(() => []) : [];
    const docMap = new Map(docs.map((d) => [ownerKey(d), d]));
    const bankMap = new Map(banks.map((b) => [ownerKey(b), b]));

    const profileOwners = toIds(profiles.map((p) => p.owner));
    const partnerIds = toIds([...docs, ...banks].map(ownerKey));
    const NOT_LABOUR = ["admin", "delivery boy", "shop owner"];

    const users = await UserModel.find({
      deletedAt: null,
      $or: [
        { role: "laber" },
        { _id: { $in: profileOwners } },
        { role: { $nin: NOT_LABOUR }, $or: [{ partnerOnBoardingSteps: { $gt: 0 } }, { _id: { $in: partnerIds } }] },
      ],
    })
      .select("name email phone address avatar role partnerOnBoardingSteps partnerStatus videoKycStatus rejectionReason isBlocked isEmailVerified createdAt")
      .sort({ createdAt: -1 }).lean();

    let rows = users.map((u) => {
      const p = profileByOwner.get(String(u._id));
      return {
        _id: String(u._id), userId: String(u._id), profileId: p ? String(p._id) : null,
        name: p?.fullName || u.name, phone: p?.phone || u.phone || "", email: u.email, role: u.role,
        image: p?.profileImage || u.avatar?.url || "", about: p?.about || "",
        category: p?.category || "", rateType: p?.rateType || "", pricePerHour: p?.pricePerHour, pricePerDay: p?.pricePerDay,
        experienceYears: p?.experienceYears ?? 0, skills: p?.skills || [],
        address: p?.location?.address || u.address || "", serviceRadius: p?.serviceRadius, availability: p?.availability || "",
        rating: p?.rating ?? 0, totalReviews: p?.totalReviews ?? 0, completedJobs: p?.completedJobs ?? 0,
        aadhaarNumber: p?.aadhaarNumber || "", aadhaarImage: p?.aadhaarImage || "",
        isVerified: !!p?.isVerified, isActive: p ? p.isActive !== false : true,
        hasProfile: !!p, onboardingStep: u.partnerOnBoardingSteps ?? 0,
        status: p?.status || u.partnerStatus || "pending", rejectionReason: p?.rejectionReason || u.rejectionReason || "",
        videoKycStatus: u.videoKycStatus || "not_required", isBlocked: !!u.isBlocked, isEmailVerified: !!u.isEmailVerified,
        createdAt: u.createdAt, bank: bankMap.get(String(u._id)) || null, docs: docMap.get(String(u._id)) || null,
      };
    });

    if (g) rows = rows.filter((r) => `${r.name} ${r.phone} ${r.email} ${r.category} ${r.address}`.toLowerCase().includes(g));

    // diagnostic: agar list khali ho to pata chale ki DB me kis role ke kitne users hain
    const roles = await UserModel.aggregate([{ $group: { _id: "$role", n: { $sum: 1 } } }]);
    return NextResponse.json({
      success: true, data: rows.slice(start, start + size),
      meta: { totalRowCount: rows.length, debug: { roles: Object.fromEntries(roles.map((r) => [r._id, r.n])), labourProfiles: profiles.length, partnerDocs: docs.length, partnerBanks: banks.length } },
    });
  } catch (e) { return catchError(e); }
}
