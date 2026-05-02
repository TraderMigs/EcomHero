import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createClient()
    const { data: settings } = await supabase
      .from('store_settings')
      .select('store_name,meta_title,meta_description,favicon_url,logo_url')
      .single()

    if (!settings) return { title: 'EcomHero Store' }

    return {
      title: settings.meta_title || settings.store_name || 'EcomHero Store',
      description: settings.meta_description || '',
      icons: settings.favicon_url
        ? {
            icon: settings.favicon_url,
            shortcut: settings.favicon_url,
            apple: settings.favicon_url,
          }
        : undefined,
      openGraph: {
        title: settings.meta_title || settings.store_name || 'EcomHero Store',
        description: settings.meta_description || '',
        images: settings.logo_url ? [{ url: settings.logo_url }] : [],
      },
    }
  } catch {
    return { title: 'EcomHero Store' }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let primaryColor = '#000000'
  let secondaryColor = '#ffffff'
  let accentColor = '#ff4500'
  let fontDisplay = 'Playfair Display'
  let fontBody = 'DM Sans'

  try {
    const supabase = createClient()
    const { data: settings } = await supabase
      .from('store_settings')
      .select('primary_color,secondary_color,accent_color,font_display,font_body')
      .single()
    if (settings) {
      primaryColor = settings.primary_color || primaryColor
      secondaryColor = settings.secondary_color || secondaryColor
      accentColor = settings.accent_color || accentColor
      fontDisplay = settings.font_display || fontDisplay
      fontBody = settings.font_body || fontBody
    }
  } catch {}

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <style>{`
          :root {
            --brand-primary: ${primaryColor};
            --brand-secondary: ${secondaryColor};
            --brand-accent: ${accentColor};
            --font-display: '${fontDisplay}', serif;
            --font-body: '${fontBody}', sans-serif;
          }
        `}</style>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0f0f0f', color: '#fff', borderRadius: '8px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
