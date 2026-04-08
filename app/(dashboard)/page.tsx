import { DashboardSummary } from '@/components/dashboard/DashboardSummary'
import { createServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Dashboard — ClaimTrack' }

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch org for this user
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, organisations(id, name, state)')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  const org = membership?.organisations as { id: string; name: string; state: string } | null

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
