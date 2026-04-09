import { DashboardSummary } from '@/components/dashboard/DashboardSummary'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard — ClaimTrack' }

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organisations')
    .select('id, name, state')
    .eq('id', membership.org_id)
    .single()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        {org && <p className="text-sm text-slate-500 mt-1">{org.name}</p>}
      </div>
      {org && <DashboardSummary orgId={org.id} />}
    </div>
  )
}
