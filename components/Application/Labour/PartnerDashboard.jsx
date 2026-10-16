"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, Lock, Video, MapPin, LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";
import RejectionCard from "./RejectionCard";
import StatusCard from "./StatusCard";
import ActionCard from "./ActionCard";
import PartnerEarning from "./PartnerEarning";
import PricingModal from "./PricingModal";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/reducer/authReducer";

/* ================= STEPS (Labour flow) ================= */

const STEPS = [
  { id: 1, title: "Labour Details", route: "/partner/onboarding/labour" },
  { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
  { id: 4, title: "Review" },
  { id: 5, title: "Video KYC" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Final Review" },
  { id: 8, title: "Live" },
];

const TOTAL_STEPS = STEPS.length;

function PartnerDashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const { auth: userData } = useSelector((state) => state.authStore);
  const router = useRouter();
  const [requestLoading, setRequestLoading] = useState(false);
  const [joiningKyc, setJoiningKyc] = useState(false);

  const [showPricing, setShowPricing] = useState(false);
  const [labourData, setLabourData] = useState(null);

  // NEW: number of booking requests waiting for this labour
  const [pendingCount, setPendingCount] = useState(0);

  // NEW: work-location saving
  const [locLoading, setLocLoading] = useState(false);
  const [locMsg, setLocMsg] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const autoLocTried = useRef(false);

  // NEW: stop polling when the user is logged out (avoids endless 401/400)
  const stopPolling = useRef(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (userData) {
      setActiveStep(userData.partnerOnBoardingSteps + 1);
    }
  }, [userData]);

  const handleGetPricing = async () => {
    try {
      const { data } = await axios.get("/api/partner/onboarding/pricing");
      setLabourData(data);
    } catch (error) {
      if ([400, 401].includes(error?.response?.status)) stopPolling.current = true;
    }
  };

  const loadPending = async () => {
    try {
      const { data } = await axios.get("/api/partner/bookings/pending-requests-count");
      const n =
        typeof data === "number"
          ? data
          : data?.count ?? data?.pendingCount ?? data?.total ?? 0;
      setPendingCount(Number(n) || 0);
    } catch (error) {
      if ([400, 401].includes(error?.response?.status)) stopPolling.current = true;
    }
  };

  /* ============ AUTO REFRESH (user, pricing doc, pending requests) ============ */
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const { data } = await axios.get("/api/auth/me");
        dispatch(login(data));
      } catch (error) {
        if ([400, 401].includes(error?.response?.status)) stopPolling.current = true;
      }
    };

    const refreshAll = () => {
      if (stopPolling.current) return;
      refreshUser();
      handleGetPricing();
      loadPending();
    };

    refreshAll();
    const interval = setInterval(refreshAll, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  /* ============ SAVE WORK LOCATION (so customers nearby can find this labour) ============ */
  const hasLocation =
    !!Number(labourData?.location?.latitude) && !!Number(labourData?.location?.longitude);
  const locationMissing = !!labourData && !hasLocation;

  const saveMyLocation = () => {
    if (!navigator.geolocation) {
      setLocMsg("Your browser does not support location.");
      return;
    }
    setLocLoading(true);
    setLocMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.post("/api/partner/labour-location", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: locAddress,
          });
          setLocMsg("Location saved. Customers near you can now find you.");
          handleGetPricing();
        } catch (e) {
          setLocMsg(e?.response?.data?.message || "Could not save location.");
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        setLocLoading(false);
        setLocMsg("Please allow location access in the browser, then tap the button again.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // When the labour is live and no location is saved yet, ask once automatically
  useEffect(() => {
    if (activeStep === 8 && locationMissing && !autoLocTried.current) {
      autoLocTried.current = true;
      saveMyLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, locationMissing]);

  const goToStep = (step) => {
    if (
      step.id === 6 &&
      userData?.partnerStatus === "approved" &&
      userData?.videoKycStatus === "approved"
    ) {
      setShowPricing(true);
      return;
    }

    if (step.route && step.id <= activeStep) {
      router.push(step.route);
    }
  };

  const handleJoinVideoKyc = () => {
    if (!userData?.videoKycRoomId) {
      console.error("No videoKycRoomId found on userData");
      return;
    }
    setJoiningKyc(true);
    router.push(`/video-kyc/${userData.videoKycRoomId}`);
  };

  const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-40 pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl font-bold">Partner Onboarding</h1>
          <p className="text-gray-600 mt-3">
            Complete all steps to activate your account
          </p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
          <div className="relative min-w-200">
            <div className="absolute top-7 left-0 w-full h-0.75 bg-gray-200 rounded-full" />
            <motion.div
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6 }}
              className="absolute top-7 left-0 h-0.75 bg-black rounded-full"
            />
            <div className="relative flex justify-between">
              {STEPS.map((s) => {
                const completed = s.id < activeStep;
                const active = s.id === activeStep;
                const locked = s.id > activeStep;

                return (
                  <motion.div
                    key={s.id}
                    whileHover={!locked ? { scale: 1.1 } : {}}
                    onClick={() => goToStep(s)}
                    className="flex flex-col items-center z-10 cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
                                ${
                                  completed
                                    ? "bg-black text-white border-black"
                                    : active
                                    ? "border-black bg-white"
                                    : "border-gray-300 text-gray-400 bg-white"
                                }`}
                    >
                      {completed ? (
                        <Check size={20} />
                      ) : locked ? (
                        <Lock size={20} />
                      ) : (
                        s.id
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-center">
                      {s.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {activeStep === 4 && userData?.partnerStatus === "rejected" && (
          <RejectionCard
            title="Labour Profile Rejected"
            reason={userData.rejectionReason}
            actionLabel="Review and Update"
            onAction={() => router.push("/partner/onboarding/labour")}
          />
        )}

        {activeStep === 4 && userData?.partnerStatus === "pending" && (
          <StatusCard
            icon={<Clock size={18} />}
            title="Documents under review"
            desc="Admin is verifying your documents."
          />
        )}

        {activeStep === 5 &&
          (userData?.videoKycStatus === "approved" ? (
            <StatusCard
              icon={<Check size={18} />}
              title="Video KYC approved"
              desc="You can now proceed to pricing."
            />
          ) : userData?.videoKycStatus === "rejected" ? (
            <RejectionCard
              title="Video KYC Rejected"
              reason={userData?.videoKycRejectionReason}
              actionLabel={requestLoading ? "Requesting..." : "Request Again"}
              onAction={async () => {
                setRequestLoading(true);
                await axios.get("/api/partner/video-kyc/request");
                setRequestLoading(false);
              }}
            />
          ) : userData?.videoKycStatus === "in_progress" &&
            userData?.videoKycRoomId ? (
            <ActionCard
              icon={<Video size={18} />}
              title="Admin Started Video KYC"
              button={joiningKyc ? "Joining..." : "Join Call"}
              onClick={handleJoinVideoKyc}
              disabled={joiningKyc}
            />
          ) : (
            <StatusCard
              icon={<Clock size={20} />}
              title="Waiting for Admin"
              desc="Admin will initiate Video KYC shortly."
            />
          ))}

        {activeStep === 6 && labourData?.status === "pending" && (
          <StatusCard
            icon={<Clock size={18} />}
            title="Pricing Under Review"
            desc="Admin is reviewing your submitted pricing."
          />
        )}

        {activeStep === 6 && labourData?.status === "rejected" && (
          <RejectionCard
            title="Pricing Rejected"
            reason={labourData?.rejectionReason}
            actionLabel="Edit & Resubmit"
            onAction={() => setShowPricing(true)}
          />
        )}

        {activeStep === 7 && labourData?.status === "pending" && (
          <StatusCard
            icon={<Clock size={18} />}
            title="Final Review in Progress"
            desc="Admin is completing the final checks on your profile."
          />
        )}

        {activeStep === 7 && labourData?.status === "rejected" && (
          <RejectionCard
            title="Final Review Rejected"
            reason={labourData?.rejectionReason}
            actionLabel="Edit & Resubmit"
            onAction={() => setShowPricing(true)}
          />
        )}

        {activeStep === 8 && userData?.partnerStatus === "approved" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black text-white rounded-3xl p-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold">🚀 You're Live</h2>
              {pendingCount > 0 && (
                <p className="mt-2 text-amber-300 font-semibold">
                  You have {pendingCount} new booking request{pendingCount > 1 ? "s" : ""} waiting
                </p>
              )}
              <button
                onClick={() => router.push("/partner/bookings")}
                className="relative mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                Go to Bookings <ArrowRight size={16} />
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </motion.div>

            {/* NEW: work location — customers only see labour near this point */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border">
              <div className="flex items-start gap-3">
                <MapPin className={hasLocation ? "text-emerald-600" : "text-red-500"} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Your work location</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasLocation
                      ? `Saved${labourData?.location?.address ? `: ${labourData.location.address}` : ""}. Customers within your service area can find you.`
                      : "Not set. Customers cannot find you until you save your location."}
                  </p>

                  <input
                    className="border rounded-xl p-3 w-full mt-3"
                    placeholder="Area, City (optional, e.g. Jamwa Ramgarh Road, Jaipur)"
                    value={locAddress}
                    onChange={(e) => setLocAddress(e.target.value)}
                  />

                  <button
                    onClick={saveMyLocation}
                    disabled={locLoading}
                    className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-50"
                  >
                    <LocateFixed size={16} />
                    {locLoading ? "Saving..." : hasLocation ? "Update my location" : "Save my current location"}
                  </button>

                  {locMsg && <p className="text-sm mt-3 text-gray-700">{locMsg}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        <PartnerEarning />
      </div>

      <PricingModal
        open={showPricing}
        onClose={() => {
          setShowPricing(false);
          handleGetPricing();
        }}
        data={labourData}
      />
    </div>
  );
}

export default PartnerDashboard;


















// "use client";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { ArrowRight, Check, Clock, Lock, Video } from "lucide-react";
// import { useRouter } from "next/navigation";
// import RejectionCard from "./RejectionCard";
// import StatusCard from "./StatusCard";
// import ActionCard from "./ActionCard";
// import PartnerEarning from "./PartnerEarning";
// import PricingModal from "./PricingModal";
// import { useDispatch, useSelector } from "react-redux";
// import { login } from "@/store/reducer/authReducer";

// /* ================= STEPS (Labour flow) ================= */

// const STEPS = [
//   { id: 1, title: "Labour Details", route: "/partner/onboarding/labour" },
//   { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
//   { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
//   { id: 4, title: "Review" },
//   { id: 5, title: "Video KYC" },
//   { id: 6, title: "Pricing" },
//   { id: 7, title: "Final Review" },
//   { id: 8, title: "Live" },
// ];

// const TOTAL_STEPS = STEPS.length;

// function PartnerDashboard() {
//   const [activeStep, setActiveStep] = useState(0);
//   const { auth: userData } = useSelector((state) => state.authStore);
//   const router = useRouter();
//   const [requestLoading, setRequestLoading] = useState(false);
//   const [joiningKyc, setJoiningKyc] = useState(false);

//   // NEW: pricing modal open/close state + the Labour document itself
//   // (mirrors `showPricing` + `vehicleData` from the vehicle reference,
//   // but renamed to match what it actually is here — a Labour profile,
//   // not a vehicle)
//   const [showPricing, setShowPricing] = useState(false);
//   const [labourData, setLabourData] = useState(null);

//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (userData) {
//       setActiveStep(userData.partnerOnBoardingSteps + 1);
//     }
//   }, [userData]);

//   // NEW: fetch the labour's own pricing/profile doc so we know its
//   // rateType/pricePerHour/pricePerDay (to prefill the modal on edit)
//   // and its review `status` (pending/rejected/approved) for step 6/7 cards
//   const handleGetPricing = async () => {
//     try {
//       const { data } = await axios.get("/api/partner/onboarding/pricing");
//       setLabourData(data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     handleGetPricing();
//   }, []);

//   /* ============ AUTO REFRESH USER DATA (fixes step not updating live) ============
//      Jab admin video KYC approve/reject karta hai, is partner ki dashboard screen ko
//      khud pata nahi chalta jab tak page refresh na ho. Yeh interval har 5 second me
//      latest user data fetch karke redux update kar deta hai, taaki step khud-ba-khud
//      aage badh jaye bina F5 dabaye. */
//   useEffect(() => {
//     const refreshUser = async () => {
//       try {
//         const { data } = await axios.get("/api/auth/me");
//         dispatch(login(data));
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     refreshUser(); // pehli baar turant
//     handleGetPricing(); // labourData bhi turant refresh, taaki reject/approve turant reflect ho

//     const interval = setInterval(() => {
//       refreshUser();
//       handleGetPricing(); // FIX: labourData ko bhi poll karo, warna already-open
//       // dashboard par admin ke reject/approve ka pata tab tak nahi chalta
//       // jab tak page manually refresh na ho
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [dispatch]);

//   // UPDATED: step 6 (Pricing) ko route pe navigate karne ke bajaye modal
//   // kholna hai — sirf tab jab partner review + video KYC dono approved
//   // ho chuke hon (reference ke goToStep logic jaisa)
//   const goToStep = (step) => {
//     if (
//       step.id === 6 &&
//       userData?.partnerStatus === "approved" &&
//       userData?.videoKycStatus === "approved"
//     ) {
//       setShowPricing(true);
//       return;
//     }

//     if (step.route && step.id <= activeStep) {
//       router.push(step.route);
//     }
//   };

//   const handleJoinVideoKyc = () => {
//     if (!userData?.videoKycRoomId) {
//       console.error("No videoKycRoomId found on userData");
//       return;
//     }
//     setJoiningKyc(true);
//     router.push(`/video-kyc/${userData.videoKycRoomId}`);
//   };

//   const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;

//   return (
//     <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-40 pb-20">
//       <div className="max-w-7xl mx-auto space-y-16">
//         <div>
//           <h1 className="text-4xl font-bold">Partner Onboarding</h1>
//           <p className="text-gray-600 mt-3">
//             Complete all steps to activate your account
//           </p>
//         </div>

//         <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
//           <div className="relative min-w-200">
//             <div className="absolute top-7 left-0 w-full h-0.75 bg-gray-200 rounded-full" />
//             <motion.div
//               animate={{ width: `${progressPercentage}%` }}
//               transition={{ duration: 0.6 }}
//               className="absolute top-7 left-0 h-0.75 bg-black rounded-full"
//             />
//             <div className="relative flex justify-between">
//               {STEPS.map((s) => {
//                 const completed = s.id < activeStep;
//                 const active = s.id === activeStep;
//                 const locked = s.id > activeStep;

//                 return (
//                   <motion.div
//                     key={s.id}
//                     whileHover={!locked ? { scale: 1.1 } : {}}
//                     onClick={() => goToStep(s)}
//                     className="flex flex-col items-center z-10 cursor-pointer"
//                   >
//                     <div
//                       className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
//                                 ${
//                                   completed
//                                     ? "bg-black text-white border-black"
//                                     : active
//                                     ? "border-black bg-white"
//                                     : "border-gray-300 text-gray-400 bg-white"
//                                 }`}
//                     >
//                       {completed ? (
//                         <Check size={20} />
//                       ) : locked ? (
//                         <Lock size={20} />
//                       ) : (
//                         s.id
//                       )}
//                     </div>
//                     <p className="mt-3 text-sm font-semibold text-center">
//                       {s.title}
//                     </p>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {activeStep === 4 && userData?.partnerStatus === "rejected" && (
//           <RejectionCard
//             title="Labour Profile Rejected"
//             reason={userData.rejectionReason}
//             actionLabel="Review and Update"
//             onAction={() => router.push("/partner/onboarding/labour")}
//           />
//         )}

//         {activeStep === 4 && userData?.partnerStatus === "pending" && (
//           <StatusCard
//             icon={<Clock size={18} />}
//             title="Documents under review"
//             desc="Admin is verifying your documents."
//           />
//         )}

//         {activeStep === 5 &&
//           (userData?.videoKycStatus === "approved" ? (
//             <StatusCard
//               icon={<Check size={18} />}
//               title="Video KYC approved"
//               desc="You can now proceed to pricing."
//             />
//           ) : userData?.videoKycStatus === "rejected" ? (
//             <RejectionCard
//               title="Video KYC Rejected"
//               reason={userData?.videoKycRejectionReason}
//               actionLabel={requestLoading ? "Requesting..." : "Request Again"}
//               onAction={async () => {
//                 setRequestLoading(true);
//                 await axios.get("/api/partner/video-kyc/request");
//                 setRequestLoading(false);
//               }}
//             />
//           ) : userData?.videoKycStatus === "in_progress" &&
//             userData?.videoKycRoomId ? (
//             <ActionCard
//               icon={<Video size={18} />}
//               title="Admin Started Video KYC"
//               button={joiningKyc ? "Joining..." : "Join Call"}
//               onClick={handleJoinVideoKyc}
//               disabled={joiningKyc}
//             />
//           ) : (
//             <StatusCard
//               icon={<Clock size={20} />}
//               title="Waiting for Admin"
//               desc="Admin will initiate Video KYC shortly."
//             />
//           ))}

//         {/* UPDATED: step 6/7 status cards now read the Labour doc's own
//             `status` field (labourData?.status) instead of the User's
//             overall partnerStatus — pricing approval is a separate review
//             stage from the initial partner/document approval */}
//         {activeStep === 6 && labourData?.status === "pending" && (
//           <StatusCard
//             icon={<Clock size={18} />}
//             title="Pricing Under Review"
//             desc="Admin is reviewing your submitted pricing."
//           />
//         )}

//         {activeStep === 6 && labourData?.status === "rejected" && (
//           <RejectionCard
//             title="Pricing Rejected"
//             reason={labourData?.rejectionReason}
//             actionLabel="Edit & Resubmit"
//             onAction={() => setShowPricing(true)}
//           />
//         )}

//         {activeStep === 7 && labourData?.status === "pending" && (
//           <StatusCard
//             icon={<Clock size={18} />}
//             title="Final Review in Progress"
//             desc="Admin is completing the final checks on your profile."
//           />
//         )}

//         {/* FIX: this case was missing entirely — final review rejection
//             had no UI at all, so the labour never saw it and had no way
//             to resubmit. Opens the pricing modal again so they can edit
//             and resubmit; the pricing POST route resets status back to
//             "pending" on resubmit. */}
//         {activeStep === 7 && labourData?.status === "rejected" && (
//           <RejectionCard
//             title="Final Review Rejected"
//             reason={labourData?.rejectionReason}
//             actionLabel="Edit & Resubmit"
//             onAction={() => setShowPricing(true)}
//           />
//         )}

//         {activeStep === 8 && userData?.partnerStatus === "approved" && (
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-black text-white rounded-3xl p-10 shadow-2xl"
//           >
//             <h2 className="text-2xl font-bold">🚀 You're Live</h2>
//             <button className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
//               Go to Bookings <ArrowRight size={16} />
//             </button>
//           </motion.div>
//         )}

//         <PartnerEarning />
//       </div>

//       {/* NEW: pricing modal — opens when step 6 clicked (goToStep logic
//           above), prefilled with the labour's existing pricing data if any */}
//       <PricingModal
//         open={showPricing}
//         onClose={() => {
//           setShowPricing(false);
//           handleGetPricing(); // refetch so status/values reflect the new submission
//         }}
//         data={labourData}
//       />
//     </div>
//   );
// }

// export default PartnerDashboard;










