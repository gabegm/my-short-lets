import Link from 'next/link'
import { supabaseServer } from '@/lib/db'

export default async function AdminPropertiesPage() {
  const { data: properties, error } = await supabaseServer
    .from('properties')
    .select('*')
    .order('name')

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Properties</h1>
        <p className="text-red-600">Error loading properties: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Link href="/admin/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-gray-500">No properties yet. <Link href="/admin/properties/new" className="text-blue-600 hover:underline">Add one</Link>.</p>
      ) : (
        <div className="space-y-4">
          {properties.map((prop: any) => (
            <div key={prop.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
              <div>
                <Link href={`/admin/properties/${prop.id}`} className="font-semibold text-blue-600 hover:underline">
                  {prop.name}
                </Link>
                <p className="text-sm text-gray-500">
                  ${prop.price_per_night}/night · Up to {prop.max_guests} guests · {prop.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/properties/${prop.id}`} className="text-sm text-blue-600 hover:underline">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  )
}
