import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { sendOrderConfirmation, sendLowStockAlert } from '@/lib/mailer'

const LOW_STOCK_THRESHOLD = 5

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const supabase = createServiceClient()
  const { data: settings } = await supabase
    .from('store_settings')
    .select('stripe_secret_key_enc, stripe_webhook_secret_enc, store_name')
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
    const customerName = session.customer_details?.name || ''

    // Upsert customer
    let customerId: string | null = null
    if (customerEmail) {
      const { data: customer } = await supabase
        .from('customers')
        .upsert({
          email: customerEmail,
          first_name: customerName.split(' ')[0],
          last_name: customerName.split(' ').slice(1).join(' '),
        }, { onConflict: 'email' })
        .select('id')
        .single()
      customerId = customer?.id || null
    }

    const orderNumber = `EH-${Date.now().toString().slice(-6)}`
    const lineItemsRaw = session.metadata?.line_items
      ? JSON.parse(session.metadata.line_items)
      : []

    const shippingAddress = session.shipping_details ? {
      first_name: session.shipping_details.name?.split(' ')[0],
      last_name: session.shipping_details.name?.split(' ').slice(1).join(' '),
      address1: session.shipping_details.address?.line1,
      address2: session.shipping_details.address?.line2,
      city: session.shipping_details.address?.city,
      state: session.shipping_details.address?.state,
      zip: session.shipping_details.address?.postal_code,
      country: session.shipping_details.address?.country,
    } : null

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
      discount_total: parseFloat(session.metadata?.discount_amount || '0'),
      shipping_address: shippingAddress,
      line_items: lineItemsRaw,
      currency: session.currency?.toUpperCase() || 'USD',
    })

    // Update customer totals
    if (customerId) {
      try {
        await supabase.rpc('increment_customer_stats', {
          cid: customerId,
          amount: (session.amount_total || 0) / 100,
        })
      } catch {}
    }

    // ── Decrement inventory for tracked variants/products ────────────────────
    const lowStockItems: { name: string; variant_name?: string; quantity: number; sku?: string }[] = []

    for (const item of lineItemsRaw) {
      if (item.variant_id) {
        // Decrement variant inventory
        const { data: variant } = await supabase
          .from('product_variants')
          .select('inventory_quantity, name, sku, product_id')
          .eq('id', item.variant_id)
          .single()

        if (variant) {
          const newQty = Math.max(0, (variant.inventory_quantity || 0) - item.quantity)
          await supabase
            .from('product_variants')
            .update({ inventory_quantity: newQty })
            .eq('id', item.variant_id)

          if (newQty <= LOW_STOCK_THRESHOLD) {
            const { data: product } = await supabase
              .from('products')
              .select('name')
              .eq('id', variant.product_id)
              .single()
            lowStockItems.push({
              name: product?.name || 'Unknown',
              variant_name: variant.name,
              quantity: newQty,
              sku: variant.sku,
            })
          }
        }
      } else if (item.product_id) {
        // Decrement product inventory
        const { data: product } = await supabase
          .from('products')
          .select('inventory_quantity, track_inventory, name, sku')
          .eq('id', item.product_id)
          .single()

        if (product?.track_inventory) {
          const newQty = Math.max(0, (product.inventory_quantity || 0) - item.quantity)
          await supabase
            .from('products')
            .update({ inventory_quantity: newQty })
            .eq('id', item.product_id)

          if (newQty <= LOW_STOCK_THRESHOLD) {
            lowStockItems.push({ name: product.name, quantity: newQty, sku: product.sku })
          }
        }
      }
    }

    // ── Send order confirmation email ────────────────────────────────────────
    if (customerEmail) {
      await sendOrderConfirmation({
        to: customerEmail,
        customerName: customerName.split(' ')[0] || 'there',
        orderNumber,
        orderDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        lineItems: lineItemsRaw,
        subtotal: (session.amount_subtotal || 0) / 100,
        discountAmount: parseFloat(session.metadata?.discount_amount || '0'),
        discountCode: session.metadata?.discount_code || undefined,
        shippingTotal: 0,
        taxTotal: (session.total_details?.amount_tax || 0) / 100,
        total: (session.amount_total || 0) / 100,
        shippingAddress: shippingAddress || undefined,
      })
    }

    // ── Send low stock alert to owner ────────────────────────────────────────
    if (lowStockItems.length > 0) {
      await sendLowStockAlert({ products: lowStockItems })
    }
  }

  return NextResponse.json({ received: true })
}
