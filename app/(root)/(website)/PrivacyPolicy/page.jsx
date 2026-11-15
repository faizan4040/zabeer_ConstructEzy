'use client'

/**
 * ConstructEzy – Privacy Policy
 * Same blueprint look as About Us / Contact Us.
 * All policy text lives in the SECTIONS array below, so future legal edits
 * only touch the content, not the layout.
 *
 * Block types:  p (paragraph) · ul (bullet list) · h3 (sub-heading)
 *               leads (bold label + text rows) · contact (contact details)
 */

const BLUE = '#12305a'
const YELLOW = '#f5b800'

const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
}

const LAST_UPDATED = '11 November 2026'

// Contact details (phone: +91 8955549556 is the only number used on this page)
const CONTACT = {
  email: 'privacy@constructezy.com',
  phoneDisplay: '+91 89555 49556',
  phoneHref: 'tel:+918955549556',
  location: 'Jaipur, Rajasthan, India',
  website: 'https://constructezy.com', // update if your website address is different
}

const SECTIONS = [
  {
    id: 'about',
    title: 'About ConstructEzy',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy is a construction and renovation marketplace that connects customers with building-material suppliers, skilled workers, contractors and specialised service providers.',
      },
      {
        t: 'p',
        text: 'Customers can explore construction materials, book services, submit material lists and communicate with ConstructEzy through our website, WhatsApp and phone support.',
      },
      {
        t: 'p',
        text: 'Our platform serves homeowners, contractors, builders, construction businesses, suppliers and service providers.',
      },
    ],
  },
  {
    id: 'information-we-collect',
    title: 'Account Registration and Information We Collect',
    blocks: [
      {
        t: 'p',
        text: 'Customers are required to create an account on ConstructEzy before placing product orders or confirming service bookings.',
      },
      {
        t: 'p',
        text: 'Depending on how you use our platform, we may collect the following information:',
      },
      { t: 'h3', text: 'A. Personal and Account Information' },
      {
        t: 'ul',
        items: [
          'Full name',
          'Mobile number',
          'Email address, where provided',
          'Password or authentication information',
          'Account login and activity details',
        ],
      },
      { t: 'h3', text: 'B. Contact and Address Information' },
      {
        t: 'ul',
        items: [
          'Residential or business address',
          'City, state and PIN code',
          'Delivery and service locations',
          'Alternative contact details, where provided',
        ],
      },
      { t: 'h3', text: 'C. Order and Enquiry Information' },
      {
        t: 'ul',
        items: [
          'Construction material requirements',
          'Uploaded material lists and documents',
          'Product enquiries and quotations',
          'Service and labour booking details',
          'Project requirements and descriptions',
          'Order history, payment status and transaction references',
        ],
      },
      { t: 'h3', text: 'D. Business and Partner Information' },
      {
        t: 'p',
        text: 'For suppliers, contractors and service providers, we may collect:',
      },
      {
        t: 'ul',
        items: [
          'Business or organisation name',
          'Business address and contact details',
          'GST or business registration details, where applicable',
          'Product and service information',
          'Relevant professional or business credentials',
        ],
      },
      { t: 'h3', text: 'E. Technical Information' },
      {
        t: 'p',
        text: 'When you access our website, certain technical information may be collected, such as IP address, browser type, device information and website usage data, subject to applicable permissions and settings.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    blocks: [
      { t: 'p', text: 'We use the information collected to:' },
      {
        t: 'ul',
        items: [
          'Create, manage and authenticate customer accounts.',
          'Process product enquiries, material orders and service bookings.',
          'Save relevant customer details and delivery addresses.',
          'Connect customers with relevant suppliers and service providers.',
          'Prepare quotations and coordinate transactions.',
          'Send order confirmations, booking updates and service communications.',
          'Respond to customer enquiries and provide support.',
          'Improve our website, services and user experience.',
          'Prevent fraudulent, unauthorised or suspicious activities.',
          'Meet applicable legal and regulatory requirements.',
        ],
      },
    ],
  },
  {
    id: 'account-security',
    title: 'Account Security and Responsibilities',
    blocks: [
      {
        t: 'p',
        text: 'Customers are responsible for maintaining the confidentiality of their account login credentials and providing accurate registration information.',
      },
      {
        t: 'p',
        text: 'Please notify ConstructEzy if you suspect unauthorised access to your account.',
      },
      {
        t: 'p',
        text: 'We may take reasonable steps to verify account ownership and protect accounts against unauthorised use.',
      },
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing of Information',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy operates as a marketplace connecting customers with independent suppliers and service providers.',
      },
      { t: 'p', text: 'We may share relevant information with:' },
      {
        t: 'leads',
        items: [
          { k: 'Suppliers and Dealers', v: 'To process material enquiries, quotations and orders.' },
          {
            k: 'Service Providers and Skilled Professionals',
            v: 'To facilitate service requests and bookings.',
          },
          {
            k: 'Delivery and Logistics Partners',
            v: 'To coordinate product transportation and delivery.',
          },
          { k: 'Payment Service Providers', v: 'To facilitate and verify transactions.' },
          {
            k: 'Technology and Support Partners',
            v: 'To maintain our website, communication systems and operational services.',
          },
          {
            k: 'Legal and Regulatory Authorities',
            v: 'Where disclosure is required by applicable law or a lawful request.',
          },
        ],
      },
      {
        t: 'p',
        text: 'We aim to share only the information reasonably necessary for the relevant purpose. Third-party providers may also process information under their own privacy policies.',
      },
      {
        t: 'p',
        text: 'We do not sell personal information to third parties as a business practice.',
      },
    ],
  },
  {
    id: 'whatsapp-phone',
    title: 'WhatsApp and Phone Communication',
    blocks: [
      {
        t: 'p',
        text: 'Customers may contact ConstructEzy through WhatsApp or phone calls to submit material lists, request quotations, book services or seek assistance.',
      },
      { t: 'p', text: 'Information shared through these channels may be used to:' },
      {
        t: 'ul',
        items: [
          'Understand and process customer requirements.',
          'Contact relevant suppliers or service providers.',
          'Provide quotations and booking updates.',
          'Coordinate orders, services and deliveries.',
          'Respond to customer enquiries.',
        ],
      },
      {
        t: 'p',
        text: 'WhatsApp and telephone services are operated by third parties and are subject to their respective terms and privacy policies.',
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and Website Technologies',
    blocks: [
      { t: 'p', text: 'Our website may use cookies and similar technologies to:' },
      {
        t: 'ul',
        items: [
          'Improve website functionality.',
          'Understand website traffic and usage.',
          'Remember user preferences.',
          'Improve website performance and user experience.',
        ],
      },
      {
        t: 'p',
        text: 'You can manage cookies through your browser settings. Disabling certain cookies may affect some website features.',
      },
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    blocks: [
      {
        t: 'p',
        text: 'We take reasonable steps to protect personal information against unauthorised access, disclosure, alteration, loss or misuse.',
      },
      {
        t: 'p',
        text: 'These measures may include access controls, secure communication practices and appropriate technical safeguards.',
      },
      {
        t: 'p',
        text: 'However, no method of electronic transmission or storage can guarantee complete security.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    blocks: [
      {
        t: 'p',
        text: 'We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including:',
      },
      {
        t: 'ul',
        items: [
          'Managing customer accounts.',
          'Processing orders and bookings.',
          'Providing customer support.',
          'Resolving complaints and disputes.',
          'Meeting legal and regulatory obligations.',
        ],
      },
      {
        t: 'p',
        text: 'When information is no longer required, we will take appropriate steps to delete or anonymise it, subject to applicable legal requirements.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Privacy Rights',
    blocks: [
      {
        t: 'p',
        text: 'Subject to applicable laws, you may have the right to:',
      },
      {
        t: 'ul',
        items: [
          'Request access to your personal information.',
          'Request correction of inaccurate or incomplete information.',
          'Request deletion of personal information where legally permissible.',
          'Withdraw consent for processing where consent is the applicable basis.',
          'Raise concerns or grievances regarding the handling of your information.',
        ],
      },
      {
        t: 'p',
        text: 'You can submit a privacy-related request using the contact details provided below. We may need to verify your identity before processing certain requests.',
      },
    ],
  },
  {
    id: 'account-deletion',
    title: 'Account Closure and Deletion Requests',
    blocks: [
      {
        t: 'p',
        text: 'Customers may contact ConstructEzy to request account closure or deletion of their personal information, subject to applicable legal and regulatory requirements.',
      },
      {
        t: 'p',
        text: 'Certain information may need to be retained for legitimate purposes, including transaction records, legal compliance, dispute resolution and fraud prevention.',
      },
      {
        t: 'p',
        text: 'To request account closure or deletion, please contact us using the details provided in the Contact Us section.',
      },
    ],
  },
  {
    id: 'third-party',
    title: 'Third-Party Websites and Services',
    blocks: [
      {
        t: 'p',
        text: 'Our website may contain links to third-party websites, payment gateways, WhatsApp or other external services.',
      },
      {
        t: 'p',
        text: 'ConstructEzy does not control the privacy practices of these external platforms. We encourage users to review their respective privacy policies before sharing personal information.',
      },
    ],
  },
  {
    id: 'children',
    title: 'Children’s Privacy',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy is intended for individuals and businesses involved in construction, renovation and related activities. Our services are not designed to knowingly collect personal information from children without appropriate authorisation or consent as required by applicable law.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Privacy Policy',
    blocks: [
      {
        t: 'p',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our services, business operations, technology or applicable laws.',
      },
      {
        t: 'p',
        text: 'Any revised version will be published on this page with an updated revision date.',
      },
      { t: 'p', text: 'We encourage users to review this page periodically.' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    blocks: [
      {
        t: 'p',
        text: 'If you have questions, concerns or requests regarding this Privacy Policy or the handling of your personal information, please contact us:',
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

    case 'h3':
      return (
        <h3 className="flex items-center gap-3 pt-3 text-lg font-bold">
          <span className="h-5 w-1.5 shrink-0" style={{ backgroundColor: YELLOW }} aria-hidden="true" />
          {b.text}
        </h3>
      )

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
            {CONTACT.website && (
              <div className="flex flex-wrap gap-x-3">
                <dt className="w-36 shrink-0 text-gray-500">Website</dt>
                <dd className="font-semibold">
                  <a
                    href={CONTACT.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words hover:underline"
                  >
                    {CONTACT.website.replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              </div>
            )}
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

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f1] text-[#14213a] [scroll-behavior:smooth]">
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>

          <p
            className="mt-5 inline-block rounded-md px-3 py-1.5 text-sm font-bold text-[#14213a]"
            style={{ backgroundColor: YELLOW }}
          >
            Last Updated: {LAST_UPDATED}
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            At ConstructEzy, we value your privacy and are committed to
            protecting your personal information. This Privacy Policy explains
            how we collect, use, store, share and protect your information when
            you visit our website, create an account, purchase construction
            materials or book services through our platform.
          </p>
        </div>
      </section>

      {/* ───────────── Body ───────────── */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:py-20 lg:grid-cols-[18rem_1fr] lg:gap-16">
        {/* Contents */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          {/* Mobile: collapsible */}
          <details className="rounded-xl border-2 border-[#14213a] bg-white lg:hidden">
            <summary className="cursor-pointer px-5 py-3.5 font-bold">Contents</summary>
            <nav aria-label="Privacy policy contents" className="border-t border-dashed border-[#14213a]/25 p-3">
              <TocList />
            </nav>
          </details>

          {/* Desktop: always open */}
          <nav
            aria-label="Privacy policy contents"
            className="hidden max-h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border-2 border-[#14213a] bg-white p-4 lg:block"
          >
            <p className="mb-2 px-2 font-bold">Contents</p>
            <TocList />
          </nav>
        </aside>

        {/* Policy text */}
        <main className="min-w-0">
          <div className="rounded-xl border-l-4 bg-white p-5 leading-8 text-gray-700" style={{ borderColor: YELLOW }}>
            By accessing or using ConstructEzy, you acknowledge the practices
            described in this Privacy Policy.
          </div>

          <div className="mt-12 space-y-14">
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
          </div>
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

export default PrivacyPolicy