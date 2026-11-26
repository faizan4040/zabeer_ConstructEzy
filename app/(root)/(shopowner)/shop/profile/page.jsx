import PanelProfile from '@/components/Application/Admin/PanelProfile'
import ShopLocationCard from '@/components/Application/ShopOwner/ShopLocationCard'

export default function ShopProfilePage() {
  return (
    <PanelProfile>
      <div className="mt-6">
        <ShopLocationCard />
      </div>
    </PanelProfile>
  )
}
