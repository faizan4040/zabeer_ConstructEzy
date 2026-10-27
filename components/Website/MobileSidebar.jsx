'use client'
// components/Website/MobileSidebar.jsx
// Phone size (md se neeche) par hi dikhta hai. Menu items mobileMenuData.js se aate hain.
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FaBars, FaTimes, FaChevronRight, FaUserCircle } from "react-icons/fa"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_HOME, WEBSITE_LOGIN, USER_DASHBOARD } from "@/routes/WebsiteRoute"
import { MENU_SECTIONS, WHATSAPP_NUMBER, CALL_NUMBER } from "./mobileMenuData"

/* ---------- Toggle (hamburger) button: header mein logo ke left side lagao ---------- */
export function MobileMenuToggle({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      className="md:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <FaBars size={20} />
    </button>
  )
}

/* ---------- Single row ---------- */
function MenuRow({ item, active, onNavigate }) {
  const { label, href, icon: Icon, emoji, action, bold } = item

  const content = (
    <>
      <span className="w-8 flex items-center justify-center shrink-0 text-gray-800">
        {Icon ? <Icon size={20} className={active ? "text-[#0B8457]" : ""} /> : <span className="text-lg leading-none">{emoji}</span>}
      </span>
      <span className={`flex-1 text-left text-[15px] ${bold || active ? "font-semibold" : "font-normal"} ${active ? "text-gray-900" : "text-gray-800"}`}>
        {label}
      </span>
      <FaChevronRight size={11} className="text-gray-400 shrink-0" />
    </>
  )

  const cls = `w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors cursor-pointer ${
    active ? "bg-emerald-100/70" : "hover:bg-gray-50 active:bg-gray-100"
  }`

  if (action === "whatsapp") {
    return (
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I want to book a service.")}`}
        target="_blank" rel="noreferrer" onClick={onNavigate} className={cls}
      >
        {content}
      </a>
    )
  }
  if (action === "call") {
    return <a href={`tel:${CALL_NUMBER}`} onClick={onNavigate} className={cls}>{content}</a>
  }
  return <Link href={href || "#"} onClick={onNavigate} className={cls}>{content}</Link>
}

/* ---------- Sidebar ---------- */
export default function MobileSidebar({ open, onClose, auth }) {
  const pathname = usePathname()

  // Body scroll lock + Esc se band
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  // Route change par apne aap band
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line

  return (
    <div className={`md:hidden fixed inset-0 z-[70] ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Dark overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Main menu"
        className={`absolute left-0 top-0 h-full w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: logo + close */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
          <Link href={WEBSITE_HOME} onClick={onClose}>
            <img src={IMAGES.logo} alt="ConstructEzy" className="h-11 w-auto" />
          </Link>
          <button
            type="button" onClick={onClose} aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-6">
          {/* User card */}
          <Link
            href={auth ? USER_DASHBOARD : WEBSITE_LOGIN}
            onClick={onClose}
            className="mx-3 mb-2 flex items-center gap-3 px-2 py-3 border-b border-gray-200"
          >
            <span className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {auth?.avatar?.url
                ? <img src={auth.avatar.url} alt="" className="w-full h-full object-cover" />
                : <FaUserCircle size={44} className="text-gray-500" />}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-gray-900 truncate">
                Hello, {auth?.name || "User"}
              </span>
              <span className="block text-sm text-gray-500">
                {auth ? "View dashboard" : "Login / Sign Up"}
              </span>
            </span>
            <FaChevronRight size={12} className="text-gray-500 shrink-0" />
          </Link>

          {/* Sections */}
          {MENU_SECTIONS.map((section, si) => (
            <nav key={si} className={`px-3 ${si > 0 ? "mt-2 pt-2 border-t border-gray-200" : ""}`}>
              {section.title && (
                <p className="px-3.5 pt-2 pb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <MenuRow
                  key={item.label}
                  item={item}
                  active={!!item.href && item.href === pathname}
                  onNavigate={onClose}
                />
              ))}
            </nav>
          ))}
        </div>
      </aside>
    </div>
  )
}