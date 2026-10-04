'use client'

const PriceBeatPromise = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">
          Price Beat Promise
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Our Price Promise
            </h2>

            <p className="text-gray-600 leading-7">
              If you find the same product available from another UK retailer
              at a lower advertised price, please contact us. We will review
              the price and, where eligible, offer a better price.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              How It Works
            </h2>

            <p className="text-gray-600 leading-7">
              Contact our customer support team with the product details and
              the competing retailer's price. Our team will verify the offer
              and confirm whether the price qualifies for our price promise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Contact Us
            </h2>

            <p className="text-gray-600 leading-7">
              For price-related queries, please contact our support team.
            </p>

            <p className="mt-2 font-medium">
              +91 XXXXX XXXXX
            </p>

            <p className="mt-1 font-medium">
              support@constructezy.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Terms & Conditions
            </h2>

            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>The product must be the same model and specification.</li>
              <li>The competing product must be currently available.</li>
              <li>The competing price must be publicly advertised.</li>
              <li>Clearance and discontinued products may be excluded.</li>
              <li>Special promotions may be excluded.</li>
              <li>Bulk purchases may not qualify.</li>
              <li>Additional conditions may apply.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

export default PriceBeatPromise