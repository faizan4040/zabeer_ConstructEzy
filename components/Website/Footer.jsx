"use client"

import { useState, useEffect, useRef } from "react"

import {
  WEBSITE_ABOUT,
  WEBSITE_CAREERS,
  WEBSITE_CONTACT_US,
  WEBSITE_COOKIE_POLICY,
  WEBSITE_DELIVERY_RETURNS,
  WEBSITE_DISCOUNT_CODES,
  WEBSITE_HOME_DISCOUNT,
  WEBSITE_PRICE_BEAT_PROMISE,
  WEBSITE_PRIVACY_POLICY,
  WEBSITE_TERMS_CONDITIONS,
} from "@/routes/WebsiteRoute"

import {
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Headphones,
  Globe,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  ChevronUp,
  Check,
} from "lucide-react"

import Link from "next/link"
import { BsWhatsapp } from "react-icons/bs"

import axios from "axios"

/* ── Languages (code = Google Translate code) ── */
const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "zh-CN", label: "Chinese", native: "中文" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "Urdu", native: "اردو" },
]

const getCurrentLang = () => {
  if (typeof document === "undefined") return "en"
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/)
  return match ? decodeURIComponent(match[1]) : "en"
}

const setLangCookie = (code) => {
  const host = window.location.hostname
  if (code === "en") {
    // remove translation cookie
    const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = `googtrans=; ${expired}; path=/`
    document.cookie = `googtrans=; ${expired}; path=/; domain=${host}`
  } else {
    document.cookie = `googtrans=/en/${code}; path=/`
    document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`
  }
}

const Footer = () => {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Language state
  const [langOpen, setLangOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState("en")
  const langRef = useRef(null)

  /* Load Google Translate script once */
  useEffect(() => {
    setCurrentLang(getCurrentLang())

    if (document.getElementById("google-translate-script")) return

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element"
      )
    }

    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)
  }, [])

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  const changeLanguage = (code) => {
    if (code === currentLang) {
      setLangOpen(false)
      return
    }
    setLangCookie(code)
    setCurrentLang(code)
    setLangOpen(false)
    window.location.reload()
  }

  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post("/api/newsletter/subscribe", {
        email,
      })

      if (!data.success) {
        throw new Error(data.message)
      }

      setSuccess(true)
      setEmail("")
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Something went wrong."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-indigo-100/70">

      {/* Hide Google Translate default banner/toolbar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .goog-te-banner-frame, .goog-te-balloon-frame, #goog-gt-tt, .goog-tooltip { display: none !important; }
            iframe.skiptranslate { display: none !important; }
            body { top: 0 !important; position: static !important; }
            .goog-text-highlight { background: none !important; box-shadow: none !important; }
          `,
        }}
      />
      <div id="google_translate_element" className="hidden" />

      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider">
                Stay Updated
              </p>

              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                Get the latest updates from ConstructEzy
              </h3>
            </div>

            <div className="w-full lg:max-w-xl">
              {success ? (
                <div className="flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 rounded-xl">
                  <CheckCircle2
                    className="text-emerald-400 shrink-0"
                    size={22}
                  />

                  <p className="text-emerald-300 text-sm">
                    You're subscribed! Thanks for signing up.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter your email address"
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-indigo-200/50 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-semibold hover:from-amber-500 hover:to-orange-600 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe
                        <ArrowUpRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {error && (
                <p className="mt-2 text-sm text-rose-400">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5">
              Support
            </h4>

            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/918955549556"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-indigo-100/70 hover:text-amber-400 transition"
                >
                  <BsWhatsapp size={17} />
                  <span>WhatsApp</span>
                </a>
              </li>

              <li>
                <Link
                  href={WEBSITE_CONTACT_US}
                  className="flex items-center gap-3 text-indigo-100/70 hover:text-amber-400 transition"
                >
                  <Headphones size={18} />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5">
              Follow Us
            </h4>

            <ul className="space-y-4">
              <li>
                <a
                  href="https://www.youtube.com/channel/YourChannelID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-indigo-100/70 hover:text-amber-400 transition"
                >
                  <Youtube size={18} />
                  <span>YouTube</span>
                </a>
              </li>

              <li>
                <a
                  href="https://www.instagram.com/YourInstagramProfile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-indigo-100/70 hover:text-amber-400 transition"
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                </a>
              </li>

              <li>
                <a
                  href="https://twitter.com/YourTwitterProfile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-indigo-100/70 hover:text-amber-400 transition"
                >
                  <Twitter size={18} />
                  <span>X</span>
                </a>
              </li>

              <li>
                <a
                  href="https://www.facebook.com/YourFacebookProfile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-indigo-100/70 hover:text-amber-400 transition"
                >
                  <Facebook size={18} />
                  <span>Facebook</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Order Info */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5">
              Order Info
            </h4>

            <ul className="space-y-3">
              <li>
                <Link
                  href={WEBSITE_DELIVERY_RETURNS}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Delivery & Returns
                </Link>
              </li>

              <li>
                <Link
                  href={WEBSITE_HOME_DISCOUNT}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Home Discount
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5">
              Customer Care
            </h4>

            <ul className="space-y-3">
              <li>
                <Link
                  href={WEBSITE_CONTACT_US}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  href={WEBSITE_PRICE_BEAT_PROMISE}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Price Beat Promise
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5">
              Company
            </h4>

            <ul className="space-y-3">
              <li>
                <Link
                  href={WEBSITE_ABOUT}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href={WEBSITE_CAREERS}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Careers
                </Link>
              </li>

              <li>
                <Link
                  href={WEBSITE_PRIVACY_POLICY}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href={WEBSITE_TERMS_CONDITIONS}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href={WEBSITE_COOKIE_POLICY}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Cookie Policy
                </Link>
              </li>

              <li>
                <Link
                  href={WEBSITE_DISCOUNT_CODES}
                  className="text-indigo-100/70 hover:text-amber-400 transition"
                >
                  Discount Codes
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-5">

          {/* Language Selector */}
          <div className="relative notranslate" ref={langRef} translate="no">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-2 text-sm text-indigo-100 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg px-3 py-2 cursor-pointer transition-colors"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <Globe size={16} className="text-amber-400" />
              <span>{activeLang.native}</span>
              <ChevronUp
                size={14}
                className={`transition-transform ${langOpen ? "" : "rotate-180"}`}
              />
            </button>

            {langOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-72 max-w-[90vw] bg-white text-black rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-indigo-50">
                  <p className="text-sm font-semibold text-indigo-950">Select language</p>
                </div>

                <div className="max-h-72 overflow-y-auto py-1" role="listbox">
                  {LANGUAGES.map((lang) => {
                    const active = lang.code === currentLang
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left cursor-pointer transition-colors ${
                          active
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        <span>
                          {lang.native}
                          <span className="text-gray-400 text-xs ml-2">{lang.label}</span>
                        </span>
                        {active && <Check size={16} className="text-indigo-600" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/25 text-center py-4 text-xs text-white">
          © 2026 Constructezy Limited — All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer