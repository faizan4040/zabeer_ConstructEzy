"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, MapPin, Phone, Trash2, MessageCircle } from "lucide-react";

const STATUSES = ["new", "contacted", "quoted", "delivered", "cancelled"];
const COLORS = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  quoted: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderByUserPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/material-orders?status=${filter}`, { cache: "no-store" });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    await fetch(`/api/material-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this order permanently?")) return;
    await fetch(`/api/material-orders/${id}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((o) => o._id !== id));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Order by User</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 capitalize"
        >
          <option value="all">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((o) => (
            <div key={o._id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{o.name}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${COLORS[o.status]}`}
                >
                  {o.status}
                </span>
              </div>

              <p className="mb-1 flex items-center gap-2 text-sm">
                <Phone size={16} /> {o.phone}
              </p>
              <p className="mb-3 flex items-start gap-2 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0" /> {o.address}
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {o.files.map((f, i) => (
                  <a
                    key={i}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {f.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.url} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <FileText size={18} className="text-red-500" />
                    )}
                    <span className="max-w-[120px] truncate">{f.originalName}</span>
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`tel:+91${o.phone}`}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                >
                  Call
                </a>
                <a
                  href={`https://wa.me/91${o.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
                {o.location?.lat && (
                  <a
                    href={`https://www.google.com/maps?q=${o.location.lat},${o.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    Open map
                  </a>
                )}
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="ml-auto rounded-lg border px-2 py-2 text-sm capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remove(o._id)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  aria-label="Delete order"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}