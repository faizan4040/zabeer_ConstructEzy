"use client";

import Link from "next/link";

/* ----------------------------- CONFIG ----------------------------- */
const WHATSAPP_NUMBER = "918955549556"; // country code + number, no "+" or spaces
const WHATSAPP_MESSAGE = "Hi, I would like to book / get a quote.";
const PHONE_NUMBER = "+918955549556";
const UPLOAD_PAGE = "/upload-material-list"; // change to your route
/* ------------------------------------------------------------------ */

const cardBase =
  "group flex items-center gap-4 sm:gap-5 rounded-2xl border border-white/90 " +
  "px-4 py-4 sm:px-6 sm:py-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] " +
  "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] " +
  "active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50";

function ChevronRight() {
  return (
    <svg
      className="shrink-0 text-gray-800 transition-transform duration-200 group-hover:translate-x-1"
      width="20"
      height="20"
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
    <span className="flex h-14 w-14 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-full bg-[#25a244] ring-4 ring-white">
      <svg className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 32 32" aria-hidden="true">
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
    <span className="flex h-14 w-14 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-full bg-[#1f7ae0] ring-4 ring-white">
      <svg className="h-8 w-8 sm:h-9 sm:w-9" viewBox="0 0 24 24" aria-hidden="true">
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
    <span className="flex h-14 w-14 sm:h-18 sm:w-18 shrink-0 items-center justify-center">
      <svg className="h-12 w-11 sm:h-16 sm:w-14" viewBox="0 0 56 64" aria-hidden="true">
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

export default function BookingSection() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <section
      aria-label="Booking options"
      className="mx-auto w-full max-w-7xl px-4 py-4"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cardBase} bg-linear-to-r from-[#e8f7ee] to-[#f4fbf7]`}
        >
          <WhatsAppIcon />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold leading-tight text-gray-900 sm:text-xl">
              Book via WhatsApp
            </h3>
            <p className="mt-1 text-sm text-gray-500 sm:text-[15px]">
              Chat with our team
            </p>
          </div>
          <ChevronRight />
        </a>

        {/* Call */}
        <a
          href={`tel:${PHONE_NUMBER}`}
          className={`${cardBase} bg-linear-to-r from-[#e6f0fd] to-[#f2f7fe]`}
        >
          <CallIcon />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold leading-tight text-gray-900 sm:text-xl">
              Book via Call
            </h3>
            <p className="mt-1 text-sm text-gray-500 sm:text-[15px]">
              Talk to our experts
            </p>
          </div>
          <ChevronRight />
        </a>

        {/* Upload */}
        <Link
          href={UPLOAD_PAGE}
          className={`${cardBase} bg-linear-to-r from-[#fdf0e3] to-[#fef8f1]`}
        >
          <UploadIcon />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold leading-tight text-gray-900 sm:text-xl">
              Upload Your Material List
            </h3>
            <p className="mt-1 text-sm text-gray-500 sm:text-[15px]">
              Get best prices &amp; quick quotes
            </p>
          </div>
          <ChevronRight />
        </Link>
      </div>
    </section>
  );
}