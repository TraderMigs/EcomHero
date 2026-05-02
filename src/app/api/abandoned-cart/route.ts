import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Called when customer enters their email at checkout but doesn't complete
// Also called when cart has items and user is idle (from Cart component)
export async function POST(req: NextRequest) {
  try {
    const { email, items, total, customer_name } = await req.json()
    if (!email || !items?.length) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Upsert abandoned cart — one per email, overwrite with latest
    await supabase
      .from('abandoned_carts')
      .upsert({
        email: email.toLowerCase().trim(),
        customer_name: customer_name || null,
        items,
        total,
        recovered: false,
        email_sent: false,
        created_at: new Date().toISOString(),
        send_after: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      }, { onConflict: 'email' })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Abandoned cart error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Called by Supabase cron / edge function to process pending carts
export async function GET() {
  try {
    const supabase = createServiceClient()
    const { sendAbandonedCart } = await import('@/lib/mailer')

    // Find carts ready to send (1hr passed, not yet sent, not recovered)
    const { data: carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('email_sent', false)
      .eq('recovered', false)
      .lte('send_after', new Date().toISOString())
      .limit(50)

    let sent = 0
    for (const cart of carts || []) {
      await sendAbandonedCart({
        to: cart.email,
        customerName: cart.customer_name || undefined,
        items: cart.items,
        cartTotal: cart.total,
      })
      await supabase
        .from('abandoned_carts')
        .update({ email_sent: true })
        .eq('id', cart.id)
      sent++
    }

    return NextResponse.json({ processed: sent })
  } catch (e) {
    console.error('Abandoned cart cron error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
