import { CheckCircle, Home, Package } from 'lucide-react'

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--brand-secondary)' }}>
      <div className="text-center max-w-md">
        <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Order Confirmed!
        </h1>
        <p className="opacity-60 mb-8 text-sm leading-relaxed">
          Thank you for your purchase. You'll receive a confirmation email shortly. We'll notify you when your order ships.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/" className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--brand-primary)' }}>
            <Home size={16} /> Continue Shopping
          </a>
        </div>
      </div>
    </div>
  )
}
