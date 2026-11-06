"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CircleDashed, FileCheck, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import useLabourOnboardingGuard from "@/hooks/useLabourOnboardingGuard";

// Required docs (block Continue until all 3 are present)
const REQUIRED_DOCS = [
  {
    key: "aadhaarFront",
    label: "Aadhaar Card (Front)",
    desc: "Government issued ID — front side",
  },
  {
    key: "aadhaarBack",
    label: "Aadhaar Card (Back)",
    desc: "Government issued ID — back side",
  },
  {
    key: "selfieImage",
    label: "Selfie Photo",
    desc: "Clear photo of your face",
  },
];

// Optional docs (do not block Continue)
const OPTIONAL_DOCS = [
  {
    key: "addressProof",
    label: "Address Proof",
    desc: "Electricity bill, rent agreement, etc.",
  },
  {
    key: "experienceCertificate",
    label: "Experience Certificate",
    desc: "Proof of past work (if any)",
  },
  {
    key: "policeVerification",
    label: "Police Verification",
    desc: "If already available",
  },
];

const ALL_DOCS = [...REQUIRED_DOCS, ...OPTIONAL_DOCS];

function Page() {
  const router = useRouter();
  useLabourOnboardingGuard(); // already live labour -> dashboard

  const [docs, setDocs] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    selfieImage: null,
    addressProof: null,
    experienceCertificate: null,
    policeVerification: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (key, file) => {
    if (!file) return;
    setDocs((prev) => ({ ...prev, [key]: file }));
  };

  const isCompleted = REQUIRED_DOCS.every((d) => docs[d.key]);

  const handleSubmit = async () => {
    setError("");

    if (!isCompleted) {
      setError("Aadhaar (front & back) and a selfie are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      ALL_DOCS.forEach((d) => {
        if (docs[d.key]) formData.append(d.key, docs[d.key]);
      });

      await axios.post("/api/partner/onboarding/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/partner/onboarding/bank");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Something went wrong");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const renderDocRow = (doc, isOptional = false) => (
    <motion.label
      key={doc.key}
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{doc.label}</p>
          {isOptional && (
            <span className="text-[10px] uppercase tracking-wide text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
              Optional
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{doc.desc}</p>
      </div>

      {docs[doc.key] ? (
        <span className="text-xs text-green-600 font-medium">Uploaded</span>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-400">Upload</span>
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <UploadCloud size={18} />
          </div>
        </div>
      )}

      <input
        type="file"
        hidden
        accept="image/*,.pdf"
        onChange={(e) => handleFile(doc.key, e.target?.files?.[0] || null)}
      />
    </motion.label>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">Step 2 of 3</p>
          <h1 className="text-2xl font-bold mt-1">Upload Documents</h1>
          <p className="text-sm text-gray-500 mt-2">Required for verification</p>
        </div>

        <div className="mt-8 space-y-5">
          {REQUIRED_DOCS.map((doc) => renderDocRow(doc, false))}
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-500 mb-3">
            Optional Documents
          </p>
          <div className="space-y-5">
            {OPTIONAL_DOCS.map((doc) => renderDocRow(doc, true))}
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <FileCheck size={16} className="mt-0.5" />
          <p>Documents are securely stored and manually verified by our team.</p>
        </div>

        {error && <p className="text-red-500 mt-4">*{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!isCompleted || loading}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
        >
          {loading ? (
            <CircleDashed className="text-white animate-spin" />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Page;