// components/Website/mobileMenuData.js
// Sab menu items yahin se aate hain. Naya item add/remove/edit karna ho to sirf is file mein badlo.
//
// Har item:
//   label  : text jo dikhana hai
//   href   : link (ya "action" use karo, neeche dekho)
//   icon   : react-icons ka component (FaXxx)
//   emoji  : (optional) agar icon nahi diya to emoji dikhega
//   action : (optional) "whatsapp" | "call"  -> href ki jagah special action
//
// Sections ka title khali ("") rakhoge to heading nahi dikhegi.

import {
  FaHome, FaShoppingCart, FaTools, FaFileAlt, FaWhatsapp, FaPhoneAlt,
  FaTruck, FaFaucet, FaBolt, FaPaintRoller, FaWrench, FaHardHat,
  FaBuilding, FaBath, FaDoorOpen, FaThLarge, FaHammer, FaSnowflake,
  FaTint, FaCogs, FaUserTie, FaHeadset, FaInfoCircle,
} from "react-icons/fa"

import { WEBSITE_HOME, WEBSITE_SHOP } from "@/routes/WebsiteRoute"

// Contact numbers / links (yahan change karo)
export const WHATSAPP_NUMBER = "919999999999" // country code ke saath, + ke bina
export const CALL_NUMBER = "+919999999999"

export const MENU_SECTIONS = [
  {
    title: "",
    items: [
      { label: "Home", href: WEBSITE_HOME, icon: FaHome },
      { label: "Shop Products", href: WEBSITE_SHOP, icon: FaShoppingCart, bold: true },
      { label: "Book Services", href: "/services", icon: FaTools, bold: true },
      { label: "Upload Your Material List", href: "/upload-material-list", icon: FaFileAlt, bold: true },
      { label: "Book via WhatsApp", action: "whatsapp", icon: FaWhatsapp },
      { label: "Book via Call", action: "call", icon: FaPhoneAlt },
      { label: "Track Order / Booking", href: "/track-order", icon: FaTruck },
    ],
  },
  {
    title: "Shop by category",
    items: [
      { label: "Plumbing", href: `${WEBSITE_SHOP}?category=plumbing`, icon: FaFaucet },
      { label: "Electrical", href: `${WEBSITE_SHOP}?category=electrical`, icon: FaBolt },
      { label: "Paints & Finishes", href: `${WEBSITE_SHOP}?category=paints`, icon: FaPaintRoller },
      { label: "Hardware", href: `${WEBSITE_SHOP}?category=hardware`, icon: FaWrench },
      { label: "Power Tools", href: `${WEBSITE_SHOP}?category=power-tools`, icon: FaTools },
      { label: "Safety & PPE", href: `${WEBSITE_SHOP}?category=safety`, icon: FaHardHat },
      { label: "Building Materials", href: `${WEBSITE_SHOP}?category=building-materials`, icon: FaBuilding },
      { label: "Bathroom & Kitchen", href: `${WEBSITE_SHOP}?category=bathroom-kitchen`, icon: FaBath },
      { label: "Doors & Windows", href: `${WEBSITE_SHOP}?category=doors-windows`, icon: FaDoorOpen },
      { label: "View All Categories", href: WEBSITE_SHOP, icon: FaThLarge },
    ],
  },
  {
    title: "Book a service",
    items: [
      { label: "Plumbing Repair", href: "/services?type=plumbing", icon: FaFaucet },
      { label: "Electrical Work", href: "/services?type=electrical", icon: FaBolt },
      { label: "Painting", href: "/services?type=painting", icon: FaPaintRoller },
      { label: "Carpentry", href: "/services?type=carpentry", icon: FaHammer },
      { label: "AC Installation", href: "/services?type=ac-installation", icon: FaSnowflake },
      { label: "Renovation", href: "/services?type=renovation", icon: FaHome },
      { label: "Installation", href: "/services?type=installation", icon: FaCogs },
      { label: "Civil Contractor", href: "/services?type=civil-contractor", icon: FaUserTie },
      { label: "Waterproofing", href: "/services?type=waterproofing", icon: FaTint },
      { label: "View All Services", href: "/services", icon: FaThLarge },
    ],
  },
  {
    title: "",
    items: [
      { label: "Help & Support", href: "/help", icon: FaHeadset },
      { label: "About Us", href: "/about", icon: FaInfoCircle },
      { label: "Contact Us", href: "/contact", icon: FaPhoneAlt },
    ],
  },
]