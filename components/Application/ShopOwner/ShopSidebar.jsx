"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePanelNotifications } from "@/components/Application/Admin/PanelNotifications"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Button } from "@/components/ui/button"
import { LucideChevronRight, Bell, Headset } from "lucide-react"
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb"
import { shopOwnerSidebarMenu } from "@/lib/shopOwnerSidebarMenu"
import { IMAGES } from "@/routes/AllImages"

// ── "Notifications (N)" — same unread count as the header bell (shared store) ──
const NotificationBell = () => {
  const { totalUnseen } = usePanelNotifications()
  const pathname = usePathname()
  const active = pathname?.startsWith("/shop/notifications")

  return (
    <Link
      href="/shop/notifications"
      className={`inline-flex items-center gap-1.5 text-xs font-medium hover:text-white ${active ? "text-white" : "text-gray-300"}`}
    >
      <Bell className="h-4 w-4 text-yellow-400" />
      <span>Notifications</span>
      <span
        className={`rounded-full px-1.5 text-[10px] font-bold ${
          totalUnseen > 0 ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300"
        }`}
      >
        {totalUnseen > 99 ? "99+" : totalUnseen}
      </span>
    </Link>
  )
}

const SidebarTopBar = () => (
  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
    <NotificationBell />
    <Link
      href="/shop/support"
      className="inline-flex items-center gap-1 text-gray-300 hover:text-white text-xs font-medium"
    >
      <Headset className="h-5 w-5 text-green-400" />
      <span>Support</span>
    </Link>
  </div>
)

const ShopSidebar = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar className="z-50">
      <SidebarHeader className="border-b h-14 p-0 bg-gray-800">
        <div className="flex justify-between items-center px-4 h-full">
          <img src={IMAGES.dashboardlogo} alt="Logo" className="block dark:hidden w-35 h-12" />
          <img src={IMAGES.dashboardlogo} alt="Logo Dark" className="hidden dark:block w-auto h-10" />
          <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden text-white">
            <TbLayoutSidebarLeftExpandFilled />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarTopBar />

      <SidebarContent className="p-3 bg-gray-800">
        <SidebarMenu className="text-gray-300">
          {shopOwnerSidebarMenu.map((item, index) => {
            if (item.type === "heading") {
              return (
                <div key={`heading-${index}`} className="mt-4 mb-1 px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-600 pb-1">
                    {item.title}
                  </p>
                </div>
              )
            }

            const Icon = item.icon
            return (
              <Collapsible key={index} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className="font-semibold px-2 py-5 transition-colors duration-200 hover:bg-gray-300"
                    >
                      <Link href={item.url ?? "#"} className="flex items-center gap-2 w-full">
                        <Icon className={`h-4 w-4 ${item.iconColor ?? "text-gray-300"}`} />
                        <span>{item.title}</span>
                        {item.submenu?.length > 0 && (
                          <LucideChevronRight className="ml-auto transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90 hover:text-gray-300" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {item.submenu?.length > 0 && (
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up hover:text-gray-300">
                      <SidebarMenuSub className="pl-4">
                        {item.submenu.map((submenuItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <SidebarMenuSubButton
                              asChild
                              className="px-2 py-4 text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-gray-300"
                            >
                              <Link href={submenuItem.url}>{submenuItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default ShopSidebar

