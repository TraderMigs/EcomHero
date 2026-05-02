'use client'
import { useState, useEffect, useRef } from 'react'
import { Eye, ShoppingBag } from 'lucide-react'

interface Props {
  products: { name: string; images?: { url: string }[] }[]
}

type Notification = {
  id: number
  type: 'view' | 'purchase'
  text: string
  image?: string
}

const FIRST_NAMES = ['Emma','Liam','Olivia','Noah','Ava','Elijah','Sophia','Lucas','Isabella','Mason',
  'Mia','Logan','Charlotte','Ethan','Amelia','Aiden','Harper','Carter','Evelyn','Jackson']
const CITIES = ['New York','Los Angeles','Chicago','Houston','Phoenix','Austin','Seattle','Miami',
  'Denver','Portland','Atlanta','Boston','Nashville','San Diego','Dallas']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function SocialProofTicker({ products }: Props) {
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 18) + 7)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [visible, setVisible] = useState(false)
  const notifIdRef = useRef(0)

  // Fluctuate viewer count every 8–20s
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(v => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(3, Math.min(45, v + delta))
      })
    }, Math.random() * 12000 + 8000)
    return () => clearInterval(interval)
  }, [])

  // Show purchase/view notifications every 25–55s
  useEffect(() => {
    if (!products.length) return

    const show = () => {
      const id = ++notifIdRef.current
      const product = randomFrom(products)
      const name = randomFrom(FIRST_NAMES)
      const city = randomFrom(CITIES)
      const isPurchase = Math.random() > 0.35

      setNotification({
        id,
        type: isPurchase ? 'purchase' : 'view',
        text: isPurchase
          ? `${name} from ${city} just purchased ${product.name}`
          : `${name} from ${city} is viewing ${product.name}`,
        image: product.images?.[0]?.url,
      })
      setVisible(true)

      // Hide after 5s
      setTimeout(() => {
        setVisible(false)
        setTimeout(() => setNotification(n => n?.id === id ? null : n), 400)
      }, 5000)
    }

    // First one after 12s
    const first = setTimeout(show, 12000)
    // Then recurring
    const interval = setInterval(show, Math.random() * 30000 + 25000)

    return () => { clearTimeout(first); clearInterval(interval) }
  }, [products])

  return (
    <>
      {/* Viewer count badge — subtle, top of product section */}
      <div className="flex items-center gap-1.5 text-xs opacity-50 mb-4">
        <Eye size={13} />
        <span><strong>{viewerCount}</strong> people viewing now</span>
      </div>

      {/* Purchase/view popup — bottom left */}
      {notification && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl max-w-xs transition-all duration-400 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ background: 'var(--brand-secondary)', border: '1px solid color-mix(in srgb, var(--brand-primary) 12%, transparent)' }}>
          {notification.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={notification.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
              <ShoppingBag size={16} style={{ color: 'var(--brand-accent)' }} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--brand-primary)' }}>
              {notification.text}
            </p>
            <p className="text-xs opacity-40 mt-0.5">Just now</p>
          </div>
        </div>
      )}
    </>
  )
}
