import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const supabase = createServiceClient()
    const { data: discount, error } = await supabase
      .from('discount_codes')
      .insert({
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        min_order_amount: data.min_order_amount || 0,
        max_uses: data.max_uses || null,
        expires_at: data.expires_at || null,
        is_active: true,
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ discount })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ discounts: data || [] })
}
