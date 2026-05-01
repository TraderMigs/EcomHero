import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const supabase = createServiceClient()
  const { data: settings } = await supabase
    .from('store_settings')
    .select('stripe_secret_key_enc, stripe_webhook_secret_enc')
    .single()

  if (!settings?.stripe_secret_key_enc) {
    return NextResponse.json({ error: 'Not configured' }, { status: 400 })
  }

  const stripeKey = Buffer.from(settings.stripe_secret_key_enc, 'base64').toString('utf-8')
  const webhookSecret = settings.stripe_webhook_secret_enc
    ? Buffer.from(settings.stripe_webhook_secret_enc, 'base64').toString('utf-8')
    : ''

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const customerEmail = session.customer_details?.email || ''

    let customerId: string | null = null
    if (customerEmail) {
      const { data: customer } = await supabase
        .from('customers')
        .upsert({
          email: customerEmail,
          first_name: session.customer_details?.name?.split(' ')[0],
          last_name: session.customer_details?.name?.split(' ').slice(1).join(' '),
        }, { onConflict: 'email' })
        .select('id')
        .single()
      customerId = customer?.id || null
    }

    const orderNumber = `EH-${Date.now().toString().slice(-6)}`

    await supabase.from('orders').insert({
      order_number: orderNumber,
      customer_id: customerId,
      customer_email: customerEmail,
      status: 'processing',
      financial_status: 'paid',
      fulfillment_status: 'unfulfilled',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      subtotal: (session.amount_subtotal || 0) / 100,
      shipping_total: 0,
      tax_total: (session.total_details?.amount_tax || 0) / 100,
      total: (session.amount_total || 0) / 100,
      discount_code: session.metadata?.discount_code || null,
      discount_amount: parseFloat(session.metadata?.discount_amount || '0'),
      shipping_address: session.shipping_details ? {
        first_name: session.shipping_details.name?.split(' ')[0],
        last_name: session.shipping_details.name?.split(' ').slice(1).join(' '),
        address1: session.shipping_details.address?.line1,
        address2: session.shipping_details.address?.line2,
        city: session.shipping_details.address?.city,
        state: session.shipping_details.address?.state,
        zip: session.shipping_details.address?.postal_code,
        country: session.shipping_details.address?.country,
      } : null,
      line_items: [],
      currency: session.currency?.toUpperCase() || 'USD',
    })

    // Update customer totals — non-critical, wrapped in try/catch
    if (customerId) {
      try {
        await supabase.rpc('increment_customer_stats', {
          cid: customerId,
          amount: (session.amount_total || 0) / 100,
        })
      } catch {
        // non-critical, ignore
      }
    }
  }

  return NextResponse.json({ received: true })
}
