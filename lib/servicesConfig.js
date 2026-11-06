import {
  FaSearch, FaRegCalendarAlt, FaClipboardCheck, FaUserCheck, FaShieldAlt, FaTag, FaRegClock, FaAward,
  FaMapMarkerAlt, FaHeadset, FaHome, FaWrench, FaBolt, FaPaintRoller, FaHammer, FaSnowflake, FaBoxOpen,
  FaHardHat, FaTint, FaBug, FaBroom, FaTools,
} from 'react-icons/fa'

export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
export const PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''
export const HERO_IMG = process.env.NEXT_PUBLIC_SERVICES_HERO_IMG || ''

export const CITIES = ['Delhi NCR', 'Jaipur', 'Gurugram', 'Noida', 'Ghaziabad', 'Faridabad']
export const SERVICE_TYPES = ['Repair & Maintenance', 'Installation', 'New Construction', 'Renovation']
export const PRO_TYPES = ['Individual Professional', 'Company / Team']
export const RATINGS = [4.5, 4, 3.5, 3]
export const MAX_PRICE = 50000
export const PAGE_SIZE = 12

// Service Type / Availability / Professional Type abhi sirf UI hain (backend me data nahi).
// Jab tak wire na ho, false kar do to ye teen section chhup jayenge.
export const SHOW_EXTRA_FILTERS = true

// location '' = All Locations (default), warna sirf us city ke labour dikhenge
export const EMPTY_FILTERS = { location: '', serviceTypes: [], minPrice: 0, maxPrice: MAX_PRICE, rating: '', today: false, week: false, date: '', proTypes: [] }

export const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

export const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15'

export const STEPS = [
  { t: 'Choose Service', d: 'Select the service you need', Icon: FaSearch },
  { t: 'Select Date & Location', d: 'Pick a convenient date and time', Icon: FaRegCalendarAlt },
  { t: 'Confirm Booking', d: 'Get confirmation on your booking', Icon: FaClipboardCheck },
  { t: 'Our Professional Arrives', d: 'Our verified professional will arrive at your location', Icon: FaUserCheck },
]
export const WHY = [
  { t: 'Verified Professionals', d: 'Background checked', Icon: FaShieldAlt },
  { t: 'Transparent Pricing', d: 'No hidden charges', Icon: FaTag },
  { t: 'On-time Service', d: 'Reliable & punctual', Icon: FaRegClock },
  { t: 'Quality Assurance', d: 'Service warranty', Icon: FaAward },
  { t: 'Wide Service Coverage', d: 'Across Delhi NCR & Jaipur', Icon: FaMapMarkerAlt },
  { t: 'Dedicated Support', d: "We're here to help", Icon: FaHeadset },
]

export const catIcon = (name = '') => {
  const s = name.toLowerCase()
  if (s.includes('all')) return FaHome
  if (s.includes('plumb')) return FaWrench
  if (s.includes('electric')) return FaBolt
  if (s.includes('paint')) return FaPaintRoller
  if (s.includes('carpent')) return FaHammer
  if (s.includes('ac')) return FaSnowflake
  if (s.includes('renov')) return FaHome
  if (s.includes('install')) return FaBoxOpen
  if (s.includes('civil') || s.includes('contract') || s.includes('mason')) return FaHardHat
  if (s.includes('water')) return FaTint
  if (s.includes('pest')) return FaBug
  if (s.includes('clean')) return FaBroom
  return FaTools
}
