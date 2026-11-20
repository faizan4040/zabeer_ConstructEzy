'use client'
import CartSizeInput from '@/components/Website/CartSizeInput'
import { customSizeKey, formatCustomSize } from '@/lib/customSize'

import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { CiCircleRemove } from "react-icons/ci";
import { LocateFixed, Loader2, Truck } from 'lucide-react'


import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import {
  WEBSITE_SHOP,
  WEBSITE_PRODUCT_DETAILS,
  WEBSITE_ORDER_DETAILS,
} from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import useFetch from '@/hooks/useFetch'
import { addIntoCart, clearCart } from '@/store/reducer/cartReducer'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showToast } from '@/lib/showToast'
import { IMAGES } from '@/routes/AllImages'
import { z } from 'zod'
import Script from 'next/script'
import { useRouter } from 'next/navigation'


/* ---------------- HELPERS ---------------- */
const formatPrice = (v) =>
  Number(v || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })

const getImageSrc = (media) => {
  if (!media) return IMAGES.image_placeholder
  if (typeof media === 'string') return media
  if (Array.isArray(media) && media[0]) {
    return media[0].url || media[0].path || IMAGES.image_placeholder
  }
  return IMAGES.image_placeholder
}

/* ---------------- BREADCRUMB ---------------- */
const breadCrumb = {
  title: 'Checkout',
  links: [{ label: 'Checkout' }],
}

const CheckOut = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cartStore)
  const authStore = useSelector((state) => state.authStore)

  /* ---------------- COUPON STATE ---------------- */
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  /* ---------------- PAYMENT METHOD ---------------- */
  const [paymentMethod, setPaymentMethod] = useState('online')

  /* ---------------- VERIFY CART ---------------- */
  const { data: verifiedResponse } = useFetch(
    '/api/cart-verification',
    'POST',
    { data: cart.products }
  )

  useEffect(() => {
    if (verifiedResponse?.success) {
      dispatch(clearCart())
      verifiedResponse.data.forEach((item) => {
        dispatch(addIntoCart(item))
      })
    }
  }, [verifiedResponse, dispatch])

  /* ---------------- DELIVERY (distance × ₹/km, server-calculated) ---------------- */
  const [customerLocation, setCustomerLocation] = useState(null) // { lat, lng }
  const [deliveryQuote, setDeliveryQuote] = useState(null)
  const [quoting, setQuoting] = useState(false)
  const [locating, setLocating] = useState(false)

  const hasPaidDelivery = (cart.products || []).some((p) => p.delivery?.mode === 'paid')
  const deliveryCharge = hasPaidDelivery ? Number(deliveryQuote?.totalDeliveryCharge || 0) : 0
  const deliveryReady = !hasPaidDelivery || (deliveryQuote && !deliveryQuote.needsLocation)

  const cartKey = JSON.stringify((cart.products || []).map((p) => [p.productId, p.variantId, !!p.isSample]))

  const fetchQuote = async ({ location, address } = {}) => {
    if (!hasPaidDelivery || !cart.products?.length) return null
    setQuoting(true)
    try {
      const { data } = await axios.post('/api/delivery/quote', {
        items: cart.products.map((p) => ({
          productId: String(p.productId),
          variantId: String(p.variantId),
          qty: p.qty,
          isSample: !!p.isSample,
        })),
        location: location || customerLocation || null,
        address,
      })
      if (!data.success) throw new Error(data.message)
      setDeliveryQuote(data.data)
      if (data.data.location) setCustomerLocation(data.data.location)
      return data.data
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message || 'Could not calculate delivery.')
      return null
    } finally {
      setQuoting(false)
    }
  }

  // Buyer ki GPS location -> delivery charge
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Your browser does not support location.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCustomerLocation(loc)
        await fetchQuote({ location: loc })
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        showToast('error', err.code === 1
          ? 'Location permission denied. Allow location to calculate delivery.'
          : 'Could not get your location. Please try again.')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  // Cart badle to quote dobara (agar location pehle se hai)
  useEffect(() => {
    if (!hasPaidDelivery) { setDeliveryQuote(null); return }
    if (customerLocation) fetchQuote({ location: customerLocation })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, hasPaidDelivery])

  /* ---------------- PRICE CALCULATIONS ---------------- */
