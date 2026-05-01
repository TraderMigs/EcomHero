import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServiceClient()
    const { data: page, error } = await supabase.from('pages').insert({ ...body, content: body.content || [], updated_at: new Date().toISOString() }).select().single()
    if (error) throw error
    return NextResponse.json({ page })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('pages').select('*').order('sort_order')
  return NextResponse.json({ pages: data || [] })
}
