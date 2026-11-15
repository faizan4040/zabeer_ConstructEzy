'use client'

/**
 * ConstructEzy – Cookies Policy
 * Same blueprint look as the other pages. The policy wording is the same as your
 * previous page (only the brand spelling is now "ConstructEzy").
 * All text lives in the SECTIONS array, so edits don't touch the layout.
 *
 * Block types:  p · ul · leads (bold label + text rows) · contact
 */

const BLUE = '#12305a'
const YELLOW = '#f5b800'

const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
}

// Set this when you publish or revise the policy, e.g. '16 November 2026'. Hidden while empty.
const LAST_UPDATED = ''

const CONTACT = {
  email: 'privacy@constructezy.com',
  phoneDisplay: '+91 89555 49556',
  phoneHref: 'tel:+918955549556',
  location: 'Jaipur, Rajasthan, India',
}

const SECTIONS = [
  {
    id: 'what-are-cookies',
    title: 'What Are Cookies?',
    blocks: [
      {
        t: 'p',
        text: 'Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, improve functionality, and provide a better user experience.',
      },
      {
        t: 'p',
        text: 'ConstructEzy may also use similar technologies such as local storage and other tools for similar purposes.',
      },
    ],
  },
  {
    id: 'how-we-use-cookies',
    title: 'How We Use Cookies',
    blocks: [
      { t: 'p', text: 'We may use cookies and similar technologies to:' },
      {
        t: 'ul',
        items: [
          'Keep users signed in securely',
          'Remember account and website preferences',
          'Remember delivery and service locations',
          'Improve website performance',
          'Understand how users use our website',
          'Improve our services and user experience',
          'Maintain website security',
        ],
      },
    ],
  },
  {
    id: 'types-of-cookies',
    title: 'Types of Cookies We Use',
    blocks: [
      {
        t: 'leads',
        items: [
          {
            k: 'Essential Cookies',
            v: 'These cookies are required for basic website functionality, including account login, sessions, orders, bookings, and other essential services.',
          },
          {
            k: 'Functional Cookies',
            v: 'These cookies help remember your preferences and settings so that you do not have to enter the same information repeatedly.',
          },
          {
            k: 'Analytics Cookies',
            v: 'These cookies help us understand website usage, performance, errors, and areas that can be improved.',
          },
          {
            k: 'Location Cookies',
            v: 'We may use cookies or local storage to remember delivery or service locations and provide relevant services.',
          },
        ],
      },
    ],
  },
  {
    id: 'third-party-cookies',
    title: 'Third-Party Cookies',
    blocks: [
      {
        t: 'p',
        text: 'Some services used by ConstructEzy may place cookies or use similar technologies on our website. These services may include analytics, payment, mapping, security, and other technology providers.',
      },
      {
        t: 'p',
        text: 'Third-party providers may have their own privacy and cookie policies. We recommend reviewing their policies when applicable.',
      },
    ],
  },
  {
    id: 'cookie-duration',
    title: 'Cookie Duration',
    blocks: [
      {
        t: 'p',
        text: 'Some cookies are temporary and are deleted when you close your browser. Other cookies may remain on your device for a specific period depending on their purpose.',
      },
      {
        t: 'p',
        text: 'Cookie duration may vary depending on the type of cookie and the service for which it is used.',
      },
    ],
  },
  {
    id: 'managing-cookies',
    title: 'Managing Cookies',
    blocks: [
      {
        t: 'p',
        text: 'You can manage or delete cookies through your browser settings. Most browsers allow you to view, block, or delete stored cookies.',
      },
      {
        t: 'p',
        text: 'Please note that disabling essential cookies may affect certain features of ConstructEzy, including account login, orders, bookings, or other website functionality.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    blocks: [
      {
        t: 'p',
        text: 'We may update this Cookies Policy from time to time to reflect changes in our services, technology, or legal requirements. Updated versions will be published on this page.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    blocks: [
      {
        t: 'p',
        text: 'If you have any questions about our use of cookies, please contact us.',
      },
      { t: 'contact' },
    ],
  },
]

/* ───────────── small pieces ───────────── */

const Bullet = () => (
  <span
    className="mt-[0.7rem] h-1.5 w-1.5 shrink-0"
    style={{ backgroundColor: YELLOW }}
    aria-hidden="true"
  />
)

const Block = ({ b }) => {
  switch (b.t) {
    case 'p':
      return <p className="leading-8 text-gray-700">{b.text}</p>

    case 'ul':
      return (
        <ul className="space-y-2.5">
          {b.items.map((item) => (
            <li key={item} className="flex gap-3 leading-7 text-gray-700">
              <Bullet />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'leads':
      return (
        <ul className="divide-y divide-dashed divide-[#14213a]/25 rounded-xl border-2 border-[#14213a] bg-white">
          {b.items.map(({ k, v }) => (
            <li key={k} className="px-5 py-4">
              <p className="font-bold">{k}</p>
              <p className="mt-0.5 leading-7 text-gray-700">{v}</p>
            </li>
          ))}
        </ul>
      )

    case 'contact':
      return (
        <div className="rounded-xl border-2 border-[#14213a] bg-white p-6 shadow-[6px_6px_0_0_#f5b800]">
          <p className="text-xl font-bold">ConstructEzy</p>
          <dl className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-x-3">
              <dt className="w-36 shrink-0 text-gray-500">Email</dt>
              <dd className="font-semibold">
                <a href={`mailto:${CONTACT.email}`} className="break-words hover:underline">
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <dt className="w-36 shrink-0 text-gray-500">Phone / WhatsApp</dt>
              <dd className="font-semibold">
                <a href={CONTACT.phoneHref} className="hover:underline">
                  {CONTACT.phoneDisplay}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <dt className="w-36 shrink-0 text-gray-500">Location</dt>
              <dd className="font-semibold">{CONTACT.location}</dd>
            </div>
          </dl>
        </div>
      )

    default:
      return null
  }
}

const TocList = () => (
  <ol className="space-y-1">
    {SECTIONS.map((s, i) => (
      <li key={s.id}>
        <a
          href={`#${s.id}`}
          className="flex gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 transition hover:bg-[#f6f5f1] hover:text-[#14213a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12305a]"
        >
          <span className="w-6 shrink-0 text-right font-semibold text-gray-400">{i + 1}.</span>
          <span>{s.title}</span>
        </a>
      </li>
    ))}
  </ol>
)

/* ───────────── page ───────────── */

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f1] text-[#14213a] [scroll-behavior:smooth]">
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Cookies Policy
          </h1>

          {LAST_UPDATED && (
            <p
              className="mt-5 inline-block rounded-md px-3 py-1.5 text-sm font-bold text-[#14213a]"
              style={{ backgroundColor: YELLOW }}
            >
              Last Updated: {LAST_UPDATED}
            </p>
          )}

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            This Cookies Policy explains how ConstructEzy uses cookies and
            similar technologies when you use our website and services.
          </p>
        </div>
      </section>

      {/* ───────────── Body ───────────── */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:py-20 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <details className="rounded-xl border-2 border-[#14213a] bg-white lg:hidden">
            <summary className="cursor-pointer px-5 py-3.5 font-bold">Contents</summary>
            <nav aria-label="Cookies policy contents" className="border-t border-dashed border-[#14213a]/25 p-3">
              <TocList />
            </nav>
          </details>

          <nav
            aria-label="Cookies policy contents"
            className="hidden max-h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border-2 border-[#14213a] bg-white p-4 lg:block"
          >
            <p className="mb-2 px-2 font-bold">Contents</p>
            <TocList />
          </nav>
        </aside>

        <main className="min-w-0 space-y-14">
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-6">
              <h2 className="border-b-2 border-[#14213a] pb-3 text-2xl font-bold leading-snug md:text-3xl">
                {i + 1}. {s.title}
              </h2>

              <div className="mt-6 max-w-3xl space-y-5">
                {s.blocks.map((b, j) => (
                  <Block key={j} b={b} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* ───────────── Closing tagline ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">
            ConstructEzy – Your Construction Needs, All in One Place.
          </h2>
        </div>
      </section>
    </div>
  )
}

export default CookiePolicy