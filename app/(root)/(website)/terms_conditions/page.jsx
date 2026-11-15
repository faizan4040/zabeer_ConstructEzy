'use client'

import { useEffect } from 'react'

/**
 * ConstructEzy – Terms & Conditions
 * Same blueprint look as About / Contact / Privacy.
 * All legal text lives in the SECTIONS array, so future edits don't touch the layout.
 *
 * Block types:  p (paragraph) · ul (bullet list) · h3 (sub-heading) · contact (details card)
 */

const BLUE = '#12305a'
const YELLOW = '#f5b800'

const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
}

const LAST_UPDATED = '11 November 2026'

/**
 * Section 21 details.
 * Empty values are hidden on the page, and a console warning lists them in development.
 * The grievance details are a legal requirement for a marketplace, so fill them in before publishing.
 */
const CONTACT = {
  legalName: '', // Registered legal entity name
  brand: 'ConstructEzy',
  email: 'support@constructezy.com',
  phoneDisplay: '+91 89555 49556',
  phoneHref: 'tel:+918955549556',
  address: '', // Registered / principal business address
  grievanceOfficer: '', // Name and designation
  grievanceEmail: '',
}

const SECTIONS = [
  {
    id: 'about',
    title: 'About ConstructEzy',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy is a construction and renovation marketplace that connects customers with building-material suppliers, dealers, contractors, skilled workers and specialised service providers.',
      },
      { t: 'p', text: 'Our platform enables customers to:' },
      {
        t: 'ul',
        items: [
          'Browse and purchase construction materials.',
          'Request quotations for building materials.',
          'Book skilled labour and construction services.',
          'Submit material lists for quotations and fulfilment.',
          'Raise construction and renovation project enquiries.',
          'Connect with relevant suppliers and service providers.',
        ],
      },
      {
        t: 'p',
        text: 'Customers can access our services through our website, WhatsApp, phone calls and other communication channels made available by ConstructEzy.',
      },
    ],
  },
  {
    id: 'account-registration',
    title: 'Account Registration',
    blocks: [
      {
        t: 'p',
        text: 'Customers are required to create an account before placing product orders or confirming service bookings.',
      },
      { t: 'p', text: 'By registering, you agree to:' },
      {
        t: 'ul',
        items: [
          'Provide accurate, complete and updated information.',
          'Maintain the confidentiality of your login credentials.',
          'Use your account for legitimate purposes.',
          'Notify ConstructEzy of any suspected unauthorised account access.',
          'Avoid creating accounts using false identities or another person’s information without authorisation.',
        ],
      },
      {
        t: 'p',
        text: 'You are responsible for activities carried out through your account, subject to applicable law.',
      },
      {
        t: 'p',
        text: 'ConstructEzy reserves the right to restrict or suspend accounts involved in fraudulent, abusive or unauthorised activities.',
      },
    ],
  },
  {
    id: 'marketplace-services',
    title: 'Our Marketplace Services',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy provides a platform to facilitate connections between customers and independent suppliers or service providers.',
      },
      { t: 'p', text: 'Our offerings include:' },
      { t: 'h3', text: 'A. Construction Materials' },
      {
        t: 'p',
        text: 'Customers can explore and request products such as cement, steel, bricks, sand, aggregates, electrical fittings, plumbing materials, paints and other construction-related products.',
      },
      { t: 'h3', text: 'B. Skilled Labour and Services' },
      {
        t: 'p',
        text: 'Customers can request professionals and services such as electricians, plumbers, carpenters, masons, painters, tile workers, welders, waterproofing specialists and other construction professionals.',
      },
      { t: 'h3', text: 'C. Project Enquiries' },
      {
        t: 'p',
        text: 'Customers may submit enquiries relating to construction, renovation and other project requirements.',
      },
      { t: 'h3', text: 'D. Material List Uploads' },
      {
        t: 'p',
        text: 'Customers can upload or share material lists through available website or communication channels to request quotations and assistance.',
      },
      {
        t: 'p',
        text: 'The availability of products, services and professionals may vary depending on location, supplier availability and operational capacity.',
      },
    ],
  },
  {
    id: 'role-of-constructezy',
    title: 'Role of ConstructEzy',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy operates as a marketplace facilitating connections between customers and participating suppliers or service providers.',
      },
      {
        t: 'p',
        text: 'Unless explicitly stated otherwise in a particular transaction:',
      },
      {
        t: 'ul',
        items: [
          'Products are offered by the respective suppliers or sellers.',
          'Services are provided by the respective service providers or professionals.',
          'Product specifications, quotations, availability and applicable warranties are subject to the respective seller’s terms.',
          'Service scope, pricing, schedules and execution are subject to the agreed terms between the customer and service provider.',
        ],
      },
      {
        t: 'p',
        text: 'ConstructEzy may assist with enquiries, quotations, communication, booking coordination and transaction facilitation.',
      },
      {
        t: 'p',
        text: 'The specific role of ConstructEzy in each transaction will be communicated to customers where relevant.',
      },
      {
        t: 'p',
        text: 'Nothing in these Terms removes any statutory responsibility or consumer right applicable to ConstructEzy or any seller or service provider.',
      },
    ],
  },
  {
    id: 'product-information-pricing',
    title: 'Product Information and Pricing',
    blocks: [
      {
        t: 'p',
        text: 'We aim to ensure that product descriptions, specifications, images and prices displayed on our platform are accurate and updated.',
      },
      { t: 'p', text: 'However:' },
      {
        t: 'ul',
        items: [
          'Prices may change based on market conditions and supplier updates.',
          'Product availability may vary.',
          'Images are for reference and actual product appearance may differ slightly.',
          'Brand, grade, size, quantity and specifications should be confirmed before purchase.',
          'Applicable taxes, transportation charges, loading or unloading charges and other fees will be communicated as applicable.',
        ],
      },
      {
        t: 'p',
        text: 'Customers should review the product details and final quotation before confirming an order.',
      },
      {
        t: 'p',
        text: 'Any quotation will be subject to its stated validity period and applicable conditions.',
      },
    ],
  },
  {
    id: 'orders-payments',
    title: 'Orders and Payments',
    blocks: [
      { t: 'p', text: 'Customers may place orders through the available ordering channels.' },
      {
        t: 'p',
        text: 'An enquiry or quotation request does not automatically constitute a confirmed order.',
      },
      {
        t: 'p',
        text: 'An order will be considered confirmed when the applicable order acceptance and payment or other agreed confirmation requirements have been completed.',
      },
      {
        t: 'p',
        text: 'Payment methods may include available online payment options, bank transfers or other approved payment arrangements.',
      },
      {
        t: 'p',
        text: 'Customers must ensure that payment details are accurate and that payments are made through authorised channels.',
      },
      {
        t: 'p',
        text: 'ConstructEzy will communicate applicable charges, including product prices, service fees, delivery charges and taxes, before order confirmation.',
      },
    ],
  },
  {
    id: 'delivery-fulfilment',
    title: 'Delivery and Fulfilment',
    blocks: [
      {
        t: 'p',
        text: 'Delivery arrangements may depend on the supplier, product category, delivery location and availability of logistics partners.',
      },
      {
        t: 'ul',
        items: [
          'Estimated delivery dates and timelines will be communicated where available.',
          'Delivery charges may vary according to distance, quantity and product type.',
          'Customers must provide accurate delivery addresses and contact details.',
          'Customers should ensure that suitable access and arrangements are available at the delivery location.',
          'Delays may occur due to traffic, weather, supplier availability, transportation issues or other circumstances beyond reasonable control.',
        ],
      },
      {
        t: 'p',
        text: 'Any specific delivery commitment communicated for an order will be subject to its stated terms and applicable law.',
      },
    ],
  },
  {
    id: 'service-labour-bookings',
    title: 'Service and Labour Bookings',
    blocks: [
      {
        t: 'p',
        text: 'Customers may request skilled workers and specialised construction services through ConstructEzy.',
      },
      { t: 'p', text: 'Service bookings are subject to:' },
      {
        t: 'ul',
        items: [
          'Availability of suitable professionals.',
          'Confirmation of the service scope.',
          'Agreed pricing and payment terms.',
          'Location and scheduling requirements.',
          'Any applicable site inspection or assessment.',
        ],
      },
      {
        t: 'p',
        text: 'Customers should provide accurate details about the required work and site conditions.',
      },
      {
        t: 'p',
        text: 'Any additional work beyond the originally agreed scope may require a revised quotation and separate approval.',
      },
      {
        t: 'p',
        text: 'ConstructEzy may facilitate communication and booking coordination but does not automatically become the employer of independent service providers or skilled professionals.',
      },
    ],
  },
  {
    id: 'cancellation-returns-refunds',
    title: 'Cancellation, Returns and Refunds',
    blocks: [
      {
        t: 'p',
        text: 'Cancellation, return and refund requests will be handled according to the applicable product or service terms, the seller or service provider’s disclosed policies and applicable consumer protection laws.',
      },
      { t: 'h3', text: 'Product Orders' },
      {
        t: 'ul',
        items: [
          'Customers should review product specifications, quantities and delivery details before confirming orders.',
          'Cancellation requests should be submitted as early as possible.',
          'Returns or exchanges may be subject to product condition, category-specific restrictions and disclosed seller policies.',
          'Defective, damaged, incorrect or materially misrepresented products will be handled in accordance with applicable law.',
        ],
      },
      { t: 'h3', text: 'Service Bookings' },
      {
        t: 'ul',
        items: [
          'Customers should communicate cancellation or rescheduling requests in advance.',
          'Any applicable cancellation or inspection charges must be communicated before confirmation.',
          'Refund eligibility will depend on the service status, agreed terms and applicable law.',
        ],
      },
      {
        t: 'p',
        text: 'Approved refunds will be processed through the applicable payment method within the legally required or communicated timeframe.',
      },
      {
        t: 'p',
        text: 'No term in this section is intended to restrict consumer rights available under applicable law.',
      },
    ],
  },
  {
    id: 'customer-responsibilities',
    title: 'Customer Responsibilities',
    blocks: [
      { t: 'p', text: 'By using ConstructEzy, customers agree to:' },
      {
        t: 'ul',
        items: [
          'Provide genuine and accurate information.',
          'Submit legitimate product and service requirements.',
          'Make payments through authorised channels.',
          'Provide correct delivery and service locations.',
          'Treat suppliers, workers and service providers respectfully.',
          'Avoid fraudulent orders, abusive conduct or misuse of the platform.',
          'Comply with applicable laws and safety requirements.',
        ],
      },
      {
        t: 'p',
        text: 'Customers must not use ConstructEzy for unlawful activities or submit misleading information.',
      },
    ],
  },
  {
    id: 'supplier-responsibilities',
    title: 'Supplier and Service Provider Responsibilities',
    blocks: [
      {
        t: 'p',
        text: 'Suppliers and service providers participating in ConstructEzy are expected to:',
      },
      {
        t: 'ul',
        items: [
          'Provide accurate business and contact information.',
          'Maintain accurate product descriptions and service details.',
          'Communicate genuine pricing and availability.',
          'Honour accepted orders and confirmed bookings.',
          'Maintain appropriate professional standards.',
          'Follow applicable safety, quality and legal requirements.',
          'Address customer complaints and fulfil applicable obligations.',
        ],
      },
      {
        t: 'p',
        text: 'Suppliers and service providers are responsible for the accuracy of the information and commitments they provide.',
      },
      {
        t: 'p',
        text: 'Their participation may be subject to separate agreements with ConstructEzy.',
      },
    ],
  },
  {
    id: 'reviews-content',
    title: 'Reviews and User-Submitted Content',
    blocks: [
      {
        t: 'p',
        text: 'Customers may be able to submit reviews, feedback, photographs, documents or other information through the platform.',
      },
      { t: 'p', text: 'By submitting content, you confirm that:' },
      {
        t: 'ul',
        items: [
          'You have the right to share the content.',
          'The content is accurate to the best of your knowledge.',
          'It does not violate another person’s rights.',
          'It does not contain unlawful, misleading, abusive or harmful material.',
        ],
      },
      {
        t: 'p',
        text: 'ConstructEzy may moderate or remove content that violates these Terms or applicable law.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    blocks: [
      {
        t: 'p',
        text: 'All content available on the ConstructEzy website, including its brand name, logo, design, graphics, text, website layout and other original materials, is owned by or licensed to ConstructEzy unless otherwise stated.',
      },
      {
        t: 'p',
        text: 'Users may not reproduce, distribute, modify, commercially exploit or use such materials without prior written permission, except where permitted by law.',
      },
    ],
  },
  {
    id: 'limitation-of-liability',
    title: 'Limitation of Liability',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy makes reasonable efforts to maintain a reliable marketplace and facilitate transactions.',
      },
      {
        t: 'p',
        text: 'However, to the extent permitted by applicable law, ConstructEzy is not responsible for:',
      },
      {
        t: 'ul',
        items: [
          'Temporary website interruptions or technical issues.',
          'Inaccurate information supplied by independent third parties.',
          'Delays caused by suppliers, service providers or logistics partners.',
          'Independent contractual commitments between customers and providers.',
        ],
      },
      {
        t: 'p',
        text: 'This section does not exclude or limit liability that cannot legally be excluded, including applicable consumer rights, statutory obligations, fraud or liability arising from negligence where exclusion is not permitted by law.',
      },
    ],
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    blocks: [
      {
        t: 'p',
        text: 'To the extent permitted by applicable law, users may be responsible for losses or claims arising from their unlawful conduct, fraudulent activities, misuse of the platform or violation of these Terms, including infringement of third-party rights.',
      },
      {
        t: 'p',
        text: 'Nothing in this section removes any responsibility that ConstructEzy or another party has under applicable law.',
      },
    ],
  },
  {
    id: 'suspension-termination',
    title: 'Suspension and Termination',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy may restrict, suspend or terminate access to an account where there is reasonable evidence of:',
      },
      {
        t: 'ul',
        items: [
          'Fraudulent or unauthorised activity.',
          'Violation of these Terms.',
          'Misuse of the platform.',
          'Unlawful activities.',
          'Conduct that creates a security or operational risk.',
        ],
      },
      {
        t: 'p',
        text: 'Where appropriate, users may be notified of the reason for such action, subject to applicable law.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy and Data Protection',
    blocks: [
      { t: 'p', text: 'Your use of ConstructEzy is also governed by our Privacy Policy.' },
      {
        t: 'p',
        text: 'Our Privacy Policy explains how we collect, use, store and share personal information, including account details, order information, service bookings and communication records.',
      },
      {
        t: 'p',
        text: 'By using the platform, you acknowledge that you have been provided access to our Privacy Policy.',
      },
    ],
  },
  {
    id: 'force-majeure',
    title: 'Force Majeure',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy will not be held responsible for delays or failures caused by circumstances beyond its reasonable control, including natural disasters, severe weather, government restrictions, strikes, transportation disruptions, internet outages or other unforeseen events.',
      },
      {
        t: 'p',
        text: 'This provision does not remove any consumer rights or statutory obligations that continue to apply.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    blocks: [
      {
        t: 'p',
        text: 'ConstructEzy reserves the right to update or modify these Terms & Conditions to reflect changes in its business operations, services, technology or applicable laws.',
      },
      {
        t: 'p',
        text: 'Updated terms will be published on this page with a revised date.',
      },
      {
        t: 'p',
        text: 'Continued use of the platform after changes take effect will be subject to the updated terms, to the extent permitted by applicable law.',
      },
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law and Jurisdiction',
    blocks: [
      {
        t: 'p',
        text: 'These Terms & Conditions are governed by the laws of India.',
      },
      {
        t: 'p',
        text: 'Subject to applicable consumer protection laws and the jurisdiction of competent consumer forums and authorities, disputes arising from the use of ConstructEzy will be subject to the jurisdiction of competent courts in Jaipur, Rajasthan, where legally permissible.',
      },
    ],
  },
  {
    id: 'grievance',
    title: 'Grievance Redressal and Contact Information',
    blocks: [
      {
        t: 'p',
        text: 'For questions, complaints, order-related issues or concerns regarding these Terms & Conditions, customers may contact ConstructEzy through the following details:',
      },
      { t: 'contact' },
      {
        t: 'p',
        text: 'We will acknowledge and address consumer complaints within the timelines prescribed by applicable law.',
      },
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

const ContactRow = ({ label, children }) => (
  <div className="flex flex-wrap gap-x-3">
    <dt className="w-44 shrink-0 text-gray-500">{label}</dt>
    <dd className="min-w-0 font-semibold">{children}</dd>
  </div>
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

    case 'contact':
      return (
        <div className="rounded-xl border-2 border-[#14213a] bg-white p-6 shadow-[6px_6px_0_0_#f5b800]">
          <dl className="space-y-3">
            {CONTACT.legalName && <ContactRow label="Business Name">{CONTACT.legalName}</ContactRow>}
            <ContactRow label="Brand">{CONTACT.brand}</ContactRow>
            {CONTACT.email && (
              <ContactRow label="Email">
                <a href={`mailto:${CONTACT.email}`} className="break-words hover:underline">
                  {CONTACT.email}
                </a>
              </ContactRow>
            )}
            {CONTACT.phoneDisplay && (
              <ContactRow label="Phone / WhatsApp">
                <a href={CONTACT.phoneHref} className="hover:underline">
                  {CONTACT.phoneDisplay}
                </a>
              </ContactRow>
            )}
            {CONTACT.address && (
              <ContactRow label="Registered / Principal Business Address">{CONTACT.address}</ContactRow>
            )}
            {CONTACT.grievanceOfficer && (
              <ContactRow label="Grievance Officer">{CONTACT.grievanceOfficer}</ContactRow>
            )}
            {CONTACT.grievanceEmail && (
              <ContactRow label="Grievance Email">
                <a href={`mailto:${CONTACT.grievanceEmail}`} className="break-words hover:underline">
                  {CONTACT.grievanceEmail}
                </a>
              </ContactRow>
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

const TermsAndConditions = () => {
  // Development reminder: lists the Section 21 details that are still empty
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const missing = {
      legalName: 'Registered legal entity name',
      address: 'Registered / principal business address',
      grievanceOfficer: 'Grievance officer name and designation',
      grievanceEmail: 'Grievance email',
    }
    const empty = Object.keys(missing).filter((k) => !CONTACT[k])
    if (empty.length) {
      console.warn(
        '[Terms & Conditions] Section 21 is missing: ' + empty.map((k) => missing[k]).join(', ')
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-[#14213a] [scroll-behavior:smooth]">
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="text-sm font-medium text-white/70">Welcome to ConstructEzy!</p>

          <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Terms &amp; Conditions
          </h1>

          <p
            className="mt-5 inline-block rounded-md px-3 py-1.5 text-sm font-bold text-[#14213a]"
            style={{ backgroundColor: YELLOW }}
          >
            Last Updated: {LAST_UPDATED}
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            These Terms &amp; Conditions govern your access to and use of the
            ConstructEzy website, platform and related services. By accessing
            our website, creating an account, placing an order, booking a
            service or using any of our communication channels, you agree to
            these Terms &amp; Conditions.
          </p>
        </div>
      </section>

      {/* ───────────── Body ───────────── */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:py-20 lg:grid-cols-[19rem_1fr] lg:gap-16">
        {/* Contents */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <details className="rounded-xl border-2 border-[#14213a] bg-white lg:hidden">
            <summary className="cursor-pointer px-5 py-3.5 font-bold">Contents</summary>
            <nav aria-label="Terms and conditions contents" className="border-t border-dashed border-[#14213a]/25 p-3">
              <TocList />
            </nav>
          </details>

          <nav
            aria-label="Terms and conditions contents"
            className="hidden max-h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border-2 border-[#14213a] bg-white p-4 lg:block"
          >
            <p className="mb-2 px-2 font-bold">Contents</p>
            <TocList />
          </nav>
        </aside>

        {/* Terms text */}
        <main className="min-w-0">
          <div className="rounded-xl border-l-4 bg-white p-5 leading-8 text-gray-700" style={{ borderColor: YELLOW }}>
            Please read them carefully before using our services.
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

export default TermsAndConditions