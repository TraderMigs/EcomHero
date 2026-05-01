'use client'

export default function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="w-full text-center py-2 px-4 text-xs font-medium tracking-widest uppercase"
      style={{ background: 'var(--brand-primary)', color: 'var(--brand-secondary)' }}>
      {text}
    </div>
  )
}
