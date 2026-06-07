import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/db'
import { PropertyGallery } from '@/components/property-gallery'
import { AvailabilityCalendar } from '@/components/availability-calendar'
import { BookingForm } from '@/components/booking-form'

interface PropertyImage {
  url: string
  display_order: number
  is_primary: boolean
}

interface PropertyWithImages {
  id: string
  name: string
  slug: string
  description: string
  price_per_night: number | string
  max_guests: number
  amenities: string[]
  house_rules: string
  check_in_time: string
  check_out_time: string
  property_images?: PropertyImage[]
}

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params

  const { data, error } = await supabaseServer
    .from('properties')
    .select(`
      *,
      property_images (url, display_order, is_primary)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    notFound()
  }

  const property: PropertyWithImages = data
  const images = property.property_images
    ?.sort((a, b) => a.display_order - b.display_order) || []
  const primaryImage = images.find((img) => img.is_primary)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>${Number(property.price_per_night).toFixed(0)} / night</span>
          <span>·</span>
          <span>Up to {property.max_guests} guests</span>
        </div>
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <div className="mb-8">
          <PropertyGallery images={images} />
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Description */}
        <div>
          <h2 className="font-semibold text-lg mb-3">About this place</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Amenities</h2>
          {property.amenities && property.amenities.length > 0 ? (
            <ul className="space-y-1">
              {(property.amenities as string[]).map((amenity: string, i: number) => (
                <li key={i} className="text-gray-700">
                  {amenity}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No amenities listed</p>
          )}
        </div>
      </div>

      {/* House rules */}
      {property.house_rules && (
        <div className="mb-8">
          <div className="p-4 bg-gray-50 rounded-lg w-full">
            <h2 className="font-semibold text-lg mb-3">House Rules</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{property.house_rules}</p>
            <div className="mt-3 text-sm text-gray-600">
              <p>Check-in: {property.check_in_time}</p>
              <p>Check-out: {property.check_out_time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar + Booking Form */}
      <div className="border-t pt-8">
        <h2 className="font-semibold text-xl mb-4">Check Availability</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <AvailabilityCalendar propertyId={property.id} />
          </div>
          <div>
            <BookingForm property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}
