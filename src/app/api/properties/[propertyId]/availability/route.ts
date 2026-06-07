import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ propertyId: string }> },
) {
  const { propertyId } = await params

  const { data: blockedRanges, error } = await supabaseServer
    .from('blocked_dates')
    .select('start_date, end_date')
    .eq('property_id', propertyId)
    .order('start_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ blockedRanges: (blockedRanges || []).map((b: any) => ({ startDate: b.start_date, endDate: b.end_date })) })
}
