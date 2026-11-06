"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Onboarding pages (labour / documents / bank) ke liye:
// labour pehle se live (KYC + approval complete) hai to form dobara mat dikhao, dashboard par bhejo.
// Warna galti se form submit karke wo wapas "review" me chala jata.
export default function useLabourOnboardingGuard() {
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    axios.get("/api/auth/me")
      .then(({ data }) => {
        if (alive && data?.role === "laber" && data.partnerOnBoardingSteps >= 7 && data.partnerStatus === "approved") {
          router.replace("/");
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [router]);
}
