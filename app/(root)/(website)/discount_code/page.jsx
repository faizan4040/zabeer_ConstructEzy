'use client'

import { IMAGES } from '@/routes/AllImages'

const offers = [
  {
    title: '10% Off First Order',
    subtitle: 'New to Constructezy?',
    description:
      'Get 10% off your first construction material order when you register and place your first eligible order. Use code FIRST10 at checkout.',
  },
  {
    title: 'Free Delivery',
    subtitle: 'On eligible orders',
    description:
      'Get free delivery on eligible construction material orders. Delivery availability may depend on your location and order value.',
  },
  {
    title: 'Labour Hire Discount',
    subtitle: 'For eligible customers',
    description:
      'Eligible customers may receive a discount on their first labour hire booking through Constructezy.',
  },
  {
    title: 'Bulk Order Discount',
    subtitle: 'Save on larger orders',
    description:
      'Eligible bulk orders may receive additional discounts, helping you reduce costs on larger construction material purchases.',
  },
  {
    title: 'Site Manager Benefits',
    subtitle: 'For construction professionals',
    description:
      'Eligible site managers and construction professionals may receive special offers and account benefits.',
  },
  {
    title: 'Refer & Earn',
    subtitle: 'Refer a business',
    description:
      'Refer a new customer to Constructezy and receive platform credit when the referral completes an eligible order.',
  },
]

const DiscountCode = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HERO BANNER */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden bg-gray-900">
        <img
          src={IMAGES.discount_code}
          alt="Constructezy Offers and Discounts"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-5xl mx-auto w-full px-6 pb-14">
            <p className="text-yellow-500 text-sm font-medium mb-4">
              Exclusive Offers
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Offers & Discounts
            </h1>

            <p className="mt-4 text-gray-200 text-lg max-w-2xl">
              Save more on construction materials and services with
              Constructezy offers.
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-5">
          Save More With Constructezy
        </h2>

        <div className="space-y-4 text-gray-600 leading-7">
          <p>
            Constructezy provides offers and discounts to help customers save
            on construction materials and services.
          </p>

          <p>
            New customers may receive introductory offers, while eligible
            customers may receive additional benefits on bulk orders, labour
            services, and referrals.
          </p>

          <p>
            Offer availability and eligibility may vary depending on the
            specific offer and order.
          </p>
        </div>
      </section>

      {/* OFFERS */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16">

          <div className="mb-10">
            <p className="text-yellow-500 text-sm font-medium mb-2">
              Current Offers
            </p>

            <h2 className="text-3xl font-bold">
              Available Discounts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.title}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {offer.title}
                </h3>

                <p className="text-gray-900 font-medium mb-3">
                  {offer.subtitle}
                </p>

                <p className="text-gray-600 leading-7">
                  {offer.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold mb-10">
          How to Redeem an Offer
        </h2>

        <div className="space-y-8">

          <div className="flex gap-5">
            <span className="text-yellow-500 font-bold text-xl">
              01
            </span>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Create Your Account
              </h3>

              <p className="text-gray-600 leading-7">
                Create your Constructezy account and provide the required
                information.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <span className="text-yellow-500 font-bold text-xl">
              02
            </span>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Place Your Order
              </h3>

              <p className="text-gray-600 leading-7">
                Select your required construction materials or services and
                place your order.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <span className="text-yellow-500 font-bold text-xl">
              03
            </span>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Apply the Offer
              </h3>

              <p className="text-gray-600 leading-7">
                Enter the applicable discount code during checkout or receive
                the eligible discount automatically.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* TERMS */}
      <section className="max-w-4xl mx-auto px-6 pb-16">

        <div className="border border-gray-200 rounded-lg p-6 sm:p-8">

          <h2 className="text-2xl font-semibold mb-5">
            Offer Terms
          </h2>

          <ul className="list-disc pl-6 space-y-2 text-gray-600 leading-7">
            <li>Offers are subject to availability.</li>
            <li>Some offers may only be available to eligible customers.</li>
            <li>Discounts may not be combined with other offers.</li>
            <li>Discount codes must be entered correctly during checkout.</li>
            <li>Offers may have additional terms or expiry dates.</li>
            <li>Constructezy may modify or withdraw offers when required.</li>
          </ul>

        </div>

      </section>

    </div>
  )
}

export default DiscountCode