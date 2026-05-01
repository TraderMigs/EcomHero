'use client'
import { useState } from 'react'
import { X, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react'
import { StoreSettings } from '@/types'
import toast from 'react-hot-toast'

interface CartItem {
  product_id: string
  variant_id?: string
  name: string
  variant_name?: string
  price: number
  quantity: number
  image_url?: string
}

interface Props {
  open: boolean
  items: CartItem[]
  onClose: () => void
  onUpdateQty: (productId: string, variantId: string | undefined, qty: number) => void
  settings: StoreSettings
}

export default function Cart({ open, items, onClose, onUpdateQty, settings }: Props) {
  const [loading, setLoading] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState<{ code: string; value: number; type: string } | null>(null)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discountAmount = discountApplied
    ? discountApplied.type === 'percentage'
      ? subtotal * (discountApplied.value / 100)
      : Math.min(discountApplied.value, subtotal)
    : 0
  const total = subtotal - discountAmount

  const applyDiscount = async () => {
    if (!discountCode.trim()) return
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscountApplied({ code: discountCode, value: data.value, type: data.type })
        toast.success(`Discount applied! -${data.type === 'percentage' ? data.value + '%' : '$' + data.value}`)
      } else {
        toast.error('Invalid or expired discount code')
      }
    } catch {
      toast.error('Error applying discount')
    }
  }

  const checkout = async () => {
    if (!items.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          discount_code: discountApplied?.code,
          discount_amount: discountAmount,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Checkout error. Please try again.')
      }
    } catch {
      toast.error('Checkout error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--brand-secondary)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Your Cart {items.length > 0 && <span className="text-sm font-normal opacity-50">({items.reduce((s, i) => s + i.quantity, 0)} items)</span>}
          </h2>
          <button onClick={onClose} className="p-2 hover:opacity-60 transition-opacity">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
              <ShoppingBag size={48} />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div key={`${item.product_id}-${item.variant_id}`}
                  className="flex gap-4 pb-4 border-b" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }}>
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                    {item.variant_name && <p className="text-xs opacity-50 mb-2">{item.variant_name}</p>}
                    <div className="flex items-center gap-3">
                      <button onClick={() => onUpdateQty(item.product_id, item.variant_id, item.quantity - 1)}
                        className="p-1 border rounded hover:bg-gray-50"><Minus size={12} /></button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.product_id, item.variant_id, item.quantity + 1)}
                        className="p-1 border rounded hover:bg-gray-50"><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => onUpdateQty(item.product_id, item.variant_id, 0)}
                      className="text-xs opacity-40 hover:opacity-70 mt-1">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
            {/* Discount */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Discount code"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none"
                style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
              />
              <button onClick={applyDiscount}
                className="px-4 py-2 text-sm font-semibold border rounded hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--brand-primary)' }}>
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-2 mb-4 text-sm">
              <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount ({discountApplied?.code})</span><span>-${discountAmount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between opacity-50 text-xs"><span>Shipping & taxes calculated at checkout</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={checkout} disabled={loading}
              className="w-full py-4 font-semibold text-sm tracking-widest uppercase rounded transition-all hover:opacity-90 text-white flex items-center justify-center gap-2"
              style={{ background: 'var(--brand-primary)' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
