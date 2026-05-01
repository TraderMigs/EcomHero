import { createServiceClient } from '@/lib/supabase/server'
import AdminDiscountsClient from '@/components/admin/AdminDiscountsClient'

export default async function DiscountsPage() {
  const supabase = createServiceClient()
  const { data: discounts } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Discount Codes</h1>
        <p className="text-sm text-gray-500 mt-1">Manage promotional codes</p>
      </div>
      <AdminDiscountsClient discounts={discounts || []} />
    </div>
  )
}
