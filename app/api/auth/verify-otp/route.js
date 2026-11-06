import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { zSchema } from "@/lib/zodSchema";


export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json()
    const validationSchema = zSchema.pick({
        otp: true, email: true
    })

    const validatedData = validationSchema.safeParse(payload)
    if(!validatedData.success){
        return response(false, 401, `Invalid or missing input field.`, 
        validatedData.error)
    }

    const {email, otp} = validatedData.data

    const getOtpData = await OTPModel.findOne({ email, otp })
    if(!getOtpData){
        return response(false, 404, `Invalid or expired otp.`)
    }

    // FIX: was "deleteAt" (typo, field doesn't exist on schema) — now correctly excludes soft-deleted users
    const getUser = await UserModel.findOne({ deletedAt: null, email }).lean()
    if(!getUser){
        return response(false, 404, 'User not fount.')
    }

    // block check — prevent a blocked shop owner from even getting a session token
    if (getUser.role === 'shop owner' && getUser.isBlocked) {
        await getOtpData.deleteOne() // consume the OTP so it can't be reused
        return response(false, 403, 'Your shop account has been blocked by the admin. Please contact support.')
    }

    const loggedInUserData = {
        _id: getUser._id.toString(),
        role: getUser.role,
        name: getUser.name,
        avatar: getUser.avatar,
    }
    
    // create token
    const secret = new TextEncoder().encode(process.env.SECRET_KEY)
    const token = await new SignJWT(loggedInUserData)
    .setIssuedAt()
    .setExpirationTime("24h")
    .setProtectedHeader({alg: 'HS256'})
    .sign(secret)

    const cookieStore = await cookies()

    cookieStore.set({
        name: 'access_token',
        value: token,
        httpOnly: process.env.NODE_ENV === 'production',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })

    // remove otp after validation
    await getOtpData.deleteOne()
    
    // labour ko login ke baad sahi page par bhejne ke liye (token me nahi, sirf response me)
    return response(true, 200, 'Login successfull.', {
        ...loggedInUserData,
        partnerOnBoardingSteps: getUser.partnerOnBoardingSteps || 0,
        partnerStatus: getUser.partnerStatus,
    })

  } catch (error) {
    return catchError(error, "Email verification failed.");
  }
}

















// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import OTPModel from "@/models/Otp.model";
// import UserModel from "@/models/User.model";
// import { SignJWT } from "jose";
// import { cookies } from "next/headers";
// import { zSchema } from "@/lib/zodSchema";


// export async function POST(request) {
//   try {
//     await connectDB();
//     const payload = await request.json()
//     const validationSchema = zSchema.pick({
//         otp: true, email: true
//     })

//     const validatedData = validationSchema.safeParse(payload)
//     if(!validatedData.success){
//         return response(false, 401, `Invalid or missing input field.`, 
//         validatedData.error)
//     }

//     const {email, otp} = validatedData.data

//     const getOtpData = await OTPModel.findOne({ email, otp })
//     if(!getOtpData){
//         return response(false, 404, `Invalid or expired otp.`)
//     }

//     const getUser = await UserModel.findOne({ deleteAt: null, email }).lean()
//     if(!getUser){
//         return response(false, 404, 'User not fount.')
//     }

//     const loggedInUserData = {
//         _id: getUser._id.toString(),
//         role: getUser.role,
//         name: getUser.name,
//         avatar: getUser.avatar,
//     }
    
//     // create token
//     const secret = new TextEncoder().encode(process.env.SECRET_KEY)
//     const token = await new SignJWT(loggedInUserData)
//     .setIssuedAt()
//     .setExpirationTime("24h")
//     .setProtectedHeader({alg: 'HS256'})
//     .sign(secret)

//     const cookieStore = await cookies()

//     cookieStore.set({
//         name: 'access_token',
//         value: token,
//         httpOnly: process.env.NODE_ENV === 'production',
//         path: '/',
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//     })

//     // remove otp after validation
//     await getOtpData.deleteOne()
    
//     return response(true, 200, 'Login successfull.', loggedInUserData)

//   } catch (error) {
//     return catchError(error, "Email verification failed.");
//   }
// }
