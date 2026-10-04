'use client'

import { Card } from "@/components/ui/card"

const StatusCard = ({ title, count, icon, bgColor, textColor }) => {
  return (
    <Card className={`flex flex-col sm:flex-row justify-between items-center p-4 ${bgColor} ${textColor} rounded-xl shadow-md`}>
      <div className="flex flex-col items-start sm:items-start">
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-2xl font-bold mt-1">{count}</span>
      </div>
      <div className="text-4xl mt-2 sm:mt-0 bg-orange-200 p-4 rounded-2xl text-yellow-500">{icon}</div>
    </Card>
  )
}

export default StatusCard