import { supabase } from './db'

/**
 * Get all unblocked nights for a property within a date range.
 * Returns an array of date strings (YYYY-MM-DD) for each available night.
 */
export async function getAvailableNights(
  propertyId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string, // YYYY-MM-DD (exclusive — the check-out date)
): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_available_nights', {
    p_property_id: propertyId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) {
    console.error('Error fetching available nights:', error)
    return []
  }

  return data || []
}

/**
 * Check if a date range overlaps with any blocked dates.
 * Returns true if there's any overlap.
 */
export async function hasBlockedDates(
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('id')
    .match({ property_id: propertyId })
    .filter('start_date', '<', endDate)
    .filter('end_date', '>', startDate)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error checking blocked dates:', error)
    return false
  }

  return data !== null
}

/**
 * Get all blocked date ranges for a property.
 */
export async function getBlockedDateRanges(
  propertyId: string,
): Promise<{ startDate: string; endDate: string }[]> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('start_date, end_date')
    .eq('property_id', propertyId)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching blocked date ranges:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    startDate: row.start_date as string,
    endDate: row.end_date as string,
  }))
}
