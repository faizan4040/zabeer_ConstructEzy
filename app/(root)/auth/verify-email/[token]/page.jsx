"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";

import { Verified, XCircle, Loader2 } from "lucide-react";

const EmailVerification = ({ params }) => {
  const { token } = use(params);

  // "loading" | "success" | "error"
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const verify = async () => {
      try {
        const { data } = await axios.post(
          "/api/auth/verify-email",
          { token },
          { timeout: 120000 }
        );
        if (cancelled) return;

        if (data?.success) {
          setStatus("success");
          setMessage(data?.message || "Your email has been verified.");
        } else {
          setStatus("error");
          setMessage(data?.message || "Verification failed.");
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err?.code === "ECONNABORTED"
            ? "Server is taking too long. Please refresh and try again."
            : err?.response?.data?.message ||
                "Link expired or invalid. Please request a new verification email."
        );
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4 py-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 size={64} className="mx-auto animate-spin text-slate-400" />
              <h1 className="text-xl font-semibold text-slate-600">
                Verifying your email...
              </h1>
            </>
          )}

          {status === "success" && (
            <>
              <Verified size={100} className="mx-auto text-green-500" />
              <h1 className="text-2xl font-bold text-green-500">
                Email verification successful!
              </h1>
              <p className="text-sm text-slate-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle size={100} className="mx-auto text-red-500" />
              <h1 className="text-2xl font-bold text-red-500">
                Email verification failed!
              </h1>
              <p className="text-sm text-slate-600">{message}</p>
            </>
          )}

          {status !== "loading" && (
            <Button className="hover:bg-orange-500 hover:text-white" asChild>
              <Link href={WEBSITE_HOME}>Continue Shopping</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;


















// "use client";

// import { use, useEffect, useState } from "react";
// import axios from "axios";
// import Link from "next/link";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { WEBSITE_HOME } from "@/routes/WebsiteRoute";

// import { Verified } from "lucide-react";
// import { FaFileDownload } from "react-icons/fa";


// const EmailVerification = ({ params }) => {
//   const { token } = use(params); 
//   const [isVerified, setIsVerified] = useState(false);

//   useEffect(() => {
//        const verify = async () =>{
//         const {data: verificationResponse} = await axios.post('/api/auth/verify-email',{token})
//         if (verificationResponse.success) {
//           setIsVerified(true)
//         } else {
//           setIsVerified(false)
//         }
//     }
//     verify();
//   }, [token]);

//   return (
//     <div className="flex justify-center items-center min-h-screen">
//       <Card className="w-96">
//         <CardContent className="text-center py-8 space-y-4">
//           {isVerified === true && (
//             <>
//               <Verified size={100} className="mx-auto text-green-500" alt='Verifaication success'/>
//               <h1 className="text-2xl font-bold text-green-500" >
//                 Email verification successful!
//               </h1>
//             </>
//           )}

//           {isVerified === false && (
//             <>
//               <FaFileDownload size={100} className="mx-auto text-red-500" alt='Verifaication error'/>
//               <h1 className="text-2xl font-bold text-red-500">
//                 Email verification failed!
//               </h1>
//             </>
//           )}

//           {isVerified !== null && (
//             <Button className='hover:bg-orange-500 hover:text-white' asChild>
//               <Link href={WEBSITE_HOME}>Continue Shopping</Link>
//             </Button>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default EmailVerification;
