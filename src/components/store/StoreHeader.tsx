'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, User } from 'lucide-react'
import { StoreSettings } from '@/types'
import Image from 'next/image'
import CustomerAuthModal from './CustomerAuthModal'

interface Props {
  settings: StoreSettings
  navItems: { label: string; href: string }[]
  cartCount: number
  onCartOpen: () => void
}

export default function StoreHeader({ settings, navItems, cartCount, onCartOpen }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if customer is logged in
  useEffect(() => {
    fetch('/api/account/profile')
      .then(r => { if (r.ok) setIsLoggedIn(true) })
      .catch(() => {})
  }, [])

  // Handle ?auth=login redirect from account page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('auth') === 'login') {
        setAuthOpen(true)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  const showLogo = settings.logo_url && !logoError

  return (
    <>
      <header className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--brand-secondary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-3 shrink-0">
            {showLogo ? (
              <Image
                src={settings.logo_url!}
                alt={settings.store_name}
                width={180} height={40}
                className="object-contain h-10 w-auto max-w-[180px]"
                onError={() => setLogoError(true)}
                priority
              />
            ) : (
              <span className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-primary)' }}>
                {settings.store_name}
              </span>
            )}
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <a key={item.href} href={item.href}
                className="text-sm font-medium tracking-wide hover:opacity-60 transition-opacity"
                style={{ color: 'var(--brand-primary)' }}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Account */}
            {isLoggedIn ? (
              <a href="/account"
                className="p-2 hover:opacity-60 transition-opacity"
                title="My Account">
                <User size={20} style={{ color: 'var(--brand-primary)' }} />
              </a>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="p-2 hover:opacity-60 transition-opacity"
                title="Sign in">
                <User size={20} style={{ color: 'var(--brand-primary)' }} />
              </button>
            )}

            {/* Cart */}
            <button onClick={onCartOpen} className="relative p-2 hover:opacity-60 transition-opacity">
              <ShoppingBag size={22} style={{ color: 'var(--brand-primary)' }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white"
                  style={{ background: 'var(--brand-accent)' }}>
                  {cartCount}
                </span>
              )}
            </button>

            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-4"
            style={{
              borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
              background: 'var(--brand-secondary)',
            }}>
            {navItems.map(item => (
              <a key={item.href} href={item.href}
                className="text-sm font-medium"
                style={{ color: 'var(--brand-primary)' }}
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            {isLoggedIn ? (
              <a href="/account" className="text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>
                My Account
              </a>
            ) : (
              <button onClick={() => { setAuthOpen(true); setMobileOpen(false) }}
                className="text-sm font-medium text-left" style={{ color: 'var(--brand-primary)' }}>
                Sign in / Create account
              </button>
            )}
          </div>
        )}
      </header>

      {/* Auth modal */}
      {authOpen && (
        <CustomerAuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {
            setIsLoggedIn(true)
            setAuthOpen(false)
          }}
        />
      )}
    </>
  )
}
