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

/**
 * Resolves true  -> payment verified
 * Resolves false -> user closed the popup (booking stays unpaid, can pay later)
 * Rejects        -> script / server / verification error
 */
export async function payForBooking(bookingId) {
  const ok = await loadRazorpay();
  if (!ok) throw new Error("Could not load Razorpay. Check your internet.");

  const { data } = await axios.post(`/api/booking/${bookingId}/payment/create`);

  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "ConstructEzy",
      description: "Labour booking",
      order_id: data.orderId,
      handler: async (response) => {
        try {
          await axios.post(`/api/booking/${bookingId}/payment/verify`, response);
          resolve(true);
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => resolve(false) },
    });
    rz.open();
  });
}