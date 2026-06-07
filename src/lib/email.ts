import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const hostEmail = process.env.HOST_EMAIL || 'admin@example.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Short Lets'

interface BookingData {
  propertyId: string
  propertyName: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  guestsCount: number
  message?: string
}

/**
 * Send notification email to the host about a new booking request.
 */
export async function sendBookingRequestEmail(booking: BookingData): Promise<void> {
  const html = `
    <h2>New Booking Request</h2>
    <p><strong>Property:</strong> ${escapeHtml(booking.propertyName)}</p>
    <p><strong>Guest:</strong> ${escapeHtml(booking.guestName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(booking.guestEmail)}</p>
    ${booking.guestPhone ? `<p><strong>Phone:</strong> ${escapeHtml(booking.guestPhone)}</p>` : ''}
    <p><strong>Check-in:</strong> ${booking.checkIn}</p>
    <p><strong>Check-out:</strong> ${booking.checkOut}</p>
    <p><strong>Guests:</strong> ${booking.guestsCount}</p>
    ${booking.message ? `<p><strong>Message:</strong> ${escapeHtml(booking.message)}</p>` : ''}
  `

  await resend.emails.send({
    from: `Bookings <bookings@${process.env.NEXT_PUBLIC_DOMAIN || 'localhost'}>`,
    to: [hostEmail],
    subject: `New Booking Request — ${booking.propertyName}`,
    html,
  })
}

/**
 * Send confirmation email to the guest after submitting a booking request.
 */
export async function sendBookingConfirmationEmail(booking: BookingData): Promise<void> {
  const html = `
    <h2>Booking Request Received</h2>
    <p>Hi ${escapeHtml(booking.guestName)},</p>
    <p>Thanks for your interest in <strong>${escapeHtml(booking.propertyName)}</strong>!</p>
    <p>We've received your request for <strong>${booking.checkIn} to ${booking.checkOut}</strong>.</p>
    <p>We'll confirm availability and get back to you within 24 hours.</p>
    <p>Best regards,<br>${escapeHtml(siteName)}</p>
  `

  await resend.emails.send({
    from: `Bookings <bookings@${process.env.NEXT_PUBLIC_DOMAIN || 'localhost'}>`,
    to: [booking.guestEmail],
    subject: `We received your booking request — ${booking.propertyName}`,
    html,
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
