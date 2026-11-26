import { redirect } from 'next/navigation'

// Old URL — profile now lives at /shop/profile
export default function ShopownerEditProfilePage() {
  redirect('/shop/profile')
}
