"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import CuponBanner from "@/components/Website/CuponBanner";
import FeatureProduct from "@/components/Website/FeatureProduct";
import LabourSlider from "@/components/Website/LabourSlider";
import ShopBySlider from "@/components/Website/ShopBySlider";
import PartnerDashboard from "@/components/Application/Labour/PartnerDashboard";
import GeoUpdater from "@/components/Application/Labour/GeoUpdater";
import DeliveryDashboard from "@/components/Application/Delivery/DeliveryDashboard"; //  NEW
import Testimonial from '@/components/Website/Testimonial'
import ProductBox from "@/components/Website/ProductBox";
import { WEBSITE_SHOP, WEBSITE_HOME } from "@/routes/WebsiteRoute";
import { X, Loader2 } from "lucide-react";
import Link from "next/link";

const Home = () => {
  const auth = useSelector((state) => state.authStore.auth);
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) return;

    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/shop?category=${category}&limit=24`);
        if (data.success) {
          setProducts(data.data.products);
          setCategoryName(data.data.products?.[0]?.category?.name || category);
        }
      } catch (error) {
        console.log("Error fetching filtered products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [category]);

  // ── Labour partner: same pattern as before ──
  if (auth?.role === "laber") {
    return (
      <>
        <GeoUpdater userId={auth?._id} />
        <PartnerDashboard />
      </>
    );
  }

  // ── NEW: Delivery boy — home page khud dashboard render kar deti hai,
  // bilkul labour wale pattern jaisa, koi alag redirect nahi ──
  if (auth?.role === "delivery boy") {
    return <DeliveryDashboard />;
  }

  // ── Category selected from the navbar: show a filtered grid in-place ──
  if (category) {
    return (
      <div className="px-4 sm:px-6 lg:px-24 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold capitalize">
            {categoryName.replace(/-/g, ' ')}
          </h1>

          <div className="flex items-center gap-3">
            <Link
              href={`${WEBSITE_SHOP}?category=${category}`}
              className="text-sm text-yellow-500 font-medium hover:underline"
            >
              View all with filters &amp; sorting
            </Link>

            <button
              type="button"
              onClick={() => router.push(WEBSITE_HOME)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No products found in this category yet.
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {products.map((product) => (
              <ProductBox key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── No category selected: normal landing page ──
  return (
     <div className="w-full min-w-0 overflow-x-hidden">
    <section className="w-full">
      <CuponBanner />
    </section>


    <section className="w-full py-10">
      <LabourSlider />
    </section>

    <section className="w-full py-10">
      <FeatureProduct />
    </section>

    <section className="w-full py-1">
      <ShopBySlider />
    </section>

    <section className="w-full">
      <Testimonial />
    </section>
  </div>
  );
};

export default Home;



