import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const supabase = createServiceClient()

    const updateData: Record<string, unknown> = {
      store_name: data.store_name,
      tagline: data.tagline || null,
      store_type: data.store_type,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      accent_color: data.accent_color,
      pod_provider: data.pod_provider || 'none',
      pod_shop_id: data.pod_shop_id || null,
      contact_email: data.contact_email || null,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    }

    // Store sensitive keys encrypted (simple base64 for now — swap for proper encryption in prod)
    if (data.pod_api_key) updateData.pod_api_key_enc = Buffer.from(data.pod_api_key).toString('base64')
    if (data.stripe_publishable_key) updateData.stripe_publishable_key = data.stripe_publishable_key
    if (data.stripe_secret_key) updateData.stripe_secret_key_enc = Buffer.from(data.stripe_secret_key).toString('base64')

    const { error } = await supabase.from('store_settings').update(updateData).neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Onboarding error:', e)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
