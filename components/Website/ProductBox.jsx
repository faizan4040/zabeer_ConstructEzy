import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Clock, Wallet, Truck } from 'lucide-react'

const ProductBox = ({ product }) => {


  const firstVariant = product?.variants?.[0]

  const mrp = firstVariant?.mrp ?? product?.mrp ?? 0
  const sellingPrice = firstVariant?.sellingPrice ?? product?.sellingPrice ?? 0
  const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0

  return (
    <div className="
      bg-white rounded-lg shadow-md overflow-hidden
      transform transition-all duration-300
      hover:scale-105 hover:shadow-xl hover:-translate-y-1
    ">

    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
      <div className="relative w-full aspect-square bg-gray-100 cursor-pointer">
        <Image
          src={product?.media?.[0]?.secure_url || IMAGES.image_placeholder}
          alt={product?.media?.[0]?.alt || product?.name}
          title={product?.media?.[0]?.title || product?.name}
          fill
          className="object-cover"
        />
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2 flex flex-col gap-1.5">
        <h4 className="text-xs sm:text-sm font-medium line-clamp-2">{product?.name}</h4>

        <div className="flex items-center gap-1.5">
          {mrp > sellingPrice && (
            <span className="line-through text-gray-400 text-xs sm:text-sm">
              ₹{mrp}
            </span>
          )}
          <span className="font-semibold text-xs sm:text-sm text-black">
            ₹{sellingPrice}
          </span>
        </div>

        {/* Delivery trust badges */}
        <div className="flex items-center gap-2.5 text-[10px] text-gray-500 mt-0.5">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-green-600" />
            60 Mins
          </span>
          <span className="flex items-center gap-1">
            <Wallet size={11} className="text-green-600" />
            Pay on Delivery
          </span>
        </div>
        <p className="flex items-center gap-1 text-[10px] text-gray-500">
          <Truck size={11} className="text-green-600" />
          Free Delivery on orders above ₹500
        </p>

        <button className="cursor-pointer hover:bg-orange-500 mt-1 w-full bg-black text-white text-xs sm:text-sm py-1 rounded-md transition">
          Buy Now
        </button>
      </div>
    </Link>
    </div>
  )
}

export default ProductBox










