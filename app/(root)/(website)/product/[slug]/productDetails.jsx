'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_CART, WEBSITE_CHECKOUT, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import { useRouter } from "next/navigation"
import { decode } from "entities"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Plus, Truck, Clock, Wallet, ShieldCheck, FlaskConical, RotateCcw, Ruler } from "lucide-react"
import { BiMinus } from "react-icons/bi"
import { IoStar } from "react-icons/io5"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { useDispatch, useSelector } from "react-redux"
import { addIntoCart } from "@/store/reducer/cartReducer"
import { showToast } from "@/lib/showToast"
import { Button } from "@/components/ui/button"
import ProdcutReview from "@/components/Website/ProdcutReview"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { deliveryLabel } from "@/lib/listingOptions"
import { calcDiscount } from "@/lib/variantBulk"
import { areaSqft, cleanCustomSize, customSizeError, customSizeKey, priceForSize, SIZE_MAX, SIZE_MIN } from "@/lib/customSize"

const inr = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

const valueOf = (v, label) => v?.attributes?.find((a) => a.label === label)?.value

// attributeGroups shape: { "Weight": ["100g","200g","500g"], "Color": ["Red","White"] }
// variants: every live variant of this product — switching happens here, no page reload.
const ProductDetails = ({ product, variant: initialVariant, variants: variantList = [], attributeGroups = {}, reviewCount }) => {

  const dispatch = useDispatch()
  const router = useRouter()
  const cartStore =
    useSelector((store) => store.cartStore) ?? {
      count: 0,
      products: [],
    }

  const variants = variantList.length ? variantList : (initialVariant ? [initialVariant] : [])
  const [variantId, setVariantId] = useState(initialVariant?._id)
  const variant = variants.find((v) => v._id === variantId) || initialVariant

  const [activeThumb, setActiveThumb] = useState(initialVariant?.media?.[0]?.secure_url || IMAGES.image_placeholder)
  const [qty, setQty] = useState(1)
  const [isProductLoading, setIsProductLoading] = useState(false)

  // the server may send a different variant when the URL changes (back/forward)
  useEffect(() => {
    if (initialVariant?._id) setVariantId(initialVariant._id)
  }, [initialVariant?._id])

  // new variant → its photo, qty back to 1
  useEffect(() => {
    setActiveThumb(variant?.media?.[0]?.secure_url || IMAGES.image_placeholder)
    setQty(1)
  }, [variant?._id])

  // ===== price maths (always from MRP & selling price, never a stale stored %) =====
  const mrp = Number(variant?.mrp) || 0
  const sellingPrice = Number(variant?.sellingPrice) || 0
  const discount = calcDiscount(mrp, sellingPrice)
  const savePerUnit = mrp > sellingPrice ? mrp - sellingPrice : 0
  const stock = Math.max(0, Number(variant?.stock) || 0)
  const outOfStock = stock <= 0
  const lowStock = !outOfStock && stock <= 10

  // ===== custom size (doors, windows...) — Height × Width in inches =====
  const needsSize = !!variant?.requiresCustomSize
  const [sizeH, setSizeH] = useState('')
  const [sizeW, setSizeW] = useState('')
  const [sizeTouched, setSizeTouched] = useState(false)
  const sizeError = needsSize ? customSizeError(sizeH, sizeW) : ''
  const customSize = needsSize ? cleanCustomSize({ height: sizeH, width: sizeW }) : null

  const isAddedIntoCart = cartStore.products.some((cartProduct) =>
    cartProduct.productId === product._id && cartProduct.variantId === variant?._id && !cartProduct.isSample &&
    customSizeKey(cartProduct.customSize) === customSizeKey(customSize))

  // ₹ per sq ft: price of one item for the entered size
  const perSqft = needsSize && variant?.priceUnit === 'sqft'
  const area = perSqft && customSize ? areaSqft(customSize) : 0
  const linePrice = priceForSize(variant, customSize) // { mrp, sellingPrice } of ONE item
  const lineMrp = perSqft ? (customSize ? linePrice.mrp : 0) : mrp
  const lineSelling = perSqft ? (customSize ? linePrice.sellingPrice : 0) : sellingPrice

  // stops the order until a valid size is entered
  const checkSize = () => {
    if (!needsSize) return true
    setSizeTouched(true)
    if (sizeError) {
      showToast('error', sizeError)
      document.getElementById('custom-size')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  const handleQty = (type) => {
    setQty((prev) => {
      if (type === 'inc') return prev < stock ? prev + 1 : prev
      if (type === 'dec' && prev > 1) return prev - 1
      return prev
    })
  }

  const buildCartProduct = (isSample = false) => ({
    productId: product._id,
    variantId: variant._id,
    name: product.name,
    url: product.slug,
    attributes: variant.attributes, // dynamic — array of {label, value}
    mrp: isSample ? product.samplePrice : lineMrp,
    sellingPrice: isSample ? product.samplePrice : lineSelling,
    // per-sq-ft rate, so the cart can re-price if the size changes
    priceUnit: isSample ? 'piece' : (variant.priceUnit || 'piece'),
    rateMrp: variant.mrp,
    rateSellingPrice: variant.sellingPrice,
    media: variant?.media[0]?.secure_url,
    qty: isSample ? 1 : qty,
    isSample,
    sampleNote: isSample ? (product.sampleNote || '') : '',
    delivery: product.delivery,
    requiresCustomSize: isSample ? false : needsSize,
    customSize: isSample ? null : customSize,
  })

  const handleAddToCart = () => {
    if (outOfStock) return showToast('error', 'This variant is out of stock.')
    if (!checkSize()) return
    dispatch(addIntoCart(buildCartProduct(false)))
    showToast('success', 'product added into cart.')
  }

  // Buy Now → cart me daalo aur seedha checkout
  const handleBuyNow = () => {
    if (outOfStock) return showToast('error', 'This variant is out of stock.')
    if (!checkSize()) return
    if (!isAddedIntoCart) dispatch(addIntoCart(buildCartProduct(false)))
    router.push(WEBSITE_CHECKOUT)
  }

  // Buy a Sample → qty 1, seller ka sample price, seedha checkout
  const sampleAvailable = !!product?.sampleEnabled && Number(product?.samplePrice) > 0
  const handleBuySample = () => {
    dispatch(addIntoCart(buildCartProduct(true)))
    router.push(WEBSITE_CHECKOUT)
  }

  const isPaidDelivery = product?.delivery?.mode === 'paid'

  // current selected value of a given attribute label, read off this variant
  const getCurrentValue = (label) => valueOf(variant, label)

  // Variant to switch to when the buyer clicks label=value: exact match with the other
  // current options if it exists, otherwise the closest variant that has label=value.
  const findVariantFor = (label, value) => {
    const candidates = variants.filter((v) => valueOf(v, label) === value)
    if (!candidates.length) return null
    const score = (v) =>
      Object.keys(attributeGroups).reduce(
        (s, lbl) => s + (lbl !== label && valueOf(v, lbl) === getCurrentValue(lbl) ? 2 : 0),
        0
      ) + (Number(v.stock) > 0 ? 1 : 0)
    return candidates.reduce((best, v) => (score(v) > score(best) ? v : best), candidates[0])
  }

  // is label=value available together with every other current option?
  const isExactCombo = (label, value) =>
    variants.some((v) =>
      Object.keys(attributeGroups).every((lbl) =>
        valueOf(v, lbl) === (lbl === label ? value : getCurrentValue(lbl))
      )
    )

  const selectOption = (label, value) => {
    const next = findVariantFor(label, value)
    if (!next || next._id === variant?._id) return
    setVariantId(next._id)

    // keep the URL shareable without reloading the page
    const params = new URLSearchParams()
    ;(next.attributes || []).forEach((a) => params.set(a.label, a.value))
    window.history.replaceState(null, '', `${WEBSITE_PRODUCT_DETAILS(product.slug)}?${params.toString()}`)
  }

  const descriptionText = decode(product?.description || "")

  return (
    <div className="px-4 sm:px-6 lg:px-20 xl:px-32 py-6 sm:py-10">

      {isProductLoading && (
        <div className="fixed top-30 left-1/2 z-50 -translate-x-1/2">
          <img
            src={IMAGES.loading}
            alt="Loading"
            className="w-20 h-20"
          />
        </div>
      )}

      <div>
        <Breadcrumb className="mb-6 sm:mb-8 text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={WEBSITE_SHOP}>Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={WEBSITE_PRODUCT_DETAILS(product?.slug)}>
                  {product?.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Section */}
        <div className="flex flex-col-reverse md:flex-row gap-4 md:sticky md:top-24 md:self-start">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
            {variant?.media?.map((img) => (
              <Image
                key={img._id}
                src={img.secure_url}
                alt="thumb"
                width={80}
                height={80}
                onClick={() => setActiveThumb(img.secure_url)}
                className={`min-w-20 rounded-lg cursor-pointer border transition
                  ${activeThumb === img.secure_url
                    ? "border-primary"
                    : "border-gray-200 hover:border-gray-400"
                  }`}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1">
            <Image
              src={activeThumb || IMAGES.image_placeholder}
              alt="product"
              width={600}
              height={600}
              onLoadingComplete={() => setIsProductLoading(false)}
              className="w-full object-contain rounded-xl border"
            />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3 text-gray-900">
            {product?.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <IoStar key={i} className="text-yellow-400 text-sm sm:text-base" />
            ))}
            <span className="text-xs sm:text-sm text-gray-600 ml-2">
              ({reviewCount} reviews)
            </span>
          </div>

          {/* Delivery & Payment Info */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-gray-700">
                <span className="font-medium text-gray-900">{deliveryLabel(product?.delivery)}</span>{" "}
                {isPaidDelivery && (
                  <span className="text-gray-500">· calculated at checkout by distance</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-gray-700">
                <span className="font-medium text-gray-900">60 Mins</span>{" "}
                <span className="text-gray-500">Pay on Delivery</span>
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {inr(sellingPrice)}
              {perSqft && <span className="text-base font-medium text-gray-500"> / sq ft</span>}
            </span>

            {mrp > sellingPrice && (
              <span className="line-through text-gray-400 text-sm">
                MRP {inr(mrp)}
              </span>
            )}

            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                -{discount}%
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-sm">
            {savePerUnit > 0 && (
              <span className="text-green-600 font-medium">You save {inr(savePerUnit)}{perSqft ? " / sq ft" : ""}</span>
            )}
            {outOfStock ? (
              <span className="text-red-600 font-medium">Out of stock</span>
            ) : lowStock ? (
              <span className="text-orange-600 font-medium">Only {stock} left</span>
            ) : (
              <span className="text-gray-500">In stock</span>
            )}
          </div>

          {/* Cashback Info */}
          <div className="flex items-center gap-2 mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 w-fit">
            <Wallet className="w-4 h-4 shrink-0" />
            <span>
              <span className="font-medium">Assured 2% Cashback</span>{" "}
              <span className="text-green-600">On purchases above ₹50,000</span>
            </span>
          </div>

          {/* Short description preview */}
          {descriptionText && (
            <div className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3 [&_p]:m-0 [&_ul]:hidden [&_ol]:hidden [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {descriptionText}
              </ReactMarkdown>
            </div>
          )}

          {/* Dynamic Attributes — Weight / Diameter / Color / Gauge...
              whatever the product's category defines. No hardcoding here;
              driven entirely by attributeGroups passed from the parent page. */}
          {Object.entries(attributeGroups).map(([label, values]) => (
            <div className="mb-6" key={label}>
              <p className="font-semibold mb-2 text-gray-900">
                {label}: <span className="font-normal text-gray-600">{getCurrentValue(label)}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {values.map((value) => {
                  const selected = value === getCurrentValue(label)
                  const exact = isExactCombo(label, value)
                  const target = findVariantFor(label, value)
                  const soldOut = target && Number(target.stock) <= 0
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => selectOption(label, value)}
                      aria-pressed={selected}
                      title={soldOut ? 'Out of stock' : !exact ? 'Other options will change' : undefined}
                      className={`border py-1.5 px-3 rounded-lg cursor-pointer transition text-sm
                        ${selected
                          ? "bg-primary text-white border-primary"
                          : `border-gray-200 text-gray-700 hover:border-primary hover:text-primary ${!exact ? "border-dashed opacity-70" : ""}`}
                        ${soldOut && !selected ? "line-through text-gray-400" : ""}`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Custom size — supplier turned this on for made-to-size items */}
          {needsSize && (
            <div id="custom-size" className="mb-6 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
              <p className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                <Ruler className="w-4 h-4 text-orange-500" /> Enter your size (in inches) <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                This item is made to your size. Measure the opening and enter height and width in inches.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Height (inch)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={SIZE_MIN}
                    max={SIZE_MAX}
                    step="0.25"
                    value={sizeH}
                    onChange={(e) => setSizeH(e.target.value)}
                    onBlur={() => setSizeTouched(true)}
                    placeholder="e.g. 84"
                    className={`mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                      sizeTouched && sizeError && !(Number(sizeH) >= SIZE_MIN && Number(sizeH) <= SIZE_MAX) ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Width (inch)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={SIZE_MIN}
                    max={SIZE_MAX}
                    step="0.25"
                    value={sizeW}
                    onChange={(e) => setSizeW(e.target.value)}
                    onBlur={() => setSizeTouched(true)}
                    placeholder="e.g. 36"
                    className={`mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                      sizeTouched && sizeError && !(Number(sizeW) >= SIZE_MIN && Number(sizeW) <= SIZE_MAX) ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </label>
              </div>
              {sizeTouched && sizeError ? (
                <p className="text-xs text-red-600 mt-2">{sizeError}</p>
              ) : customSize ? (
                <p className="text-xs text-green-700 mt-2">
                  Size: {customSize.height}&quot; H × {customSize.width}&quot; W
                  {perSqft && <> = {area} sq ft</>}
                </p>
              ) : null}
              {perSqft && (
                <p className="text-sm mt-2 text-gray-700">
                  {customSize ? (
                    <>
                      Price for your size: <b className="text-gray-900">{inr(lineSelling)}</b>
                      {lineMrp > lineSelling && <span className="text-gray-400 line-through ml-2">{inr(lineMrp)}</span>}
                      <span className="text-xs text-gray-500"> ({inr(sellingPrice)} × {area} sq ft)</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">Price = {inr(sellingPrice)} × sq ft (Height × Width ÷ 144)</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <p className="font-semibold mb-2 text-gray-900">Quantity</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center w-32 border border-gray-200 rounded-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQty("dec")}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                >
                  <BiMinus />
                </button>
                <input
                  value={qty}
                  readOnly
                  className="w-12 text-center border-none focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleQty("inc")}
                  disabled={outOfStock || qty >= stock}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {!outOfStock && (!perSqft || customSize) && (
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{inr(lineSelling * qty)}</span>
                  {lineMrp > lineSelling && (
                    <span className="text-green-600"> · save {inr((lineMrp - lineSelling) * qty)}</span>
                  )}
                </p>
              )}
            </div>
            {!outOfStock && qty >= stock && (
              <p className="text-xs text-orange-600 mt-1">Maximum available quantity selected.</p>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <Button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 bg-black text-white py-3 hover:bg-orange-500 hover:text-white cursor-pointer rounded-full font-semibold transition"
            >
              {outOfStock ? 'Out of Stock' : 'Buy Now'}
            </Button>
            {outOfStock ? null : !isAddedIntoCart ? (
              <ButtonLoading
                onClick={handleAddToCart}
                text='Add to Cart'
                className="flex-1 bg-primary text-white py-3 hover:bg-orange-500 hover:text-white cursor-pointer rounded-full font-semibold hover:opacity-90 transition"
              >
              </ButtonLoading>
            ) : (
              <Button
                asChild
                className="flex-1 bg-primary text-white py-3 hover:bg-orange-500 hover:text-white cursor-pointer rounded-full font-semibold hover:opacity-90 transition"
              >
                <Link href={WEBSITE_CART}>
                  Go to Cart
                </Link>
              </Button>
            )}
          </div>

          {/* Buy a Sample — sirf jab seller ne enable kiya ho */}
          {sampleAvailable && (
            <div className="mt-4 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex items-start gap-2">
                  <FlaskConical className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Not sure? Try a sample first —{" "}
                      {Number(product.samplePrice).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </p>
                    {product.sampleNote && (
                      <p className="text-xs text-gray-600">{product.sampleNote}</p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <RotateCcw className="w-3 h-3" /> Sample is returnable within 7 days of delivery
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleBuySample}
                  variant="outline"
                  className="rounded-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-semibold cursor-pointer"
                >
                  Buy a Sample
                </Button>
              </div>
            </div>
          )}

          {/* Trust strip */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>100% genuine products, sourced directly from authorised manufacturers</span>
          </div>

        </div>
      </div>

      {/* Full Description Section */}
      <div className="mt-16 mb-32">
        <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Product Description
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {descriptionText ? (
              <div
                className="prose prose-sm sm:prose-base max-w-none
                  prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mb-3 prose-headings:mt-6 first:prose-headings:mt-0
                  prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-li:text-gray-700 prose-li:leading-relaxed
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-3 prose-ol:my-3"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {descriptionText}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No description available for this product.</p>
            )}
          </div>

        </div>
      </div>

      <ProdcutReview productId={product._id} />

    </div>
  )
}

export default ProductDetails


