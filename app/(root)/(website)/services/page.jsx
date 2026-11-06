import { Suspense } from 'react'
import ServicesPage from '@/components/Application/Website/Services/ServicesPage'

export const metadata = { title: 'Home & Construction Services | ConstructEzy' }

export default function Page() {
  return <Suspense fallback={<p className="py-24 text-center text-gray-400">Loading...</p>}><ServicesPage /></Suspense>
}
