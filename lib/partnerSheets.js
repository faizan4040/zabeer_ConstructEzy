// Shared config for the spreadsheet-style admin pages: Vendor List + Logistic Partners.
// Used by BOTH the mongoose models / API (server) and the SheetGrid UI (client),
// so a column added here automatically becomes a DB field, an editable cell,
// a filter, a bulk-update option and an export column.
//
// column types: code (auto, read-only) | text | email | phone | url | select | status |
//               number | percent | rating | date
// select: `options` are suggestions (custom values allowed) unless `strict: true`.

export const STATUS_OPTIONS = ["Active", "Onboarding", "Inactive"]
export const VERIFICATION_OPTIONS = ["Pending", "Verified", "Rejected"]
export const PAYMENT_TERMS = ["Advance", "COD", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"]

export const STATUS_COLORS = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Onboarding: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Inactive: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  Verified: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Rejected: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
}

// soft pastel chips for category / partner type
export const CHIP_COLORS = [
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
]

const VENDOR_CATEGORIES = [
  "Paints & Finishes", "Bathroom & Plumbing", "Electrical", "Plumbing", "Cement & Building",
  "Cleaning Equipment", "Glass & Partitions", "Power Tools", "Adhesives & Chemicals",
  "Tiles & Flooring", "Hardware", "Steel & Metals", "Wood & Plywood", "Other",
]

const PARTNER_TYPES = [
  "3PL (National)", "3PL (B2B)", "Courier (Express)", "Courier (B2B/B2C)", "Last-Mile",
  "Mid / Heavy", "On-Demand", "E-commerce", "Heavy Transport", "Regional Transport",
]

export const SHEETS = {
  vendors: {
    key: "vendors",
    title: "Vendor List",
    subtitle: "Manage all your suppliers, manufacturers and brand partners in one place.",
    singular: "Vendor",
    plural: "Vendors",
    api: "/api/admin/vendors",
    codePrefix: "VEN",
    nameField: "name",
    regionFields: ["city", "deliveryLocations"],
    searchPlaceholder: "Search anything (vendors, products, contacts...)",
    // bottom sheet-tabs: quick views on one column
    viewField: "category",
    views: ["Paints & Finishes", "Plumbing", "Electrical", "Cement & Building", "Power Tools"],
    columns: [
      { key: "code", label: "Vendor ID", type: "code", width: 96 },
      { key: "name", label: "Vendor Name", type: "text", width: 210, logo: true },
      { key: "category", label: "Category", type: "select", options: VENDOR_CATEGORIES, chip: true, width: 170 },
      { key: "brand", label: "Brand / Manufacturer", type: "text", width: 170 },
      { key: "productCategories", label: "Products Supplied", type: "text", width: 200 },
      { key: "contactPerson", label: "Contact Person", type: "text", width: 140 },
      { key: "phone", label: "Phone", type: "phone", width: 140 },
      { key: "email", label: "Email", type: "email", width: 220 },
      { key: "gstin", label: "GSTIN", type: "text", width: 160, upper: true },
      { key: "city", label: "City", type: "text", width: 110 },
      { key: "deliveryLocations", label: "Delivery Locations", type: "text", width: 180 },
      { key: "b2bDiscount", label: "B2B Discount %", type: "percent", width: 120 },
      { key: "paymentTerms", label: "Payment Terms", type: "select", options: PAYMENT_TERMS, width: 130 },
      { key: "accountManager", label: "Account Manager", type: "text", width: 150 },
      { key: "documents", label: "Agreement / GST Docs", type: "url", width: 180 },
      { key: "verification", label: "Verification", type: "status", options: VERIFICATION_OPTIONS, strict: true, width: 130, default: "Pending" },
      { key: "status", label: "Status", type: "status", options: STATUS_OPTIONS, strict: true, width: 130, default: "Onboarding" },
      { key: "rating", label: "Rating", type: "rating", width: 90 },
      { key: "lastOrder", label: "Last Order", type: "date", width: 130 },
      { key: "logo", label: "Logo URL", type: "url", width: 160, hidden: true },
      { key: "notes", label: "Notes", type: "text", width: 220, hidden: true },
    ],
  },

  logistics: {
    key: "logistics",
    title: "Logistic Partners",
    subtitle: "Manage your delivery, transport and last-mile logistics partners for products and services.",
    singular: "Partner",
    plural: "Partners",
    api: "/api/admin/logistic-partners",
    codePrefix: "LOG",
    nameField: "name",
    regionFields: ["serviceCoverage"],
    searchPlaceholder: "Search logistics partners, service area, contact, etc...",
    viewField: "partnerType",
    views: ["Last-Mile", "Regional Transport", "3PL (National)", "Heavy Transport", "Courier (Express)"],
    columns: [
      { key: "code", label: "Partner ID", type: "code", width: 96 },
      { key: "name", label: "Partner Name", type: "text", width: 200, logo: true },
      { key: "partnerType", label: "Partner Type", type: "select", options: PARTNER_TYPES, chip: true, width: 160 },
      { key: "serviceCoverage", label: "Service Coverage", type: "text", width: 160 },
      { key: "contactPerson", label: "Contact Person", type: "text", width: 140 },
      { key: "phone", label: "Phone", type: "phone", width: 140 },
      { key: "email", label: "Email", type: "email", width: 220 },
      { key: "vehicleType", label: "Vehicle Type", type: "text", width: 150 },
      { key: "sla", label: "SLA / Delivery Time", type: "select", options: ["Same Day", "6–12 Hours", "12–24 Hours", "24 Hours", "12–48 Hours", "24–48 Hours", "24–72 Hours", "3–5 Days"], width: 150 },
      { key: "ratePerKg", label: "Rate / Kg (₹)", type: "number", width: 110 },
      { key: "gstin", label: "GSTIN", type: "text", width: 160, upper: true },
      { key: "paymentTerms", label: "Payment Terms", type: "select", options: PAYMENT_TERMS, width: 130 },
      { key: "accountManager", label: "Account Manager", type: "text", width: 150 },
      { key: "documents", label: "Agreement / Docs", type: "url", width: 170 },
      { key: "verification", label: "Verification", type: "status", options: VERIFICATION_OPTIONS, strict: true, width: 130, default: "Pending" },
      { key: "status", label: "Status", type: "status", options: STATUS_OPTIONS, strict: true, width: 130, default: "Onboarding" },
      { key: "performance", label: "Performance", type: "rating", width: 110 },
      { key: "lastShipment", label: "Last Shipment", type: "date", width: 130 },
      { key: "logo", label: "Logo URL", type: "url", width: 160, hidden: true },
      { key: "notes", label: "Notes", type: "text", width: 220, hidden: true },
    ],
  },
}

