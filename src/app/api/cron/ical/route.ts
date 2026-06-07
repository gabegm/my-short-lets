import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'
import { parseIcsContent, eventsToBlocks } from '@/lib/ical'

/**
 * Vercel cron endpoint — triggered every 6 hours.
 * Fetches iCal feeds from Airbnb/Booking.com for all active properties,
 * parses blocked dates, and upserts into the database.
 */
export async function GET(req: Request) {
  // Verify cron origin (Vercel sets this header)
  const url = new URL(req.url)
  if (url.hostname !== 'localhost' && !url.hostname.includes('vercel')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Fetch all active properties with iCal URLs
    const { data: properties, error: propsError } = await supabaseServer
      .from('properties')
      .select('id, name, airbnb_ical_url, booking_com_ical_url')
      .eq('is_active', true)

    if (propsError) {
      return NextResponse.json({ error: propsError.message }, { status: 500 })
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({ message: 'No active properties to sync' })
    }

    const results: { propertyId: string; propertyName: string; status: string; eventsParsed: number; errorMessage?: string }[] = []

    for (const property of properties) {
      const propertyBlocks: { startDate: string; endDate: string }[] = []

      // Fetch Airbnb iCal
      if (property.airbnb_ical_url) {
        try {
          const response = await fetch(property.airbnb_ical_url)
          if (response.ok) {
            const content = await response.text()
            const events = parseIcsContent(content)
            const blocks = eventsToBlocks(events)
            propertyBlocks.push(...blocks)
          }
        } catch (e) {
          console.error(`Failed to fetch Airbnb iCal for ${property.name}:`, e)
        }
      }

      // Fetch Booking.com iCal
      if (property.booking_com_ical_url) {
        try {
          const response = await fetch(property.booking_com_ical_url)
          if (response.ok) {
            const content = await response.text()
            const events = parseIcsContent(content)
            const blocks = eventsToBlocks(events)
            propertyBlocks.push(...blocks)
          }
        } catch (e) {
          console.error(`Failed to fetch Booking.com iCal for ${property.name}:`, e)
        }
      }

      // Upsert blocked dates
      let eventsParsed = propertyBlocks.length
      let status = 'success'
      let errorMessage: string | undefined

      try {
        // Delete old blocks from automated sources (will be re-added)
        await supabaseServer
          .from('blocked_dates')
          .delete()
          .match({ property_id: property.id })
          .in('source', ['airbnb', 'booking_com'])

        // Insert new blocks
        if (propertyBlocks.length > 0) {
          const { error: insertError } = await supabaseServer
            .from('blocked_dates')
            .insert(
              propertyBlocks.map((block) => ({
                property_id: property.id,
                start_date: block.startDate,
                end_date: block.endDate,
                source: 'airbnb', // default; could be more granular
              })),
            )

          if (insertError) {
            status = 'error'
            errorMessage = insertError.message
          }
        }
      } catch (e) {
        status = 'error'
        errorMessage = (e as Error).message
      }

      // Log sync result
      await supabaseServer.from('sync_logs').insert({
        property_id: property.id,
        status,
        events_parsed: eventsParsed,
        error_message: errorMessage,
      })

      results.push({
        propertyId: property.id,
        propertyName: property.name,
        status,
        eventsParsed,
        errorMessage,
      })
    }

    return NextResponse.json({ synced: results })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
