'use client'

import React, { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useFetch from '@/hooks/useFetch'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { CiMemoPad } from "react-icons/ci";
import { LuTicket } from "react-icons/lu";
import { CiDeliveryTruck } from "react-icons/ci";
import { RiDiscountPercentLine } from "react-icons/ri";
import { FaPhoneVolume } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { TbHomeFilled } from "react-icons/tb";
import { IoCalendarNumber } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { PiNotepadFill } from "react-icons/pi";
import { ADMIN_DASHBOARD, ADMIN_ORDER_SHOW } from '@/routes/AdminPanelRoute'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import Select from '@/components/Application/Select'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'


const breadcrumbData = [
  {href: ADMIN_DASHBOARD, label: "Home"},
  {href: ADMIN_ORDER_SHOW, label: "Orders"},
  {href: '', label: "Orders Details"},
]

const OrderDetails = ({ params }) => {
  const { order_id } = use(params)
  const [orderData, setOrderData] = useState(null)
  const { data } = useFetch(`/api/orders/get/${order_id}`)
  const [orderStatus, setOrderStatus] = useState()
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [loading, setLoading] = useState(false);



const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: 'Cancelled', value: 'cancelled' }, 
  { label: "Unverified", value: "unverified" },
];


useEffect(()=>{
   if(data && data.success){
    setOrderData(data.data)
    setOrderStatus(data?.data?.status)
   }
  },[data])

const handleOrderStatus = async () => {
  setUpdatingStatus(true)
  try {
    const { data: response } = await axios.put('/api/orders/update-status', {
      _id: orderData?._id,
      status: orderStatus,
    })

    if (!response.success) {
      throw new Error(response.message) 
    }

    showToast('success', response.message)

  } catch (error) {
    showToast('error', error.message)
  } finally {
    setUpdatingStatus(false)
  }
}



  useEffect(() => {
    if (data?.success) setOrderData(data.data)
  }, [data])

  if (!orderData) {
    return (
      <div className="py-40 text-center text-gray-500">
        Loading order details...
      </div>
    )
  }

  const mapAddress = encodeURIComponent(orderData.address || '')


  // 👇 add this at the TOP of the file (after imports)

  const normalizeStatus = (status = '') => {
  return status.toString().toLowerCase().trim()
}

const getActiveStep = (status) => {
  const s = normalizeStatus(status)

  switch (s) {
    case 'pending':
      return 1
    case 'processing':
      return 2
    case 'shipped':
      return 3
    case 'delivered':
      return 4

    case 'cancelled':
    case 'unverified':
      return -1   // 👈 special state

    default:
      return 0
  }
}


const getStatusBadge = (status) => {
  const s = normalizeStatus(status)

  switch (s) {
    case 'pending':
      return 'bg-orange-100 text-gray-700'

    case 'paid':
      return 'bg-blue-100 text-blue-700'

    case 'processing':
      return 'bg-yellow-100 text-yellow-700'

    case 'shipped':
      return 'bg-purple-100 text-purple-700'

    case 'delivered':
      return 'bg-green-100 text-green-700'

    case 'cancelled':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-orange-100 text-gray-600'
  }
}



const formatDate = (date) => {
  if (!date) return 'Not available'

  const d = new Date(date)
  return isNaN(d.getTime())
    ? 'Not available'
    : d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00'

  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })
}



  const ORDER_PROGRESS = [
  { key: 'confirming', label: 'Order Confirming' },
  { key: 'pending', label: 'Payment Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipping' },
  // { label: 'cancelled', value: 'Cancelled' }, 
  { key: 'delivered', label: 'Delivered' },
]

  

const activeStep = getActiveStep(orderData.status);


