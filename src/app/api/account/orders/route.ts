import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()

    // Get customer record
    const { data: customer } = await service
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!customer) return NextResponse.json({ orders: [] })

    const { data: orders } = await service
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders: orders || [] })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
