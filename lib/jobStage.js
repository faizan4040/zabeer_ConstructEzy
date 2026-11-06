// Ek job ka "kaam" aur "paisa" stage — labour aur admin dono UI yahi use karte hain
export const workStage = (b) => {
  if (b.status === "cancelled") return { key: "cancelled", label: "Cancelled", tone: "red" };
  if (b.status === "completed") return { key: "finished", label: "Work finished", tone: "green" };
  if (b.status === "in_progress") return { key: "working", label: "Work in progress", tone: "blue" };
  if (b.status === "pending_payment") return { key: "unpaid", label: "Awaiting customer payment", tone: "gray" };
  if (!b.labourUser) return { key: "unassigned", label: "Labour not assigned", tone: "amber" };
  return { key: "assigned", label: "Assigned · not started", tone: "amber" };
};

// Money pending -> Cash -> Payment due -> Payment complete
export const moneyStage = (b) => {
  if (b.status === "cancelled") return { key: "cancelled", label: b.paymentStatus === "paid" ? "Refund needed" : "Cancelled", tone: "red" };
  if (b.paymentStatus === "paid") {
    return b.status === "completed"
      ? { key: "complete", label: "Payment complete", tone: "green", hint: "Online · commission auto cut" }
      : { key: "pending", label: "Money pending", tone: "blue", hint: "Paid online · wallet after finish" };
  }
  if (b.paymentStatus === "cash_due") return { key: "cash", label: "Cash", tone: "amber", hint: "Collect cash from customer" };
  if (b.paymentStatus === "cash_collected") {
    if (b.commissionStatus === "due") return { key: "due", label: "Payment due", tone: "red", hint: "Commission to pay company" };
    return { key: "complete", label: "Payment complete", tone: "green", hint: "Cash · commission settled" };
  }
  return { key: "pending", label: "Money pending", tone: "gray", hint: "Customer has not paid yet" };
};

export const TONE = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
