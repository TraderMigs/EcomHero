import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data } = await supabase.from('products').select('*, product_variants(*)').eq('id', params.id).single()
  return NextResponse.json({ product: data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const supabase = createServiceClient()
    const { variants, ...productData } = body

    const { data: product, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Sync variants — delete existing, reinsert
    await supabase.from('product_variants').delete().eq('product_id', params.id)
    if (variants?.length) {
      await supabase.from('product_variants').insert(
        variants.map((v: Record<string, unknown>, i: number) => ({ ...v, product_id: params.id, sort_order: i }))
      )
    }

    return NextResponse.json({ product })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  await supabase.from('product_variants').delete().eq('product_id', params.id)
  await supabase.from('products').delete().eq('id', params.id)
  return NextResponse.json({ success: true })
}
