"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Star } from "lucide-react";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

export default function AdminLabourReviews() {
  const [rows, setRows] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/admin/labour/booking-reviews");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log(e);
      setRows([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!confirm("Delete this review? The labour's rating will be recalculated.")) return;
    setBusyId(id);
    try {
      await axios.post("/api/admin/labour/booking-reviews", { id, action: "delete" });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Could not delete");
    }
    setBusyId(null);
  };

  if (!rows) return <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
          <tr>
            {["Date", "Labour", "Customer", "Rating", "Review", ""].map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">No labour reviews yet.</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r._id} className="border-t border-zinc-100 align-top">
              <td className="px-4 py-3 whitespace-nowrap">{fmt(r.createdAt)}</td>
              <td className="px-4 py-3">
                <p className="font-semibold">{r.labourProfile?.fullName || "-"}</p>
                <p className="text-xs text-zinc-500 capitalize">{(r.labourProfile?.category || "").replace("-", " ")}</p>
              </td>
              <td className="px-4 py-3">{r.user?.name || "-"}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 font-bold">
                  <Star size={13} className="text-amber-400 fill-amber-400" /> {r.rating}
                </span>
              </td>
              <td className="px-4 py-3 max-w-[320px]">
                {r.title && <p className="font-semibold">{r.title}</p>}
                <p className="text-zinc-600">{r.review || "—"}</p>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => remove(r._id)}
                  disabled={busyId === r._id}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
