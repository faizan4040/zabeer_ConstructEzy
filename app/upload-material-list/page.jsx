"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileText, ImageIcon, MapPin, Upload, X, CheckCircle2 } from "lucide-react";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

export default function UploadMaterialListPage() {
  const inputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [coords, setCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onPick = (e) => {
    setError("");
    const picked = Array.from(e.target.files || []);
    const next = [...files];
    for (const f of picked) {
      if (!ACCEPT.split(",").includes(f.type)) {
        setError("Only PDF, JPG, PNG or WEBP allowed");
        continue;
      }
      if (f.size > MAX_SIZE) {
        setError("Each file must be under 10MB");
        continue;
      }
      if (next.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files`);
        break;
      }
      next.push(f);
    }
    setFiles(next);
    e.target.value = "";
  };

  const getLocation = () => {
    if (!navigator.geolocation) return setError("Location not supported on this device");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setError("Could not get location. Please allow location access.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async () => {
    setError("");
    if (!form.name.trim()) return setError("Please enter your name");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError("Enter a valid 10 digit phone number");
    if (!form.address.trim()) return setError("Please enter your address");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("phone", form.phone);
    fd.append("address", form.address);
    if (coords) {
      fd.append("lat", coords.lat);
      fd.append("lng", coords.lng);
    }
    files.forEach((f) => fd.append("files", f));

    setLoading(true);
    try {
      const res = await fetch("/api/material-orders", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDone(false);
    setStep(1);
    setFiles([]);
    setForm({ name: "", phone: "", address: "" });
    setCoords(null);
  };

  const btn =
    "w-full rounded-lg bg-[#ff5544] py-4 font-semibold text-white transition hover:bg-[#f04535] disabled:opacity-50";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <nav className="mb-2 text-sm text-gray-500">
        <Link href="/">Home</Link> &gt;{" "}
        <span className={step === 1 ? "text-gray-900" : ""}>Upload material list</span>
        {step === 2 && <> &gt; <span className="text-gray-900">Confirm order</span></>}
      </nav>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {step === 1 ? "Upload your material list" : "Confirm order"}
      </h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="space-y-4">
          <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={onPick} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-5 py-5 text-left hover:bg-gray-50"
          >
            <Upload size={22} />
            <span>
              <span className="block font-medium">Upload PDF or image</span>
              <span className="text-sm text-gray-500">Max 5 files, 10MB each</span>
            </span>
          </button>

          {files.length > 0 && (
            <div>
              <p className="mb-2 font-semibold">Files attached ({files.length})</p>
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    {f.type === "application/pdf" ? (
                      <FileText className="text-red-500" />
                    ) : (
                      <ImageIcon className="text-blue-500" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                    <button
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      aria-label="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className={btn}
            disabled={files.length === 0}
            onClick={() => {
              setError("");
              setStep(2);
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (
        <div className="space-y-5">
          <input
            placeholder="Enter name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 outline-none focus:border-gray-900"
          />
          <input
            placeholder="Enter 10 digit phone number"
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 outline-none focus:border-gray-900"
          />
          <textarea
            placeholder="Delivery address (house/site, area, city, pincode)"
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 outline-none focus:border-gray-900"
          />

          <button
            type="button"
            onClick={getLocation}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 hover:bg-gray-50"
          >
            {coords ? (
              <>
                <CheckCircle2 className="text-green-600" size={20} /> Location added
              </>
            ) : (
              <>
                <MapPin size={20} /> {locLoading ? "Getting location..." : "Share my current location"}
              </>
            )}
          </button>

          <div className="flex gap-3">
            <button
              className="w-1/3 rounded-lg border border-gray-300 py-4 font-semibold"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button className={`${btn} flex-1`} disabled={loading} onClick={submit}>
              {loading ? "Submitting..." : "Continue"}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500">
            We will call you shortly to help you place order.
          </p>
        </div>
      )}

      {/* STEP 3: SUCCESS MODAL */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-green-600" size={56} />
            <h2 className="mb-2 text-2xl font-bold">We have received your list</h2>
            <p className="mb-6 text-gray-600">We'll be calling you shortly to confirm your order.</p>
            <button className={btn} onClick={reset}>
              Okay
            </button>
          </div>
        </div>
      )}
    </main>
  );
}