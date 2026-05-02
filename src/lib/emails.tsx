import * as React from 'react'

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function EmailLayout({ storeName, accentColor = '#6366f1', children }: {
  storeName: string
  accentColor?: string
  children: React.ReactNode
}) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f9fafb', color: '#111827' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#f9fafb', padding: '40px 16px' }}>
          <tr><td align="center">
            <table width="600" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {/* Header */}
              <tr>
                <td style={{ background: '#111827', padding: '24px 32px' }}>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
                    {storeName}
                  </p>
                </td>
              </tr>
              {/* Accent bar */}
              <tr><td style={{ height: '4px', background: accentColor }} /></tr>
              {/* Content */}
              <tr><td style={{ padding: '40px 32px' }}>{children}</td></tr>
              {/* Footer */}
              <tr>
                <td style={{ padding: '24px 32px', borderTop: '1px solid #f3f4f6', background: '#f9fafb' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
                    © {new Date().getFullYear()} {storeName}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  )
}

// ── Order confirmation ────────────────────────────────────────────────────────
export interface OrderConfirmationProps {
  storeName: string
  accentColor?: string
  customerName: string
  orderNumber: string
  orderDate: string
  lineItems: { name: string; variant_name?: string; quantity: number; price: number; image_url?: string }[]
  subtotal: number
  discountAmount?: number
  discountCode?: string
  shippingTotal: number
  taxTotal: number
  total: number
  shippingAddress?: { address1?: string; city?: string; state?: string; zip?: string; country?: string }
  trackingNumber?: string
  trackingUrl?: string
  storeUrl: string
}

