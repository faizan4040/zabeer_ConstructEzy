import AppSidebar from '@/components/Application/Admin/AppSidebar'
import ThemeProvider from '@/components/Application/Admin/ThemeProvider'
import Topbar from '@/components/Application/Admin/Topbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { PanelNotificationsProvider } from '@/components/Application/Admin/PanelNotifications'

import React from 'react'

// Logged-in, per-user dashboard: render on every request and never let a CDN
// cache it (prevents raw RSC text showing up on Hostinger's CDN).
export const dynamic = 'force-dynamic'

const layout = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PanelNotificationsProvider role="admin">
      <SidebarProvider>
        {/* panel-theme → dashboard light/dark fixes in app/panel-theme.css */}
        <div className="panel-theme flex min-h-screen w-full text-foreground">
          <AppSidebar />
          <main className="flex-1 min-w-0 bg-[#f5f6f8] dark:bg-background">
            <div className="pt-17.5 px-4 md:px-8 min-h-[calc(100vh-40px)] pb-10">
              <Topbar />
              {children}
            </div>

            <div className="border-t h-10 flex justify-center items-center text-sm text-muted-foreground bg-[#f5f6f8] dark:bg-background">
              © 2026 ConstructEzy. All Rights Reserved.
            </div>
          </main>
        </div>
      </SidebarProvider>
      </PanelNotificationsProvider>
    </ThemeProvider>
  )
}

export default layout
