'use client'

const DeliveryReturns = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">
          Delivery & Returns
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Delivery
            </h2>
            <p className="text-gray-600 leading-7">
              We aim to deliver your order safely and on time. Delivery
              charges and estimated delivery times may vary depending on
              your location and the products ordered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Delivery Time
            </h2>
            <p className="text-gray-600 leading-7">
              Orders are generally processed and dispatched as soon as
              possible. You will receive order and delivery updates when
              available.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Returns
            </h2>
            <p className="text-gray-600 leading-7">
              If you receive a damaged, defective, or incorrect product,
              please contact us as soon as possible with your order details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Refunds
            </h2>
            <p className="text-gray-600 leading-7">
              Once an eligible return is approved and the product is
              received, the refund will be processed according to the
              applicable payment method and return policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-7">
              If you have any questions about delivery, returns, or refunds,
              please contact our support team.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DeliveryReturns