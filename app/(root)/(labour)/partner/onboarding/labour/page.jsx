"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, CircleDashed, Hammer, Wrench, PaintRoller, Drill, HardHat,
  Truck, Pickaxe, House, ShieldCheck, Construction, Warehouse, LocateFixed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const LABOUR_CATEGORIES = [
  { id: "helpers", label: "Helpers", icon: Construction },
  { id: "masons", label: "Masons", icon: Hammer },
  { id: "electricians", label: "Electricians", icon: Drill },
  { id: "plumbers", label: "Plumbers", icon: Wrench },
  { id: "carpenters", label: "Carpenters", icon: Warehouse },
  { id: "painters", label: "Painters", icon: PaintRoller },
  { id: "tile-experts", label: "Tile Experts", icon: House },
  { id: "welders", label: "Welders", icon: ShieldCheck },
  { id: "jcb-operators", label: "JCB Operators", icon: Truck },
  { id: "contractors", label: "Contractors", icon: Pickaxe },
  { id: "engineers", label: "Engineers", icon: HardHat },
];

export default function Page() {
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [rateType, setRateType] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [skills, setSkills] = useState("");
  const [about, setAbout] = useState("");

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locating, setLocating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const showHourly = rateType === "hour" || rateType === "both";
  const showDaily = rateType === "day" || rateType === "both";

  const getMyLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Could not get location. Please allow location access in the browser.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const validate = () => {
    if (!category) return "Please select a category";
    if (!fullName.trim()) return "Full name is required";
    if (!/^\d{10}$/.test(phone.trim())) return "Enter a valid 10-digit phone number";
    if (!rateType) return "Select how you charge";
    if (showHourly && (!pricePerHour || Number(pricePerHour) <= 0)) return "Enter a valid price per hour";
    if (showDaily && (!pricePerDay || Number(pricePerDay) <= 0)) return "Enter a valid price per day";
    if (!address.trim()) return "Enter your home / working area address";
    if (!Number(latitude) || !Number(longitude)) return "Tap 'Use my current location' so customers nearby can find you";
    return "";
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/partner/onboarding/labour", {
        category,
        fullName: fullName.trim(),
        phone: phone.trim(),
        experienceYears: Number(experienceYears) || 0,
        rateType,
        pricePerHour: showHourly ? Number(pricePerHour) : undefined,
        pricePerDay: showDaily ? Number(pricePerDay) : undefined,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        about: about.trim(),
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      router.push("/partner/onboarding/documents");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLabour = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/labour");
        setCategory(data.category || "");
        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setExperienceYears(data.experienceYears || "");
        setRateType(data.rateType || "");
        setPricePerHour(data.pricePerHour || "");
        setPricePerDay(data.pricePerDay || "");
        setSkills((data.skills || []).join(", "));
        setAbout(data.about || "");
        setAddress(data.location?.address || "");
        if (data.location?.latitude && data.location?.longitude) {
          setLatitude(String(data.location.latitude));
          setLongitude(String(data.location.longitude));
        }
      } catch (err) {
        console.log(err?.response?.data?.message || "No existing labour profile found.");
      } finally {
        setFetching(false);
      }
    };
    fetchLabour();
  }, []);

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white rounded-3xl border shadow-xl p-8"
      >
        <div className="relative text-center">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 h-10 w-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-xs text-gray-500">Step 1 of 3</p>
          <h1 className="text-3xl font-bold mt-2">Labour Details</h1>
          <p className="text-gray-500 mt-2">Complete your labour profile</p>
        </div>

        {fetching ? (
          <div className="flex justify-center items-center py-20">
            <CircleDashed className="animate-spin text-gray-400" size={28} />
          </div>
        ) : (
          <div className="mt-8">
            <label className="text-sm font-semibold">Select Category</label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {LABOUR_CATEGORIES.map((item) => {
                const Icon = item.icon;
                const active = category === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCategory(item.id)}
                    className={`cursor-pointer rounded-2xl border p-4 text-center transition ${
                      active ? "bg-black text-white border-black" : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${
                        active ? "bg-white text-black" : "bg-black text-white"
                      }`}
                    >
                      <Icon size={22} />
                    </div>
                    <p className="mt-3 font-semibold">{item.label}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-8">
              <input className="border rounded-xl p-3" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input
                className="border rounded-xl p-3"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
              />
              <input type="number" className="border rounded-xl p-3" placeholder="Experience (Years)" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />

              <select className="border rounded-xl p-3 text-sm bg-white" value={rateType} onChange={(e) => setRateType(e.target.value)}>
                <option value="">How do you charge?</option>
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="both">Both</option>
              </select>

              {showHourly && (
                <input type="number" className="border rounded-xl p-3" placeholder="Price Per Hour" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />
              )}
              {showDaily && (
                <input type="number" className="border rounded-xl p-3" placeholder="Price Per Day" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} />
              )}

              <input className="border rounded-xl p-3" placeholder="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>

            <div className="mt-8 rounded-2xl border p-4 bg-gray-50">
              <p className="text-sm font-semibold">Your work area / home address</p>
              <p className="text-xs text-gray-500 mt-1">Customers near this location will see you. Stand at your home or usual work area and tap the button.</p>

              <input
                className="border rounded-xl p-3 w-full mt-3 bg-white"
                placeholder="Area, City (e.g. Jamwa Ramgarh Road, Jaipur)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <button
                type="button"
                onClick={getMyLocation}
                disabled={locating}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-50"
              >
                {locating ? <CircleDashed size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                Use my current location
              </button>

              {Number(latitude) && Number(longitude) ? (
                <p className="text-xs text-emerald-600 font-semibold mt-2">
                  Location saved: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-2">Location not set yet</p>
              )}
            </div>

            <textarea
              rows={5}
              className="border rounded-xl p-3 w-full mt-5"
              placeholder="About Yourself"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-red-500 mt-5">*{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading || fetching}
          onClick={handleSubmit}
          className="w-full h-14 bg-black text-white rounded-2xl mt-8 font-semibold disabled:opacity-40 flex justify-center items-center"
        >
          {loading ? <CircleDashed className="animate-spin" /> : "Continue"}
        </motion.button>
      </motion.div>
    </div>
  );
}










