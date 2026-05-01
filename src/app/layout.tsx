import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'EcomHero Store',
  description: 'Powered by EcomHero',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let primaryColor = '#000000'
  let secondaryColor = '#ffffff'
  let accentColor = '#ff4500'
  let fontDisplay = 'Playfair Display'
  let fontBody = 'DM Sans'
  let storeName = 'EcomHero Store'

  try {
    const supabase = createClient()
    const { data: settings } = await supabase
      .from('store_settings')
      .select('primary_color,secondary_color,accent_color,font_display,font_body,store_name,meta_title,meta_description')
      .single()
    if (settings) {
      primaryColor = settings.primary_color || primaryColor
      secondaryColor = settings.secondary_color || secondaryColor
      accentColor = settings.accent_color || accentColor
      fontDisplay = settings.font_display || fontDisplay
      fontBody = settings.font_body || fontBody
      storeName = settings.store_name || storeName
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
