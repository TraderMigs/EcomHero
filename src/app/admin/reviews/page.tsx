import { createServiceClient } from '@/lib/supabase/server'
import AdminReviewsClient from '@/components/admin/AdminReviewsClient'

export default async function AdminReviewsPage() {
  const supabase = createServiceClient()
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*, products(name)')
    .order('created_at', { ascending: false })

  return <AdminReviewsClient reviews={reviews || []} />
}
