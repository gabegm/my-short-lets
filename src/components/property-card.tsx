import Link from 'next/link'
import Image from 'next/image'

interface PropertyCardProps {
  property: {
    id: string
    name: string
    slug: string
    price_per_night: number | string
    max_guests: number
    property_images?: { url: string; is_primary?: boolean }[]
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.property_images?.find((img) => img.is_primary)
  const thumbnail = property.property_images?.[0]

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {primaryImage || thumbnail ? (
          <Image
            src={primaryImage?.url || thumbnail!.url}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
          {property.name}
        </h2>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>${Number(property.price_per_night).toFixed(0)} / night</span>
          <span>Up to {property.max_guests} guests</span>
        </div>
      </div>
    </Link>
  )
}
