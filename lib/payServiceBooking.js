import axios from "axios";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const METHODS = ["upi", "card", "netbanking", "wallet"];

/** true = paid & verified | false = user ne popup band kiya | throws = error */
export async function payServiceBooking(bookingId) {
  if (!(await loadRazorpay())) throw new Error("Could not load Razorpay. Check your internet.");
  const { data: res } = await axios.post(`/api/service-booking/${bookingId}/pay/create`);
  if (!res.success) throw new Error(res.message);
  const d = res.data;

  // User ka chuna hua method (UPI / Card / Net Banking / Wallet) sabse upar dikhao, baaki bhi available rakho.
  // `method: { upi: true, card: false, ... }` se lock karne par, agar wo method account/test mode me enabled
  // nahi ho, Razorpay "No appropriate payment method found" dikhata hai.
  const LABEL = { upi: "UPI", card: "Card", netbanking: "Net Banking", wallet: "Wallet" };
  const method = METHODS.includes(d.mode)
    ? {
        config: {
          display: {
            blocks: { chosen: { name: `Pay using ${LABEL[d.mode]}`, instruments: [{ method: d.mode }] } },
            sequence: ["block.chosen"],
            preferences: { show_default_blocks: true },
          },
        },
      }
    : {};

  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: d.key, amount: d.amount, currency: "INR", name: "ConstructEzy",
      description: d.description || "Home service booking", order_id: d.orderId,
      prefill: { contact: d.contact ? `+91${d.contact}` : undefined, name: d.name || undefined },
      theme: { color: "#047857" }, retry: { enabled: true, max_count: 3 },
      ...method,
      handler: async (response) => {
        try {
          const { data: v } = await axios.post(`/api/service-booking/${bookingId}/pay/verify`, response);
          if (!v.success) throw new Error(v.message);
          resolve(true);
        } catch (e) { reject(e); }
      },
      modal: { ondismiss: () => resolve(false), confirm_close: true },
    });
    rz.on("payment.failed", () => {}); // Razorpay khud retry dikhata hai
    rz.open();
  });
}
