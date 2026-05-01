import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient()
    const { data: file } = await supabase.from('media_library').select('file_url').eq('id', params.id).single()

    if (file?.file_url) {
      const fileName = file.file_url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('ecomhero-media').remove([fileName])
      }
    }

    await supabase.from('media_library').delete().eq('id', params.id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
