import connectDB from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import ShopModel from "@/models/Shop.model";
import { SignJWT } from "jose";
import { emailVerificationLink } from "@/email/emailVerificationLink";
import { catchError, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import slugify from "slugify";
import { z } from "zod";

const ALLOWED_ROLES = ["admin", "customer", "shop owner", "laber", "delivery boy"];

export async function POST(request) {
  try {
    await connectDB();

    const validationSchema = zSchema
      .pick({ name: true, email: true, password: true })
      .extend({
        role: z.string().refine((r) => ALLOWED_ROLES.includes(r), {
          message: "Invalid role selected.",
        }),
      });

    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error);
    }

    const { name, email, password, role } = validatedData.data;

    const existingUser = await UserModel.exists({ email });
    if (existingUser) {
      return response(false, 409, "User already registered with this email.");
    }

    const newUser = new UserModel({ name, email, password, role });

    /* ── If registering as shop owner, auto-create their Shop ── */
    if (role === "shop owner") {
      const baseSlug = slugify(name, { lower: true });
      let slug = baseSlug;
      let counter = 1;
      // ensure slug uniqueness
      while (await ShopModel.exists({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const newShop = new ShopModel({
        name: `${name}'s Shop`,
        slug,
        owner: newUser._id,
      });
      await newShop.save();
      newUser.shop = newShop._id;
    }

    await newUser.save();

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ userId: newUser._id.toString() })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    await sendMail(
      "Email verification request from ConstructEzy",
      email,
      emailVerificationLink(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`)
    );

    return response(true, 200, "Registration successful! Please verify your email address.");
  } catch (error) {
    return catchError(error);
  }
}




