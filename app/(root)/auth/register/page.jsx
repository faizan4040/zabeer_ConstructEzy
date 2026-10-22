"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import {
  FaBagShopping,
  FaStore,
  FaHelmetSafety,
  FaMotorcycle,
  FaCheck,
} from "react-icons/fa6";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { zSchema } from "@/lib/zodSchema";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { showToast } from "@/lib/showToast";

/* ─── Role Options (admin excluded from self-registration) ─── */
const ROLES = [
  // {
  //   value: "admin",
  //   label: "Admin",
  //   icon: FaBagShopping,
  //   desc: "Manage the platform",
  // },
  {
    value: "customer",
    label: "Customer",
    icon: FaBagShopping,
    desc: "Browse & shop products",
  },
  {
    value: "shop owner",
    label: "Shop Owner",
    icon: FaStore,
    desc: "Manage your store",
  },
  {
    value: "laber",
    label: "Labour",
    icon: FaHelmetSafety,
    desc: "Offer your services",
  },
  {
    value: "delivery boy",
    label: "Delivery",
    icon: FaMotorcycle,
    desc: "Deliver orders",
  },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleError, setRoleError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const formSchema = zSchema
    .pick({ name: true, email: true, password: true })
    .extend({ confirmPassword: z.string() })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const handleRegisterSubmit = async (values) => {
    if (!selectedRole) {
      setRoleError("Please select your role to continue.");
      return;
    }
    setRoleError("");
    try {
      setLoading(true);
      const { data: res } = await axios.post("/api/auth/register", {
        ...values,
        role: selectedRole,
      });
      if (!res.success) throw new Error(res.message);
      form.reset();
      setSelectedRole("");
      showToast("success", res.message);
    } catch (error) {
      showToast("error", error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-slate-200 px-6 sm:px-8 py-8 sm:py-10"
      >
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <span className="text-slate-800 font-bold text-xl">ConstructEzy</span>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in the details below to register.
          </p>
        </div>

        {/* ── ROLE SELECTOR ── */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">I am a…</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value);
                    setRoleError("");
                  }}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors group ${
                    active
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                      : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40"
                  }`}
                >
                  <span
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold leading-none mb-1 truncate ${
                        active ? "text-blue-700" : "text-slate-700"
                      }`}
                    >
                      {role.label}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-none truncate">
                      {role.desc}
                    </p>
                  </div>

                  <AnimatePresence>
                    {active && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center"
                      >
                        <FaCheck className="w-2 h-2 text-white" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {roleError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-xs mt-2 font-medium"
              >
                {roleError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-xs font-medium">Your details</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* ── FORM ── */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-4">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-sm font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 h-11 rounded-lg border-slate-300 bg-white focus-visible:border-blue-500 focus-visible:ring-blue-200"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-sm font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="you@email.com"
                          className="pl-10 h-11 rounded-lg border-slate-300 bg-white focus-visible:border-blue-500 focus-visible:ring-blue-200"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-sm font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type={showPassword ? "password" : "text"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11 rounded-lg border-slate-300 bg-white focus-visible:border-blue-500 focus-visible:ring-blue-200"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 text-sm font-medium">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type={showConfirmPassword ? "password" : "text"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11 rounded-lg border-slate-300 bg-white focus-visible:border-blue-500 focus-visible:ring-blue-200"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <FaRegEye size={16} />
                          ) : (
                            <FaRegEyeSlash size={16} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                  Creating Account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 pt-2">
              Already have an account?{" "}
              <Link href={WEBSITE_LOGIN} className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;