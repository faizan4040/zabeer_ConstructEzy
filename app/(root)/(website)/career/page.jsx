'use client'

const Career = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4">
            Career Opportunities
          </h1>

          <p className="text-gray-600 text-lg">
            Interested in building your career with Constructezy?
          </p>
        </div>

        {/* About Careers */}
        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Who We&apos;re Looking For
            </h2>

            <div className="space-y-4 text-gray-600 leading-7">
              <p>
                At Constructezy, we are looking for skilled and motivated
                professionals who are passionate about construction, design,
                technology, and project execution.
              </p>

              <p>
                We welcome engineers, architects, contractors, labor experts,
                project managers, and professionals with experience in
                construction, materials management, plumbing, electrical work,
                and other related fields.
              </p>

              <p>
                We believe in learning, teamwork, and professional growth.
                Every team member contributes to building better solutions
                and delivering quality results.
              </p>

              <p>
                If you are motivated, hardworking, and interested in growing
                with Constructezy, we would love to hear from you.
              </p>
            </div>
          </section>

          {/* Roles */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Roles We&apos;re Interested In
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Engineers',
                'Architects',
                'Contractors',
                'Labor Experts',
              ].map((role) => (
                <div
                  key={role}
                  className="border border-gray-200 rounded-lg p-4 text-gray-700"
                >
                  {role}
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="border border-gray-200 rounded-lg p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Contact Us
            </h2>

            <div className="space-y-4 text-gray-600">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Email
                </p>

                <a
                  href="mailto:careers@constructezy.com"
                  className="text-gray-900 font-medium hover:text-yellow-500"
                >
                  careers@constructezy.com
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Phone
                </p>

                <a
                  href="tel:+918955549556"
                  className="text-gray-900 font-medium hover:text-yellow-500"
                >
                  +91 8955549556
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Location
                </p>

                <p className="text-gray-900 font-medium">
                  India
                </p>
              </div>
            </div>

            <a
              href="mailto:careers@constructezy.com"
              className="inline-block mt-7 bg-orange-500 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-600 transition"
            >
              Send Your Application
            </a>
          </section>

        </div>
      </main>
    </div>
  )
}

export default Career