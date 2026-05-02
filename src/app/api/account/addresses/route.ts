import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

async function getCustomerId(userId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('customers')
    .select('id')
    .eq('auth_user_id', userId)
    .single()
  return data?.id || null
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const customerId = await getCustomerId(user.id)
    if (!customerId) return NextResponse.json({ addresses: [] })

    const service = createServiceClient()
    const { data: addresses } = await service
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false })

    return NextResponse.json({ addresses: addresses || [] })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const customerId = await getCustomerId(user.id)
    if (!customerId) return NextResponse.json({ error: 'No customer record' }, { status: 404 })

    const body = await req.json()
    const service = createServiceClient()

    // If setting as default, clear other defaults first
    if (body.is_default) {
      await service
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId)
    }

    const { data: address, error } = await service
      .from('customer_addresses')
      .insert({ ...body, customer_id: customerId })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ address })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    await service.from('customer_addresses').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
