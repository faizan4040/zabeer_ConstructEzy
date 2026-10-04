'use client'

import Link from "next/link"
import { FaArrowUp, FaArrowDown, FaShoppingCart, FaHandshake, FaDollarSign } from "react-icons/fa"
import { BiSolidCategoryAlt } from "react-icons/bi"
import { useShopDashboard } from "@/contexts/ShopDashboardContext"
import {
  SHOP_OWNER_CATEGORY_SHOW,
  SHOP_OWNER_PRODUCT_SHOW,
  SHOP_OWNER_ORDER_SHOW,
} from "@/routes/ShopOwnerPanelRoute"

const LedgerCard = ({ title, value, percent, period, icon, isPositive = true, link, iconBg, iconColor }) => (
  <Link href={link || "#"} className="block group h-full">
    <div className="bg-white dark:bg-card rounded-2xl shadow-sm p-5 h-full flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-medium truncate">{title}</p>
          <h3 className="text-2xl font-bold mt-0.5 tabular-nums text-gray-800 dark:text-gray-100">{value}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs">
        <span className={`flex items-center gap-1 font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
          {percent} <span className="text-gray-400 font-normal">{period}</span>
        </span>
        <span className="text-yellow-500 font-medium group-hover:underline">View More</span>
      </div>
    </div>
  </Link>
)

const CountOverview = () => {
  const { data, loading } = useShopDashboard()

  const category = data?.count?.category || 0
  const product = data?.count?.product || 0
  const customer = data?.count?.customer || 0
  const order = data?.count?.order || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
      <LedgerCard
        title="Categories You Sell In"
        value={loading ? "…" : category}
        percent="+0%"
        period="live"
        icon={<BiSolidCategoryAlt />}
        link={SHOP_OWNER_CATEGORY_SHOW}
        iconBg="bg-orange-50 dark:bg-orange-500/20"
        iconColor="text-yellow-500"
      />
      <LedgerCard
        title="Your Products"
        value={loading ? "…" : product}
        percent="+0%"
        period="live"
        icon={<FaShoppingCart />}
        link={SHOP_OWNER_PRODUCT_SHOW}
        iconBg="bg-amber-50 dark:bg-amber-500/20"
        iconColor="text-amber-500"
      />
      <LedgerCard
        title="Customers Reached"
        value={loading ? "…" : customer}
        percent="+0%"
        period="all time"
        icon={<FaHandshake />}
        link="#"
        iconBg="bg-emerald-50 dark:bg-emerald-500/20"
        iconColor="text-emerald-500"
      />
      <LedgerCard
        title="Your Orders"
        value={loading ? "…" : order}
        percent="+0%"
        period="all time"
        icon={<FaDollarSign />}
        link={SHOP_OWNER_ORDER_SHOW}
        iconBg="bg-rose-50 dark:bg-rose-500/20"
        iconColor="text-rose-500"
      />
    </div>
  )
}

export default CountOverview



