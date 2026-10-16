"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Phone, X, AlertTriangle, Star } from "lucide-react";

const money = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

const AMBER = "bg-amber-50 text-amber-700 border-amber-200";
const RED = "bg-red-50 text-red-700 border-red-200";
const GREEN = "bg-emerald-50 text-emerald-700 border-emerald-200";
const GRAY = "bg-zinc-100 text-zinc-600 border-zinc-200";

const STATUS = {
  unassigned: ["Needs labour", RED],
  requested: ["Waiting for labour", AMBER],
  rejected: ["Labour rejected", RED],
  awaiting_payment: ["Awaiting payment", AMBER],
  confirmed: ["Accepted", GREEN],
  started: ["In progress", "bg-blue-50 text-blue-700 border-blue-200"],
  completed: ["Completed", GRAY],
  cancelled: ["Cancelled", GRAY],
  expired: ["Expired", GRAY],
};

const PAYOUT = {
  pending: "Due",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
};

function Stat({ label, value, sub, tone }) {
  return (
    <div className={`border rounded-2xl p-4 ${tone || "bg-white border-zinc-200"}`}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-xl font-black mt-1">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function AssignModal({ booking, onClose, onDone }) {
  const [labours, setLabours] = useState(null);
  const [labourId, setLabourId] = useState("");
  const [fare, setFare] = useState("");
  const [note, setNote] = useState("");
  const [autoAccept, setAutoAccept] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    axios
      .get(`/api/admin/labour/assignable?category=${booking.category}`)
      .then(({ data }) => setLabours(data))
      .catch(() => setLabours([]));
  }, [booking.category]);

  const submit = async () => {
    if (!labourId) { setErr("Select a labour"); return; }
    setSaving(true);
    setErr("");
    try {
      await axios.post(`/api/admin/labour/bookings/${booking._id}`, {
        action: "assign",
        labourId,
        autoAccept,
        fare: fare ? Number(fare) : undefined,
        note,
      });
      onDone();
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not assign");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => !saving && onClose()}>
      <div className="bg-white w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-black">Assign labour</h3>
            <p className="text-xs text-zinc-500 capitalize">
              {booking.userName} · {booking.category === "all" ? "any category" : booking.category.replace("-", " ")} · {booking.duration} {booking.pricingType === "hourly" ? "hr" : "day"}
            </p>
          </div>
          <button onClick={onClose} disabled={saving}><X size={20} /></button>
        </div>

        {labours === null ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin" /></div>
        ) : labours.length === 0 ? (
          <p className="text-sm text-red-600 mb-4">No approved labour found in this category.</p>
        ) : (
          <>
            <label className="text-xs font-bold text-zinc-500">Labour</label>
            <select
              value={labourId}
              onChange={(e) => setLabourId(e.target.value)}
              className="w-full mt-1 mb-4 h-12 px-3 rounded-xl border border-zinc-200 bg-white text-sm"
            >
              <option value="">Select labour</option>
              {labours.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.fullName} · {l.phone} · {l.pricePerDay ? `₹${l.pricePerDay}/day` : ""} {l.pricePerHour ? `₹${l.pricePerHour}/hr` : ""}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="text-xs font-bold text-zinc-500">Fare in ₹ (leave empty to use labour's rate)</label>
        <input
          type="number" min={0} value={fare} onChange={(e) => setFare(e.target.value)}
          className="w-full mt-1 mb-4 h-12 px-4 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900"
        />

        <label className="text-xs font-bold text-zinc-500">Note (optional)</label>
        <input
          value={note} onChange={(e) => setNote(e.target.value)} maxLength={200}
          className="w-full mt-1 mb-4 h-12 px-4 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900"
        />

        <label className="flex items-start gap-2 text-sm mb-4">
          <input type="checkbox" checked={autoAccept} onChange={(e) => setAutoAccept(e.target.checked)} className="mt-1" />
          <span>
            <span className="font-semibold">Already confirmed on call</span>
            <span className="block text-xs text-zinc-500">Booking becomes Accepted directly. Untick to send it to the labour as a request.</span>
          </span>
        </label>

        {err && <p className="text-red-600 text-xs mb-3">{err}</p>}

        <button
          onClick={submit} disabled={saving || !labours?.length}
          className="w-full h-12 rounded-2xl bg-zinc-900 text-white font-black text-sm disabled:opacity-50 flex items-center justify-center"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : "Assign"}
        </button>
      </div>
    </div>
  );
}

export default function AdminLabourBookings() {
  const [data, setData] = useState(null);
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [assigning, setAssigning] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/admin/labour/bookings");
      setData(data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const rows = useMemo(
    () =>
      (data?.bookings || []).filter((b) => {
        if (method !== "all" && b.paymentMethod !== method) return false;
        if (status === "attention") {
          if (!(["unassigned", "rejected"].includes(b.bookingStatus) || b.overdue)) return false;
        } else if (status !== "all" && b.bookingStatus !== status) return false;
        if (q) {
          const hay = [b.userName, b.userMobileNumber, b.labourName, b.labourMobileNumber, String(b._id)]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [data, method, status, q]
  );

  const run = async (b, url, body, showMessage) => {
    setBusyId(b._id);
    try {
      const { data: res } = await axios.post(url, body);
      if (showMessage && res?.message) alert(res.message);
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
    }
    await load();
    setBusyId(null);
  };

  const cancel = (b) => {
    if (!confirm("Cancel this booking?")) return;
    run(b, `/api/admin/labour/bookings/${b._id}`, { action: "cancel" });
  };
  const payout = (b) => {
    if (!confirm(`Send ${money(b.labourAmount)} to ${b.labourName}'s bank account?`)) return;
    run(b, `/api/admin/labour/payout/${b._id}`, { action: "pay" }, true);
  };
  const sync = (b) => run(b, `/api/admin/labour/payout/${b._id}`, { action: "sync" }, true);
  const settle = (b) => {
    if (!confirm(`Mark commission ${money(b.adminCommission)} as received from ${b.labourName}?`)) return;
    run(b, `/api/admin/labour/bookings/${b._id}`, { action: "settle_commission" });
  };

  if (!data) return <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>;
  const s = data.stats;

  return (
    <div className="space-y-5">
      {s.needsAdmin > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">
          <AlertTriangle size={18} />
          {s.needsAdmin} booking{s.needsAdmin > 1 ? "s need" : " needs"} your action. Call the customer and a labour, then assign.
          <button onClick={() => setStatus("attention")} className="ml-auto underline">Show</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total bookings" value={s.totalBookings} />
        <Stat label="Delivered (completed)" value={s.completed} tone="bg-emerald-50 border-emerald-200" />
        <Stat label="Pending (not accepted yet)" value={s.pending} tone="bg-amber-50 border-amber-200" />
        <Stat label="Accepted / in progress" value={s.accepted} />
        <Stat label="Cancelled" value={s.cancelled} />
        <Stat label="Prepaid (online)" value={s.prepaidCount} sub={`${money(s.onlinePaid)} received`} />
        <Stat label="Postpaid (cash)" value={s.postpaidCount} sub={`${money(s.cashTotal)} on completed jobs`} />
        <Stat label="Platform commission" value={money(s.commission)} />
        <Stat label="Payout due to labour banks" value={money(s.payoutDue)} tone="bg-amber-50 border-amber-200" />
        <Stat label="Payout processing" value={money(s.payoutProcessing)} />
        <Stat label="Paid to labour banks" value={money(s.payoutPaid)} />
        <Stat label="Cash commission to collect" value={money(s.cashCommissionDue)} sub="from labour, cash jobs" />
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, booking id"
          className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm w-64 outline-none focus:border-zinc-900"
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="h-11 px-3 rounded-xl border border-zinc-200 bg-white text-sm">
          <option value="all">All payments</option>
          <option value="online">Prepaid (online)</option>
          <option value="cash">Postpaid (cash)</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 px-3 rounded-xl border border-zinc-200 bg-white text-sm">
          <option value="all">All status</option>
          <option value="attention">Needs my action</option>
          <option value="unassigned">Needs labour</option>
          <option value="requested">Waiting for labour</option>
          <option value="rejected">Labour rejected</option>
          <option value="confirmed">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              {["Booked on", "Customer", "Labour", "Visit & address", "Amount", "Payment", "Payout / commission", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-400">No bookings found.</td></tr>
            )}
            {rows.map((b) => {
              const [stText, stCls] = STATUS[b.bookingStatus] || [b.bookingStatus, GRAY];
              const attention = ["unassigned", "rejected"].includes(b.bookingStatus) || b.overdue;
              const paid = b.paymentStatus === "paid";
              const canAssign = ["unassigned", "requested", "rejected"].includes(b.bookingStatus) && !paid;
              const canCancel = !["completed", "cancelled", "expired"].includes(b.bookingStatus) && !paid;
              const canPayout =
                b.paymentMethod === "online" && paid && b.bookingStatus === "completed" &&
                ["pending", "failed"].includes(b.payoutStatus);
              const canSync = b.payoutStatus === "processing" && b.payoutId;
              const canSettle =
                b.paymentMethod === "cash" && b.bookingStatus === "completed" &&
                !b.commissionSettled && b.adminCommission > 0;
              const busy = busyId === b._id;

              return (
                <tr key={b._id} className={`border-t border-zinc-100 align-top ${attention ? "bg-amber-50/50" : ""}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {fmt(b.createdAt)}
                    <p className="text-[11px] text-zinc-400">#{String(b._id).slice(-6)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{b.userName || "-"}</p>
                    <a href={`tel:${b.userMobileNumber}`} className="text-xs text-zinc-500 flex items-center gap-1 hover:underline">
                      <Phone size={11} /> {b.userMobileNumber}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {b.labourName ? (
                      <>
                        <p className="font-semibold">{b.labourName}</p>
                        <p className="text-xs text-zinc-500 capitalize">{(b.category || "").replace("-", " ")}</p>
                        <a href={`tel:${b.labourMobileNumber}`} className="text-xs text-zinc-500 flex items-center gap-1 hover:underline">
                          <Phone size={11} /> {b.labourMobileNumber}
                        </a>
                        {b.assignedByAdmin && <p className="text-[11px] text-blue-600">Assigned by admin</p>}
                        {b.review && (
                          <p className="text-[11px] text-amber-600 flex items-center gap-0.5 mt-0.5">
                            <Star size={10} className="fill-amber-400 text-amber-400" /> {b.review.rating}/5 review
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-red-600">Not assigned</p>
                        <p className="text-xs text-zinc-500 capitalize">wants {b.category === "all" ? "any worker" : b.category.replace("-", " ")}</p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <p className="whitespace-nowrap font-medium">{fmt(b.visitAt)}</p>
                    <p className="text-xs text-zinc-500">{b.siteDetails ? `${b.siteDetails}, ` : ""}{b.workAddress}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.fare > 0 ? <p className="font-bold">{money(b.fare)}</p> : <p className="font-bold text-red-600">Fare not set</p>}
                    <p className="text-xs text-zinc-500">{b.duration} {b.pricingType === "hourly" ? "hr" : "day"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{b.paymentMethod === "online" ? "Prepaid (online)" : "Postpaid (cash)"}</p>
                    <p className="text-xs text-zinc-500">
                      {b.paymentMethod === "cash"
                        ? "Collect after work"
                        : paid ? "Paid" : b.paymentStatus === "failed" ? "Payment failed" : "Not paid yet"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {b.paymentMethod === "online" ? (
                      <>
                        <p className="font-semibold">{PAYOUT[b.payoutStatus] || "—"}{b.labourAmount ? ` · ${money(b.labourAmount)}` : ""}</p>
                        {b.bank ? (
                          <p className="text-[11px] text-zinc-500">{b.bank.holder} · A/c ••{b.bank.last4}</p>
                        ) : b.labour ? (
                          <p className="text-[11px] text-red-600">No bank added</p>
                        ) : null}
                        {b.payoutUtr && <p className="text-[11px] text-zinc-500">UTR {b.payoutUtr}</p>}
                        {b.payoutError && <p className="text-[11px] text-red-600 max-w-[200px]">{b.payoutError}</p>}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">Commission {money(b.adminCommission)}</p>
                        <p className="text-[11px] text-zinc-500">
                          {b.bookingStatus !== "completed" ? "After job" : b.commissionSettled ? "Received" : b.adminCommission > 0 ? "To collect from labour" : "—"}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${stCls}`}>{stText}</span>
                    {b.overdue && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">No reply in {data.timeoutMin}+ min</p>
                    )}
                    {b.rejectReason && <p className="text-[11px] text-zinc-500 mt-1 max-w-[160px]">{b.rejectReason}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                      {canAssign && (
                        <button onClick={() => setAssigning(b)} disabled={busy} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-bold disabled:opacity-50">
                          {b.bookingStatus === "requested" ? "Reassign" : "Assign"}
                        </button>
                      )}
                      {canPayout && (
                        <button onClick={() => payout(b)} disabled={busy} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50">
                          {busy ? "Please wait…" : "Pay to bank"}
                        </button>
                      )}
                      {canSync && (
                        <button onClick={() => sync(b)} disabled={busy} className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold disabled:opacity-50">
                          Check payout
                        </button>
                      )}
                      {canSettle && (
                        <button onClick={() => settle(b)} disabled={busy} className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold disabled:opacity-50">
                          Commission received
                        </button>
                      )}
                      {canCancel && (
                        <button onClick={() => cancel(b)} disabled={busy} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold disabled:opacity-50">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {assigning && (
        <AssignModal
          booking={assigning}
          onClose={() => setAssigning(null)}
          onDone={async () => { setAssigning(null); await load(); }}
        />
      )}
    </div>
  );
}
