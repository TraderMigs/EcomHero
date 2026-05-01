import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  await supabase.from('discount_codes').delete().eq('id', params.id)
  return NextResponse.json({ success: true })
}
