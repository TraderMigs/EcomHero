import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { pod_provider, pod_api_key, pod_shop_id } = await req.json()
    const supabase = createServiceClient()

    const updateData: Record<string, unknown> = {
      pod_provider: pod_provider || 'none',
      pod_shop_id: pod_shop_id || null,
      updated_at: new Date().toISOString(),
    }

    if (pod_api_key) {
      updateData.pod_api_key_enc = Buffer.from(pod_api_key).toString('base64')
    }

    const { error } = await supabase.from('store_settings').update(updateData).neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
