"use client"

import React from "react"
import Link from "next/link"

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
import { LucideChevronRight } from "lucide-react"
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb"

import { adminAppSidebarMenu } from "@/lib/adminSidebarMenu"
import { IMAGES } from "@/routes/AllImages"

/* ==========================================================
   THEME  (change colors only here)
   Keep full Tailwind class names so the compiler can detect them.
   ========================================================== */
const THEME = {
  // Backgrounds
  headerBg: "bg-white",
  contentBg: "bg-slate-50",
  headerBorder: "border-slate-200",

  // Text
  text: "text-slate-700",

  // Main menu hover
  menuHover: "hover:bg-indigo-100 hover:text-indigo-700",

  // Sub menu
  subText: "text-slate-600",
  subHover: "hover:bg-indigo-50 hover:text-indigo-700",
  subBorder: "border-slate-200",

  // Mobile toggle button
  toggleBtn: "bg-indigo-600 hover:bg-indigo-500 text-white",
}

const AppSidebar = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar className="z-50">
      {/* ================= HEADER ================= */}
      <SidebarHeader
        className={`border-b h-14 p-0 ${THEME.headerBg} ${THEME.headerBorder}`}
      >
        <div className="flex justify-between items-center px-4 h-full">
          <img
            src={IMAGES.dashboardlogo}
            alt="Logo"
            className="block dark:hidden w-35 h-12"
          />

          <img
            src={IMAGES.dashboardlogo}
            alt="Logo Dark"
            className="hidden dark:block w-auto h-10"
          />

          <Button
            onClick={toggleSidebar}
            type="button"
            size="icon"
            className={`md:hidden ${THEME.toggleBtn}`}
          >
            <TbLayoutSidebarLeftExpandFilled />
          </Button>
        </div>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}
      <SidebarContent className={`p-3 ${THEME.contentBg}`}>
        <SidebarMenu className={THEME.text}>
          {adminAppSidebarMenu.map((menu, index) => {
            const Icon = menu.icon

            return (
              <Collapsible key={index} className="group/collapsible">
                <SidebarMenuItem>
                  {/* ===== Main Menu Trigger ===== */}
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className={`
                        font-semibold px-2 py-5
                        transition-colors duration-200
                        ${THEME.text} ${THEME.menuHover}
                      `}
                    >
                      <Link
                        href={menu.url ?? "#"}
                        className="flex items-center gap-2 w-full"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{menu.title}</span>

                        {menu.submenu?.length > 0 && (
                          <LucideChevronRight
                            className="
                              ml-auto
                              transition-transform duration-300 ease-in-out
                              group-data-[state=open]/collapsible:rotate-90
                            "
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {/* ===== Sub Menu (Smooth) ===== */}
                  {menu.submenu?.length > 0 && (
                    <CollapsibleContent
                      className="
                        overflow-hidden
                        data-[state=open]:animate-collapsible-down
                        data-[state=closed]:animate-collapsible-up
                      "
                    >
                      <SidebarMenuSub className={`pl-4 ${THEME.subBorder}`}>
                        {menu.submenu.map((submenuItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <SidebarMenuSubButton
                              asChild
                              className={`
                                px-2 py-4
                                transition-colors duration-200
                                ${THEME.subText} ${THEME.subHover}
                              `}
                            >
                              <Link href={submenuItem.url}>
                                {submenuItem.title}
                              </Link>
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

export default AppSidebar



