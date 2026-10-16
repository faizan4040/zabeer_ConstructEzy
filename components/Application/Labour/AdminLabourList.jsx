"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronDown, Loader2, Search } from "lucide-react";

const HIDE = new Set(["_id", "__v", "owner", "user", "partner", "userId", "partnerId", "createdAt", "updatedAt"]);

const pretty = (k) =>
  k.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase());

const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
const isImg = (v) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(v) || v.includes("/image/upload/");

function Value({ v }) {
  if (v && typeof v === "object" && !Array.isArray(v) && v.url) v = v.url;
  if (v === null || v === undefined || v === "") return <span className="text-zinc-400">-</span>;
  if (typeof v === "boolean") return <span>{v ? "Yes" : "No"}</span>;
  if (Array.isArray(v)) return <span>{v.map((x) => (typeof x === "object" ? x?.url || JSON.stringify(x) : x)).join(", ") || "-"}</span>;
  if (isUrl(v)) {
    return isImg(v) ? (
      <a href={v} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v} alt="document" className="h-20 rounded-lg border border-zinc-200 object-cover" />
      </a>
    ) : (
      <a href={v} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View file</a>
    );
  }
  if (typeof v === "object") return <span>{JSON.stringify(v)}</span>;
  return <span className="break-words">{String(v)}</span>;
}

function Section({ title, rows }) {
  if (!rows.length) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2">{title}</p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-zinc-400">{k}</p>
            <div className="font-medium text-zinc-900"><Value v={v} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

const generic = (obj) =>
  obj ? Object.entries(obj).filter(([k]) => !HIDE.has(k)).map(([k, v]) => [pretty(k), v]) : [];

function LabourRow({ l }) {
  const [open, setOpen] = useState(false);
  const statusCls =
    l.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : l.status === "rejected" ? "bg-red-50 text-red-700 border-red-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

  const basic = [
    ["Full name", l.fullName],
    ["Category", l.category],
    ["Phone", l.phone],
    ["Account email", l.owner?.email],
    ["Experience (years)", l.experienceYears],
    ["Home address", l.location?.address],
    ["Rate type", l.rateType],
    ["Price per day", l.pricePerDay],
    ["Price per hour", l.pricePerHour],
    ["Skills", l.skills],
    ["Aadhaar number", l.aadhaarNumber],
    ["Aadhaar image", l.aadhaarImage],
    ["Profile photo", l.profileImage],
    ["Partner review", l.owner?.partnerStatus],
    ["Video KYC", l.owner?.videoKycStatus],
    ["Completed jobs", l.completedJobs],
    ["Rating", l.rating],
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-4 p-4 text-left">
        <div className="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {l.profileImage && <img src={l.profileImage} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{l.fullName}</p>
          <p className="text-xs text-zinc-500 capitalize">{(l.category || "").replace("-", " ")} · {l.phone}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${statusCls}`}>{l.status}</span>
        <ChevronDown size={18} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-zinc-100 p-5 space-y-6">
          <Section title="Labour details" rows={basic} />
          <Section title="Documents (Aadhaar / PAN etc.)" rows={generic(l.docs)} />
          <Section title="Bank account (direct payment)" rows={generic(l.bank)} />
          {!l.docs && !l.bank && (
            <p className="text-xs text-zinc-400">Documents / bank details not submitted yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminLabourList() {
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    axios.get("/api/admin/labour/all")
      .then(({ data }) => setLabours(data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return labours.filter((l) =>
      (status === "all" || l.status === status) &&
      (!s || [l.fullName, l.phone, l.category, l.aadhaarNumber].some((x) => String(x || "").toLowerCase().includes(s)))
    );
  }, [labours, q, status]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 flex-1 min-w-[220px]">
          <Search size={15} className="text-zinc-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, category, Aadhaar"
            className="h-11 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 px-3 rounded-xl border border-zinc-200 bg-white text-sm">
          <option value="all">All status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500">No labour found.</div>
      ) : (
        filtered.map((l) => <LabourRow key={l._id} l={l} />)
      )}
    </div>
  );
}