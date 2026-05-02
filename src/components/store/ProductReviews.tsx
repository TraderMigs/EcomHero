'use client'
import { useState, useEffect } from 'react'
import { Star, Loader2, CheckCircle } from 'lucide-react'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  title?: string
  body: string
  created_at: string
}

interface Props {
  productId: string
  productName: string
}

function Stars({ rating, size = 16, interactive = false, onRate }: {
  rating: number
  size?: number
  interactive?: boolean
  onRate?: (r: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onRate?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}>
          <Star
            size={size}
            fill={(interactive ? (hover || rating) : rating) >= i ? 'var(--brand-accent)' : 'none'}
            stroke={(interactive ? (hover || rating) : rating) >= i ? 'var(--brand-accent)' : '#d1d5db'}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-2 opacity-60">{star}</span>
      <Star size={10} fill="var(--brand-accent)" stroke="var(--brand-accent)" />
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--brand-accent)' }} />
      </div>
      <span className="w-5 text-right opacity-50">{count}</span>
    </div>
  )
}

export default function ProductReviews({ productId, productName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({ reviewer_name: '', reviewer_email: '', rating: 0, title: '', body: '' })

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [productId])

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }))

  const submit = async () => {
    if (!form.reviewer_name || !form.rating || !form.body) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, ...form }),
      })
      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
      }
    } catch {}
    finally { setSubmitting(false) }
  }

  return (
    <div className="border-t mt-6 pt-6" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-display)' }}>
          Reviews {reviews.length > 0 && <span className="text-sm font-normal opacity-40">({reviews.length})</span>}
        </h3>
        {!submitted && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-70"
            style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}>
            Write a review
          </button>
        )}
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex gap-6 mb-6 p-4 rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
            <Stars rating={Math.round(avgRating)} size={14} />
            <p className="text-xs opacity-40 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={reviews.length} />
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div className="mb-6 p-4 rounded-xl border" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' }}>
          <p className="font-semibold text-sm mb-4">Your review for {productName}</p>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs opacity-50 mb-1.5">Rating *</p>
              <Stars rating={form.rating} size={24} interactive onRate={r => setForm(f => ({ ...f, rating: r }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs opacity-50 mb-1.5">Your Name *</p>
                <input value={form.reviewer_name} onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-current"
                  style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                  placeholder="Jane Smith" />
              </div>
              <div>
                <p className="text-xs opacity-50 mb-1.5">Email (optional)</p>
                <input type="email" value={form.reviewer_email} onChange={e => setForm(f => ({ ...f, reviewer_email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-current"
                  style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                  placeholder="jane@example.com" />
              </div>
            </div>
            <div>
              <p className="text-xs opacity-50 mb-1.5">Review Title</p>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none"
                style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                placeholder="Summarize your experience" />
            </div>
            <div>
              <p className="text-xs opacity-50 mb-1.5">Review *</p>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={3} className="w-full px-3 py-2 text-sm border rounded-lg outline-none resize-none"
                style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                placeholder="What did you think?" />
            </div>
            <div className="flex gap-2">
              <button onClick={submit} disabled={submitting || !form.rating || !form.reviewer_name || !form.body}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--brand-primary)' }}>
                {submitting ? <Loader2 size={13} className="animate-spin" /> : null}
                Submit Review
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm opacity-50 hover:opacity-70">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted confirmation */}
      {submitted && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl text-sm"
          style={{ background: 'color-mix(in srgb, #22c55e 10%, transparent)', color: '#16a34a' }}>
          <CheckCircle size={15} />
          Thanks! Your review has been submitted for approval.
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-6 opacity-40">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm opacity-40 text-center py-6">
          No reviews yet — be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(review => (
            <div key={review.id} className="pb-4 border-b last:border-b-0"
              style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }}>
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <p className="font-semibold text-sm">{review.reviewer_name}</p>
                  {review.title && <p className="text-sm opacity-70 mt-0.5">{review.title}</p>}
                </div>
                <div className="text-right">
                  <Stars rating={review.rating} size={13} />
                  <p className="text-xs opacity-30 mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
