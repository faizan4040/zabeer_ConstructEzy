import { calculateDistanceKm } from "@/lib/distance"

// ─────────────────────────────────────────────────────────────────────────────
// Service area — abhi hum kin shehron me deliver karte hain.
//
// Naya shehar add karna ho to bas yahan ek entry daal do:
//   { name: "Delhi", lat: 28.6139, lng: 77.2090, radiusKm: 40, aliases: ["new delhi"] }
//
// Check do tarah se hota hai:
//   1. GPS / geocoded lat-lng → city center se radiusKm ke andar?
//   2. Sirf city ka naam (manual entry / checkout form) → name ya alias match?
// Ye file client (Header, checkout) aur server (order APIs) dono use karte hain.
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICE_AREAS = [
  { name: "Jaipur", lat: 26.9124, lng: 75.7873, radiusKm: 35, aliases: ["jaipur", "jaipur city"] },
]

export const SERVICE_CITY_NAMES = SERVICE_AREAS.map((a) => a.name).join(", ")

const norm = (s) => String(s || "").trim().toLowerCase()

// lat/lng service area ke andar hai? → matching area ya null
export function findServiceAreaByCoords(lat, lng) {
  const la = Number(lat)
  const ln = Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null
  return (
    SERVICE_AREAS.find((a) => calculateDistanceKm(la, ln, a.lat, a.lng) <= a.radiusKm) || null
  )
}

// City / address text me kisi service city ka naam hai? → matching area ya null
export function findServiceAreaByName(text) {
  const t = norm(text)
  if (!t) return null
  return (
    SERVICE_AREAS.find((a) =>
      [a.name, ...(a.aliases || [])].some((n) => t.includes(norm(n)))
    ) || null
  )
}

/**
 * Final decision.
 *  - coords mile to unhi pe bharosa (sabse accurate)
 *  - warna city / address naam se
 *  - kuch bhi na mile → serviceable: null (pata nahi — block mat karo)
 */
export function checkServiceArea({ lat, lng, city } = {}) {
  const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && lat !== null && lng !== null
  if (hasCoords) {
    const area = findServiceAreaByCoords(lat, lng)
    return { serviceable: !!area, area }
  }
  if (norm(city)) {
    const area = findServiceAreaByName(city)
    return { serviceable: !!area, area }
  }
  return { serviceable: null, area: null }
}

export const NOT_SERVICEABLE_MESSAGE = `We're coming soon to your area! Right now we deliver only in ${SERVICE_CITY_NAMES}.`
