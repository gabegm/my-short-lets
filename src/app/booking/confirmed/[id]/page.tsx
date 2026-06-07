import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/db'
import Link from 'next/link'

interface BookingWithProperty {
  id: string
  guest_name: string
  guest_email: string
  check_in: string
  check_out: string
  guests_count: number
  message: string
  properties?: { name: string | null }
}

interface ConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params

  const { data, error } = await supabaseServer
    .from('booking_requests')
    .select(`
      *,
      properties (name, slug)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const booking: BookingWithProperty = data
  const property = booking.properties

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Booking Request Received!</h1>
        <p className="text-gray-600">
          Thanks for your interest in <strong>{property?.name}</strong>.
        </p>
        <p className="text-gray-600">
          We'll confirm availability and get back to you within 24 hours.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-3">
        <h2 className="font-semibold">Booking Details</h2>
        <p><strong>Request ID:</strong> {booking.id}</p>
        <p><strong>Property:</strong> {property?.name}</p>
        <p><strong>Check-in:</strong> {booking.check_in}</p>
        <p><strong>Check-out:</strong> {booking.check_out}</p>
        <p><strong>Guests:</strong> {booking.guests_count}</p>
        {booking.message && <p><strong>Message:</strong> {booking.message}</p>}
      </div>

      <div className="text-center mt-6">
        <Link href="/properties" className="text-blue-600 hover:underline">
          ← Browse more properties
        </Link>
      </div>
    </div>
  )
}
