'use client'
import { StoreSettings } from '@/types'
import { Instagram } from 'lucide-react'
import NewsletterSignup from './NewsletterSignup'

interface Props {
  settings: StoreSettings
  navItems: { label: string; href: string }[]
}

export default function StoreFooter({ settings, navItems }: Props) {
  return (
    <footer className="border-t mt-16"
      style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">

          {/* Brand */}
          <div className="max-w-xs">
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {settings.store_name}
            </h3>
            {settings.tagline && <p className="text-sm opacity-60 mb-4">{settings.tagline}</p>}
            <div className="flex gap-3">
              {settings.social_instagram && (
                <a href={`https://instagram.com/${settings.social_instagram}`}
                  target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity">
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Nav links */}
          {navItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-50">Info</h4>
              <ul className="flex flex-col gap-2">
                {navItems.map(item => (
                  <li key={item.href}>
                    <a href={item.href}
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {settings.contact_email && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-50">Contact</h4>
              <a href={`mailto:${settings.contact_email}`}
                className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                {settings.contact_email}
              </a>
            </div>
          )}

          {/* Newsletter */}
          <div className="max-w-sm w-full">
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-50">Newsletter</h4>
            <NewsletterSignup accentColor={settings.accent_color} />
          </div>
        </div>

        <div className="border-t pt-6 text-xs opacity-40 flex flex-col md:flex-row justify-between gap-2"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
          <p>{settings.footer_text || `© ${new Date().getFullYear()} ${settings.store_name}. All rights reserved.`}</p>
          <p>Powered by EcomHero</p>
        </div>
      </div>
    </footer>
  )
}
