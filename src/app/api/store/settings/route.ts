import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const supabase = createServiceClient()

    const updateData: Record<string, unknown> = {
      store_name: data.store_name,
      tagline: data.tagline || null,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      accent_color: data.accent_color,
      contact_email: data.contact_email || null,
      support_email: data.support_email || null,
      social_instagram: data.social_instagram || null,
      social_tiktok: data.social_tiktok || null,
      social_facebook: data.social_facebook || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      footer_text: data.footer_text || null,
      announcement_bar: data.announcement_bar || null,
      announcement_bar_active: data.announcement_bar_active,
      stripe_publishable_key: data.stripe_publishable_key || null,
      updated_at: new Date().toISOString(),
    }

    if (data.new_stripe_secret) {
      updateData.stripe_secret_key_enc = Buffer.from(data.new_stripe_secret).toString('base64')
    }
    if (data.new_webhook_secret) {
      updateData.stripe_webhook_secret_enc = Buffer.from(data.new_webhook_secret).toString('base64')
    }

    const { error } = await supabase.from('store_settings').update(updateData).neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Settings error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
