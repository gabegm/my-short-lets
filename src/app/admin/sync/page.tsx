import { supabaseServer } from '@/lib/db'
import Link from 'next/link'

interface SyncLog {
  id: string
  property_id: string | null
  status: string
  events_parsed: number
  error_message: string | null
  run_at: string
  properties?: { name: string | null }
}

interface Property {
  id: string
  name: string
  airbnb_ical_url: string | null
  booking_com_ical_url: string | null
}

export default async function AdminSyncPage() {
  const [propsResult, logsResult] = await Promise.all([
    supabaseServer.from('properties').select('id, name, airbnb_ical_url, booking_com_ical_url'),
    supabaseServer
      .from('sync_logs')
      .select('*, properties(name)')
      .order('run_at', { ascending: false })
      .limit(50),
  ])

  const properties: Property[] = propsResult.data || []
  const syncLogs: SyncLog[] = logsResult.data || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">iCal Sync Status</h1>
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Property sync status */}
      <h2 className="font-semibold text-lg mb-3">Property Sync Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {properties.map((property) => {
          const lastSync = syncLogs
            .filter((log) => log.property_id === property.id)
            .sort((a, b) => new Date(b.run_at).getTime() - new Date(a.run_at).getTime())[0]

          return (
            <div key={property.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{property.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {property.airbnb_ical_url ? '✓ Airbnb iCal configured' : '✗ No Airbnb iCal'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {property.booking_com_ical_url ? '✓ Booking.com iCal configured' : '✗ No Booking.com iCal'}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lastSync?.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : lastSync?.status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {lastSync ? (lastSync.status === 'success' ? 'Synced' : 'Error') : 'Never synced'}
                </span>
              </div>
              {lastSync?.run_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Last sync: {new Date(lastSync.run_at).toLocaleString()}
                </p>
              )}
              {lastSync?.error_message && (
                <p className="text-xs text-red-600 mt-1">{lastSync.error_message}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent sync logs */}
      <h2 className="font-semibold text-lg mb-3">Recent Sync Logs</h2>
      {syncLogs.length === 0 && (
        <p className="text-gray-500">No sync logs yet. The first sync will run on the next cron job.</p>
      )}

      {syncLogs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Property</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Events Parsed</th>
                <th className="pb-3 pr-4">Error</th>
                <th className="pb-3 pr-4">Run At</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="py-2 pr-4">{log.properties?.name || 'Unknown'}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{log.events_parsed}</td>
                  <td className="py-2 pr-4 text-red-600 text-xs">{log.error_message || '—'}</td>
                  <td className="py-2 pr-4">{new Date(log.run_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
