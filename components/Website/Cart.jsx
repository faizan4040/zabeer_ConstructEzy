'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import Link from 'next/link'

import { IMAGES } from '@/routes/AllImages'
import { removeFromCart } from '@/store/reducer/cartReducer'
import { Button } from '../ui/button'
import { WEBSITE_CART, WEBSITE_CHECKOUT } from '@/routes/WebsiteRoute'


/* ================= HELPERS ================= */

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })

const getImageSrc = (media) => {
  if (!media) return IMAGES.image_placeholder
  if (typeof media === 'string') return media

  if (Array.isArray(media) && media.length > 0) {
    if (typeof media[0] === 'string') return media[0]
    if (media[0]?.path) return media[0].path
    if (media[0]?.url) return media[0].url
  }

  return IMAGES.image_placeholder
}

/* ================= COMPONENT ================= */

const Cart = () => {
  const cart = useSelector((state) => state.cartStore)
  const dispatch = useDispatch()

  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [open, setOpen] = useState(false)

  /* ================= CALCULATIONS ================= */
useEffect(() => {
  const products = cart.products || []

  // Final price user pays
  const sub = products.reduce(
    (sum, p) => sum + p.sellingPrice * p.qty,
    0
  )

  // Discount shown only for UI (NOT used in total)
  const disc = products.reduce(
    (sum, p) => sum + Math.max(p.mrp - p.sellingPrice, 0) * p.qty,
    0
  )

  setSubtotal(sub)
  setDiscount(disc)
}, [cart.products])

  const totalPayable = subtotal

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* CART ICON */}
      <SheetTrigger className="relative cursor-pointer">
        <ShoppingBag size={26} className="text-gray-900 hover:text-yellow-500 transition" />
        {cart.count > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-400 text-black text-xs px-2 py-0.5 rounded-full">
            {cart.count}
          </span>
        )}
      </SheetTrigger>

      {/* SIDEBAR */}
      <SheetContent className="max-w-[95vw] sm:max-w-md flex flex-col px-0">
        {/* HEADER */}
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="text-2xl font-bold">
            My Cart ({cart.count})
          </SheetTitle>
        </SheetHeader>

        {/* PRODUCTS */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {cart.count === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag size={48} className="mb-3 opacity-40" />
              <p className="text-lg font-semibold">Your cart is empty</p>
            </div>
          )}

          {cart.products.map((product) => {
            const key = `${product.productId}-${product.variantId}`

            return (
              <div
                key={key}
                className="flex gap-4 p-3 border rounded-xl shadow-sm hover:shadow-md transition"
              >
                <Image
                  src={getImageSrc(product.media)}
                  width={90}
                  height={90}
                  alt={product.name || 'Product'}
                  className="rounded-lg object-cover border"
                />

                <div className="flex-1">
                  <h4 className="font-semibold leading-snug">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {product.size} • {product.color}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold">
                      {formatPrice(product.sellingPrice)}
                    </span>

                    <button
                      onClick={() =>
                        dispatch(
                          removeFromCart({
                            productId: product.productId,
                            variantId: product.variantId,
                          })
                        )
                      }
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    Qty: <span className="font-semibold">{product.qty}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* FOOTER */}
        {cart.count > 0 && (
        <div className="border-t px-6 py-5 bg-white">
          {/* PRICE SUMMARY */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>- {formatPrice(discount)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(totalPayable)}</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* VIEW CART */}
            <Button
              asChild
              className="w-full sm:flex-1 rounded-xl"
              onClick={() => setOpen(false)}
            >
              <Link href={WEBSITE_CART}>View Cart</Link>
            </Button>

            {/* CHECKOUT */}
            <Button
              className="w-full sm:flex-1 rounded-xl bg-black text-white hover:opacity-90"
              onClick={() => {
                setOpen(false)
                window.location.href = WEBSITE_CHECKOUT
              }}
            >
            <Link href={WEBSITE_CHECKOUT}>Checkout</Link> 
            </Button>
          </div>
        </div>
      )}

      </SheetContent>
    </Sheet>
  )
}

export default Cart



























