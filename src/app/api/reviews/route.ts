import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('product_id')
    const pending = searchParams.get('pending') === 'true'
    const supabase = createServiceClient()

    let query = supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (productId) query = query.eq('product_id', productId)
    if (!pending) query = query.eq('is_approved', true)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ reviews: data || [] })
  } catch (e) {
    console.error('Reviews GET error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { product_id, reviewer_name, reviewer_email, rating, title, body } = data

    if (!product_id || !reviewer_name || !rating || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check for duplicate from same email on same product
    if (reviewer_email) {
      const { data: existing } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', product_id)
        .eq('reviewer_email', reviewer_email)
        .single()
      if (existing) {
        return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
      }
    }

    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id,
        reviewer_name: reviewer_name.trim(),
        reviewer_email: reviewer_email?.trim() || null,
        rating,
        title: title?.trim() || null,
        body: body.trim(),
        is_approved: false, // requires admin approval
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ review, message: 'Review submitted for approval' })
  } catch (e) {
    console.error('Review POST error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
