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
  WEBSITE_SHOP,
} from "@/routes/WebsiteRoute"

import { IMAGES } from "@/routes/AllImages"

import {
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ChevronUp,
  Check,
  MapPin,
} from "lucide-react"

import Link from "next/link"

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

/* ── Link data ──
   NOTE: jin links ka route abhi project me nahi hai unka href "#" rakha hai.
   Route ban jaye to bas us item ka href badal dena. */
const WHATSAPP_URL = "https://wa.me/918955549556"
const CALL_URL = "tel:+918955549556"

const SHOP_LINKS = [
  { label: "All Products", href: WEBSITE_SHOP },
  { label: "Plumbing", href: `${WEBSITE_SHOP}?q=Plumbing` },
  { label: "Electrical", href: `${WEBSITE_SHOP}?q=Electrical` },
  { label: "Paints & Finishes", href: `${WEBSITE_SHOP}?q=Paints` },
  { label: "Hardware", href: `${WEBSITE_SHOP}?q=Hardware` },
  { label: "Power Tools", href: `${WEBSITE_SHOP}?q=Power%20Tools` },
  { label: "Home Discount", href: WEBSITE_HOME_DISCOUNT },
  { label: "Discount Codes", href: WEBSITE_DISCOUNT_CODES },
]

const SERVICE_LINKS = [
  { label: "Plumbing Repair", href: "#" },
  { label: "Electrical Work", href: "#" },
  { label: "Painting", href: "#" },
  { label: "Carpentry", href: "#" },
  { label: "Installation", href: "#" },
  { label: "Renovation", href: "#" },
]

const SUPPORT_LINKS = [
  { label: "Help Center", href: "#" },
  { label: "Track Order", href: "#" },
  { label: "Returns & Refunds", href: WEBSITE_DELIVERY_RETURNS },
  { label: "Contact Us", href: WEBSITE_CONTACT_US },
  { label: "Price Beat Promise", href: WEBSITE_PRICE_BEAT_PROMISE },
  { label: "Book via WhatsApp", href: WHATSAPP_URL, external: true },
  { label: "Book via Call", href: CALL_URL, external: true },
]

const COMPANY_LINKS = [
  { label: "About Us", href: WEBSITE_ABOUT },
  { label: "Our Partners", href: "#" },
  { label: "Careers", href: WEBSITE_CAREERS },
  { label: "Terms & Conditions", href: WEBSITE_TERMS_CONDITIONS },
  { label: "Privacy Policy", href: WEBSITE_PRIVACY_POLICY },
  { label: "Cookie Policy", href: WEBSITE_COOKIE_POLICY },
]

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/YourInstagramProfile", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/YourFacebookProfile", Icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/YourCompany", Icon: Linkedin },
  { label: "YouTube", href: "https://www.youtube.com/channel/YourChannelID", Icon: Youtube },
  { label: "X", href: "https://twitter.com/YourTwitterProfile", Icon: Twitter },
]

const linkClass = "text-[13px] text-gray-300 hover:text-white transition-colors"

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-white font-semibold text-[15px] mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={linkClass}
              >
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
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
    <footer className="bg-[#0A1F44] text-gray-300">

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

      {/* Main Footer */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-10 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1.3fr] gap-x-8 gap-y-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block">
              <img src={IMAGES.logo} alt="ConstructEzy" className="h-11 w-auto" />
            </Link>

            <p className="mt-4 text-[13px] leading-relaxed text-gray-300 max-w-[240px]">
              Your trusted platform for construction materials and services.
            </p>

            <div className="mt-5 flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white hover:text-emerald-400 transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Shop" links={SHOP_LINKS} />
          <FooterColumn title="Services" links={SERVICE_LINKS} />
          <FooterColumn title="Support" links={SUPPORT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />

          {/* Stay Updated */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="text-white font-semibold text-[15px]">Stay Updated</h4>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-300">
              Get latest offers, new products and{" "}
              <span className="font-semibold text-white">service updates.</span>
            </p>

            <div className="mt-4">
              {success ? (
                <div className="flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 rounded-lg">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                  <p className="text-emerald-300 text-sm">
                    You're subscribed! Thanks for signing up.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-stretch rounded-lg overflow-hidden bg-white"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="flex-1 min-w-0 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    aria-label="Subscribe"
                    className="w-12 bg-[#0B8457] hover:bg-[#086b47] text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </form>
              )}

              {error && (
                <p className="mt-2 text-sm text-rose-400">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <p className="text-[13px] text-gray-300 order-2 md:order-1">
            © 2026 ConstructEzy. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 order-1 md:order-2">

            {/* Delivering in */}
            <p className="flex items-center gap-2 text-[13px] text-gray-300">
              <MapPin size={14} className="text-gray-300 shrink-0" />
              <span>Delivering in:</span>
              <span className="text-white">Delhi NCR</span>
              <span className="text-gray-500">|</span>
              <span className="text-white">Jaipur</span>
            </p>

            {/* Language Selector */}
            <div className="relative notranslate" ref={langRef} translate="no">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-2 text-[13px] text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <Globe size={15} className="text-emerald-400" />
                <span>{activeLang.native}</span>
                <ChevronUp
                  size={14}
                  className={`transition-transform ${langOpen ? "" : "rotate-180"}`}
                />
              </button>

              {langOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-72 max-w-[90vw] bg-white text-black rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-emerald-50">
                    <p className="text-sm font-semibold text-gray-900">Select language</p>
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
                              ? "bg-emerald-50 text-[#0B8457] font-semibold"
                              : "text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          <span>
                            {lang.native}
                            <span className="text-gray-400 text-xs ml-2">{lang.label}</span>
                          </span>
                          {active && <Check size={16} className="text-[#0B8457]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer