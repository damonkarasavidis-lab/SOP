import { createServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Settings — ClaimTrack' }

export default async function SettingsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  const { data: org } = await supabase
    .from('organisations')
    .select('id, name, abn, state')
    .eq('id', membership!.org_id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="max-w-xl space-y-6">
        {/* Org details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Organisation</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-slate-500">Name</dt>
              <dd className="text-sm text-slate-900 mt-0.5">{org?.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">ABN</dt>
              <dd className="text-sm text-slate-900 mt-0.5">{org?.abn ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">State</dt>
              <dd className="text-sm text-slate-900 mt-0.5">{org?.state}</dd>
            </div>
          </dl>
        </div>

        {/* Account */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Account</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="text-sm text-slate-900 mt-0.5">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Role</dt>
              <dd className="text-sm text-slate-900 mt-0.5 capitalize">{membership?.role}</dd>
            </div>
          </dl>
        </div>

        {/* Billing placeholder */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-2">Billing</h2>
          <p className="text-sm text-slate-500">Stripe billing coming in Week 7.</p>
        </div>
      </div>
    </div>
  )
}
