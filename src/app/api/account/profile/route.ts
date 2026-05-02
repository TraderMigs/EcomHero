import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data: customer } = await service
      .from('customers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    return NextResponse.json({ customer })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { first_name, last_name, phone } = await req.json()
    const service = createServiceClient()

    const { data: customer, error } = await service
      .from('customers')
      .update({ first_name, last_name, phone, updated_at: new Date().toISOString() })
      .eq('auth_user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ customer })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
