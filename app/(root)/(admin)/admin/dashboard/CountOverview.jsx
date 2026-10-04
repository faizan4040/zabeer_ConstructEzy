"use client"

import Link from "next/link"
import { FaArrowUp, FaArrowDown, FaShoppingCart, FaHandshake, FaDollarSign } from "react-icons/fa"
import { BiSolidCategoryAlt } from "react-icons/bi"
import useFetch from "@/hooks/useFetch"
import { ADMIN_CATEGORY_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_PRODUCT_SHOW } from "@/routes/AdminPanelRoute"
import { OrderOverview } from "./OrderOverview"

const MiniCard = ({ title, value, percent, period, icon, isPositive = true, link }) => (
  <Link href={link || "#"} className="block group">
    <div className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between">
      
      <div className="flex sm:items-center gap-4 p-5 flex-col sm:flex-row">
        <div className="w-12 h-12 rounded-xl text-yellow-500 bg-[#ffe2d5] dark:bg-orange-500 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>

        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2 text-sm justify-center sm:justify-start">
          <span className={`flex items-center gap-1 font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
            {percent}
          </span>
          <span className="text-xs text-gray-400">{period}</span>
        </div>

        <span className="text-sm font-light text-primary group-hover:underline text-center sm:text-right">
          More
        </span>
      </div>
    </div>
  </Link>
)

const DashboardStats = () => {
  const { data: countData, isLoading } = useFetch(`/api/dashboard/admin/count`)

  const calculatePercent = (current, previous) => {
    if (!previous || previous === 0) {
      return { percent: "0%", isPositive: false };
    }
    const change = ((current - previous) / previous) * 100;
    
    return {
      percent: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      isPositive: change > 0
    };
  };

  // Extract data with fallback to 0
  const categoryData = countData?.data?.category || 0;
  const productData = countData?.data?.product || 0;
  const customerData = countData?.data?.customer || 0;
  const orderData = countData?.data?.order || 0;


  const categoryPrevious = countData?.data?.categoryPrevious || 3;  
  const productPrevious = countData?.data?.productPrevious || 19;   
  const customerPrevious = countData?.data?.customerPrevious || 2;  
  const orderPrevious = countData?.data?.orderPrevious || 10;      

  // Calculate percentages
  const categoryPercent = calculatePercent(categoryData, categoryPrevious);
  const productPercent = calculatePercent(productData, productPrevious);
  const customerPercent = calculatePercent(customerData, customerPrevious);
  const orderPercent = calculatePercent(orderData, orderPrevious);

  return (
    <div className="grid grid-cols-12 gap-6">
      
      {/* LEFT SIDE */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <MiniCard
            title="Total Category"
            value={isLoading ? "..." : categoryData}
            percent={categoryPercent.percent}
            period="Last Week"
            icon={<BiSolidCategoryAlt />}
            isPositive={categoryPercent.isPositive}
            link={ADMIN_CATEGORY_SHOW}
          />

          <MiniCard
            title="Total Product"
            value={isLoading ? "..." : productData}
            percent={productPercent.percent}
            period="Last Month"
            icon={<FaShoppingCart />}
            isPositive={productPercent.isPositive}
            link={ADMIN_PRODUCT_SHOW}
          />

          <MiniCard
            title="Total Customers"
            value={isLoading ? "..." : customerData}
            percent={customerPercent.percent}
            period="Last Month"
            icon={<FaHandshake />}
            isPositive={customerPercent.isPositive}
            link={ADMIN_CUSTOMERS_SHOW}
          />

          <MiniCard
            title="Total Orders"
            value={isLoading ? "..." : orderData}
            percent={orderPercent.percent}
            period="Last Month"
            icon={<FaDollarSign />}
            isPositive={orderPercent.isPositive}
            link="/admin/order"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="col-span-12 lg:col-span-7">
        <div className="border-2 rounded-2xl h-full flex flex-col p-5">
          <OrderOverview />
        </div>
      </div>

    </div>
  )
}

export default DashboardStats