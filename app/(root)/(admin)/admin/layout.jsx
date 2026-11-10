import AppSidebar from '@/components/Application/Admin/AppSidebar'
import ThemeProvider from '@/components/Application/Admin/ThemeProvider'
import Topbar from '@/components/Application/Admin/Topbar'
import { SidebarProvider } from '@/components/ui/sidebar'

import React from 'react'

const layout = ({ children }) => {
  return (
    <ThemeProvider 
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
    >
        <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 min-w-0 bg-[#f9f7f7] dark:bg-stone-900">
            <div className="pt-17.5 px-4 md:px-8 min-h-[calc(100vh-40px)] pb-10">
              <Topbar />
              {children}
            </div>

            <div className="border-t h-10 flex justify-center items-center text-sm bg-[#f9f7f7] dark:bg-black">
              © 2026 ConstructEzy. All Rights Reserved.
            </div>
          </main>

        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default layout