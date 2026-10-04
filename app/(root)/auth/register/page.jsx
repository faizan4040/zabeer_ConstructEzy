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

/* ─── Feature bullets for the left panel ─── */
const FEATURES = [
  "Verified profiles across every role",
  "Real-time order & job tracking",
  "Secure payments, zero hassle",
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fffaf3] px-4 py-8 sm:py-12">
      {/* ── ambient background glow (warm amber, no gray) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-36 -left-28 w-[26rem] h-[26rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-36 -right-20 w-[24rem] h-[24rem] rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full bg-yellow-100/50 blur-3xl" />
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_25px_70px_rgba(217,119,6,0.16)] ring-1 ring-amber-900/5 overflow-hidden flex flex-col lg:flex-row"
      >
        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="hidden lg:flex flex-col justify-between w-2/5 bg-[radial-gradient(circle_at_top_left,_#fb923c,_#f97316_45%,_#ea580c_100%)] px-10 py-10 relative overflow-hidden">
          {/* decorative rings */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full border border-white/15" />
          <div className="absolute bottom-8 -right-14 w-44 h-44 rounded-full border border-white/15" />
          <div className="absolute top-1/2 -translate-y-1/2 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <span className="text-orange-600 font-black text-lg">C</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">ConstructEzy</span>
          </div>

          {/* Center role-icon grid */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-8">
            <div className="grid grid-cols-2 gap-4 w-full max-w-[220px]">
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                return (
                  <motion.div
                    key={r.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={mounted ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                    className="aspect-square rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Icon className="w-7 h-7 text-white/90" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Copy */}
          <div className="relative z-10 text-white">
            <h2 className="text-[1.7rem] font-bold leading-snug mb-3">
              Everything you need,
              <br />
              in one place.
            </h2>
            <ul className="space-y-2.5 mb-6">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-orange-50 text-sm">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <FaCheck className="w-2 h-2 text-white" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <span className="w-6 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div
          className="flex-1 px-6 sm:px-10 lg:px-11 py-7 sm:py-9 max-h-[94vh] overflow-y-auto
                     [&::-webkit-scrollbar]:w-1.5
                     [&::-webkit-scrollbar-track]:bg-transparent
                     [&::-webkit-scrollbar-thumb]:bg-amber-300
                     [&::-webkit-scrollbar-thumb]:rounded-full
                     hover:[&::-webkit-scrollbar-thumb]:bg-amber-400"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#fcd34d transparent" }}
        >
          {/* Header */}
          <div className="mb-6">
            <p className="text-orange-600 text-xs font-bold uppercase tracking-[0.15em] mb-1.5">
              Get started
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
              Create your account
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Fill in the details below to register.
            </p>
          </div>

          {/* ── ROLE SELECTOR ── */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">I am a…</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const active = selectedRole === role.value;
                return (
                  <motion.button
                    key={role.value}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedRole(role.value);
                      setRoleError("");
                    }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 group ${
                      active
                        ? "border-orange-500 bg-orange-50/80 shadow-md shadow-orange-100"
                        : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40"
                    }`}
                  >
                    <span
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors shrink-0 ${
                        active
                          ? "bg-orange-600 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold leading-none mb-1 truncate ${
                          active ? "text-orange-700" : "text-slate-700"
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
                          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center"
                        >
                          <FaCheck className="w-2 h-2 text-white" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
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
              {/* Name + Email side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 text-sm font-semibold">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="John Doe"
                            className="pl-10 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-200 bg-slate-50"
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
                      <FormLabel className="text-slate-700 text-sm font-semibold">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                          <Input
                            type="email"
                            placeholder="you@email.com"
                            className="pl-10 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-200 bg-slate-50"
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
                      <FormLabel className="text-slate-700 text-sm font-semibold">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                          <Input
                            type={showPassword ? "password" : "text"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-200 bg-slate-50"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-500 transition-colors"
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
                      <FormLabel className="text-slate-700 text-sm font-semibold">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                          <Input
                            type={showConfirmPassword ? "password" : "text"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 rounded-xl border-slate-200 focus:border-orange-400 focus:ring-orange-200 bg-slate-50"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-500 transition-colors"
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
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-white bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 shadow-lg shadow-orange-200 transition-all duration-200 text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                  "Create Account →"
                )}
              </motion.button>

              {/* Footer */}
              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href={WEBSITE_LOGIN} className="text-orange-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;























// "use client";

// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import Link from "next/link";
// import axios from "axios";
// import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
// import { zSchema } from "@/lib/zodSchema";
// import ButtonLoading from "@/components/Application/ButtonLoading";
// import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
// import { showToast } from "@/lib/showToast";

// /* ─── Role Options (admin excluded from self-registration) ─── */
// const ROLES = [
//   {
//     value: "customer",
//     label: "Customer",
//     icon: "🛍️",
//     desc: "Browse & shop products",
//   },
//   {
//     value: "shop owner",
//     label: "Shop Owner",
//     icon: "🏪",
//     desc: "Manage your store",
//   },
//   {
//     value: "laber",
//     label: "Labour",
//     icon: "🔧",
//     desc: "Offer your services",
//   },
//   {
//     value: "delivery boy",
//     label: "Delivery",
//     icon: "🚴",
//     desc: "Deliver orders",
//   },

//   //  {
//   //    value: "admin", 
//   //   label: "Admin", 
//   //   icon: "👑", 
//   //   desc: "Manage the entire platform"
//   //  }
// ];

// /* ─── Decorative left-panel illustration (inline SVG) ─── */
// const PanelIllustration = () => (
//   <svg viewBox="0 0 480 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto">
//     {/* Background blob */}
//     <ellipse cx="240" cy="300" rx="200" ry="220" fill="url(#blobGrad)" opacity="0.18" />
//     {/* Store building */}
//     <rect x="120" y="230" width="240" height="180" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
//     <rect x="140" y="250" width="80" height="60" rx="6" fill="url(#windowGrad)" />
//     <rect x="260" y="250" width="80" height="60" rx="6" fill="url(#windowGrad)" />
//     <rect x="185" y="330" width="110" height="80" rx="8" fill="#f1f5f9"/>
//     <rect x="200" y="345" width="30" height="30" rx="4" fill="url(#accentGrad)" opacity="0.6"/>
//     <rect x="250" y="345" width="30" height="30" rx="4" fill="url(#accentGrad)" opacity="0.6"/>
//     {/* Roof / awning */}
//     <path d="M100 232 Q240 190 380 232" stroke="url(#accentGrad)" strokeWidth="6" strokeLinecap="round" fill="none"/>
//     <rect x="100" y="225" width="280" height="18" rx="9" fill="url(#roofGrad)"/>
//     {/* Sign */}
//     <rect x="160" y="195" width="160" height="36" rx="8" fill="url(#signGrad)"/>
//     <circle cx="182" cy="213" r="6" fill="white" opacity="0.7"/>
//     <rect x="196" y="208" width="80" height="4" rx="2" fill="white" opacity="0.7"/>
//     <rect x="196" y="216" width="56" height="4" rx="2" fill="white" opacity="0.5"/>
//     {/* Delivery bike */}
//     <circle cx="370" cy="400" r="24" stroke="url(#accentGrad)" strokeWidth="3" fill="none"/>
//     <circle cx="320" cy="400" r="24" stroke="url(#accentGrad)" strokeWidth="3" fill="none"/>
//     <path d="M320 400 L345 370 L370 400" stroke="#64748b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
//     <rect x="335" y="358" width="26" height="16" rx="4" fill="url(#accentGrad)" opacity="0.8"/>
//     <circle cx="345" cy="370" r="5" fill="#64748b"/>
//     {/* Person / customer */}
//     <circle cx="150" cy="370" r="22" fill="url(#personGrad)"/>
//     <path d="M128 410 Q150 390 172 410" stroke="url(#personGrad)" strokeWidth="10" strokeLinecap="round" fill="none"/>
//     <circle cx="150" cy="363" r="10" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5"/>
//     {/* Tool / labour icon */}
//     <rect x="200" y="430" width="80" height="30" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5"/>
//     <rect x="214" y="438" width="12" height="14" rx="2" fill="url(#accentGrad)" opacity="0.7"/>
//     <rect x="234" y="438" width="32" height="4" rx="2" fill="#94a3b8"/>
//     <rect x="234" y="446" width="22" height="4" rx="2" fill="#cbd5e1"/>
//     {/* Stars / sparkles */}
//     <circle cx="90" cy="250" r="4" fill="#fbbf24" opacity="0.7"/>
//     <circle cx="400" cy="260" r="3" fill="#a78bfa" opacity="0.6"/>
//     <circle cx="410" cy="350" r="5" fill="#34d399" opacity="0.5"/>
//     <circle cx="75" cy="360" r="3" fill="#f472b6" opacity="0.6"/>
//     <defs>
//       <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
//         <stop offset="0%" stopColor="#6366f1"/>
//         <stop offset="100%" stopColor="#ec4899"/>
//       </linearGradient>
//       <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
//         <stop offset="0%" stopColor="#6366f1"/>
//         <stop offset="100%" stopColor="#8b5cf6"/>
//       </linearGradient>
//       <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="0">
//         <stop offset="0%" stopColor="#6366f1"/>
//         <stop offset="50%" stopColor="#8b5cf6"/>
//         <stop offset="100%" stopColor="#ec4899"/>
//       </linearGradient>
//       <linearGradient id="signGrad" x1="0" y1="0" x2="1" y2="0">
//         <stop offset="0%" stopColor="#4f46e5"/>
//         <stop offset="100%" stopColor="#7c3aed"/>
//       </linearGradient>
//       <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
//         <stop offset="0%" stopColor="#e0e7ff"/>
//         <stop offset="100%" stopColor="#c7d2fe"/>
//       </linearGradient>
//       <linearGradient id="personGrad" x1="0" y1="0" x2="1" y2="1">
//         <stop offset="0%" stopColor="#6366f1"/>
//         <stop offset="100%" stopColor="#4f46e5"/>
//       </linearGradient>
//     </defs>
//   </svg>
// );

// /* ═══════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════ */
// const RegisterPage = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(true);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(true);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [roleError, setRoleError] = useState("");
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => setMounted(true), []);

//   const formSchema = zSchema
//     .pick({ name: true, email: true, password: true })
//     .extend({ confirmPassword: z.string() })
//     .refine((data) => data.password === data.confirmPassword, {
//       message: "Passwords do not match",
//       path: ["confirmPassword"],
//     });

//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
//   });

//   const handleRegisterSubmit = async (values) => {
//     if (!selectedRole) {
//       setRoleError("Please select your role to continue.");
//       return;
//     }
//     setRoleError("");
//     try {
//       setLoading(true);
//       const { data: res } = await axios.post("/api/auth/register", {
//         ...values,
//         role: selectedRole,
//       });
//       if (!res.success) throw new Error(res.message);
//       form.reset();
//       setSelectedRole("");
//       showToast("success", res.message);
//     } catch (error) {
//       showToast("error", error.message || "Registration failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 px-4 py-10"
//       style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
//     >
//       {/* Card */}
//       <div
//         className={`w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row transition-all duration-700 ${
//           mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
//         }`}
//         style={{ boxShadow: "0 24px 80px rgba(99,102,241,0.13), 0 2px 12px rgba(0,0,0,0.07)" }}
//       >
//         {/* ── LEFT PANEL ── */}
//         <div className="hidden lg:flex flex-col justify-between w-5/12 bg-linear-to-b from-indigo-600 via-violet-600 to-purple-700 px-10 py-12 relative overflow-hidden">
//           {/* Decorative circles */}
//           <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10" />
//           <div className="absolute bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/5" />

//           {/* Brand */}
//           <div className="relative z-10">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow">
//                 <span className="text-indigo-600 font-black text-lg">B</span>
//               </div>
//               <span className="text-white font-bold text-xl tracking-wide">ConstructEzy</span>
//             </div>
//           </div>

//           {/* Illustration */}
//           <div className="relative z-10 flex-1 flex items-center justify-center py-8">
//             <PanelIllustration />
//           </div>

//           {/* Copy */}
//           <div className="relative z-10 text-white">
//             <h2 className="text-2xl font-bold leading-snug mb-2">
//               Everything you need,<br />in one place.
//             </h2>
//             <p className="text-indigo-200 text-sm leading-relaxed">
//               Join thousands of customers, shop owners, labourers &amp; delivery boys on our platform.
//             </p>
//             {/* Dots */}
//             <div className="flex gap-2 mt-5">
//               <span className="w-6 h-2 rounded-full bg-white" />
//               <span className="w-2 h-2 rounded-full bg-white/40" />
//               <span className="w-2 h-2 rounded-full bg-white/40" />
//             </div>
//           </div>
//         </div>

//         {/* ── RIGHT PANEL ── */}
//         <div className="flex-1 px-8 sm:px-12 py-10 overflow-y-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-1">Get started</p>
//             <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">Create your account</h1>
//             <p className="text-slate-500 text-sm mt-1">Fill in the details below to register.</p>
//           </div>

//           {/* ── ROLE SELECTOR ── */}
//           <div className="mb-7">
//             <p className="text-sm font-semibold text-slate-700 mb-3">I am a…</p>
//             <div className="grid grid-cols-2 gap-3">
//               {ROLES.map((role) => (
//                 <button
//                   key={role.value}
//                   type="button"
//                   onClick={() => { setSelectedRole(role.value); setRoleError(""); }}
//                   className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 group ${
//                     selectedRole === role.value
//                       ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
//                       : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
//                   }`}
//                 >
//                   <span
//                     className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
//                       selectedRole === role.value
//                         ? "bg-indigo-100"
//                         : "bg-slate-100 group-hover:bg-indigo-100"
//                     }`}
//                   >
//                     {role.icon}
//                   </span>
//                   <div>
//                     <p className={`text-sm font-semibold leading-none mb-0.5 ${selectedRole === role.value ? "text-indigo-700" : "text-slate-700"}`}>
//                       {role.label}
//                     </p>
//                     <p className="text-xs text-slate-400 leading-none">{role.desc}</p>
//                   </div>
//                   {selectedRole === role.value && (
//                     <span className="ml-auto w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
//                       <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
//                         <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                     </span>
//                   )}
//                 </button>
//               ))}
//             </div>
//             {roleError && <p className="text-red-500 text-xs mt-2 font-medium">{roleError}</p>}
//           </div>

//           {/* Divider */}
//           <div className="flex items-center gap-3 mb-6">
//             <div className="flex-1 h-px bg-slate-200" />
//             <span className="text-slate-400 text-xs font-medium">Your details</span>
//             <div className="flex-1 h-px bg-slate-200" />
//           </div>

//           {/* ── FORM ── */}
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-5">
//               {/* Name + Email side by side */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-slate-700 text-sm font-semibold">Full Name</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="text"
//                           placeholder="John Doe"
//                           className="rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-slate-700 text-sm font-semibold">Email</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="email"
//                           placeholder="you@email.com"
//                           className="rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Password + Confirm Password */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                 <FormField
//                   control={form.control}
//                   name="password"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-slate-700 text-sm font-semibold">Password</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Input
//                             type={showPassword ? "password" : "text"}
//                             placeholder="••••••••"
//                             className="pr-10 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50"
//                             {...field}
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowPassword(!showPassword)}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
//                           >
//                             {showPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
//                           </button>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="confirmPassword"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-slate-700 text-sm font-semibold">Confirm Password</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Input
//                             type={showConfirmPassword ? "password" : "text"}
//                             placeholder="••••••••"
//                             className="pr-10 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50"
//                             {...field}
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
//                           >
//                             {showConfirmPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
//                           </button>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 rounded-2xl font-bold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all duration-200 text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2"
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
//                     </svg>
//                     Creating Account…
//                   </span>
//                 ) : (
//                   "Create Account →"
//                 )}
//               </button>

//               {/* Footer */}
//               <p className="text-center text-sm text-slate-500">
//                 Already have an account?{" "}
//                 <Link href={WEBSITE_LOGIN} className="text-indigo-600 font-semibold hover:underline">
//                   Sign in
//                 </Link>
//               </p>
//             </form>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;


