"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Activity, AlertCircle, ArrowDownToLine, Banknote, CalendarClock, Check, CircleDollarSign, Clock, HandCoins,
  Landmark, Loader2, MapPin, Phone, RefreshCw, Search, UserPlus, Users, Wallet, X,
} from "lucide-react";
import { showToast } from "@/lib/showToast";
import useLiveRoom from "@/hooks/useLiveRoom";
import { moneyStage, workStage, TONE, money } from "@/lib/jobStage";

const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong";
const ok = (data) => { if (!data?.success) throw new Error(data?.message || "Failed"); return data.data; };
const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const fmtDay = (d) => new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });

const TABS = [
  ["live", "Live now"], ["upcoming", "Upcoming"], ["unassigned", "Unassigned"],
  ["completed", "Completed"], ["due", "Payment due"], ["all", "All"],
];

const Chip = ({ s }) => (
  <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONE[s.tone]}`}>{s.label}</span>
);

// Tailwind ko poori class names dikhni chahiye (dynamic `bg-${x}-50` build me nahi banti)
const ICON_TONE = {
  slate: "bg-slate-100 text-slate-600", sky: "bg-sky-50 text-sky-600", amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600", indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600",
};

const Stat = ({ icon: I, label, value, sub, tone = "slate", pulse }) => (
  <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${ICON_TONE[tone]}`}>
        <I size={16} className={pulse ? "animate-pulse" : ""} />
      </span>
    </div>
    <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
  </div>
);

