'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, Trash2, Star, MessageSquare } from 'lucide-react'
import { palette } from '@/components/ui/palette'
import { AdminPage, AdminPageHeader, AdminBadge, AdminEmpty } from '@/components/ui/AdminUI'

interface Review {
  id: string
  product_id: string
  reviewer_name: string
  reviewer_email?: string
  rating: number
  title?: string
  body: string
  is_approved: boolean
  created_at: string
  products?: { name: string }
}

interface Props { reviews: Review[] }

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12}
          fill={rating >= i ? '#f59e0b' : 'none'}
          stroke={rating >= i ? '#f59e0b' : palette.border} />
      ))}
    </div>
  )
}

export default function AdminReviewsClient({ reviews: initial }: Props) {
  const [reviews, setReviews] = useState(initial)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')

  const pending = reviews.filter(r => !r.is_approved)
  const approved = reviews.filter(r => r.is_approved)
  const displayed = tab === 'pending' ? pending : approved

  const approve = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: 'PATCH' })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r))
    toast.success('Review approved')
  }

  const del = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    setReviews(prev => prev.filter(r => r.id !== id))
    toast.success('Review deleted')
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Reviews"
        subtitle="Moderate customer reviews before they appear on the store"
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: palette.bg }}>
        {(['pending', 'approved'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
            style={{
              background: tab === t ? palette.surface : 'transparent',
              color: tab === t ? palette.text : palette.textMuted,
            }}>
            {t}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
              style={{ background: tab === t ? palette.accent + '20' : palette.border, color: tab === t ? palette.accent : palette.textDim }}>
              {t === 'pending' ? pending.length : approved.length}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {displayed.length === 0 ? (
        <div className="rounded-xl border" style={{ borderColor: palette.border, background: palette.surface }}>
          <AdminEmpty
            icon={<MessageSquare size={18} />}
            title={tab === 'pending' ? 'No pending reviews' : 'No approved reviews yet'}
            subtitle={tab === 'pending' ? 'All reviews have been moderated' : 'Approve reviews to show them on your store'}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map(review => (
            <div key={review.id} className="rounded-xl border p-5"
              style={{ background: palette.surface, borderColor: palette.border }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <StarDisplay rating={review.rating} />
                    <AdminBadge variant={review.is_approved ? 'success' : 'warning'}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </AdminBadge>
                    {review.products?.name && (
                      <span className="text-xs truncate" style={{ color: palette.textMuted }}>
                        {review.products.name}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: palette.text }}>
                    {review.reviewer_name}
                    {review.reviewer_email && (
                      <span className="font-normal ml-2 text-xs" style={{ color: palette.textDim }}>
                        {review.reviewer_email}
                      </span>
                    )}
                  </p>
                  {review.title && (
                    <p className="text-sm font-medium mt-1" style={{ color: palette.text }}>{review.title}</p>
                  )}
                  <p className="text-sm mt-1.5 leading-relaxed" style={{ color: palette.textMuted }}>
                    {review.body}
                  </p>
                  <p className="text-xs mt-2" style={{ color: palette.textDim }}>
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!review.is_approved && (
                    <button onClick={() => approve(review.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: '#22c55e18', color: '#22c55e' }}>
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                  <button onClick={() => del(review.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: palette.dangerDim, color: palette.danger }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  )
}