const { subtotal, discount, totalAmount } = useMemo(() => {
  const products = cart.products || []

  const sub = products.reduce(
    (sum, p) => sum + p.sellingPrice * p.qty,
    0
  )

  const disc = products.reduce(
    (sum, p) => sum + (p.mrp - p.sellingPrice) * p.qty,
    0
  )

  const total = Math.max(sub - couponDiscount, 0) + deliveryCharge

  return {
    subtotal: sub,
    discount: disc,
    totalAmount: total,
  }
}, [cart.products, couponDiscount, deliveryCharge])

  /* ---------------- COUPON FORM ---------------- */
  const couponForm = useForm({
    resolver: zodResolver(
      zSchema.pick({
        code: true,
        minShoppingAmount: true,
      })
    ),
    defaultValues: {
      code: '',
      minShoppingAmount: subtotal,
    },
  })

  useEffect(() => {
    couponForm.setValue('minShoppingAmount', subtotal)
  }, [subtotal, couponForm])

  const applyCoupon = async (values) => {
    setCouponLoading(true)
    try {
      const { data } = await axios.post('/api/coupon/apply', values)

      if (!data.success) {
        throw new Error(data.message)
      }

      const discountAmount =
        (subtotal * data.data.discountPercentage) / 100

      setCouponDiscount(discountAmount)
      setCouponCode(values.code.toUpperCase())
      setIsCouponApplied(true)
      couponForm.reset()

      showToast('success', data.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponDiscount(0)
    setCouponCode('')
    setIsCouponApplied(false)
    showToast('success', 'Coupon removed')
  }

  // place order
const orderFormSchema = zSchema
  .pick({
    name: true,
    email: true,
    phone: true,
    address: true,
    country: true,
    state: true,
    city: true,
    pincode: true,
    landmark: true,
    ordernote: true,
  })
  .extend({
    userId: z.string().optional(),
  })


const orderForm = useForm({
  resolver: zodResolver(orderFormSchema), 
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    landmark: '',
    ordernote: '',
    userId: authStore?.auth?._id,
  },
})

useEffect(() =>{
  if(authStore){
    orderForm.setValue('userId', authStore?.auth?._id)
  }
},[authStore])

// GPS nahi diya to typed address se delivery quote try karo (debounced)
const watchedAddress = orderForm.watch(['address', 'city', 'state', 'pincode'])
const addressString = watchedAddress.filter(Boolean).join(', ')
useEffect(() => {
  if (!hasPaidDelivery || customerLocation) return
  const [, city, , pincode] = watchedAddress
  if (!city || !pincode || String(pincode).length < 6) return
  const t = setTimeout(() => fetchQuote({ address: `${addressString}, India` }), 800)
  return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [addressString, hasPaidDelivery, customerLocation])


//get order id
const getOrderId = async (amount) => {
   try{
       const { data: orderIdData } = await axios.post('/api/payment/get-order-id',{ amount })
       if(!orderIdData.success) {
         throw new Error(orderIdData.message)
       }

       return { success: true, order_id: orderIdData.data }


   } catch(error){
      return { success: false, message: error.message }
   }
}

// place order — online (Razorpay) ya COD, dono handle karta hai
const placeOrder = async (formData) => {
  if (hasPaidDelivery && !deliveryReady) {
    showToast('error', 'Please share your delivery location to calculate the delivery charge.')
    return
  }
  if (deliveryQuote?.unavailable?.length) {
    showToast('error', 'Delivery is not available for some items right now. Please remove them and try again.')
    return
  }
  const missingSize = cart.products.find((p) => p.requiresCustomSize && !p.isSample && !p.customSize)
  if (missingSize) {
    showToast('error', `Please enter height and width for "${missingSize.name}" in your order summary.`)
    return
  }

  setPlacingOrder(true)

  const products = cart.products.map((cartItem) => ({
    productId: cartItem.productId,
    variantId: cartItem.variantId,
    name: cartItem.name,
    qty: cartItem.qty,
    mrp: cartItem.mrp,
    sellingPrice: cartItem.sellingPrice,
    isSample: !!cartItem.isSample,
    customSize: cartItem.customSize || null,
  }))
  const deliveryPayload = { deliveryCharge, customerLocation: customerLocation || null }

  // ── COD flow: koi Razorpay nahi, seedha order create ──
  if (paymentMethod === 'cod') {
    try {
      setSavingOrder(true)
      const { data } = await axios.post('/api/payment/save-cod-order', {
        ...formData,
        userId: authStore?._id,
        products,
        subtotal,
        discount,
        couponDiscount,
        totalAmount,
        ...deliveryPayload,
      })

      if (data.success) {
        showToast('success', data.message)
        dispatch(clearCart())
        orderForm.reset()
        router.push(WEBSITE_ORDER_DETAILS(data.data.order_id))
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to place order.')
    } finally {
      setSavingOrder(false)
      setPlacingOrder(false)
    }
    return
  }

  // ── Online flow — waisa hi jaisa pehले tha ──
  try {
    const generateOrderId = await getOrderId(totalAmount)
    if (!generateOrderId.success) {
      throw new Error(generateOrderId.message)
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded')
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      name: 'ConstructEzy',
      description: 'Payment for order',
      order_id: generateOrderId.order_id,

      handler: async function (response) {
        try {
          setSavingOrder(true)

          const { data } = await axios.post('/api/payment/save-order', {
            ...formData,
            ...response,
            userId: authStore?._id,
            products: products,
            subtotal: subtotal,
            discount: discount,
            couponDiscount: couponDiscount,
            totalAmount: totalAmount,
            ...deliveryPayload,
          })

          if (data.success) {
            showToast('success', data.message)
            dispatch(clearCart())
            orderForm.reset()
            router.push(WEBSITE_ORDER_DETAILS(response.razorpay_order_id))
          } else {
            showToast('error', data.message)
          }
        } catch (err) {
          showToast('error', err.message)
        } finally {
          setSavingOrder(false)
        }
      },

      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },

      theme: {
        color: '#f97316',
      },
    }

    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', function (response) {
      showToast('error', response.error.description)
    })

    rzp.open()
  } catch (error) {
    showToast('error', error.message)
  } finally {
    setPlacingOrder(false)
  }
}



  return (
    <div>

       {cart.count === 0 ? (
        <div className="py-32 text-center">
          <h4 className="text-4xl font-semibold mb-5">
            Your cart is empty
          </h4>
          <Button asChild>
            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
           {savingOrder && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-2xl transition-all">

          <img
            src={IMAGES.confirmorder}
            alt="Confirm Order"
            className="h-24 w-24 animate-[float_2s_ease-in-out_infinite]"
          />

          <h4 className="text-lg font-semibold text-gray-900">
            Confirming your order
          </h4>

          <p className="text-sm text-gray-500 animate-pulse text-center">
            Please wait, we’re almost done 🚚
          </p>
        </div>
      </div>
    )}


      <WebsiteBreadcrumb props={breadCrumb} />

      <div className="flex flex-wrap lg:flex-nowrap gap-10 my-20 lg:px-32 px-4">

    <div className="w-full lg:w-[70%]">
  <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border">

    {/* HEADER */}
    <div className="flex items-center gap-3 mb-6 border-b pb-4">
      <img
        src={IMAGES.shipping}
        alt="Shipping"
        className="h-10 w-10 object-contain"
      />
      <h2 className="text-xl font-semibold">Shipping Details</h2>
    </div>

    <Form {...orderForm}>
      <form
        onSubmit={orderForm.handleSubmit(placeOrder)}
        className="space-y-5"
      >

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={orderForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={orderForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={orderForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={orderForm.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Enter country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ADDRESS (FULL WIDTH) */}
        <FormField
          control={orderForm.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="House no, street, area" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={orderForm.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={orderForm.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROW 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={orderForm.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pincode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={orderForm.control}
            name="landmark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Landmark</FormLabel>
                <FormControl>
                  <Input placeholder="Nearby landmark" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ORDER NOTE */}
        <FormField
          control={orderForm.control}
          name="ordernote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Note (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Any special delivery instructions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DELIVERY LOCATION — sirf jab cart me paid-delivery item ho */}
        {hasPaidDelivery && (
          <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Delivery charge is based on distance</p>
                  <p className="text-xs text-gray-600">
                    {deliveryQuote && !deliveryQuote.needsLocation
                      ? `Delivery: ${formatPrice(deliveryCharge)}${deliveryQuote.resolvedFrom === 'address' ? ' (from your address)' : ''}`
                      : 'Share your location (or fill your full address & pincode) to see the delivery charge.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating || quoting}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 disabled:opacity-60"
              >
                {locating || quoting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                {customerLocation ? 'Update my location' : 'Use my current location'}
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT METHOD */}
        <div>
          <FormLabel className="mb-2 block">Payment Method</FormLabel>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`p-4 rounded-xl border text-sm font-medium transition text-left ${
                paymentMethod === 'online'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Pay Online
              <p className="text-xs font-normal text-gray-400 mt-0.5">UPI, Card, Netbanking</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-xl border text-sm font-medium transition text-left ${
                paymentMethod === 'cod'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Cash on Delivery
              <p className="text-xs font-normal text-gray-400 mt-0.5">Pay when it arrives</p>
            </button>
          </div>
        </div>

        {/* SUBMIT */}
        <ButtonLoading
          type="submit"
          text={paymentMethod === 'cod' ? 'Place Order (COD)' : 'Place Order'}
          loading={placingOrder}
          className="w-full mt-6 bg-black text-white rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300"
        />
      </form>
    </Form>
  </div>
</div>



        <div className="lg:w-1/3 w-full">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

            {/* PRODUCTS */}
            <table className="w-full mb-4">
              <tbody>
                {cart.products.map((product) => (
                  <tr key={`${product.variantId}-${product.isSample ? 's' : 'f'}-${customSizeKey(product.customSize)}`}>
                    <td className="py-3">
                      <div className="flex gap-4">
                        <Image
                          src={getImageSrc(product.media)}
                          width={60}
                          height={60}
                          className="rounded"
                          alt={product.name}
                        />
                        <div>
                          <Link
                            href={WEBSITE_PRODUCT_DETAILS(product.url)}
                            className="font-medium line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          {product.attributes?.length ? (
                            <p className="text-sm">{product.attributes.map((a) => `${a.label}: ${a.value}`).join(' | ')}</p>
                          ) : (
                            <>
                              <p className="text-sm">Color: {product.color}</p>
                              <p className="text-sm">Size: {product.size}</p>
                            </>
                          )}
                          {product.requiresCustomSize && !product.isSample ? (
                            <CartSizeInput product={product} />
                          ) : product.customSize ? (
                            <p className="text-sm font-medium text-orange-700">Size: {formatCustomSize(product.customSize)}</p>
                          ) : null}
                          {product.isSample && (
                            <span className="inline-block text-[11px] font-semibold bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">
                              Sample · returnable 7 days
                            </span>
                          )}
                          <p className="text-xs text-gray-500">
                            {product.delivery?.mode === 'paid'
                              ? `Paid Delivery · ₹${product.delivery.ratePerKm}/km`
                              : 'Free Delivery'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-right">
                      {product.qty} × {formatPrice(product.sellingPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PRICE */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {formatPrice(discount)}</span>
              </div>

              {isCouponApplied && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-2">
                    Coupon ({couponCode})
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      <CiCircleRemove size={20}/>
                    </button>
                  </span>
                  <span>- {formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {!hasPaidDelivery
                    ? 'Free'
                    : quoting
                      ? 'Calculating…'
                      : deliveryReady
                        ? formatPrice(deliveryCharge)
                        : 'Share location'}
                </span>
              </div>
              {hasPaidDelivery && deliveryReady && deliveryQuote?.groups?.length > 0 && (
                <div className="text-xs text-gray-500 space-y-0.5 -mt-1">
                  {deliveryQuote.groups.map((g, i) => (
                    <p key={i} className="flex justify-between">
                      <span>{g.distanceKm} km × ₹{g.ratePerKm}/km</span>
                      <span>{formatPrice(g.charge)}</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* COUPON FORM */}
            {!isCouponApplied && (
              <Form {...couponForm}>
                <form
                  onSubmit={couponForm.handleSubmit(applyCoupon)}
                  className="flex gap-3 mt-5"
                >
                  <FormField
                    control={couponForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Enter coupon code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ButtonLoading
                    type="submit"
                    text="Apply"
                    loading={couponLoading}
                  />
                </form>
              </Form>
            )}

            <p className="text-center mt-4">
              <Link href={WEBSITE_SHOP} className="text-sm hover:underline">
                Continue Shopping
              </Link>
            </p>
          </div>
        </div>
      </div>

     
        </>
      )}

      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  )
}

    
export default CheckOut