'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { Store, Package, ShoppingCart, IndianRupee, Loader2, TrendingUp } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { IMAGES } from '@/routes/AllImages'
import { ADMIN_DASHBOARD, ADMIN_SHOPOWNER_TRACKER_SHOW } from '@/routes/AdminPanelRoute'

const ShopownerTrackerDetails = () => {
  const { shop_owner_id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shop_owner_id) return
    axios.get(`/api/admin/shopowner-tracker/${shop_owner_id}`)
      .then((res) => { if (res.data.success) setData(res.data.data) })
      .finally(() => setLoading(false))
  }, [shop_owner_id])

  if (loading) return <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-yellow-500" size={28} /></div>
  if (!data) return <div className="py-40 text-center text-gray-400">Shop not found.</div>

  const { owner, shop, productCount, orderCount, earnings, itemsSold, products, recentOrders } = data

  return (
    <div>
      <BreadCrumb breadcrumbData={[
        { href: ADMIN_DASHBOARD, label: 'Home' },
        { href: ADMIN_SHOPOWNER_TRACKER_SHOW, label: 'Shopowner Tracker' },
        { href: '', label: shop.name },
      ]} />

      <div className="bg-white border rounded-2xl shadow-sm p-6 mt-4 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border bg-gray-100 shrink-0">
          <Image src={owner.avatar?.url || IMAGES.profile} alt={owner.name} fill className="object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{shop.name}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${owner.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {owner.isBlocked ? 'Blocked' : 'Active'}
            </span>
          </div>
          <p className="text-sm text-gray-500">{owner.name} · {owner.email} · {owner.phone || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <Card className="rounded-2xl"><CardContent className="p-4 text-center">
          <Package className="mx-auto text-yellow-500 mb-1" size={18} />
          <p className="text-xl font-bold">{productCount}</p><p className="text-xs text-gray-400">Products</p>
        </CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-4 text-center">
          <ShoppingCart className="mx-auto text-blue-500 mb-1" size={18} />
          <p className="text-xl font-bold">{orderCount}</p><p className="text-xs text-gray-400">Orders</p>
        </CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-4 text-center">
          <TrendingUp className="mx-auto text-purple-500 mb-1" size={18} />
          <p className="text-xl font-bold">{itemsSold}</p><p className="text-xs text-gray-400">Items Sold</p>
        </CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-4 text-center">
          <IndianRupee className="mx-auto text-green-500 mb-1" size={18} />
          <p className="text-xl font-bold">₹{Number(earnings).toLocaleString('en-IN')}</p><p className="text-xs text-gray-400">Earnings</p>
        </CardContent></Card>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-5 mt-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2"><Package size={16} className="text-yellow-500" />Products ({products.length})</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div key={p._id} className="flex items-center gap-3 border rounded-xl p-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                <Image src={p.media?.[0]?.secure_url || IMAGES.image_placeholder} alt={p.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category?.name} · ₹{p.sellingPrice}</p>
              </div>
            </div>
          ))}
          {!products.length && <p className="text-sm text-gray-400">No products listed yet.</p>}
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-5 mt-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2"><ShoppingCart size={16} className="text-yellow-500" />Recent Orders</h4>
        <div className="space-y-2">
          {recentOrders.map((o) => (
            <div key={o._id} className="flex justify-between items-center border rounded-xl p-3 text-sm">
              <span className="font-mono text-xs text-gray-500">#{o.order_id}</span>
              <span>{o.name}</span>
              <span className="capitalize text-xs bg-gray-100 px-2 py-1 rounded-full">{o.status}</span>
            </div>
          ))}
          {!recentOrders.length && <p className="text-sm text-gray-400">No orders yet.</p>}
        </div>
      </div>
    </div>
  )
}

export default ShopownerTrackerDetails