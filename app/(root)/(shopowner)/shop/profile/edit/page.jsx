'use client'

import { useEffect, useState } from "react"
import ProfileEditForm from "@/components/Profile/ProfileEditForm"
import ShopLocationCard from "@/components/Application/ShopOwner/ShopLocationCard"
import { USER_DASHBOARD } from "@/routes/WebsiteRoute"

export default function ShopownerEditProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile/get")
        const data = await res.json()
        if (data.success) setUser(data.data)
      } catch (err) {
        console.error("Failed to load profile:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading profile…</div>
  }

  if (!user) {
    return <div className="py-20 text-center text-red-500">Could not load your profile.</div>
  }

  return (
    <div className="py-10 px-4">
      <ProfileEditForm
        apiEndpoint="/api/shopowner/update-profile"
        redirectRoute={USER_DASHBOARD}
        initialUser={user}
      />
      <div className="max-w-lg mx-auto mt-6">
        <ShopLocationCard />
      </div>
    </div>
  )
}