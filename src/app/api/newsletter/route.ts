import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNewsletterWelcome } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'footer' } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ message: 'Already subscribed' })
      }
      // Reactivate
      await supabase
        .from('email_subscribers')
        .update({ is_active: true, subscribed_at: new Date().toISOString() })
        .eq('id', existing.id)
      return NextResponse.json({ success: true })
    }

    await supabase.from('email_subscribers').insert({
      email: email.toLowerCase().trim(),
      source,
      is_active: true,
      subscribed_at: new Date().toISOString(),
    })

    // Send welcome email
    await sendNewsletterWelcome(email.toLowerCase().trim())

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Newsletter subscribe error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// CSV export — admin only via service role
export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { data: subscribers } = await supabase
      .from('email_subscribers')
      .select('email, source, subscribed_at')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })

    const csv = [
      'Email,Source,Subscribed At',
      ...(subscribers || []).map(s =>
        `${s.email},${s.source},${new Date(s.subscribed_at).toLocaleDateString()}`
      )
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${Date.now()}.csv"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
