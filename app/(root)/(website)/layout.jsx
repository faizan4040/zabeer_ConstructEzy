'use client'

import { useSelector } from 'react-redux'
import Footer from '@/components/Website/Footer'
import Header from '@/components/Website/Header'
import LabourHeader from '@/components/Website/LabourHeader'
import GeoUpdater from '@/components/Application/Labour/GeoUpdater'

const Layout = ({ children }) => {
  const auth = useSelector(store => store.authStore.auth)
  const isLabour = auth?.role === 'laber'

  return (
    <>
      {isLabour ? <LabourHeader /> : <Header />}


      {/* Keeps labour's live GPS location flowing to the server */}
      {isLabour && <GeoUpdater userId={auth?._id ?? auth?.id} />}

      <main>
        {children}
      </main>

      <Footer />
    </>
  )
}

export default Layout