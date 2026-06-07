import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/db'
import Link from 'next/link'

interface PropertyImage {
  id: string
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
  is_active: boolean
  airbnb_ical_url: string | null
  booking_com_ical_url: string | null
  property_images?: PropertyImage[]
}

interface PropertyEditorPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyEditorPage({ params }: PropertyEditorPageProps) {
  const { id } = await params

  // Check if we're creating a new property or editing
  const isNew = id === 'new'

  let property: PropertyWithImages | null = null
  let images: PropertyImage[] = []

  if (!isNew) {
    const { data, error } = await supabaseServer
      .from('properties')
      .select(`
        *,
        property_images (id, url, display_order, is_primary)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      notFound()
    }

    property = data
    images = (property as PropertyWithImages).property_images?.sort((a, b) => a.display_order - b.display_order) || []
  }

  const safeProperty = isNew ? null : property

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? 'Add Property' : 'Edit Property'}
        </h1>
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <form action={`/admin/properties${isNew ? '' : `/${id}`}`} method="POST" className="space-y-6">
        {/* Basic info */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Property Name *</label>
            <input
              type="text"
              name="name"
              defaultValue={safeProperty?.name || ''}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Slug *</label>
            <input
              type="text"
              name="slug"
              defaultValue={safeProperty?.slug || ''}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="cozy-downtown-loft"
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              defaultValue={safeProperty?.description || ''}
              required
              rows={4}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Pricing & capacity */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Pricing & Capacity</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price per Night ($) *</label>
              <input
                type="number"
                name="pricePerNight"
                defaultValue={safeProperty?.price_per_night || ''}
                required
                min="0"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Guests *</label>
              <input
                type="number"
                name="maxGuests"
                defaultValue={safeProperty?.max_guests || 1}
                required
                min="1"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Amenities</h2>
          <p className="text-xs text-gray-500">Enter one amenity per line (e.g., WiFi, Kitchen, Parking)</p>
          <textarea
            name="amenities"
            defaultValue={safeProperty?.amenities?.join('\n') || ''}
            rows={4}
            placeholder="WiFi\nKitchen\nParking\nTV"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* House rules */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">House Rules</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Check-in Time</label>
              <input
                type="text"
                name="checkInTime"
                defaultValue={safeProperty?.check_in_time || '15:00'}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Check-out Time</label>
              <input
                type="text"
                name="checkOutTime"
                defaultValue={safeProperty?.check_out_time || '11:00'}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">House Rules</label>
            <textarea
              name="houseRules"
              defaultValue={safeProperty?.house_rules || ''}
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* iCal URLs */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Calendar Sync (iCal)</h2>
          <p className="text-xs text-gray-500">
            Paste your Airbnb/Booking.com iCal export URLs. The site will sync availability every 6 hours.
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">Airbnb iCal URL</label>
            <input
              type="url"
              name="airbnbIcalUrl"
              defaultValue={safeProperty?.airbnb_ical_url || ''}
              placeholder="https://www.airbnb.com/rooms/XXXX/calendar.ics"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Booking.com iCal URL</label>
            <input
              type="url"
              name="bookingComIcalUrl"
              defaultValue={safeProperty?.booking_com_ical_url || ''}
              placeholder="https://www.booking.com/calendar/XXXX.ics"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Image upload */}
        {!isNew && images.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Property Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <label className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      name={`imagePrimary_${img.id}`}
                      className="sr-only peer"
                    />
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 peer-checked:opacity-100 transition">
                      Primary
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              To add or remove images, use the Supabase dashboard or the image management API.
            </p>
          </div>
        )}

        {/* Active toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            defaultChecked={safeProperty?.is_active !== false}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active (visible on public site)
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {isNew ? 'Create Property' : 'Save Property'}
          </button>
          {!isNew && (
            <Link
              href="/admin"
              className="px-6 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </Link>
          )}
        </div>
      </form>
    </div>
  )
}
