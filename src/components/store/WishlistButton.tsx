'use client'
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

const STORAGE_KEY = 'ecomhero_wishlist'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setWishlist(JSON.parse(stored))
    } catch {}
  }, [])

  const toggle = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const isWishlisted = (productId: string) => wishlist.includes(productId)

  return { wishlist, toggle, isWishlisted }
}

interface Props {
  productId: string
  className?: string
}

export default function WishlistButton({ productId, className = '' }: Props) {
  const { toggle, isWishlisted } = useWishlist()
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const liked = isWishlisted(productId)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAnimating(true)
    toggle(productId)
    setTimeout(() => setAnimating(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      title={liked ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`transition-all ${animating ? 'scale-125' : 'scale-100'} ${className}`}
      style={{ color: liked ? '#ef4444' : 'currentColor' }}>
      <Heart
        size={18}
        fill={liked ? '#ef4444' : 'none'}
        stroke={liked ? '#ef4444' : 'currentColor'}
        className="transition-all"
      />
    </button>
  )
}
