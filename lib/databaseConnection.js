import dns from "dns";
import mongoose from "mongoose";

// Local DNS kabhi-kabhi SRV lookup me time-out kar deta hai (querySrv ETIMEOUT).
// Sirf Node ke liye Google/Cloudflare DNS use karo. Sab theek chalne lage to ye 2 line hata sakte ho.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGODB_URL = process.env.MONGODB_URI;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URI is missing");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "Sport-Ecommerce",
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // pehle se zyada intezaar
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // fail hua promise yaad mat rakho, agli request dobara try karegi
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;













// import mongoose from "mongoose";
// const MONGODB_URL = process.env.MONGODB_URI;

// if (!MONGODB_URL) {
//   throw new Error("MONGODB_URI is missing");
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { 
//     conn: null, 
//     promise: null 
//    };
// }

// const connectDB = async () => {
//   if (cached.conn) return cached.conn;
//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URL, {
//       dbName: "Sport-Ecommerce",
//       bufferCommands: false,
//     });
//   }

//   cached.conn = await cached.promise;

//   return cached.conn;
// };

// export default connectDB;







