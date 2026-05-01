'use client'
import Image from 'next/image'

interface Props {
  heading: string
  subheading?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  imageUrl?: string | null
}

export default function StoreHero({ heading, subheading, ctaText, ctaLink, imageUrl }: Props) {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt={heading} fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--brand-primary) 50%, transparent)' }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 95%, transparent) 0%, color-mix(in srgb, var(--brand-primary) 75%, transparent) 100%)' }} />
      )}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-display)', color: imageUrl ? '#fff' : 'var(--brand-secondary)' }}>
          {heading}
        </h1>
        {subheading && (
          <p className="text-lg md:text-xl mb-8 opacity-80 animate-slide-up animate-delay-100"
            style={{ color: imageUrl ? '#fff' : 'var(--brand-secondary)' }}>
            {subheading}
          </p>
        )}
        {ctaText && ctaLink && (
          <a href={ctaLink}
            className="inline-block px-10 py-4 text-sm font-semibold tracking-widest uppercase transition-all hover:opacity-90 animate-slide-up animate-delay-200"
            style={{
              background: 'var(--brand-accent)',
              color: '#fff',
              borderRadius: '2px',
            }}>
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
