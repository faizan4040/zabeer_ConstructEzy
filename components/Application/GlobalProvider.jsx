"use client"

import { persistor, store } from "@/store/store"
import React from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Loading from "./Loading"
import { BsWhatsapp } from "react-icons/bs"

const queryClient = new QueryClient()

const GlobalProvider = ({ children }) => {
  const whatsappNumber = "911234567890"

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={<Loading />}>
          {children}

          {/* WhatsApp Floating Button */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
            className="
              fixed
              bottom-6
              right-6
              z-[9999]
              w-14
              h-14
              rounded-full
              bg-[#25D366]
              text-white
              flex
              items-center
              justify-center
              shadow-lg
              hover:scale-110
              hover:shadow-xl
              transition-all
              duration-300
            "
          >
            <BsWhatsapp size={28} />
          </a>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  )
}

export default GlobalProvider


