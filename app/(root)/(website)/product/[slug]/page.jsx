import axios from 'axios'
import React from 'react'
import ProductDetails from './productDetails'

const ProductPage = async ({ params, searchParams }) => {
  const { slug } = await params
  const sp = await searchParams

  let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/details/${slug}`

  // forward every selected attribute (Weight, Diameter, Color...) as a query param
  const queryEntries = Object.entries(sp || {}).filter(([, value]) => value)
  if (queryEntries.length > 0) {
    const query = new URLSearchParams(queryEntries).toString()
    url += `?${query}`
  }

  try {
    const { data: getProduct } = await axios.get(url)

    if (!getProduct.success) {
      return (
        <div className='flex justify-center items-center py-10 h-75'>
          <h1 className='text-4xl font-semibold'>Data not found.</h1>
        </div>
      )
    }

    return (
      <ProductDetails
        product={getProduct?.data?.product}
        variant={getProduct?.data?.variant}
        attributeGroups={getProduct?.data?.attributeGroups ?? {}}
        reviewCount={getProduct?.data?.reviewCount}
      />
    )
  } catch (error) {
    return (
      <div className='flex justify-center items-center py-10 h-75'>
        <h1 className='text-4xl font-semibold'>Something went wrong.</h1>
      </div>
    )
  }
}

export default ProductPage







