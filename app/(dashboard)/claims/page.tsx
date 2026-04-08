import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Claims — ClaimTrack' }

export default async function ClaimsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  const { data: claims } = await supabase
    .from('payment_claims')
    .select('*, projects(name, state)')
    .eq('org_id', membership!.org_id)
    .order('response_due_date', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment claims</h1>
        <Link
          href="/claims/new"
          className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          + Log claim
        </Link>
      </div>

      {!claims || claims.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">No claims logged yet.</p>
          <Link href="/claims/new" className="mt-3 inline-block text-brand-600 text-sm font-medium hover:underline">
            Log your first claim →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {claims.map((claim) => {
            const isOverdue = claim.response_due_date < today && claim.status === 'submitted'
            const isDueSoon = !isOverdue && claim.response_due_date <= new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

            return (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isOverdue ? 'bg-red-500' : isDueSoon ? 'bg-amber-400' : 'bg-green-400'
                    }`} />
                    <p className="font-medium text-slate-900">Claim #{claim.claim_number}</p>
                  </div>
                  <p className="text-sm text-slate-500 ml-4 mt-0.5">
                    {(claim.projects as { name: string })?.name} · Response due {claim.response_due_date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${Number(claim.amount_claimed).toLocaleString('en-AU')}</p>
                  <p className={`text-xs font-medium mt-1 ${
                    isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : claim.status}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Deadlines are indicative. Always confirm with a legal professional before making adjudication decisions.
      </p>
    </div>
  )
}
