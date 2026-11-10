"use client";

import Link from "next/link";

/* ----------------------------- CONFIG ----------------------------- */
const WHATSAPP_NUMBER = "918955549556"; // country code + number, no "+" or spaces
const WHATSAPP_MESSAGE = "Hi, I would like to book / get a quote.";
const PHONE_NUMBER = "+918955549556";
const UPLOAD_PAGE = "/upload-material-list"; // change to your route
/* ------------------------------------------------------------------ */

/* Phone: compact vertical tile (icon on top, text below)
   md+: wide horizontal card (icon | text | arrow) */
const cardBase =
  "group flex w-full min-w-0 flex-col items-center justify-center gap-1.5 text-center " +
  "rounded-xl border border-white/90 px-1.5 py-3 " +
  "md:flex-row md:justify-start md:gap-4 md:px-5 md:py-3.5 md:text-left " +
  "shadow-[0_2px_10px_rgba(15,23,42,0.06)] " +
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.12)] " +
  "active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50";

const iconWrap =
  "flex h-10 w-10 shrink-0 items-center justify-center md:h-12 md:w-12";

function ChevronRight() {
  return (
    <svg
      className="hidden shrink-0 text-gray-800 transition-transform duration-200 group-hover:translate-x-1 md:block"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <span className={`${iconWrap} rounded-full bg-[#25a244] ring-2 ring-white`}>
      <svg className="h-6 w-6 md:h-7 md:w-7" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 4.5C9.65 4.5 4.5 9.65 4.5 16c0 2.2.62 4.25 1.7 6L4.5 27.5l5.67-1.66A11.45 11.45 0 0 0 16 27.5c6.35 0 11.5-5.15 11.5-11.5S22.35 4.5 16 4.5Z"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12.2 10.6c-.3-.65-.62-.67-.9-.68h-.77c-.27 0-.7.1-1.06.5-.37.4-1.4 1.37-1.4 3.34 0 1.97 1.43 3.87 1.63 4.14.2.27 2.77 4.4 6.8 5.99 3.36 1.32 4.04 1.06 4.77.99.73-.07 2.35-.96 2.68-1.89.33-.93.33-1.73.23-1.9-.1-.16-.37-.26-.77-.46-.4-.2-2.35-1.16-2.72-1.3-.36-.13-.63-.2-.9.2-.26.4-1.02 1.3-1.25 1.56-.23.27-.46.3-.86.1-.4-.2-1.68-.62-3.2-1.97-1.18-1.05-1.98-2.35-2.2-2.75-.24-.4-.03-.61.17-.8.18-.18.4-.46.6-.7.2-.23.26-.4.4-.66.13-.27.06-.5-.03-.7-.1-.2-.88-2.18-1.23-2.97Z"
          fill="#fff"
        />
      </svg>
    </span>
  );
}

function CallIcon() {
  return (
    <span className={`${iconWrap} rounded-full bg-[#1f7ae0] ring-2 ring-white`}>
      <svg className="h-6 w-6 md:h-7 md:w-7" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.56 0 1 .44 1 1V20c0 .56-.44 1-1 1C10.6 21 3 13.4 3 4c0-.56.44-1 1-1h3.5c.56 0 1 .44 1 1 0 1.25.2 2.45.57 3.58.11.35.03.74-.25 1.02L6.6 10.8Z"
          fill="#fff"
        />
        <path
          d="M14.5 3.5a6 6 0 0 1 6 6M14.5 6.7a2.8 2.8 0 0 1 2.8 2.8"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function UploadIcon() {
  return (
    <span className={iconWrap}>
      <svg className="h-9 w-8 md:h-11 md:w-10" viewBox="0 0 56 64" aria-hidden="true">
        <path
          d="M6 0h31l19 19v39a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Z"
          fill="#F59A23"
        />
        <path d="M37 0l19 19H43a6 6 0 0 1-6-6V0Z" fill="#fff" opacity="0.85" />
        <path
          d="M20 40h16M20 47h16"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M17 33.5 28 29l-2.5 3.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* title      = full title (shown on md+)
   shortTitle = compact title (shown on phone)
   subtitle   = hidden on phone, shown on md+ */
function CardBody({ title, shortTitle, subtitle }) {
  return (
    <>
      <div className="min-w-0 md:flex-1">
        <h3 className="text-[11px] font-bold leading-tight text-gray-900 md:truncate md:text-lg">
          <span className="md:hidden">{shortTitle}</span>
          <span className="hidden md:inline">{title}</span>
        </h3>
        <p className="mt-0.5 hidden truncate text-sm text-gray-500 md:block">
          {subtitle}
        </p>
      </div>
      <ChevronRight />
    </>
  );
}

export default function BookingSection() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <section
      aria-label="Booking options"
      className="mx-auto w-full max-w-400 px-3 py-4 sm:px-6 lg:px-8"
    >
      {/* 3 columns on every screen size */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-5">
        {/* WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cardBase} bg-linear-to-r from-[#e8f7ee] to-[#f4fbf7]`}
        >
          <WhatsAppIcon />
          <CardBody
            title="Book via WhatsApp"
            shortTitle="WhatsApp"
            subtitle="Chat with our team"
          />
        </a>

        {/* Call */}
        <a
          href={`tel:${PHONE_NUMBER}`}
          className={`${cardBase} bg-linear-to-r from-[#e6f0fd] to-[#f2f7fe]`}
        >
          <CallIcon />
          <CardBody
            title="Book via Call"
            shortTitle="Call Now"
            subtitle="Talk to our experts"
          />
        </a>

        {/* Upload */}
        <Link
          href={UPLOAD_PAGE}
          className={`${cardBase} bg-linear-to-r from-[#fdf0e3] to-[#fef8f1]`}
        >
          <UploadIcon />
          <CardBody
            title="Upload Your Material List"
            shortTitle="Upload List"
            subtitle="Get best prices & quick quotes"
          />
        </Link>
      </div>
    </section>
  );
}




