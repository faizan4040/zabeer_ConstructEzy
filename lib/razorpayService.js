import crypto from "crypto";

// Server-side Razorpay helpers (service bookings)
export const rzKeyId = () => process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const rzSecret = () => process.env.RAZORPAY_KEY_SECRET || "";
export const rzConfigured = () => !!(rzKeyId() && rzSecret());
const auth = () => "Basic " + Buffer.from(`${rzKeyId()}:${rzSecret()}`).toString("base64");

export async function createOrder({ amountPaise, receipt, notes }) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth() },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.error?.description || "Could not create Razorpay order");
  return j;
}

export async function fetchPayment(paymentId) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: auth() } });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.error?.description || "Could not fetch payment");
  return j; // { id, order_id, amount, status, method, vpa, ... }
}

const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b || "")); return x.length === y.length && crypto.timingSafeEqual(x, y); };

export const verifySignature = (orderId, paymentId, signature) =>
  safeEq(crypto.createHmac("sha256", rzSecret()).update(`${orderId}|${paymentId}`).digest("hex"), signature);

export const verifyWebhook = (rawBody, signature) => {
  const s = process.env.RAZORPAY_WEBHOOK_SECRET;
  return !!s && safeEq(crypto.createHmac("sha256", s).update(rawBody).digest("hex"), signature);
};