export const editableColumns = (sheet) => sheet.columns.filter((c) => c.type !== "code")

// Normalise one value for a column. Returns { ok, value } or { ok:false, error }.
export function coerceValue(col, raw) {
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    if (col.type === "status") return { ok: true, value: col.default || "" }
    return { ok: true, value: ["number", "percent", "rating", "date"].includes(col.type) ? null : "" }
  }
  switch (col.type) {
    case "number":
    case "percent":
    case "rating": {
      const n = Number(String(raw).replace(/[₹,%\s]/g, ""))
      if (!Number.isFinite(n)) return { ok: false, error: `${col.label} must be a number` }
      if (col.type === "rating" && (n < 0 || n > 5)) return { ok: false, error: `${col.label} must be between 0 and 5` }
      if (col.type === "percent" && (n < 0 || n > 100)) return { ok: false, error: `${col.label} must be between 0 and 100` }
      return { ok: true, value: Math.round(n * 100) / 100 }
    }
    case "date": {
      const d = parseDate(raw)
      if (!d) return { ok: false, error: `${col.label} is not a valid date` }
      return { ok: true, value: d }
    }
    case "status": {
      const v = String(raw).trim()
      const match = col.options.find((o) => o.toLowerCase() === v.toLowerCase())
      if (!match) return { ok: false, error: `${col.label} must be one of: ${col.options.join(", ")}` }
      return { ok: true, value: match }
    }
    case "email": {
      const v = String(raw).trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { ok: false, error: `"${v}" is not a valid email` }
      return { ok: true, value: v }
    }
    default: {
      let v = String(raw).trim().slice(0, 1000)
      if (col.upper) v = v.toUpperCase()
      if (col.type === "select" && col.options) {
        const match = col.options.find((o) => o.toLowerCase() === v.toLowerCase())
        if (match) v = match
      }
      return { ok: true, value: v }
    }
  }
}

// accepts Date, ISO, yyyy-mm-dd, dd/mm/yyyy, dd-mm-yyyy, "28 Oct 2026", excel serial
export function parseDate(raw) {
  if (raw instanceof Date) return isNaN(raw) ? null : raw
  if (typeof raw === "number") {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000))
    return isNaN(d) ? null : d
  }
  const s = String(raw).trim()
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
  if (dmy) {
    const d = new Date(Date.UTC(+dmy[3], +dmy[2] - 1, +dmy[1]))
    return isNaN(d) ? null : d
  }
  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (ymd) {
    const d = new Date(Date.UTC(+ymd[1], +ymd[2] - 1, +ymd[3]))
    return isNaN(d) ? null : d
  }
  const d = new Date(s)
  if (isNaN(d)) return null
  // full ISO timestamps (from DB) are kept; loose text like "28 Oct 2026" -> that calendar day in UTC
  if (/T\d{2}:/.test(s)) return d
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}
