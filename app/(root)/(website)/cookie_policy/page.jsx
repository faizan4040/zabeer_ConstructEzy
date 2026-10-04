'use client'

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Cookies Policy
          </h1>

          <p className="text-gray-600 text-lg leading-7">
            This Cookies Policy explains how Constructezy uses cookies and
            similar technologies when you use our website and services.
          </p>
        </div>

        <div className="space-y-12">

          {/* 1 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              1. What Are Cookies?
            </h2>

            <p className="text-gray-600 leading-7">
              Cookies are small text files stored on your device when you
              visit a website. They help websites remember information about
              your visit, improve functionality, and provide a better user
              experience.
            </p>

            <p className="text-gray-600 leading-7 mt-4">
              Constructezy may also use similar technologies such as local
              storage and other tools for similar purposes.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. How We Use Cookies
            </h2>

            <p className="text-gray-600 leading-7 mb-4">
              We may use cookies and similar technologies to:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Keep users signed in securely</li>
              <li>Remember account and website preferences</li>
              <li>Remember delivery and service locations</li>
              <li>Improve website performance</li>
              <li>Understand how users use our website</li>
              <li>Improve our services and user experience</li>
              <li>Maintain website security</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Types of Cookies We Use
            </h2>

            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Essential Cookies
                </h3>

                <p className="text-gray-600 leading-7">
                  These cookies are required for basic website functionality,
                  including account login, sessions, orders, bookings, and
                  other essential services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Functional Cookies
                </h3>

                <p className="text-gray-600 leading-7">
                  These cookies help remember your preferences and settings so
                  that you do not have to enter the same information repeatedly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Analytics Cookies
                </h3>

                <p className="text-gray-600 leading-7">
                  These cookies help us understand website usage, performance,
                  errors, and areas that can be improved.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Location Cookies
                </h3>

                <p className="text-gray-600 leading-7">
                  We may use cookies or local storage to remember delivery or
                  service locations and provide relevant services.
                </p>
              </div>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Third-Party Cookies
            </h2>

            <p className="text-gray-600 leading-7">
              Some services used by Constructezy may place cookies or use
              similar technologies on our website. These services may include
              analytics, payment, mapping, security, and other technology
              providers.
            </p>

            <p className="text-gray-600 leading-7 mt-4">
              Third-party providers may have their own privacy and cookie
              policies. We recommend reviewing their policies when applicable.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Cookie Duration
            </h2>

            <p className="text-gray-600 leading-7">
              Some cookies are temporary and are deleted when you close your
              browser. Other cookies may remain on your device for a specific
              period depending on their purpose.
            </p>

            <p className="text-gray-600 leading-7 mt-4">
              Cookie duration may vary depending on the type of cookie and
              the service for which it is used.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              6. Managing Cookies
            </h2>

            <p className="text-gray-600 leading-7">
              You can manage or delete cookies through your browser settings.
              Most browsers allow you to view, block, or delete stored cookies.
            </p>

            <p className="text-gray-600 leading-7 mt-4">
              Please note that disabling essential cookies may affect certain
              features of Constructezy, including account login, orders,
              bookings, or other website functionality.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Changes to This Policy
            </h2>

            <p className="text-gray-600 leading-7">
              We may update this Cookies Policy from time to time to reflect
              changes in our services, technology, or legal requirements.
              Updated versions will be published on this page.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Contact Us
            </h2>

            <p className="text-gray-600 leading-7">
              If you have any questions about our use of cookies, please
              contact us.
            </p>

            <div className="mt-4 space-y-2">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:privacy@constructezy.com"
                  className="text-yellow-500 hover:text-orange-600"
                >
                  privacy@constructezy.com
                </a>
              </p>

              <p>
                <strong>Phone:</strong>{' '}
                <a
                  href="tel:+916375380848"
                  className="text-yellow-500 hover:text-orange-600"
                >
                  +91 6375380848
                </a>
              </p>

              <p>
                <strong>Location:</strong> India
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}

export default CookiePolicy