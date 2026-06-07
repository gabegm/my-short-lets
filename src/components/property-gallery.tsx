'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PropertyGalleryProps {
  images: { url: string; is_primary?: boolean }[]
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length)
  const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length)

  return (
    <div className="relative">
      {/* Main image */}
      <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden">
        <Image
          src={images[currentIndex].url}
          alt={`Property image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition ${
                i === currentIndex ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
