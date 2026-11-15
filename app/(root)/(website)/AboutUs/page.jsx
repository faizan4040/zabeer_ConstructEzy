'use client'


const BLUE = '#12305a'
const YELLOW = '#f5b800'

const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
}

const customers = ['Homeowners', 'Contractors', 'Builders', 'Construction businesses']

const providers = ['Material suppliers', 'Skilled professionals', 'Service providers']

const materials = [
  'Cement',
  'Steel',
  'Bricks',
  'Electrical',
  'Plumbing',
  'Paints',
  'Finishing products',
]

const trades = [
  'Electricians',
  'Plumbers',
  'Carpenters',
  'Masons',
  'Painters',
  'Tile workers',
  'Other specialised service providers',
]

const channels = [
  'Browse our website',
  'Connect on WhatsApp',
  'Call our team',
  'Upload your material list',
]

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f1] text-[#14213a]">
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-medium text-white/70">About Us</p>

            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Making Construction Easy, One Connection at a Time.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              Construction is a journey that involves hundreds of decisions,
              multiple suppliers, skilled professionals and countless moving
              parts. Finding the right materials, booking reliable workers and
              coordinating different services shouldn&apos;t make that journey
              more complicated.
            </p>
          </div>

          {/* Who we connect – focal element */}
          <div className="relative lg:ml-auto lg:w-full lg:max-w-sm">
            <div
              className="absolute -inset-2 translate-x-3 translate-y-3 rounded-lg"
              style={{ backgroundColor: YELLOW }}
              aria-hidden="true"
            />
            <div className="relative rounded-lg bg-white p-6 text-[#14213a] shadow-2xl">
              <h2 className="border-b-2 border-[#14213a] pb-3 text-base font-bold">
                We connect
              </h2>

              <ul className="mt-4 space-y-2">
                {customers.map((c) => (
                  <li
                    key={c}
                    className="rounded-md bg-[#f6f5f1] px-4 py-2.5 font-medium"
                  >
                    {c}
                  </li>
                ))}
              </ul>

              <div className="my-4 flex items-center gap-3 text-sm font-semibold text-gray-500">
                <span className="h-px flex-1 bg-gray-300" aria-hidden="true" />
                with
                <span className="h-px flex-1 bg-gray-300" aria-hidden="true" />
              </div>

              <ul className="space-y-2">
                {providers.map((p) => (
                  <li
                    key={p}
                    className="rounded-md px-4 py-2.5 font-medium text-[#14213a]"
                    style={{ backgroundColor: YELLOW }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Intro statement ───────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">
            That&apos;s where ConstructEzy comes in.
          </h2>

          <div className="space-y-5 text-lg leading-8 text-gray-700">
            <p>
              ConstructEzy is a construction and renovation marketplace
              designed to bring materials, skilled labour and specialised
              services together on one platform. We connect homeowners,
              contractors, builders and construction businesses with material
              suppliers, skilled professionals and service providers.
            </p>
            <p>
              Whether you&apos;re building a new home, renovating an existing
              space or managing a construction project, ConstructEzy aims to
              make it easier to find what you need and connect with the right
              people.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────── What We Bring Together ───────────── */}
      <section className="border-y border-[#14213a]/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <h2 className="max-w-xl text-3xl font-bold leading-tight md:text-4xl">
            What We Bring Together
          </h2>

          <div className="mt-12 grid gap-5 lg:grid-cols-6">
            {/* Materials – wide */}
            <div className="rounded-xl bg-[#f6f5f1] p-8 lg:col-span-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
                  style={{ backgroundColor: YELLOW }}
                  aria-hidden="true"
                >
                  🧱
                </span>
                <h3 className="text-2xl font-bold">Construction Materials</h3>
              </div>

              <p className="mt-4 max-w-xl leading-7 text-gray-700">
                Explore a wide range of construction materials, from cement,
                steel and bricks to electrical, plumbing, paints and finishing
                products.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {materials.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-[#14213a]/20 bg-white px-3 py-1.5 text-sm font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Labour – dark */}
            <div
              className="rounded-xl p-8 text-white lg:col-span-2"
              style={{ backgroundColor: BLUE }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
                style={{ backgroundColor: YELLOW }}
                aria-hidden="true"
              >
                👷
              </span>
              <h3 className="mt-4 text-2xl font-bold">Skilled Labour &amp; Services</h3>
              <p className="mt-3 leading-7 text-white/80">
                Find and book professionals such as electricians, plumbers,
                carpenters, masons, painters, tile workers and other
                specialised service providers.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {trades.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: YELLOW }}
                      aria-hidden="true"
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ordering – full width */}
            <div className="rounded-xl border-2 border-dashed border-[#14213a]/25 p-8 lg:col-span-6">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
                      style={{ backgroundColor: YELLOW }}
                      aria-hidden="true"
                    >
                      📲
                    </span>
                    <h3 className="text-2xl font-bold">
                      Convenient Ordering &amp; Booking
                    </h3>
                  </div>
                  <p className="mt-4 leading-7 text-gray-700">
                    Choose how you want to get started. Browse through our
                    website, connect with us on WhatsApp, call our team or
                    simply upload your material list to share your
                    requirements.
                  </p>
                </div>

                <ul className="grid gap-3 sm:grid-cols-2">
                  {channels.map((c) => (
                    <li
                      key={c}
                      className="rounded-lg bg-[#f6f5f1] px-4 py-4 font-semibold"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Mission & Vision – drawing title block ───────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="overflow-hidden rounded-xl border-2 border-[#14213a] bg-white">
          <div className="grid md:grid-cols-2">
            <div className="border-b-2 border-[#14213a] p-8 md:border-b-0 md:border-r-2 md:p-12">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="mt-5 text-lg leading-8 text-gray-700">
                To simplify the construction and renovation experience by
                making materials, skilled professionals and essential services
                easier to discover, access and coordinate.
              </p>
            </div>

            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-bold">Our Vision</h2>
              <p className="mt-5 text-lg leading-8 text-gray-700">
                To build a connected construction ecosystem where customers,
                suppliers and service providers can work together more
                efficiently, making construction more accessible, organised
                and convenient.
              </p>
            </div>
          </div>

          <div
            className="h-3 border-t-2 border-[#14213a]"
            style={{ backgroundColor: YELLOW }}
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ───────────── Closing tagline ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            ConstructEzy — Your Construction Needs, All in One Place.
          </h2>
        </div>
      </section>
    </div>
  )
}

export default AboutUs