import { Suspense } from 'react'
import MyBookings from '@/components/Application/Website/Services/MyBookings'

export const metadata = { title: 'My Service Bookings | ConstructEzy' }

export default function Page() {
  return <Suspense fallback={<p className="py-24 text-center text-gray-400">Loading...</p>}><MyBookings /></Suspense>
}
