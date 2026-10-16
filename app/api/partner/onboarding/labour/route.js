import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";

const PHONE_REGEX = /^[6-9]\d{9}$/;

const LABOUR_CATEGORIES = [
  "helpers", "masons", "electricians", "plumbers", "carpenters", "painters",
  "tile-experts", "welders", "jcb-operators", "contractors", "engineers",
];

const RATE_TYPES = ["hour", "day", "both"];
const ALLOWED_ROLES = ["customer", "laber"];

export async function POST(req) {
  try {
    await connectDb();

    const authResult = await isAuthenticated(ALLOWED_ROLES);
    if (!authResult.isAuth) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    if (authResult.blocked) {
      return Response.json({ message: "account blocked" }, { status: 403 });
    }

    const user = await User.findById(authResult.userId);
    if (!user) {
      return Response.json({ message: "user not found" }, { status: 400 });
    }

    const {
      category, fullName, phone, experienceYears, rateType,
      pricePerHour, pricePerDay, skills, about,
      address, latitude, longitude, // NEW: home / base location
    } = await req.json();

    if (!category || !fullName || !phone || !rateType) {
      return Response.json({ message: "missing required details" }, { status: 400 });
    }
    if (!LABOUR_CATEGORIES.includes(category)) {
      return Response.json({ message: "invalid category selected" }, { status: 400 });
    }
    if (!RATE_TYPES.includes(rateType)) {
      return Response.json({ message: "invalid rate type" }, { status: 400 });
    }

    const sanitizedPhone = phone.trim();
    if (!PHONE_REGEX.test(sanitizedPhone)) {
      return Response.json({ message: "invalid phone number format" }, { status: 400 });
    }

    const needsHourly = rateType === "hour" || rateType === "both";
    const needsDaily = rateType === "day" || rateType === "both";

    if (needsHourly && (!pricePerHour || Number(pricePerHour) <= 0)) {
      return Response.json({ message: "enter a valid price per hour" }, { status: 400 });
    }
    if (needsDaily && (!pricePerDay || Number(pricePerDay) <= 0)) {
      return Response.json({ message: "enter a valid price per day" }, { status: 400 });
    }

    // location is saved only when the form really sent real coordinates
    const lat = Number(latitude);
    const lon = Number(longitude);
    const loc =
      lat && lon && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
        ? { latitude: lat, longitude: lon, address: (address || "").trim() }
        : null;

    let labour = await Labour.findOne({ owner: user._id });

    if (labour) {
      const duplicate = await Labour.findOne({
        phone: sanitizedPhone,
        owner: { $ne: user._id },
      });
      if (duplicate) {
        return Response.json(
          { message: "phone number already registered with another profile" },
          { status: 400 }
        );
      }

      labour.category = category;
      labour.fullName = fullName;
      labour.phone = sanitizedPhone;
      labour.experienceYears = experienceYears || 0;
      labour.rateType = rateType;
      labour.pricePerHour = needsHourly ? pricePerHour : undefined;
      labour.pricePerDay = needsDaily ? pricePerDay : undefined;
      labour.skills = Array.isArray(skills) ? skills : [];
      labour.about = about || "";
      if (loc) labour.location = loc; // NEW
      labour.status = "pending";
      await labour.save();

      user.partnerOnBoardingSteps = user.partnerOnBoardingSteps < 2 ? 2 : 3;
      user.partnerStatus = "pending";
      await user.save();

      return Response.json(labour, { status: 200 });
    }

    const duplicate = await Labour.findOne({ phone: sanitizedPhone });
    if (duplicate) {
      return Response.json({ message: "phone number already registered" }, { status: 400 });
    }

    labour = await Labour.create({
      owner: user._id,
      category,
      fullName,
      phone: sanitizedPhone,
      experienceYears: experienceYears || 0,
      rateType,
      pricePerHour: needsHourly ? pricePerHour : undefined,
      pricePerDay: needsDaily ? pricePerDay : undefined,
      skills: Array.isArray(skills) ? skills : [],
      about: about || "",
      ...(loc && { location: loc }), // NEW
    });

    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }
    user.role = "laber";
    user.partnerStatus = "pending";
    await user.save();

    return Response.json(labour, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ message: `labour error ${error}` }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDb();

    const authResult = await isAuthenticated(ALLOWED_ROLES);
    if (!authResult.isAuth) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    if (authResult.blocked) {
      return Response.json({ message: "account blocked" }, { status: 403 });
    }

    const user = await User.findById(authResult.userId);
    if (!user) {
      return Response.json({ message: "user not found" }, { status: 400 });
    }

    const labour = await Labour.findOne({ owner: user._id });
    if (labour) {
      return Response.json(labour, { status: 200 });
    }
    return Response.json({ message: "labour profile not found" }, { status: 400 });
  } catch (error) {
    return Response.json({ message: `get labour error ${error}` }, { status: 500 });
  }
}