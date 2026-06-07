'use client'

import { useState, useTransition } from 'react'
import { submitBookingRequest } from '@/lib/actions'
import { type PropertyInput } from '@/lib/validation'

interface BookingFormProps {
  property: {
    id: string
    name: string
    price_per_night: number | string
  }
}

export function BookingForm({ property }: BookingFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; bookingId?: string; errors?: Record<string, string | string[]> } | null>(null)

  const pricePerNight = Number(property.price_per_night)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)

    const formData = new FormData(e.currentTarget)
    formData.set('propertyId', property.id)

    startTransition(async () => {
      const res = await submitBookingRequest(formData)
      setResult(res)

      if (res.success) {
        // Reset form after successful submission
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  const totalNights = result?.success && result.bookingId
    ? 0 // Would need to recalculate from form values
    : 0

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Request a Booking</h3>

      {result?.success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ Booking request submitted!
          </p>
          <p className="text-green-700 text-sm mt-1">
            We'll confirm availability and get back to you within 24 hours.
          </p>
        </div>
      )}

      {result?.errors && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          {Object.values(result.errors).flat().map((err: string, i: number) => (
            <p key={i} className="text-red-700 text-sm">{err}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Check-in Date</label>
          <input
            type="date"
            name="checkIn"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Check-out Date</label>
          <input
            type="date"
            name="checkOut"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Number of Guests</label>
          <input
            type="number"
            name="guestsCount"
            min={1}
            max={property.price_per_night ? 10 : 1} // placeholder max
            defaultValue={1}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your Name *</label>
          <input
            type="text"
            name="guestName"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="guestEmail"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone (optional)</label>
          <input
            type="tel"
            name="guestPhone"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message (optional)</label>
          <textarea
            name="message"
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Any special requests?"
          />
        </div>

        <input type="hidden" name="propertyId" value={property.id} />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Send Booking Request'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          No payment required now. You'll receive confirmation and payment details after we approve your request.
        </p>
      </form>
    </div>
  )
}
