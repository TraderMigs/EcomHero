import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('products').select('*, product_variants(*)').order('sort_order')
  return NextResponse.json({ products: data || [] })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServiceClient()
    const { variants, ...productData } = body

    const { data: product, error } = await supabase
      .from('products')
      .insert({ ...productData, updated_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error

    if (variants?.length) {
      await supabase.from('product_variants').insert(
        variants.map((v: Record<string, unknown>, i: number) => ({ ...v, product_id: product.id, sort_order: i }))
      )
    }

    return NextResponse.json({ product })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
