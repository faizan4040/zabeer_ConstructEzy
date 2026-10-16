import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Labour from "@/models/Labour.model";

const ownerKey = (d) => String(d?.owner || d?.user || d?.partner || d?.userId || d?.partnerId || "");

export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated("admin");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const labours = await Labour.find()
      .sort({ createdAt: -1 })
      .populate({ path: "owner", select: "name email phone partnerStatus videoKycStatus" })
      .lean();

    const ownerIds = labours.map((l) => l.owner?._id).filter(Boolean);

    // falls back to null if the export differs
    const PartnerDocs = await import("@/models/partnerDocs.model").then((m) => m.default || null).catch(() => null);
    const PartnerBank = await import("@/models/PartnerBank.model").then((m) => m.default || null).catch(() => null);

    const docs = PartnerDocs ? await PartnerDocs.find({}).lean() : [];
    const banks = PartnerBank ? await PartnerBank.find({}).lean() : [];

    const docsMap = new Map(docs.map((d) => [ownerKey(d), d]));
    const bankMap = new Map(banks.map((b) => [ownerKey(b), b]));
    const wanted = new Set(ownerIds.map(String));

    const data = labours.map((l) => {
      const key = String(l.owner?._id || "");
      return {
        ...l,
        docs: wanted.has(key) ? docsMap.get(key) || null : null,
        bank: wanted.has(key) ? bankMap.get(key) || null : null,
      };
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `admin labour list error ${error}` }, { status: 500 });
  }
}