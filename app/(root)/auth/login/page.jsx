"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { zSchema } from "@/lib/zodSchema";
import { WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import OTPVerification from "@/components/Application/OTPVerification";
import { useDispatch } from "react-redux";
import { login } from "@/store/reducer/authReducer";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";
import { SHOP_OWNER_DASHBOARD } from "@/routes/ShopOwnerPanelRoute";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Role → dashboard map (keep in sync with middleware) ─── */
const ROLE_DASHBOARDS = {
  admin: ADMIN_DASHBOARD,
  customer: "/my-account/dashboard",
  "shop owner": SHOP_OWNER_DASHBOARD,
  laber: "/partner/onboarding/labour",
  "delivery boy": "/delivery/dashboard",
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const LoginPage = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [otpEmail, setOtpEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* ── Form schema ── */
  const formSchema = zSchema.pick({ email: true }).extend({
    password: z.string().min(1, "Password is required."),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  /* ── Step 1: Login → triggers OTP send ── */
  const handleLoginSubmit = async (values) => {
    try {
      setLoading(true);
      const { data: res } = await axios.post("/api/auth/login", values);
      if (!res.success) throw new Error(res.message);
      setOtpEmail(values.email);
      form.reset();
      showToast("success", res.message);
    } catch (error) {
      showToast("error", error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: OTP verification → dispatch + redirect ── */
  const handleOtpVerification = async (values) => {
    try {
      setOtpLoading(true);
      const { data: res } = await axios.post("/api/auth/verify-otp", values);
      if (!res.success) throw new Error(res.message);

      setOtpEmail("");
      showToast("success", res.message);
      dispatch(login(res.data));

      const callback = searchParams.get("callback");
      const dashboard = ROLE_DASHBOARDS[res.data.role] ?? "/";
      router.push(callback || dashboard);
    } catch (error) {
      showToast("error", error.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 px-6 sm:px-8 py-8 sm:py-10"
      >
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <span className="text-slate-800 font-bold text-xl">ConstructEzy</span>
        </div>

        <AnimatePresence mode="wait">
          {!otpEmail ? (
            /* ════ LOGIN FORM ════ */
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Sign in</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your credentials to continue.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 text-sm font-medium">
                          Email address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="you@email.com"
                              className="pl-10 h-11 rounded-lg border-slate-300 bg-white"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-700 text-sm font-medium">
                            Password
                          </FormLabel>
                          <Link
                            href={WEBSITE_RESETPASSWORD}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type={showPassword ? "password" : "text"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 h-11 rounded-lg border-slate-300 bg-white"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Verifying…
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-500 pt-2">
                    Don&apos;t have an account?{" "}
                    <Link href={WEBSITE_REGISTER} className="text-blue-600 font-medium hover:underline">
                      Create one
                    </Link>
                  </p>
                </form>
              </Form>
            </motion.div>
          ) : (
            /* ════ OTP STEP ════ */
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">Check your email</h1>
                <p className="text-slate-500 text-sm mt-1">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-slate-700">{otpEmail}</span>. Enter it below
                  to sign in.
                </p>
              </div>

              {/* Email badge */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <HiOutlineMail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 leading-none mb-0.5">Code sent to</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{otpEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpEmail("")}
                  className="ml-auto shrink-0 text-xs text-blue-600 font-medium hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Existing OTPVerification component — unchanged */}
              <OTPVerification
                email={otpEmail}
                onSubmit={handleOtpVerification}
                loading={otpLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;