// Booked -> Assigned -> Started -> Finished -> Paid
function Timeline({ b }) {
  const m = moneyStage(b);
  const steps = [
    ["Booked", b.createdAt],
    ["Assigned", b.labourUser ? b.assignedAt || b.createdAt : null],
    ["Started", b.startedAt],
    ["Finished", b.completedAt],
    ["Paid", m.key === "complete" ? b.commissionSettledAt || b.paidAt || b.completedAt : null],
  ];
  const current = steps.findIndex(([, t]) => !t);
  return (
    <div className="flex items-center">
      {steps.map(([label, t], i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center" title={t ? `${label}: ${fmt(t)}` : label}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${
              t ? "bg-emerald-500" : i === current && b.status !== "cancelled" ? "animate-pulse bg-sky-500" : "bg-slate-200"}`}>
              {t ? <Check size={11} strokeWidth={3} /> : null}
            </span>
            <span className="mt-1 text-[10px] text-slate-500">{label}</span>
          </div>
          {i < steps.length - 1 && <span className={`mx-0.5 mb-4 h-0.5 w-4 sm:w-6 ${steps[i + 1][1] ? "bg-emerald-500" : "bg-slate-200"}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
    <div className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-stone-900 ${wide ? "max-w-xl" : "max-w-md"}`} onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onClose} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-stone-800"><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ label, ...p }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
    <input {...p} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-stone-700 dark:bg-stone-950" />
  </label>
);

export default function AdminLabourJobs() {
  const [tab, setTab] = useState("live");
  const [q, setQ] = useState("");
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [labourSearch, setLabourSearch] = useState("");
  const [flash, setFlash] = useState(null); // live update highlight
  const throttle = useRef(0);

  const load = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/labour-jobs", { params: { tab, q: q || undefined } });
      setD(ok(data));
    } catch (e) { if (!silent) showToast("error", errMsg(e)); }
    finally { setLoading(false); }
  }, [tab, q]);

  useEffect(() => { const t = setTimeout(() => load(), q ? 350 : 0); return () => clearTimeout(t); }, [load, q]);

  useLiveRoom("admin:labour-jobs",
    ["job:updated", "job:assigned", "job:started", "job:finished", "job:paid", "wallet:updated", "withdraw:requested"],
    (ev, p) => {
      if (ev === "job:started") showToast("info", `Work started · #${p?.bookingCode || ""}`);
      if (ev === "job:finished") showToast("success", `Work finished · #${p?.bookingCode || ""}`);
      if (ev === "withdraw:requested") showToast("info", `Labour withdraw request ${money(p?.amount)}`);
      if (p?.bookingId) { setFlash(p.bookingId); setTimeout(() => setFlash(null), 2500); }
      const now = Date.now();
      if (ev === "poll" || now - throttle.current > 800) { throttle.current = now; load(true); }
    }, 15000);

  /* ── actions ── */
  const assign = async (labour) => {
    setBusy(labour.userId);
    try {
      const r = await axios.post(`/api/admin/labour-jobs/${modal.assign._id}/assign`, { labourUserId: labour.userId, note: form.note || "" });
      if (!r.data.success) throw new Error(r.data.message);
      showToast("success", `${r.data.message}. Labour ko notification bhej di.`);
      setModal(null); load(true);
    } catch (e) { showToast("error", errMsg(e)); } finally { setBusy(""); }
  };

  const markDone = async (b) => {
    const cash = b.paymentStatus === "cash_due";
    if (!confirm(`Mark #${b.bookingCode} finished?${cash ? `\n\nCash job: labour par ${money((b.commission || 0) + (b.platformFee || 0))} commission due ho jayega.` : ""}`)) return;
    setBusy(b._id);
    try { ok((await axios.patch(`/api/service-booking/${b._id}/complete`)).data); showToast("success", "Marked finished"); load(true); }
    catch (e) { showToast("error", errMsg(e)); } finally { setBusy(""); }
  };

  const settle = async (e) => {
    e.preventDefault(); setBusy("settle");
    try {
      const r = await axios.post("/api/admin/labour-jobs/settle", { userId: modal.settle.userId, amount: Number(form.amount), note: form.note });
      if (!r.data.success) throw new Error(r.data.message);
      showToast("success", r.data.message); setModal(null); load(true);
    } catch (err) { showToast("error", errMsg(err)); } finally { setBusy(""); }
  };

  const withdraw = async (e) => {
    e.preventDefault(); setBusy("payout");
    try {
      const r = await axios.post("/api/admin/platform-payouts", { ...form, amount: Number(form.amount) });
      if (!r.data.success) throw new Error(r.data.message);
      showToast("success", "Withdrawal recorded"); setModal(null); load(true);
    } catch (err) { showToast("error", errMsg(err)); } finally { setBusy(""); }
  };

  const assignable = useMemo(() => {
    const list = d?.assignable || [];
    const s = labourSearch.trim().toLowerCase();
    return s ? list.filter((l) => `${l.name} ${l.phone} ${l.category}`.toLowerCase().includes(s)) : list;
  }, [d, labourSearch]);

  const c = d?.counts || {};
  const m = d?.money || {};

  return (
    <div className="space-y-5 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            Labour Jobs
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
            </span>
          </h1>
          <p className="text-sm text-slate-500">Kaam assign se lekar finish aur payment settle hone tak — sab ek jagah.</p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-stone-800">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat icon={Activity} label="Work in progress" value={c.live ?? "—"} tone="sky" pulse={c.live > 0} />
        <Stat icon={CalendarClock} label="Upcoming (not started)" value={c.upcoming ?? "—"} tone="amber" />
        <Stat icon={UserPlus} label="Unassigned" value={c.unassigned ?? "—"} tone="rose" sub={c.unassigned ? "Labour assign karo" : ""} />
        <Stat icon={HandCoins} label="Commission due (cash)" value={money(m.outstandingDue)} tone="rose" sub={`${c.due || 0} jobs`} />
        <Stat icon={Wallet} label="Labour wallets (payable)" value={money(m.labourPayable)} tone="indigo" sub={m.pendingWithdraw?.n ? `${m.pendingWithdraw.n} withdraw req · ${money(m.pendingWithdraw.amt)}` : "No pending withdraw"} />
        <Stat icon={CircleDollarSign} label="Company earning available" value={money(m.available)} tone="emerald" sub={`Total ${money(m.earned)}`} />
      </div>

      {/* ── Jobs ── */}
      <div className="rounded-2xl border bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3 dark:border-stone-800">
          <div className="flex flex-wrap gap-1">
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === k ? "bg-slate-900 text-white dark:bg-white dark:text-black" : "text-slate-600 hover:bg-slate-100 dark:hover:bg-stone-800"}`}>
                {l}{k !== "all" && c[k] ? <span className="ml-1.5 rounded-full bg-black/10 px-1.5 text-[11px]">{c[k]}</span> : null}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Booking id, service, labour, phone"
              className="w-64 rounded-lg border py-1.5 pl-8 pr-3 text-sm outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-900" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500 dark:border-stone-800">
                <th className="px-4 py-2.5 font-medium">Booking</th>
                <th className="px-4 py-2.5 font-medium">Customer / Site</th>
                <th className="px-4 py-2.5 font-medium">Labour</th>
                <th className="px-4 py-2.5 font-medium">Progress</th>
                <th className="px-4 py-2.5 font-medium">Money</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && !d && <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="mx-auto animate-spin text-slate-400" /></td></tr>}
              {d && d.jobs.length === 0 && <tr><td colSpan={6} className="py-14 text-center text-slate-500">Is tab me koi job nahi.</td></tr>}
              {d?.jobs.map((b) => {
                const w = workStage(b), ms = moneyStage(b);
                const canAssign = ["pending_payment", "confirmed"].includes(b.status);
                const canFinish = ["confirmed", "in_progress"].includes(b.status) && ["paid", "cash_due"].includes(b.paymentStatus);
                return (
                  <tr key={b._id} className={`border-b align-top transition-colors last:border-0 dark:border-stone-800 ${flash === b._id ? "bg-emerald-50 dark:bg-emerald-950/30" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">#{b.bookingCode}</p>
                      <p className="text-xs text-slate-600">{b.serviceTitle}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Clock size={11} /> {fmtDay(b.date)} · {b.timeSlot}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.user?.name || "—"}</p>
                      <a href={`tel:${b.contactPhone}`} className="text-xs text-emerald-700 hover:underline">{b.contactPhone}</a>
                      <p className="mt-0.5 flex max-w-[220px] items-start gap-1 text-xs text-slate-500"><MapPin size={11} className="mt-0.5 shrink-0" /> {b.address?.fullAddress}, {b.address?.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      {b.labourUser ? (
                        <>
                          <p className="font-medium">{b.labourName}</p>
                          {b.labourPhone && <a href={`tel:${b.labourPhone}`} className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"><Phone size={11} /> {b.labourPhone}</a>}
                        </>
                      ) : <span className="text-xs font-medium text-rose-600">Not assigned</span>}
                      <div className="mt-1"><Chip s={w} /></div>
                    </td>
                    <td className="px-4 py-3"><Timeline b={b} /></td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{money(b.total)} <span className="text-xs font-normal capitalize text-slate-500">· {b.paymentMethod}</span></p>
                      <p className="text-xs text-slate-500">Labour {money(b.labourEarning)} · Company {money((b.commission || 0) + (b.platformFee || 0))}</p>
                      <div className="mt-1"><Chip s={ms} /></div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {canAssign && (
                          <button onClick={() => { setForm({ note: "" }); setLabourSearch(""); setModal({ assign: b }); }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-black">
                            <UserPlus size={13} /> {b.labourUser ? "Change labour" : "Assign labour"}
                          </button>
                        )}
                        {canFinish && (
                          <button disabled={busy === b._id} onClick={() => markDone(b)}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-stone-700">
                            {busy === b._id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Mark finished
                          </button>
                        )}
                        {b.status === "pending_payment" && <span className="text-[11px] text-slate-500">Customer payment pending</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* ── Labour commission ── */}
        <div className="rounded-2xl border bg-white shadow-sm xl:col-span-3 dark:border-stone-800 dark:bg-stone-950">
          <div className="flex items-center justify-between border-b p-4 dark:border-stone-800">
            <h2 className="flex items-center gap-2 font-semibold"><Users size={18} /> Labour commission & wallets</h2>
            <span className="text-xs text-slate-500">Online kamai se due auto adjust hota hai</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500 dark:border-stone-800">
                  <th className="px-4 py-2 font-medium">Labour</th>
                  <th className="px-4 py-2 font-medium">Commission due</th>
                  <th className="px-4 py-2 font-medium">Wallet</th>
                  <th className="px-4 py-2 font-medium">Earned</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {(d?.labours || []).length === 0 && <tr><td colSpan={5} className="py-10 text-center text-slate-500">Abhi koi labour wallet nahi.</td></tr>}
                {(d?.labours || []).map((l) => (
                  <tr key={String(l.userId)} className="border-b last:border-0 dark:border-stone-800">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs capitalize text-slate-500">{l.category?.replace(/-/g, " ")} {l.phone && <a href={`tel:${l.phone}`} className="ml-1 text-emerald-700">{l.phone}</a>}</p>
                    </td>
                    <td className={`px-4 py-2.5 font-semibold ${l.pendingDue > 0 ? "text-rose-600" : "text-slate-400"}`}>{money(l.pendingDue)}</td>
                    <td className="px-4 py-2.5">{money(l.balance)}</td>
                    <td className="px-4 py-2.5 text-slate-500">{money(l.totalEarned)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {l.pendingDue > 0 && (
                        <button onClick={() => { setForm({ amount: String(l.pendingDue), note: "" }); setModal({ settle: l }); }}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white">
                          <Banknote size={13} /> Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Company earning ── */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2 dark:border-stone-800 dark:bg-stone-950">
          <h2 className="flex items-center gap-2 font-semibold"><Landmark size={18} /> Company earning</h2>
          <p className="mt-3 text-xs text-slate-500">Available to withdraw</p>
          <p className="text-3xl font-bold tracking-tight text-emerald-600">{money(m.available)}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Online jobs commission (auto cut)", m.onlineCommission],
              ["Cash commission — adjusted from online", m.settledBy?.auto],
              ["Cash commission — labour paid online", m.settledBy?.online],
              ["Cash commission — settled manually", m.settledBy?.manual],
              ["Withdrawn to bank", -(m.withdrawn || 0)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{money(v)}</dd></div>
            ))}
          </dl>
          <button disabled={!(m.available > 0)}
            onClick={() => { setForm({ amount: String(m.available || ""), accountHolder: "", accountNumber: "", ifsc: "", utr: "", note: "" }); setModal("payout"); }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-black">
            <ArrowDownToLine size={16} /> Withdraw to bank
          </button>
          {d?.payouts?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent withdrawals</p>
              <ul className="space-y-1.5 text-xs">
                {d.payouts.slice(0, 6).map((p) => (
                  <li key={p._id} className="flex justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-stone-900">
                    <span className="text-slate-600">{fmt(p.createdAt)} · ••{String(p.accountNumber).slice(-4)} · UTR {p.utr}</span>
                    <span className="font-semibold">{money(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ───────── Modals ───────── */}
      {modal?.assign && (
        <Modal wide title={`Assign labour · #${modal.assign.bookingCode}`} onClose={() => setModal(null)}>
          <p className="text-sm text-slate-600">{modal.assign.serviceTitle} · {fmtDay(modal.assign.date)} {modal.assign.timeSlot} · {modal.assign.address?.city}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><AlertCircle size={13} /> Labour ko call karke confirm karo, phir Assign dabao — use turant notification jayegi.</p>
          <div className="mt-3 space-y-3">
            <Input label="Note for labour (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Customer ko 30 min pehle call karna" />
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={labourSearch} onChange={(e) => setLabourSearch(e.target.value)} placeholder="Search name, phone, category"
                className="w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none dark:border-stone-700 dark:bg-stone-950" />
            </div>
          </div>
          <ul className="mt-3 max-h-80 divide-y overflow-y-auto rounded-xl border dark:divide-stone-800 dark:border-stone-800">
            {assignable.length === 0 && <li className="p-6 text-center text-sm text-slate-500">Koi approved labour nahi mila.</li>}
            {assignable.map((l) => (
              <li key={String(l.userId)} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{l.name}
                    {String(modal.assign.labourUser) === String(l.userId) && <span className="ml-1.5 text-xs text-emerald-600">(current)</span>}
                  </p>
                  <p className="text-xs capitalize text-slate-500">{l.category?.replace(/-/g, " ")} ·{" "}
                    <span className={l.availability === "available" ? "text-emerald-600" : "text-amber-600"}>{l.availability}</span></p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium dark:border-stone-700"><Phone size={12} /> Call</a>
                  <button disabled={!!busy} onClick={() => assign(l)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                    {busy === l.userId ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />} Assign
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {modal?.settle && (
        <Modal title={`Settle commission · ${modal.settle.name}`} onClose={() => setModal(null)}>
          <form onSubmit={settle} className="space-y-3">
            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">Pending due: <b>{money(modal.settle.pendingDue)}</b>. Labour se cash/UPI mil gaya ho tabhi settle karo.</p>
            <Input label="Amount received (₹)" type="number" step="0.01" min="1" max={modal.settle.pendingDue} required value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input label="Note / reference" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. UPI ref 4321… / cash at office" />
            <button disabled={busy === "settle"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy === "settle" && <Loader2 size={15} className="animate-spin" />} Mark settled
            </button>
          </form>
        </Modal>
      )}

      {modal === "payout" && (
        <Modal title="Withdraw company earning" onClose={() => setModal(null)}>
          <form onSubmit={withdraw} className="space-y-3">
            <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-stone-800">
              Available: <b>{money(m.available)}</b>. Razorpay settlement / bank transfer karne ke baad UTR ke saath yahan record karo, taaki hisaab barabar rahe.
            </p>
            <Input label="Amount (₹)" type="number" step="0.01" min="1" max={m.available} required value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input label="Account holder" required value={form.accountHolder || ""} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Account number" required inputMode="numeric" value={form.accountNumber || ""} onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "") })} />
              <Input label="IFSC" required maxLength={11} value={form.ifsc || ""} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })} />
            </div>
            <Input label="UTR / reference no." required value={form.utr || ""} onChange={(e) => setForm({ ...form, utr: e.target.value })} />
            <Input label="Note (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <button disabled={busy === "payout"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black">
              {busy === "payout" && <Loader2 size={15} className="animate-spin" />} Record withdrawal
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
