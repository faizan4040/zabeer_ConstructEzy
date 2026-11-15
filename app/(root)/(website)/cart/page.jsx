'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import { IMAGES } from '@/routes/AllImages'
import {
  WEBSITE_CHECKOUT,
  WEBSITE_PRODUCT_DETAILS,
  WEBSITE_SHOP,
} from '@/routes/WebsiteRoute'
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from '@/store/reducer/cartReducer'

import { Plus } from 'lucide-react'
import { BiMinus } from 'react-icons/bi'
import { IoCloseCircleOutline } from 'react-icons/io5'

/* ================= BREADCRUMB ================= */
const breadCrumb = {
  title: 'Cart',
  links: [{ label: 'Cart' }],
}

/* ================= HELPERS ================= */
const formatPrice = (value) => {
  return Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })
}


const getImageSrc = (media) => {
  if (!media) return IMAGES.image_placeholder

  // string
  if (typeof media === 'string') return media

  // array
  if (Array.isArray(media) && media.length > 0) {
    const img = media[0]
    if (typeof img === 'string') return img
    if (img?.path) return img.path
    if (img?.url) return img.url
  }

  return IMAGES.image_placeholder
}


const CartPage = () => {
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cartStore)
  const [showCoupon, setShowCoupon] = useState(false)
  const [coupon, setCoupon] = useState('')

  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)

  /* ================= CALCULATIONS ================= */
  useEffect(() => {
    const products = cart.products || []

    let sub = 0
    let disc = 0

    products.forEach((p) => {
      sub += p.sellingPrice * p.qty
      disc += (p.mrp - p.sellingPrice) * p.qty
    })

    setSubtotal(sub)
    setDiscount(disc)
  }, [cart.products])

  /* ================= EMPTY CART ================= */
  if (!cart.products || cart.products.length === 0) {
    return (
      <>
        <WebsiteBreadcrumb props={breadCrumb} />
       <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-6">
          <img
            src={IMAGES.emptycart}
            alt="Empty Cart"
            className="w-80 h-80 object-contain"
          />
          <h2 className="text-3xl font-semibold text-gray-800">
            Your cart is empty
          </h2>
          <Button className="bg-black text-white px-6 py-2 rounded hover:bg-orange-500 transition">
            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
          </Button>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <WebsiteBreadcrumb props={breadCrumb} />

      <div className="max-w-8xl mx-auto px-4 lg:px-8 my-14 flex flex-col lg:flex-row gap-10">
        {/* ================= CART ITEMS ================= */}
        <div className="lg:w-2/3 w-full">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="hidden md:table-header-group bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Qty</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4"></th>
                </tr>
              </thead>

              <tbody>
                {cart.products.map((product) => (
                  <tr
                    key={`${product.productId}-${product.variantId}-${product.isSample ? 's' : 'f'}`}
                    className="border-b block md:table-row"
                  >
                    {/* PRODUCT */}
                    <td className="p-4">
                      <div className="flex gap-4">
                        <Image
                          src={getImageSrc(product?.media)}
                          width={80}
                          height={80}
                          className="rounded object-cover"
                          alt={product.name}
                        />
                        <div>
                          <Link
                            href={WEBSITE_PRODUCT_DETAILS(product.url)}
                            className="font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.attributes?.length ? (
                            <p className="text-sm text-gray-500">
                              {product.attributes.map((a) => `${a.label}: ${a.value}`).join(' | ')}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">
                              Color: {product.color || '-'} | Size:{' '}
                              {product.size || '-'}
                            </p>
                          )}
                          {product.isSample && (
                            <span className="inline-block mt-1 text-[11px] font-semibold bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">
                              Sample{product.sampleNote ? ` · ${product.sampleNote}` : ''} · returnable 7 days
                            </span>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {product.delivery?.mode === 'paid'
                              ? `Paid Delivery · ₹${product.delivery.ratePerKm}/km`
                              : 'Free Delivery'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PRICE */}
                    <td className="p-4 text-sm">
                      {formatPrice(product.sellingPrice)}
                    </td>

                    {/* QUANTITY */}
                    <td className="p-4">
                      <div className="flex items-center border rounded-full w-fit">
                        <button
                          onClick={() =>
                            dispatch(
                              decreaseQuantity({
                                productId: product.productId,
                                variantId: product.variantId,
                                isSample: !!product.isSample,
                              })
                            )
                          }
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <BiMinus />
                        </button>

                        <span className="px-4 text-sm">
                          {product.qty}
                        </span>

                        <button
                          onClick={() =>
                            dispatch(
                              increaseQuantity({
                                productId: product.productId,
                                variantId: product.variantId,
                                isSample: !!product.isSample,
                              })
                            )
                          }
                          disabled={product.isSample}
                          title={product.isSample ? 'Sample is limited to 1' : undefined}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>

                    {/* TOTAL */}
                    <td className="p-4 font-medium">
                      {formatPrice(
                        product.sellingPrice * product.qty
                      )}
                    </td>

                    {/* REMOVE */}
                    <td className="p-4">
                      <button
                        onClick={() =>
                          dispatch(
                              removeFromCart({
                                productId: product.productId,
                                variantId: product.variantId,
                                isSample: !!product.isSample,
                              })
                          )
                        }
                        className="text-xl text-gray-500 hover:text-red-500"
                      >
                        <IoCloseCircleOutline />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
       <div className="lg:w-1/3 w-full">
      <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
        <h3 className="text-xl font-semibold mb-4">
          Order Summary
        </h3>

        {/* PRICE DETAILS */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>- {formatPrice(discount)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span>
              {cart.products.some((p) => p.delivery?.mode === 'paid')
                ? 'Calculated at checkout'
                : 'Free'}
            </span>
          </div>

          <div className="border-t pt-3 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
   

        {/* CHECKOUT BUTTON */}
        <Button
          asChild
          className="w-full mt-6 rounded-full bg-black"
        >
          <Link href={WEBSITE_CHECKOUT}>
            Proceed to Checkout
          </Link>
        </Button>

        <p className="text-center mt-4">
          <Link
            href={WEBSITE_SHOP}
            className="text-sm hover:underline"
          >
            Continue Shopping
          </Link>
        </p>

        {/* TRUST & INFO */}
        <div className="mt-6 pt-5 border-t space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>
            All taxes and duties are already included in the price of
            each order shipped to mainland EU (including Ireland).
          </p>

          <ul className="space-y-1">
            <li>• UK’s no. 1 online retailer for run, gym and hike</li>
            <li>• Next day delivery – 7 days a week</li>
            <li>• 100 days return or exchange</li>
          </ul>
        </div>
      </div>
      </div>
        
      </div>
    </>
  )
}

export default CartPage

