const timeline = [
  { title: "Order Placed", sub: `Customer: ${orderData.name}` },
  { title: "Invoice Sent", sub: orderData.email },
  { title: "Payment Received", sub: `Method: ${orderData.paymentMethod || 'Master Card'}` },
  normalizeStatus(orderData.status) === "processing" && { title: "Processing Started", sub: "Warehouse confirmed" },
  normalizeStatus(orderData.status) === "shipped" && { title: "Shipped", sub: `Tracking ID: ${orderData.trackingId || 'N/A'}` },
  normalizeStatus(orderData.status) === "delivered" && { title: "Delivered", sub: `Delivered on ${formatDate(orderData.deliveryDate)}` },
].filter(Boolean); // remove any false items

  return (
    <div className="px-4 lg:px-2 py-8 bg-[#f7f8fc] min-h-screen space-y-6 ">
           <BreadCrumb breadcrumbData={breadcrumbData}/>
      {/* ================= ROW 1 ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
       {/* LEFT: Order Details + Progress + Status */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">#{orderData.order_id}</h2>
              <span className="badge-green bg-green-100 p-1 rounded-lg text-green-500 font-semibold">
                Paid
              </span>
              <span className="badge-orange border-2 rounded-full border-yellow-500 text-yellow-500 p-1 px-3 text-sm">
                {orderData.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Order / Order Details / #{orderData.order_id} –{' '}
              {new Date(orderData.createdAt).toLocaleString()}
            </p>
          </div>
        {/* 
          <div className="flex gap-3">
            <ActionBtn text="Refund" />
            <ActionBtn text="Return" />
            <ActionBtn text="Edit Order" primary />
          </div> */}
         </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <p className="font-semibold mb-4">Progress</p>

        <div className="flex items-center justify-between mb-6">
          {ORDER_PROGRESS.map((step, i) => {
            const stepIndex = i + 1
            const isCancelled = activeStep === -1

            const isActive = !isCancelled && stepIndex === activeStep
            const isComplete = !isCancelled && stepIndex < activeStep

            return (
              <div
                key={step.key}
                className="flex-1 flex flex-col items-center relative"
              >
                {/* Circle */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all ${
                    isCancelled
                      ? 'bg-red-500 border-red-500 text-white'
                      : isComplete
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-yellow-400 border-yellow-400 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {stepIndex}
                </div>

                {/* Label */}
                <p className="mt-2 text-center text-xs">{step.label}</p>

                {/* Line */}
                {i < ORDER_PROGRESS.length - 1 && (
                  <div
                    className={`absolute top-2.5 left-1/2 h-1 transform -translate-x-1/2 z-[-1] ${
                      isCancelled
                        ? 'bg-red-300'
                        : isComplete
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
            )
          })}
        </div>

          {/* Footer: Estimated shipping & Status Select */}
          <div className="flex justify-between items-start gap-4">
            <p className="text-sm text-gray-500">
              Estimated shipping date:{' '}
              <strong>{formatDate(orderData?.createdAt)}</strong>
            </p>

            {/* Status Selector */}
            {orderData.status !== 'delivered' && (
              <div className="pt-3 w-64">
                <h4 className="font-semibold mb-2">Order Status</h4>

                <Select
                  options={statusOptions}
                  selected={orderStatus}
                  setSelected={(value) => setOrderStatus(value)}
                  placeholder="Select status"
                  isMulti={false}
                />


                <div className="mt-2">
                  <ButtonLoading
                    type="button"
                    text="Save Status"
                    loading={updatingStatus}
                    onClick={handleOrderStatus}
                    className="w-full bg-linear-to-r cursor-pointer hover:text-white from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 
                              text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg 
                              transition-all duration-300 ease-in-out active:scale-95"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


        {/* RIGHT */}
      <SideCard title="Order Summary">
         <div className="border-t border-gray-300 mt-2 pt-6" />
  <div className="space-y-3 text-sm text-gray-700">

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span><CiMemoPad /></span>
        <span>Sub Total</span>
      </div>
      <span>{formatCurrency(orderData.subtotal)}</span>
    </div>

    <div className="border-t border-gray-200" />

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span><RiDiscountPercentLine /></span>
        <span>Discount</span>
      </div>
      <span className="text-red-500">
        - {formatCurrency(orderData.discount || 0)}
      </span>
    </div>

    <div className="border-t border-gray-200" />

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span><LuTicket /></span>
        <span>Coupon Discount</span>
      </div>
      <span className="text-red-500">
        - {formatCurrency(orderData.couponDiscount || 0)}
      </span>
    </div>

    <div className="border-t border-gray-200" />

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span><CiDeliveryTruck /></span>
        <span>Delivery Charge</span>
      </div>
      <span>{formatCurrency(orderData.deliveryCharge || 0)}</span>
    </div>

    <div className="border-t border-gray-300 mt-2 pt-2" />

    <div className="flex justify-between items-center text-base font-semibold text-gray-900 bg-gray-100 p-2 rounded-lg">
      <div className="flex items-center gap-2">
        <span>Total Amount</span>
      </div>
      <span>{formatCurrency(orderData.totalAmount)}</span>
    </div>

  </div>
     </SideCard>

      </div>

      {/* ================= ROW 2 ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT */}

   <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
  <h3 className="p-5 font-semibold border-b text-gray-800">
    Products
  </h3>

  <table className="w-full text-sm">
    <thead className="bg-gray-50 text-gray-600">
      <tr>
        <th className="p-4 text-left">Product</th>
        <th className="text-center">Status</th>
        <th className="text-center">Qty</th>
        <th className="text-right">Price</th>
        <th className="text-right">Coupon</th>
        <th className="text-right pr-6">Amount</th>
      </tr>
    </thead>

 <tbody>
  {orderData.products.map((p) => {
    const status = normalizeStatus(p.status || orderData.status)
    const qty = Number(p.qty || 0)
    const price = Number(p.sellingPrice || 0)


    // Calculate total amount of all products once (outside map)
    const totalProductsAmount = orderData.products.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.sellingPrice || 0),
      0
    )

    // Product total for this row
    const productTotal = qty * price

    // proportional coupon for this product
    const couponShare = (productTotal / totalProductsAmount) * (orderData.couponDiscount || 0)

    // final amount after coupon
    const amount = productTotal - couponShare

    return (
      <tr key={p.variantId._id} className="border-t hover:bg-gray-50 transition">
        {/* Product */}
        <td className="p-4 flex gap-4 items-center">
          <Image
            src={p.variantId.media?.[0]?.secure_url || IMAGES.image_placeholder}
            width={56}
            height={56}
            className="rounded-lg border bg-white object-cover"
            alt={p.productId.name || 'Product'}
          />
          <div className="flex flex-col">
            <Link
              href={WEBSITE_PRODUCT_DETAILS(p.productId.slug)}
              className="font-medium text-gray-800 hover:underline"
            >
              {p.productId.name}
            </Link>
            {p.variantId.size && (
              <p className="text-xs text-gray-500 mt-1">Size: {p.variantId.size}</p>
            )}
          </div>
        </td>

        {/* Status */}
        <td className="text-center">
          <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(status)}`}>
            {status.toUpperCase()}
          </span>
        </td>

        {/* Qty */}
        <td className="text-center font-medium text-gray-800">{qty}</td>

        {/* Price */}
        <td className="text-right text-gray-700">
          ₹{price.toLocaleString('en-IN')}
        </td>

        {/* Coupon */}
        <td className="text-right text-red-500">
          {couponShare > 0 ? `-₹${Math.round(couponShare).toLocaleString('en-IN')}` : '—'}
        </td>

        {/* Amount */}
        <td className="text-right pr-6 font-semibold text-gray-900">
          ₹{Math.round(amount).toLocaleString('en-IN')}
        </td>
      </tr>
    )
  })}
</tbody>
  </table>
</div>



        {/* RIGHT */}
    <SideCard title="Payment Information">

  {/* Divider under title */}
  <div className="border-t border-gray-200 mb-4" />

  <div className="space-y-3 text-sm">

    {/* TOP ROW */}
    <div className="flex items-center gap-3">

      {/* ICON */}
      <div className="w-15 h-15 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-4xl">
          <img src={IMAGES.mastercard}/>
        </span>
      </div>

      {/* DETAILS */}
      <div className="flex-1 leading-tight">
        <p className="font-medium text-gray-900">
          {orderData.paymentMethod || 'Master Card'}
        </p>
        <p className="text-gray-500 tracking-widest">
          xxxx xxxx xxxx {orderData.last4 || '7812'}
        </p>
      </div>

      {/* STATUS */}
      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <span className="text-green-600 text-xs font-bold">✓</span>
      </div>
    </div>

    {/* SECOND DIVIDER */}
    {/* <div className="border-t border-gray-200" /> */}

    {/* BOTTOM INFO */}
    <div className="space-y-1 text-gray-700 mt-12">
      <p>
        Transaction ID :
        <span className="font-medium text-gray-900">
          {' '}#{orderData.payment_id}
        </span>
      </p>

      <p>
        Card Holder :
        <span className="font-medium text-gray-900">
          {' '}{orderData.cardHolderName || orderData.name}
        </span>
      </p>
    </div>

  </div>

</SideCard>

      </div>

      {/* ================= ROW 3 ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
     <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
  <h3 className="font-semibold mb-6">Order Timeline</h3>

  <div className="relative pl-8">
    {/* Vertical Line */}
    <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />

    {timeline.map((item, index) => {
      const isLast = index === timeline.length - 1
      const status = normalizeStatus(orderData.status)

      const isCancelled = status === 'cancelled' || status === 'unverified'
      const isActive = !isCancelled && index === timeline.length - 1

      return (
        <TimelineItem
          key={`${item.title}-${index}`}
          title={item.title}
          sub={item.sub}
          isLast={isLast}
          isActive={isActive}
          isCancelled={isCancelled}
        />
      )
    })}
  </div>
</div>

        {/* RIGHT */}
        <div className="space-y-7 ">
    <SideCard title="Customer Details">
  <div className="border-t border-gray-200 mt-4 pt-4 space-y-6">

    {/* PROFILE + NAME */}
    <div className="flex gap-4 items-center">
      {/* PROFILE IMAGE */}
      
      {/* <div className="w-16 h-16 rounded-full overflow-hidden border bg-gray-100 shrink-0">
        <img
          src={orderData.user?.avatar?.url || orderData.user?.profileImage || IMAGES.placeholder}
          className="w-full h-full object-cover border-2 rounded-full"
          alt={orderData.user?.name || "User"}
        />
      </div> */}

      {/* NAME & EMAIL */}
      <div className="flex flex-col">
        <p className="font-semibold text-gray-900 text-lg">{orderData.name}</p>
        <p className="text-sm text-yellow-500">{orderData.email}</p>
      </div>
    </div>

    {/* CONTACT NUMBER */}
    {(orderData.phone || orderData.mobile) && (
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-semibold mb-1">
            Contact Number
          </span>
          <span className="text-sm text-gray-800">{orderData.phone || orderData.mobile}</span>
        </div>
        <button className="text-yellow-400 hover:text-gray-700">
          <FaPhoneVolume />
        </button>
      </div>
    )}

    {/* SHIPPING ADDRESS + DETAILS */}
      {orderData.address && (
        <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:justify-between gap-4">

          {/* LEFT: Address + Additional Details */}
          <div className="flex-1">
            <span className="text-xs text-gray-400 uppercase font-semibold">Shipping Address</span>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed wrap-break-word">{orderData.address}</p>

            <div className="mt-3 space-y-1 text-sm text-gray-800">
              
              {orderData.country && (
                <div className="flex justify-between">
                  <span className="font-medium w-28">Country:</span>
                  <span className="flex-1 text-right">{orderData.country}</span>
                </div>
              )}
              {orderData.state && (
                <div className="flex justify-between">
                  <span className="font-medium w-28">State:</span>
                  <span className="flex-1 text-right">{orderData.state}</span>
                </div>
              )}
              {orderData.city && (
                <div className="flex justify-between">
                  <span className="font-medium w-28">City:</span>
                  <span className="flex-1 text-right">{orderData.city}</span>
                </div>
              )}
              {orderData.pincode && (
                <div className="flex justify-between">
                  <span className="font-medium w-28">Pincode:</span>
                  <span className="flex-1 text-right">{orderData.pincode}</span>
                </div>
              )}
              {orderData.landmark && (
                <div className="flex justify-between">
                  <span className="font-medium w-28">Landmark:</span>
                  <span className="flex-1 text-right">{orderData.landmark}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Location Icon */}
          <div className="shrink-0 flex items-start justify-center md:justify-end">
            <button className="text-red-400 hover:text-gray-700 text-2xl">
              <IoLocation />
            </button>
          </div>
        </div>
      )}


          {/* ORDER NOTE */}
          {orderData.ordernote && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <span className="text-xs text-gray-400 uppercase font-semibold">Order Note</span>
              <p className="text-sm text-gray-800 mt-1 whitespace-pre-line">{orderData.ordernote}</p>
            </div>
          )}

        </div>
      </SideCard>



      <SideCard title="Delivery Location">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(orderData.deliveryAddress)}&output=embed`}
          className="w-full h-96 rounded-lg border"
          loading="lazy"
        />
      </SideCard>

        </div>
      </div>

      {/* ================= FOOTER ================= */}
       <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between text-sm flex-wrap gap-4">
      
      {/* Vendor */}
      <div className="flex flex-row items-center gap-4 text-center">
        <div className="font-semibold">Vendor</div>
        <div>{orderData.vendor}</div>
        <span className="text-gray-400 text-lg mt-1">
          <TbHomeFilled className='text-yellow-500 h-10 w-10 bg-gray-100 rounded-xl'/> </span>
      </div>

      {/* Divider */}
      <div className="h-16 border-l border-gray-300" />

      {/* Date */}
      <div className="flex flex-row items-center gap-4 text-center">
        <div className="font-semibold">Date</div>
        <div>{formatDate(orderData?.createdAt)}</div>
        <span className="text-gray-400 text-lg mt-1">
          <IoCalendarNumber className='text-yellow-500 h-10 w-10 bg-gray-100 rounded-xl'/>
        </span>
      </div>

      {/* Divider */}
      <div className="h-16 border-l border-gray-300" />

      {/* Paid By */}
      <div className="flex flex-row items-center gap-4 text-center">
        <div className="font-semibold">Paid By</div>
        <div className="bg-green-300 p-1 rounded">{orderData.name}</div>
        <span className="text-gray-400 text-lg mt-1">
          <FaCircleUser className='text-yellow-500 h-10 w-10 bg-gray-100 rounded-xl'/>
        </span>
      </div>

      {/* Divider */}
      <div className="h-16 border-l border-gray-300" />

      {/* Reference */}
      <div className="flex flex-row items-center gap-4 text-center">
        <div className="font-semibold">Reference</div>
        <div>{orderData.refNumber}</div>
        <span className="text-gray-400 text-lg mt-1">
          <PiNotepadFill className='text-yellow-500 h-10 w-10 bg-gray-100 rounded-xl'/>

        </span>
      </div>
      
    </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

const ActionBtn = ({ text, primary }) => (
  <button
    className={`px-3 rounded-lg text-xs border transition-colors duration-200 ${
      primary
        ? 'bg-orange-500 text-white border-orange-500'
        : 'border-gray-300 text-gray-800'
    }`}
  >
    {text}
  </button>
)


const SideCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <h4 className="font-semibold mb-4">{title}</h4>
    {children}
  </div>
)

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between py-1 ${bold && 'font-bold text-lg'}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

const TimelineItem = ({ title, sub }) => (
  <div className="flex gap-4 mb-6">
    <div className="w-3 h-3 mt-1 bg-green-500 rounded-full" />
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500">{sub}</p>
    </div>
  </div>
)

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
)

/* ================= UTIL CLASSES ================= */
const badge = 'px-3 py-1 text-xs rounded-full'
const styles = `
.badge-green { ${badge}; background:#dcfce7; color:#15803d }
.badge-orange { ${badge}; background:#ffedd5; color:#c2410c }
.btn-orange { background:#f97316; color:white; padding:8px 16px; border-radius:8px }
`

export default OrderDetails

