export function OrderConfirmationEmail({
  storeName, accentColor = '#6366f1', customerName, orderNumber, orderDate,
  lineItems, subtotal, discountAmount = 0, discountCode, shippingTotal,
  taxTotal, total, shippingAddress, trackingNumber, trackingUrl, storeUrl,
}: OrderConfirmationProps) {
  return (
    <EmailLayout storeName={storeName} accentColor={accentColor}>
      {/* Heading */}
      <p style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 700, color: '#111827' }}>
        Order confirmed! 🎉
      </p>
      <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
        Hi {customerName}, thanks for your order. We&apos;ll let you know when it ships.
      </p>

      {/* Order meta */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '32px', background: '#f9fafb', borderRadius: '12px', padding: '20px' }}>
        <tr>
          <td>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Number</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>#{orderNumber}</p>
          </td>
          <td>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>{orderDate}</p>
          </td>
          {trackingNumber && (
            <td>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking</p>
              {trackingUrl
                ? <a href={trackingUrl} style={{ fontSize: '14px', color: accentColor, fontWeight: 600 }}>{trackingNumber}</a>
                : <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>{trackingNumber}</p>
              }
            </td>
          )}
        </tr>
      </table>

      {/* Line items */}
      <p style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Order Summary</p>
      {lineItems.map((item, i) => (
        <table key={i} width="100%" cellPadding="0" cellSpacing="0"
          style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: i < lineItems.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
          <tr>
            <td style={{ width: '48px', verticalAlign: 'top', paddingRight: '12px' }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} width="48" height="48" style={{ borderRadius: '8px', objectFit: 'cover' }} />
                : <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px' }} />
              }
            </td>
            <td style={{ verticalAlign: 'top' }}>
              <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>{item.name}</p>
              {item.variant_name && <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#9ca3af' }}>{item.variant_name}</p>}
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Qty: {item.quantity}</p>
            </td>
            <td style={{ verticalAlign: 'top', textAlign: 'right', fontWeight: 600, fontSize: '14px' }}>
              ${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        </table>
      ))}

      {/* Totals */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid #111827' }}>
        <tr><td style={{ fontSize: '13px', color: '#6b7280', paddingBottom: '6px' }}>Subtotal</td><td style={{ textAlign: 'right', fontSize: '13px', paddingBottom: '6px' }}>${subtotal.toFixed(2)}</td></tr>
        {discountAmount > 0 && (
          <tr><td style={{ fontSize: '13px', color: '#16a34a', paddingBottom: '6px' }}>Discount {discountCode ? `(${discountCode})` : ''}</td><td style={{ textAlign: 'right', fontSize: '13px', color: '#16a34a', paddingBottom: '6px' }}>-${discountAmount.toFixed(2)}</td></tr>
        )}
        {shippingTotal > 0 && (
          <tr><td style={{ fontSize: '13px', color: '#6b7280', paddingBottom: '6px' }}>Shipping</td><td style={{ textAlign: 'right', fontSize: '13px', paddingBottom: '6px' }}>${shippingTotal.toFixed(2)}</td></tr>
        )}
        {taxTotal > 0 && (
          <tr><td style={{ fontSize: '13px', color: '#6b7280', paddingBottom: '6px' }}>Tax</td><td style={{ textAlign: 'right', fontSize: '13px', paddingBottom: '6px' }}>${taxTotal.toFixed(2)}</td></tr>
        )}
        <tr>
          <td style={{ fontSize: '16px', fontWeight: 700, paddingTop: '8px' }}>Total</td>
          <td style={{ textAlign: 'right', fontSize: '16px', fontWeight: 700, paddingTop: '8px' }}>${total.toFixed(2)}</td>
        </tr>
      </table>

      {/* Shipping address */}
      {shippingAddress?.address1 && (
        <div style={{ marginTop: '32px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipping to</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
            {shippingAddress.address1}<br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}<br />
            {shippingAddress.country}
          </p>
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <a href={`${storeUrl}/account`}
          style={{ display: 'inline-block', padding: '14px 32px', background: '#111827', color: '#ffffff', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          View Order
        </a>
      </div>
    </EmailLayout>
  )
}

// ── Low stock alert (to store owner) ─────────────────────────────────────────
export interface LowStockAlertProps {
  storeName: string
  accentColor?: string
  products: { name: string; variant_name?: string; quantity: number; sku?: string }[]
  adminUrl: string
}

export function LowStockAlertEmail({ storeName, accentColor = '#f59e0b', products, adminUrl }: LowStockAlertProps) {
  return (
    <EmailLayout storeName={storeName} accentColor={accentColor}>
      <p style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700 }}>⚠️ Low Stock Alert</p>
      <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#6b7280' }}>
        The following products are running low and may need restocking.
      </p>
      {products.map((p, i) => (
        <div key={i} style={{ padding: '16px', marginBottom: '8px', background: i % 2 === 0 ? '#fffbeb' : '#fef3c7', borderRadius: '10px', borderLeft: `4px solid ${accentColor}` }}>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600 }}>{p.name}{p.variant_name ? ` — ${p.variant_name}` : ''}</p>
          {p.sku && <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>SKU: {p.sku}</p>}
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#b45309' }}>
            {p.quantity} unit{p.quantity !== 1 ? 's' : ''} remaining
          </p>
        </div>
      ))}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <a href={`${adminUrl}/admin/products`}
          style={{ display: 'inline-block', padding: '14px 32px', background: '#111827', color: '#ffffff', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          Update Inventory
        </a>
      </div>
    </EmailLayout>
  )
}

// ── Abandoned cart recovery ───────────────────────────────────────────────────
export interface AbandonedCartProps {
  storeName: string
  accentColor?: string
  customerName?: string
  items: { name: string; price: number; image_url?: string; quantity: number }[]
  cartTotal: number
  storeUrl: string
}

export function AbandonedCartEmail({ storeName, accentColor = '#6366f1', customerName, items, cartTotal, storeUrl }: AbandonedCartProps) {
  return (
    <EmailLayout storeName={storeName} accentColor={accentColor}>
      <p style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 700 }}>You left something behind 🛒</p>
      <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
        {customerName ? `Hey ${customerName}! ` : ''}Your cart is waiting for you. Complete your purchase before these items sell out.
      </p>
      {items.slice(0, 3).map((item, i) => (
        <table key={i} width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '12px' }}>
          <tr>
            <td style={{ width: '56px', verticalAlign: 'middle', paddingRight: '14px' }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} width="56" height="56" style={{ borderRadius: '10px', objectFit: 'cover' }} />
                : <div style={{ width: '56px', height: '56px', background: '#f3f4f6', borderRadius: '10px' }} />
              }
            </td>
            <td style={{ verticalAlign: 'middle' }}>
              <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600 }}>{item.name}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Qty: {item.quantity} · ${item.price.toFixed(2)}</p>
            </td>
          </tr>
        </table>
      ))}
      {items.length > 3 && (
        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>+ {items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}</p>
      )}
      <p style={{ fontSize: '16px', fontWeight: 700, margin: '16px 0 24px' }}>
        Cart Total: ${cartTotal.toFixed(2)}
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={storeUrl}
          style={{ display: 'inline-block', padding: '16px 40px', background: accentColor, color: '#ffffff', borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
          Complete My Order →
        </a>
      </div>
      <p style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
        Items in your cart are not reserved and may sell out.
      </p>
    </EmailLayout>
  )
}

// ── Newsletter welcome ────────────────────────────────────────────────────────
export interface NewsletterWelcomeProps {
  storeName: string
  accentColor?: string
  storeUrl: string
}

export function NewsletterWelcomeEmail({ storeName, accentColor = '#6366f1', storeUrl }: NewsletterWelcomeProps) {
  return (
    <EmailLayout storeName={storeName} accentColor={accentColor}>
      <p style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 700 }}>Welcome to {storeName}! 👋</p>
      <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
        You&apos;re now subscribed to our newsletter. Expect exclusive deals, new product launches, and early access — right in your inbox.
      </p>
      <div style={{ textAlign: 'center' }}>
        <a href={storeUrl}
          style={{ display: 'inline-block', padding: '14px 32px', background: '#111827', color: '#ffffff', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          Shop Now
        </a>
      </div>
    </EmailLayout>
  )
}
