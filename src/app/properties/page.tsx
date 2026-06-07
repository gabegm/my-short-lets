import { supabaseServer } from '@/lib/db'
import { PropertyCard } from '@/components/property-card'

interface PropertyWithImages {
  id: string
  name: string
  slug: string
  price_per_night: number | string
  max_guests: number
  property_images?: { url: string; is_primary?: boolean }[]
}

export default async function PropertiesPage() {
  const { data, error } = await supabaseServer
    .from('properties')
    .select(`
      id, name, slug, price_per_night, max_guests,
      property_images (url, is_primary)
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Properties</h1>
        <p className="text-red-600">Failed to load properties. Please try again later.</p>
      </div>
    )
  }

  const properties: PropertyWithImages[] = data || []

  if (properties.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Properties</h1>
        <p className="text-gray-500">No properties available at this time.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Our Properties</h1>
      <p className="text-gray-600 mb-8">Browse our selection of short-term rentals.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
