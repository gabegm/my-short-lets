'use server'

import { z } from 'zod'
import { supabaseServer } from '@/lib/db'
import { bookingRequestSchema } from '@/lib/validation'
import { hasBlockedDates } from '@/lib/availability'
import { sendBookingRequestEmail, sendBookingConfirmationEmail } from '@/lib/email'

export async function submitBookingRequest(formData: FormData) {
  const data = {
    guestName: formData.get('guestName')?.toString() || '',
    guestEmail: formData.get('guestEmail')?.toString() || '',
    guestPhone: formData.get('guestPhone')?.toString() || '',
    checkIn: formData.get('checkIn')?.toString() || '',
    checkOut: formData.get('checkOut')?.toString() || '',
    guestsCount: parseInt(formData.get('guestsCount')?.toString() || '1', 10),
    message: formData.get('message')?.toString() || '',
  }

  const parsed = bookingRequestSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  // Check for overlapping blocked dates
  const isBlocked = await hasBlockedDates(
    formData.get('propertyId') as string,
    parsed.data.checkIn,
    parsed.data.checkOut,
  )

  if (isBlocked) {
    return {
      success: false,
      errors: {
        _form: 'Some of your selected dates are no longer available. Please adjust your dates.',
      },
    }
  }

  // Insert booking request
  const { data: booking, error } = await supabaseServer
    .from('booking_requests')
    .insert({
      property_id: formData.get('propertyId') as string,
      guest_name: parsed.data.guestName,
      guest_email: parsed.data.guestEmail,
      guest_phone: parsed.data.guestPhone || null,
      check_in: parsed.data.checkIn,
      check_out: parsed.data.checkOut,
      guests_count: parsed.data.guestsCount,
      message: parsed.data.message,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating booking request:', error)
    return { success: false, errors: { _form: 'Something went wrong. Please try again.' } }
  }

  // Get property name for emails
  const { data: property } = await supabaseServer
    .from('properties')
    .select('name')
    .eq('id', formData.get('propertyId') as string)
    .single()

  const bookingData = {
    propertyId: formData.get('propertyId') as string,
    propertyName: property?.name || 'Property',
    guestName: parsed.data.guestName,
    guestEmail: parsed.data.guestEmail,
    guestPhone: parsed.data.guestPhone || undefined,
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    guestsCount: parsed.data.guestsCount,
    message: parsed.data.message || undefined,
  }

  // Send emails (non-blocking — log errors but don't fail the request)
  try {
    await sendBookingRequestEmail(bookingData)
  } catch (emailError) {
    console.error('Failed to send host notification email:', emailError)
  }

  try {
    await sendBookingConfirmationEmail(bookingData)
  } catch (emailError) {
    console.error('Failed to send guest confirmation email:', emailError)
  }

  return { success: true, bookingId: booking.id }
}

export async function approveBookingRequest(requestId: string) {
  const { error: updateError } = await supabaseServer
    .from('booking_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Get the booking details to create blocked dates
  const { data: booking } = await supabaseServer
    .from('booking_requests')
    .select('property_id, check_in, check_out')
    .eq('id', requestId)
    .single()

  if (!booking) {
    return { success: false, error: 'Booking request not found' }
  }

  // Insert blocked dates
  const { error: blockError } = await supabaseServer
    .from('blocked_dates')
    .insert({
      property_id: booking.property_id,
      start_date: booking.check_in,
      end_date: booking.check_out,
      source: 'manual',
    })

  if (blockError) {
    return { success: false, error: blockError.message }
  }

  return { success: true }
}

export async function denyBookingRequest(requestId: string) {
  const { error } = await supabaseServer
    .from('booking_requests')
    .update({ status: 'denied' })
    .eq('id', requestId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function cancelBookingRequest(requestId: string) {
  const { data: booking } = await supabaseServer
    .from('booking_requests')
    .select('property_id, check_in, check_out')
    .eq('id', requestId)
    .single()

  if (!booking) {
    return { success: false, error: 'Booking request not found' }
  }

  const { error: updateError } = await supabaseServer
    .from('booking_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Remove corresponding blocked dates
  await supabaseServer
    .from('blocked_dates')
    .delete()
    .match({
      property_id: booking.property_id,
      start_date: booking.check_in,
      end_date: booking.check_out,
      source: 'manual',
    })

  return { success: true }
}
