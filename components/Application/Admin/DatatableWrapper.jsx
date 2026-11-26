'use client'

import React, { useEffect, useState } from 'react'
import { ThemeProvider } from '@mui/material'
// next-themes (not MUI) knows whether the dashboard is in light or dark mode
import { useTheme } from 'next-themes'
import { darkTheme, lightTheme } from '@/lib/materialTheme'
import Datatable from './Datatable'

const DatatableWrapper = ({
    querykey, 
    fetchUrl,
    columnsConfig,
    initialPageSize = 10,
    exportEndpoint,
    deleteEndpoint,
    deleteType,
    trashView,
    createAction,
    renderDetailPanel,        //  ADD — isके bina detail panel kabhi nahi khulega
    defaultHiddenColumns,     //  ADD — isके bina column-hide kaam nahi karega
}) => {

  const {resolvedTheme} = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(()=>{
    setMounted(true)  
  },[])

  if(!mounted) return null

  return (
     <ThemeProvider theme={resolvedTheme === 'dark' ? darkTheme : lightTheme}>
        <Datatable
          querykey={querykey}
          fetchUrl={fetchUrl}
          columnsConfig={columnsConfig}
          initialPageSize={initialPageSize}
          exportEndpoint={exportEndpoint}
          deleteEndpoint={deleteEndpoint}
          deleteType={deleteType}
          trashView={trashView}
          createAction={createAction}
          renderDetailPanel={renderDetailPanel}       // ✅ ADD
          defaultHiddenColumns={defaultHiddenColumns} // ✅ ADD
        />
     </ThemeProvider>

  )
}

export default DatatableWrapper