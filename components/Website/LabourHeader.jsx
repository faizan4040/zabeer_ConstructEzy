"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, User } from "lucide-react";
import axios from "axios";
import { Avatar, AvatarImage } from "../ui/avatar";
import { IMAGES } from "@/routes/AllImages";
import { logout } from "@/store/reducer/authReducer";

const ACCENT = "#F5A623"; // safety-amber — construction/high-vis accent
const HOME_HREF = "/partner/dashboard";

/* Avatar bahar define kiya hai taaki har render par remount na ho */
function AvatarCircle({ auth, size = 40 }) {
  const initial = auth?.name?.charAt(0)?.toUpperCase();
  return (
    <span
      className="rounded-full bg-white text-black font-bold flex items-center justify-center overflow-hidden shrink-0 select-none"
      style={{ width: size, height: size }}
    >
      {auth?.avatar?.url ? (
        <Avatar style={{ width: size, height: size }}>
          <AvatarImage src={auth.avatar.url} className="object-cover" />
        </Avatar>
      ) : initial ? (
        <span className="text-base">{initial}</span>
      ) : (
        <User size={18} />
      )}
    </span>
  );
}

export default function LabourHeader() {
  const auth = useSelector((store) => store.authStore.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef(null);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return;
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await axios.get("/api/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(logout());
      setLoggingOut(false);
      setProfileOpen(false);
      router.push("/auth/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B] text-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: Logo */}
        <Link href={HOME_HREF} className="flex shrink-0 items-center">
          <img
            src={IMAGES.logo}
            className="h-8 w-auto object-contain sm:h-9"
            alt="QuickMason"
          />
        </Link>

        {/* RIGHT: Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="cursor-pointer rounded-full ring-2 ring-transparent transition-all hover:ring-white/20"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <AvatarCircle auth={auth} size={40} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[calc(100%+12px)] w-72 origin-top-right overflow-hidden rounded-2xl border border-black/5 bg-white text-black shadow-2xl"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 px-5 pb-4 pt-5">
                  <AvatarCircle auth={auth} size={44} />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{auth?.name}</p>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: ACCENT }}
                    >
                      Labour Partner
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href={`/profile/${auth?.id}`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
                  >
                    <User size={17} />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <LogOut size={17} />
                    <span className="text-sm font-medium">
                      {loggingOut ? "Logging out..." : "Logout"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}