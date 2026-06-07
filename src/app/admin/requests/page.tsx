import { supabaseServer } from '@/lib/db'
import { approveBookingRequest, denyBookingRequest } from '@/lib/actions'
import Link from 'next/link'

interface BookingRequestWithProperty {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in: string
  check_out: string
  guests_count: number
  message: string
  status: string
  created_at: string
  property_id: string
  properties?: { name: string | null; slug: string | null }
}

interface AdminRequestsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  const { status } = await searchParams

  let query = supabaseServer
    .from('booking_requests')
    .select(`
      *,
      properties (name, slug)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Booking Requests</h1>
        <p className="text-red-600">Failed to load requests.</p>
      </div>
    )
  }

  const requests: BookingRequestWithProperty[] = data || []
  const statuses = ['pending', 'approved', 'denied', 'cancelled'] as const

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/admin/requests"
          className={`px-3 py-1 rounded-full text-sm border ${
            !status ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/requests?status=${s}`}
            className={`px-3 py-1 rounded-full text-sm border capitalize ${
              status === s ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {(!requests || requests.length === 0) && (
        <p className="text-gray-500">No booking requests found.</p>
      )}

      {requests && requests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Property</th>
                <th className="pb-3 pr-4">Guest</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Dates</th>
                <th className="pb-3 pr-4">Guests</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const property = req.properties
                return (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/properties/${property?.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {property?.name || 'Unknown'}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{req.guest_name}</td>
                    <td className="py-3 pr-4">{req.guest_email}</td>
                    <td className="py-3 pr-4">
                      {req.check_in} → {req.check_out}
                    </td>
                    <td className="py-3 pr-4">{req.guests_count}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : req.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : req.status === 'denied'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <form
                            action={async () => {
                              'use server'
                              await approveBookingRequest(req.id)
                              // Revalidate the page
                              throw new Response(null, { status: 303, headers: { Location: '/admin/requests' } })
                            }}
                          >
                            <button
                              type="submit"
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Approve
                            </button>
                          </form>
                          <form
                            action={async () => {
                              'use server'
                              await denyBookingRequest(req.id)
                              throw new Response(null, { status: 303, headers: { Location: '/admin/requests' } })
                            }}
                          >
                            <button
                              type="submit"
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                            >
                              Deny
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
