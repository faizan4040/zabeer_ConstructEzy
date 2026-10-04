"use client"

import React from "react"
import Image from "next/image"
import { IMAGES } from "@/routes/AllImages"

const ConstructionHero = () => {
  return (
    <section className="relative w-full h-[65vh] sm:h-[70vh] overflow-hidden bg-gray-100">
      <Image
        src={IMAGES.homebanner}
        alt="Constructezy Construction Services"
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-center"
      />
    </section>
  )
}

export default ConstructionHero