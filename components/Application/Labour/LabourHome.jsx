"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  ArrowDownToLine, Banknote, Bell, BellRing, Briefcase, CalendarClock, CheckCircle2, ChevronRight,
  History, IndianRupee, Landmark, Loader2, MapPin, Navigation, Phone, Play, QrCode, Star, Wallet, X,
} from "lucide-react";
import { showToast } from "@/lib/showToast";
import useLiveRoom from "@/hooks/useLiveRoom";
import { moneyStage, workStage, TONE, money } from "@/lib/jobStage";

const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong";
const ok = (data) => { if (!data?.success) throw new Error(data?.message || "Failed"); return data.data; };
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" });
const fmtTime = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const TXN = {
  online_credit: { label: "Earning added", sign: "+", cls: "text-emerald-600" },
  cash_due: { label: "Commission due (cash job)", sign: "", cls: "text-rose-600" },
  due_settled: { label: "Commission paid", sign: "", cls: "text-sky-600" },
  withdraw: { label: "Withdraw to bank", sign: "−", cls: "text-slate-700" },
};
const WD_STATUS = { requested: "Requested", processing: "Processing", paid: "Sent to bank", rejected: "Rejected · refunded" };

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// chhota "ding" — naya job aaye to labour ko sunai de
const ding = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach((t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.16);
    });
  } catch {}
};

