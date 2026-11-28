'use client'
import React, { useEffect } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Dark mode is only for the admin / shop-owner panels.
// next-themes puts class="dark" + style="color-scheme: dark" on <html>. On client-side
// navigation (panel → homepage) <html> is not re-rendered, so that class would stay and the
// website would turn dark too. When the panel layout unmounts, clean it off.
const ThemeProvider = ({ children, ...props }) => {
  useEffect(() => {
    return () => {
      const html = document.documentElement
      html.classList.remove('dark', 'light')
      html.style.removeProperty('color-scheme')
    }
  }, [])

  return (
    <NextThemesProvider {...props}>{children}</NextThemesProvider>
  )
}

export default ThemeProvider
