import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()
    const supabase = createServiceClient()

    const { data: discount } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (!discount) return NextResponse.json({ valid: false })
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) return NextResponse.json({ valid: false })
    if (discount.max_uses && discount.uses_count >= discount.max_uses) return NextResponse.json({ valid: false })
    if (subtotal < discount.min_order_amount) return NextResponse.json({ valid: false, reason: `Minimum order: $${discount.min_order_amount}` })

    return NextResponse.json({ valid: true, type: discount.type, value: discount.value })
  } catch (e) {
    console.error('Discount error:', e)
    return NextResponse.json({ valid: false })
  }
}