const Chip = ({ s }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONE[s.tone]}`}>{s.label}</span>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
    <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, ...p }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
    <input {...p} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-[15px] outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20" />
  </label>
);

/* ─────────────────────────── Job card ─────────────────────────── */
function JobCard({ job, busy, onStart, onFinish }) {
  const w = workStage(job), m = moneyStage(job);
  const addr = [job.address?.fullAddress, job.address?.landmark, job.address?.city, job.address?.pincode].filter(Boolean).join(", ");
  const cash = job.paymentStatus === "cash_due";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 ${job.status === "in_progress" ? "animate-pulse bg-sky-500" : "bg-amber-400"}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">#{job.bookingCode}</p>
            <h3 className="mt-0.5 text-lg font-bold leading-tight text-slate-900">{job.serviceTitle}</h3>
          </div>
          <Chip s={w} />
        </div>

        <div className="mt-4 space-y-2.5 text-sm text-slate-700">
          <p className="flex items-center gap-2.5"><CalendarClock size={16} className="shrink-0 text-slate-400" /> {fmtDate(job.date)} · {job.timeSlot}</p>
          <p className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" /> <span>{addr}</span></p>
          {job.adminNote && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900"><b>Admin note:</b> {job.adminNote}</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`tel:${job.contactPhone}`} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <Phone size={16} /> Call {job.user?.name?.split(" ")[0] || "customer"}
          </a>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <Navigation size={16} /> Directions
          </a>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{cash ? "Collect from customer" : "Customer paid"}</span>
            <span className="text-lg font-bold text-slate-900">{money(job.total)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>You earn <b className="text-emerald-700">{money(job.labourEarning)}</b></span>
            <Chip s={m} />
          </div>
        </div>

        <div className="mt-4">
          {job.status === "confirmed" && (
            <button disabled={busy} onClick={() => onStart(job)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />} Start Work
            </button>
          )}
          {job.status === "in_progress" && (
            <button disabled={busy} onClick={() => onFinish(job)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} Finish Work
            </button>
          )}
          {job.startedAt && job.status === "in_progress" && (
            <p className="mt-2 text-center text-xs text-slate-500">Started at {fmtTime(job.startedAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main ─────────────────────────── */
export default function LabourHome({ userId }) {
  const [d, setD] = useState(null);
  const [state, setState] = useState("loading");
  const [busy, setBusy] = useState("");
  const [tab, setTab] = useState("jobs");
  const [modal, setModal] = useState(null); // "withdraw" | "bank" | { finish: job } | { qr }
  const [amount, setAmount] = useState("");
  const [bankForm, setBankForm] = useState({ accountHolder: "", accountNumber: "", confirm: "", ifsc: "", upi: "" });
  const [notifyOn, setNotifyOn] = useState(false);
  const qrPoll = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/labours/dashboard");
      setD(ok(data)); setState("ok");
    } catch (e) {
      setState((s) => (s === "ok" ? s : "error"));
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setNotifyOn(typeof Notification !== "undefined" && Notification.permission === "granted"); }, []);

  // ── live: admin job deta hai / payment aata hai -> turant refresh ──
  useLiveRoom(userId ? `labour:${userId}` : null,
    ["job:assigned", "job:removed", "job:updated", "job:paid", "job:started", "job:finished", "wallet:updated"],
    (ev, p) => {
      if (ev === "job:assigned") {
        ding();
        showToast("info", `New job: ${p?.title || "Service"} · ${p?.when || ""}`);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try { new Notification("New job assigned", { body: `${p?.title || ""} · ${p?.when || ""} ${p?.city || ""}` }); } catch {}
        }
      }
      load();
    });

  const enableNotify = async () => {
    if (typeof Notification === "undefined") return showToast("error", "This browser does not support notifications.");
    const r = await Notification.requestPermission();
    setNotifyOn(r === "granted");
    if (r === "granted") { ding(); showToast("success", "Job alerts are ON"); }
  };

  const stopQr = () => { if (qrPoll.current) { clearInterval(qrPoll.current); qrPoll.current = null; } };
  useEffect(() => stopQr, []);

  /* ── actions ── */
  const start = async (job) => {
    setBusy(job._id);
    try { ok((await axios.patch(`/api/labours/jobs/${job._id}/start`)).data); showToast("success", "Work started. All the best!"); load(); }
    catch (e) { showToast("error", errMsg(e)); } finally { setBusy(""); }
  };

  const finish = async (job) => {
    setBusy(job._id);
    try {
      ok((await axios.patch(`/api/service-booking/${job._id}/complete`)).data);
      showToast("success", job.paymentStatus === "paid" ? `Work finished. ${money(job.labourEarning)} added to wallet.` : "Work finished. Cash recorded.");
      setModal(null); load();
    } catch (e) { showToast("error", errMsg(e)); } finally { setBusy(""); }
  };

  const showQr = async (job) => {
    setBusy(job._id);
    try {
      const q = ok((await axios.post(`/api/service-booking/${job._id}/qr`)).data);
      setModal({ qr: { ...q, job } });
      stopQr();
      qrPoll.current = setInterval(async () => {
        try {
          const { data: s } = await axios.get(`/api/service-booking/${job._id}/qr/status`);
          if (s.data?.paid) { stopQr(); setModal({ qr: { ...q, job, paid: true } }); load(); }
          else if (s.data?.closed) { stopQr(); setModal({ qr: { ...q, job, closed: true } }); }
        } catch {}
      }, 4000);
    } catch (e) { showToast("error", errMsg(e)); } finally { setBusy(""); }
  };

  const withdraw = async (e) => {
    e.preventDefault();
    setBusy("withdraw");
    try {
      ok((await axios.post("/api/labours/wallet/withdraw", { amount: Number(amount) })).data);
      showToast("success", "Withdraw request sent. Money will reach your bank soon.");
      setAmount(""); setModal(null); load();
    } catch (err) { showToast("error", errMsg(err)); } finally { setBusy(""); }
  };

  const payDue = async () => {
    setBusy("due");
    try {
      if (!(await loadRazorpay())) throw new Error("Could not load Razorpay. Check your internet.");
      const o = ok((await axios.post("/api/labours/wallet/pay-due")).data);
      await new Promise((resolve, reject) => {
        const rz = new window.Razorpay({
          key: o.key, amount: o.amount, currency: "INR", order_id: o.orderId, name: "ConstructEzy",
          description: "Commission payment", theme: { color: "#047857" },
          prefill: { contact: d?.profile?.phone ? `+91${d.profile.phone}` : undefined, name: d?.profile?.fullName },
          handler: async (r) => {
            try { ok((await axios.post("/api/labours/wallet/pay-due/verify", r)).data); resolve(); } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => resolve("dismiss") },
        });
        rz.open();
      }).then((r) => { if (r !== "dismiss") showToast("success", "Commission paid. Thank you!"); });
      load();
    } catch (e) { showToast("error", errMsg(e)); } finally { setBusy(""); }
  };

  const saveBank = async (e) => {
    e.preventDefault();
    if (bankForm.accountNumber !== bankForm.confirm) return showToast("error", "Account numbers do not match");
    setBusy("bank");
    try {
      const { confirm, ...body } = bankForm;
      ok((await axios.put("/api/labours/bank", body)).data);
      showToast("success", "Bank account saved");
      setModal(null); load();
    } catch (err) { showToast("error", errMsg(err)); } finally { setBusy(""); }
  };

  /* ── render ── */
  if (state === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={30} /></div>;
  }
  if (state === "error" || !d) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-slate-600">Dashboard load nahi hua.</p>
        <button onClick={load} className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  const { profile, wallet, bank, active, history, txns, today, minWithdraw, commissionPercent } = d;
  const name = profile?.fullName || "Partner";
  const due = Number(wallet.pendingDue || 0);
  const balance = Number(wallet.balance || 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-3xl space-y-5 px-4 pt-5 sm:px-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white">{name.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">Namaste, {name.split(" ")[0]}</h1>
              <p className="flex items-center gap-1.5 text-xs capitalize text-slate-500">
                {profile?.category?.replace(/-/g, " ") || "Partner"}
                {profile?.rating > 0 && <><span>·</span><Star size={12} className="fill-amber-400 text-amber-400" /> {Number(profile.rating).toFixed(1)}</>}
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live</span>
              </p>
            </div>
          </div>
          <button onClick={enableNotify} title="Job alerts"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${notifyOn ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}>
            {notifyOn ? <BellRing size={16} /> : <Bell size={16} />} {notifyOn ? "Alerts on" : "Turn on alerts"}
          </button>
        </div>

        {/* ── Wallet ── */}
        <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-emerald-900 p-5 text-white shadow-xl sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-emerald-200"><Wallet size={14} /> Wallet balance</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">{money(balance)}</p>
              <p className="mt-1 text-xs text-slate-300">Ready to withdraw · min {money(minWithdraw)}</p>
            </div>
            <IndianRupee className="text-white/10" size={56} />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/10 px-2 py-3"><p className="text-[11px] text-slate-300">Today</p><p className="mt-0.5 font-bold">{money(today.earned)}</p></div>
            <div className={`rounded-2xl px-2 py-3 ${due > 0 ? "bg-rose-500/25 ring-1 ring-rose-300/40" : "bg-white/10"}`}><p className="text-[11px] text-slate-300">Commission due</p><p className="mt-0.5 font-bold">{money(due)}</p></div>
            <div className="rounded-2xl bg-white/10 px-2 py-3"><p className="text-[11px] text-slate-300">Total earned</p><p className="mt-0.5 font-bold">{money(wallet.totalEarned)}</p></div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => (bank ? setModal("withdraw") : (showToast("info", "Add your bank account first"), setModal("bank")))}
              disabled={balance < minWithdraw}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-slate-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">
              <ArrowDownToLine size={17} /> Withdraw
            </button>
            <button onClick={payDue} disabled={due < 1 || busy === "due"}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-400">
              {busy === "due" ? <Loader2 className="animate-spin" size={17} /> : <IndianRupee size={17} />} {due > 0 ? `Pay ${money(due)}` : "No due"}
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            Online jobs: {commissionPercent}% commission auto cut, baaki wallet me. Cash jobs: commission + platform fee company ko pay karna hai (agli online kamai se bhi auto adjust ho jata hai).
          </p>
        </div>

        {/* ── Current jobs ── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><Briefcase size={18} /> Current jobs</h2>
            {active.length > 0 && <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">{active.length}</span>}
          </div>
          {active.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100"><Bell className="text-slate-400" /></div>
              <p className="mt-3 font-semibold text-slate-800">No job right now</p>
              <p className="mt-1 text-sm text-slate-500">Jab admin aapko kaam dega, notification aayegi aur job yahan dikhegi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {active.map((j) => (
                <JobCard key={j._id} job={j} busy={busy === j._id}
                  onStart={start} onFinish={(job) => setModal({ finish: job })} />
              ))}
            </div>
          )}
        </section>

        {/* ── Bank ── */}
        <button onClick={() => { setBankForm({ accountHolder: bank?.accountHolder || name, accountNumber: "", confirm: "", ifsc: bank?.ifsc || "", upi: bank?.upi || "" }); setModal("bank"); }}
          className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bank ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><Landmark size={20} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">{bank ? `${bank.bankName || "Bank account"} ${bank.accountNumber}` : "Add bank account"}</p>
            <p className="truncate text-xs text-slate-500">{bank ? `${bank.accountHolder} · ${bank.ifsc}${bank.upi ? ` · ${bank.upi}` : ""}` : "Withdraw ke liye bank account zaroori hai"}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700">{bank ? "Change" : "Add"}</span>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        {/* ── History ── */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-100 p-1.5">
            {[["jobs", "Job history", Briefcase], ["wallet", "Wallet history", History]].map(([k, l, I]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold transition ${tab === k ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                <I size={15} /> {l}
              </button>
            ))}
          </div>

          {tab === "jobs" && (
            <ul className="divide-y divide-slate-100">
              {history.length === 0 && <li className="px-5 py-10 text-center text-sm text-slate-500">Abhi koi completed job nahi.</li>}
              {history.map((j) => {
                const m = moneyStage(j);
                return (
                  <li key={j._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{j.serviceTitle}</p>
                      <p className="text-xs text-slate-500">#{j.bookingCode} · {j.completedAt ? fmtTime(j.completedAt) : fmtDate(j.date)} · {j.paymentMethod === "cash" ? "Cash" : "Online"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-900">{money(j.labourEarning)}</p>
                      <Chip s={m} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === "wallet" && (
            <ul className="divide-y divide-slate-100">
              {txns.length === 0 && <li className="px-5 py-10 text-center text-sm text-slate-500">Abhi koi transaction nahi.</li>}
              {txns.map((t) => {
                const c = TXN[t.type] || { label: t.type, sign: "", cls: "" };
                return (
                  <li key={t._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{c.label}{t.type === "withdraw" && <span className="ml-1.5 text-xs font-medium text-slate-500">· {WD_STATUS[t.status] || t.status}</span>}</p>
                      <p className="truncate text-xs text-slate-500">{fmtTime(t.createdAt)}{t.note ? ` · ${t.note}` : ""}</p>
                    </div>
                    <p className={`shrink-0 text-sm font-bold ${c.cls}`}>{c.sign}{money(t.amount)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ───────── Modals ───────── */}
      {modal?.finish && (() => {
        const j = active.find((x) => x._id === modal.finish._id) || modal.finish;
        const paid = j.paymentStatus === "paid";
        return (
          <Modal title="Finish work" onClose={() => setModal(null)}>
            <p className="text-sm text-slate-600">#{j.bookingCode} · {j.serviceTitle}</p>
            {paid ? (
              <>
                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                  Customer ne online pay kar diya hai. Finish karte hi <b>{money(j.labourEarning)}</b> aapke wallet me aa jayega (commission {money(j.commission)} auto cut).
                </div>
                <button disabled={busy === j._id} onClick={() => finish(j)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white disabled:opacity-60">
                  {busy === j._id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} Confirm finish
                </button>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm font-semibold text-slate-800">Customer se {money(j.total)} kaise liya?</p>
                <div className="mt-3 space-y-2.5">
                  <button disabled={busy === j._id}
                    onClick={() => { if (confirm(`${money(j.total)} cash le liya?\n\nCompany ko ${money((j.commission || 0) + (j.platformFee || 0))} commission pay karna hoga.`)) finish(j); }}
                    className="flex w-full items-center gap-3 rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-emerald-500 disabled:opacity-60">
                    <Banknote className="text-emerald-600" />
                    <div className="flex-1"><p className="font-bold text-slate-900">Cash liya</p><p className="text-xs text-slate-500">Commission {money((j.commission || 0) + (j.platformFee || 0))} wallet me due ho jayega</p></div>
                  </button>
                  <button disabled={busy === j._id} onClick={() => showQr(j)}
                    className="flex w-full items-center gap-3 rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-emerald-500 disabled:opacity-60">
                    {busy === j._id ? <Loader2 className="animate-spin text-emerald-600" /> : <QrCode className="text-emerald-600" />}
                    <div className="flex-1"><p className="font-bold text-slate-900">Customer UPI se pay karega</p><p className="text-xs text-slate-500">QR dikhao · commission auto cut, {money(j.labourEarning)} wallet me</p></div>
                  </button>
                </div>
              </>
            )}
          </Modal>
        );
      })()}

      {modal?.qr && (
        <Modal title="Scan & pay" onClose={() => { stopQr(); setModal(null); }}>
          {modal.qr.paid ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto text-emerald-600" size={56} />
              <p className="mt-3 text-lg font-bold">Payment received</p>
              <p className="mt-1 text-sm text-slate-500">Work finished. {money(modal.qr.job.labourEarning)} wallet me add ho gaya.</p>
              <button onClick={() => setModal(null)} className="mt-5 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white">Done</button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-slate-600">Customer ko ye QR scan karwao</p>
              <p className="mt-1 text-3xl font-extrabold">{money(modal.qr.amount)}</p>
              <img src={modal.qr.imageUrl} alt="UPI QR" className="mx-auto mt-4 w-64 rounded-2xl border" />
              {modal.qr.closed
                ? <p className="mt-3 text-sm text-rose-600">QR expire ho gaya. Band karke dobara banao.</p>
                : <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={14} /> Payment ka wait...</p>}
            </div>
          )}
        </Modal>
      )}

      {modal === "withdraw" && (
        <Modal title="Withdraw to bank" onClose={() => setModal(null)}>
          <form onSubmit={withdraw} className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-3.5 text-sm">
              <p className="text-slate-500">Available</p><p className="text-2xl font-extrabold text-slate-900">{money(balance)}</p>
              {bank && <p className="mt-1 text-xs text-slate-500">To {bank.bankName || "bank"} {bank.accountNumber} · {bank.accountHolder}</p>}
            </div>
            <Field label={`Amount (min ${money(minWithdraw)})`} type="number" inputMode="numeric" min={minWithdraw} max={balance} step="1"
              required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
            <div className="flex gap-2">
              {[500, 1000].filter((v) => v <= balance && v >= minWithdraw).map((v) => (
                <button key={v} type="button" onClick={() => setAmount(String(v))} className="rounded-full border px-3 py-1 text-xs font-semibold">{money(v)}</button>
              ))}
              <button type="button" onClick={() => setAmount(String(Math.floor(balance)))} className="rounded-full border px-3 py-1 text-xs font-semibold">Full</button>
            </div>
            <button disabled={busy === "withdraw"} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 font-bold text-white disabled:opacity-60">
              {busy === "withdraw" && <Loader2 className="animate-spin" size={18} />} Withdraw
            </button>
            <p className="text-center text-xs text-slate-500">Paisa 24 ghante me bank account me aa jata hai.</p>
          </form>
        </Modal>
      )}

      {modal === "bank" && (
        <Modal title={bank ? "Change bank account" : "Add bank account"} onClose={() => setModal(null)}>
          <form onSubmit={saveBank} className="space-y-3.5">
            <Field label="Account holder name" required value={bankForm.accountHolder} onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} />
            <Field label="Account number" required inputMode="numeric" pattern="[0-9]{9,18}" value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, "") })} />
            <Field label="Confirm account number" required inputMode="numeric" value={bankForm.confirm}
              onChange={(e) => setBankForm({ ...bankForm, confirm: e.target.value.replace(/\D/g, "") })} />
            <Field label="IFSC code" required maxLength={11} value={bankForm.ifsc} placeholder="e.g. SBIN0001234"
              onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })} />
            <Field label="UPI ID (optional)" value={bankForm.upi} placeholder="name@upi" onChange={(e) => setBankForm({ ...bankForm, upi: e.target.value.trim() })} />
            <button disabled={busy === "bank"} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 font-bold text-white disabled:opacity-60">
              {busy === "bank" && <Loader2 className="animate-spin" size={18} />} Save bank account
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
