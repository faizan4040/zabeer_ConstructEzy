import { customSizeKey, formatCustomSize } from '@/lib/customSize'
import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import CancelOrderButton from '@/components/Website/CancelOrderButton'
import ReturnOrderButton from '@/components/Website/ReturnOrderButton'

const STATUS_STYLES = {
  on_hold:       'bg-gray-100 text-gray-700',
  pending:       'bg-yellow-100 text-yellow-700',
  ready_to_ship: 'bg-blue-100 text-blue-700',
  shipped:       'bg-indigo-100 text-indigo-700',
  delivered:     'bg-green-100 text-green-700',
  cancelled:     'bg-red-100 text-red-700',
}

const OrderDetails = async ({ params }) => {
  const { orderid } = await params

  const { data: orderData } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get/${orderid}`
  )

  const breadcrumb = {
    title: 'Order Details',
    links: [{ label: 'Order Details' }],
  }

  return (
    <div>
      <WebsiteBreadcrumb props={breadcrumb} />

      <div className="lg:px-32 px-5 my-20">
        {orderData && !orderData.success ? (
          <div className="flex justify-center items-center py-32">
            <h4 className="text-red-600 text-xl font-semibold">Order Not Found</h4>
          </div>
        ) : (
          <div>
            {/* Top Info Card */}
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <div className="grid sm:grid-cols-3 grid-cols-1 gap-5 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900 break-all">
                    {orderData?.data?.order_id || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-semibold text-gray-900 break-all">
                    {orderData?.data?.payment_id || '—'}
                  </p>
                </div>

               <div>
                <p className="text-gray-500 mb-1.5">Status</p>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <span
                    className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-semibold capitalize
                    ${STATUS_STYLES[orderData?.data?.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {orderData?.data?.status?.replace(/_/g, ' ') || 'unknown'}
                  </span>

                  <CancelOrderButton
                    orderId={orderData?.data?.order_id}
                    status={orderData?.data?.status}
                  />
                </div>
              </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-start p-3 text-gray-700 font-semibold">Product</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Price</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Quantity</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Total</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orderData?.data?.products?.map((product) => (
                    <tr
                      key={product.variantId._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 flex items-center gap-4">
                        <Image
                          src={product?.variantId?.media[0]?.secure_url || IMAGES.image_placeholder}
                          width={60}
                          height={60}
                          alt={product?.productId?.name}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <Link
                            href={WEBSITE_PRODUCT_DETAILS(product?.productId?.slug)}
                            className="font-medium text-gray-800 hover:underline"
                          >
                            {product?.productId?.name}
                          </Link>
                          {product?.variantId?.attributes?.length ? (
                            <p className="text-sm text-gray-500 mt-1">
                              {product.variantId.attributes.map((a) => `${a.label}: ${a.value}`).join(' | ')}
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-gray-500 mt-1">Color: {product?.variantId?.color}</p>
                              <p className="text-sm text-gray-500">Size: {product?.variantId?.size}</p>
                            </>
                          )}
                          {product.customSize && (
                            <p className="text-sm font-medium text-orange-700">
                              Size: {formatCustomSize(product.customSize)}
                            </p>
                          )}
                          {product.isSample && (
                            <span className="inline-block mt-1 text-[11px] font-semibold bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">
                              Sample · returnable within 7 days of delivery
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="text-center p-3 text-gray-700 font-medium">
                        {product.sellingPrice.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>

                      <td className="text-center p-3 text-gray-700 font-medium">{product.qty}</td>

                      <td className="text-center p-3 text-gray-900 font-semibold">
                        {(product.qty * product.sellingPrice).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>

                      <td className="p-3">
                        <div className="flex justify-center">
                          <ReturnOrderButton
                            orderId={orderData?.data?.order_id}
                            productId={product.productId?._id || product.productId}
                            status={product.status}
                            isReturnable={product.isReturnable}
                            returnRequested={product.returnRequested}
                            isSample={!!product.isSample}
                            deliveredAt={product.deliveredAt}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Shipping + Summary */}
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-10">
              <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold mb-4 border-b pb-2">Shipping Address</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{orderData?.data?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{orderData?.data?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{orderData?.data?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span>{orderData?.data?.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Country:</span>
                    <span>{orderData?.data?.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">State:</span>
                    <span>{orderData?.data?.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">City:</span>
                    <span>{orderData?.data?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pincode:</span>
                    <span>{orderData?.data?.pincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Landmark:</span>
                    <span>{orderData?.data?.landmark}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Order Note:</span>
                    <span>{orderData?.data?.ordernote || '...'}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span>{orderData?.data?.subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Discount</span>
                    <span>{orderData?.data?.discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Coupon Discount</span>
                    <span>{orderData?.data?.couponDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Delivery</span>
                    <span>
                      {Number(orderData?.data?.deliveryCharge || 0) > 0
                        ? Number(orderData.data.deliveryCharge).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between mt-4 pt-2 border-t text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{orderData?.data?.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails