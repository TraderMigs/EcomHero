import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name, last_name } },
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data.user) return NextResponse.json({ error: 'Signup failed' }, { status: 500 })

    // Create or link customer record
    const service = createServiceClient()
    const { data: existing } = await service
      .from('customers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      // Link existing customer to auth user
      await service
        .from('customers')
        .update({ auth_user_id: data.user.id, first_name, last_name })
        .eq('id', existing.id)
    } else {
      // Create new customer record
      await service
        .from('customers')
        .insert({
          email,
          first_name: first_name || '',
          last_name: last_name || '',
          auth_user_id: data.user.id,
          accepts_marketing: false,
          total_orders: 0,
          total_spent: 0,
        })
    }

    return NextResponse.json({ user: data.user, session: data.session })
  } catch (e) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
