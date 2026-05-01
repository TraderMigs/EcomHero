import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const supabase = createServiceClient()
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from('ecomhero-media')
      .upload(fileName, buffer, { contentType: file.type, upsert: false })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage.from('ecomhero-media').getPublicUrl(fileName)

    // Save to media library
    await supabase.from('media_library').insert({
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
    })

    return NextResponse.json({ url: publicUrl })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
