import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const { items, discount_code, discount_amount } = await req.json()
    const supabase = createServiceClient()

    const { data: settings } = await supabase
      .from('store_settings')
      .select('stripe_secret_key_enc, store_name')
      .single()

    if (!settings?.stripe_secret_key_enc) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
    }

    const stripeKey = Buffer.from(settings.stripe_secret_key_enc, 'base64').toString('utf-8')
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const lineItems = items.map((item: {
      name: string; variant_name?: string; price: number; quantity: number; image_url?: string
    }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.variant_name ? `${item.name} — ${item.variant_name}` : item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cart=open`,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ'] },
      automatic_tax: { enabled: true },
      metadata: {
        discount_code: discount_code || '',
        discount_amount: discount_amount?.toString() || '0',
        store: settings.store_name,
      },
    }

    if (discount_amount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount_amount * 100),
        currency: 'usd',
        duration: 'once',
        name: discount_code || 'Discount',
      })
      sessionData.discounts = [{ coupon: coupon.id }]
    }

    const session = await stripe.checkout.sessions.create(sessionData)

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
