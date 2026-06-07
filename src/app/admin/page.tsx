import { supabaseServer } from '@/lib/db'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [propsResult, reqResult, pendingResult] = await Promise.all([
    supabaseServer.from('properties').select('id', { count: 'exact', head: true }),
    supabaseServer.from('booking_requests').select('id', { count: 'exact', head: true }),
    supabaseServer
      .from('booking_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const propertiesCount = propsResult.count || 0
  const requestsCount = reqResult.count || 0
  const pendingCount = pendingResult.count || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm text-gray-500">Active Properties</p>
          <p className="text-3xl font-bold">{propertiesCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-3xl font-bold">{requestsCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/properties"
          className="block p-6 border rounded-lg hover:bg-gray-50 transition"
        >
          <h2 className="font-semibold text-lg">Properties</h2>
          <p className="text-gray-600 text-sm">View and manage all properties</p>
        </Link>
        <Link
          href="/admin/requests"
          className="block p-6 border rounded-lg hover:bg-gray-50 transition"
        >
          <h2 className="font-semibold text-lg">Booking Requests</h2>
          <p className="text-gray-600 text-sm">View and manage all booking requests</p>
        </Link>
        <Link
          href="/admin/sync"
          className="block p-6 border rounded-lg hover:bg-gray-50 transition"
        >
          <h2 className="font-semibold text-lg">iCal Sync Status</h2>
          <p className="text-gray-600 text-sm">Monitor and trigger calendar sync</p>
        </Link>
      </div>
    </div>
  )
}
