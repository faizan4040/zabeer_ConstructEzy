"use client";
import axios from "axios";
import { CheckCircle2, Clock, HardHat, User, Users, Video, XCircle, List, CalendarCheck, Star } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Kpi from "@/components/Application/Labour/Kpi";
import TabButton from "@/components/Application/Labour/TabButton";
import { AnimatePresence, motion } from "framer-motion";
import ContentList from "@/components/Application/Labour/ContentList";
import AdminEarning from "@/components/Application/Labour/AdminEarning";
import AdminLabourList from "@/components/Application/Labour/AdminLabourList";
import AdminLabourBookings from "@/components/Application/Labour/AdminLabourBookings";
import AdminLabourReviews from "@/components/Application/Labour/AdminLabourReviews";
import { IMAGES } from "@/routes/AllImages";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [partnerReviews, setPartnerReviews] = useState();
  const [pendingkyc, setPendingkyc] = useState();
  const [labourReviews, setLabourReviews] = useState();

  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/labour/labour-dashboard");
      setStats(data.stats);
      setPartnerReviews(data.pendingPartnersReviews);
      setLabourReviews(data.pendingLabours);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetPendingKYC = async () => {
    try {
      const { data } = await axios.get("/api/admin/labour/video-kyc/pending");
      setPendingkyc(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetPendingKYC();
    handleGetData();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Image src={IMAGES.logo} alt="logo" width={44} height={44} priority />
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white">
            <User size={14} />
            Admin Dashboard
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Kpi label="Total Partners" value={stats?.totalPartners} icon={<Users />} variant={"totalPartners"} />
          <Kpi label="Approved Partners" value={stats?.totalApprovedPartners} icon={<CheckCircle2 />} variant={"approved"} />
          <Kpi label="Pending Partners" value={stats?.totalPendingPartners} icon={<Clock />} variant={"pending"} />
          <Kpi label="Rejected Partners" value={stats?.totalRejectedPartners} icon={<XCircle />} variant={"rejected"} />
        </div>

        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
          <TabButton active={activeTab === "bookings"} count={0} icon={<CalendarCheck size={15} />} onClick={() => setActiveTab("bookings")}>
            Bookings & Payments
          </TabButton>
          <TabButton active={activeTab === "all"} count={0} icon={<List size={15} />} onClick={() => setActiveTab("all")}>
            All Labour Details
          </TabButton>
          <TabButton active={activeTab === "reviews"} count={0} icon={<Star size={15} />} onClick={() => setActiveTab("reviews")}>
            Labour Reviews
          </TabButton>
          <TabButton active={activeTab === "partner"} count={partnerReviews?.length ?? 0} icon={<Users size={15} />} onClick={() => setActiveTab("partner")}>
            Pending Partner Reviews
          </TabButton>
          <TabButton active={activeTab === "kyc"} count={pendingkyc?.length ?? 0} icon={<Video size={15} />} onClick={() => setActiveTab("kyc")}>
            Pending Video KYC
          </TabButton>
          <TabButton active={activeTab === "labour"} count={labourReviews?.length ?? 0} icon={<HardHat size={15} />} onClick={() => setActiveTab("labour")}>
            Pending Labour Reviews
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            {activeTab === "bookings" && <AdminLabourBookings />}
            {activeTab === "all" && <AdminLabourList />}
            {activeTab === "reviews" && <AdminLabourReviews />}
            {activeTab === "partner" && <ContentList data={partnerReviews ?? []} type={"partner"} />}
            {activeTab === "kyc" && <ContentList data={pendingkyc ?? []} type={"kyc"} />}
            {activeTab === "labour" && <ContentList data={labourReviews ?? []} type={"labour"} />}
          </motion.div>
        </AnimatePresence>

        <AdminEarning />
      </main>
    </div>
  );
}

export default AdminDashboard;
