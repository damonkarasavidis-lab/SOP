import { createServerClient } from '@/lib/supabase/server'
import { getClaimUrgency, getRetentionUrgency } from '@/lib/sop/types'
import Link from 'next/link'

export async function DashboardSummary({ orgId }: { orgId: string }) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: projects }, { data: claims }, { data: retentions }] = await Promise.all([
    supabase.from('projects').select('id, status').eq('org_id', orgId),
    supabase
      .from('payment_claims')
      .select('id, amount_claimed, response_due_date, adjudication_window_end, status')
      .eq('org_id', orgId)
      .in('status', ['submitted', 'overdue']),
    supabase
      .from('retentions')
      .select('id, total_retention_held, pc_release_date, pc_release_status, dlp_release_date, dlp_release_status')
      .eq('org_id', orgId),
  ])

  const activeProjects = projects?.filter((p) => p.status === 'active').length ?? 0

  const totalClaimsOutstanding =
    claims?.reduce((sum, c) => sum + Number(c.amount_claimed), 0) ?? 0

  const totalRetentionHeld =
    retentions?.reduce((sum, r) => sum + Number(r.total_retention_held), 0) ?? 0

  // Claims needing attention (overdue or due within 7 days)
  const urgentClaims =
    claims?.filter((c) => {
      const days = Math.ceil(
        (new Date(c.response_due_date).getTime() - Date.now()) / 86400000
      )
      return getClaimUrgency(days, c.response_due_date < today) !== 'green'
    }) ?? []

  // Retention releases overdue or due within 30 days
  const urgentRetentions =
    retentions?.filter((r) => {
      const pcDays = r.pc_release_date
        ? Math.ceil((new Date(r.pc_release_date).getTime() - Date.now()) / 86400000)
        : null
      const dlpDays = r.dlp_release_date
        ? Math.ceil((new Date(r.dlp_release_date).getTime() - Date.now()) / 86400000)
        : null
      return (
        getRetentionUrgency(pcDays, r.pc_release_status === 'overdue') !== 'green' ||
        getRetentionUrgency(dlpDays, r.dlp_release_status === 'overdue') !== 'green'
      )
    }) ?? []

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label="Active projects" value={String(activeProjects)} />
        <KpiTile
          label="Claims outstanding"
          value={`$${totalClaimsOutstanding.toLocaleString('en-AU')}`}
          href="/claims"
        />
        <KpiTile
          label="Retention held"
          value={`$${totalRetentionHeld.toLocaleString('en-AU')}`}
          href="/retentions"
        />
        <KpiTile
          label="Action needed"
          value={String(urgentClaims.length + urgentRetentions.length)}
          urgent={urgentClaims.length + urgentRetentions.length > 0}
        />
      </div>

      {/* Urgent claims */}
      {urgentClaims.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Claims needing attention</h2>
          <div className="grid gap-2">
            {urgentClaims.map((claim) => {
              const days = Math.ceil(
                (new Date(claim.response_due_date).getTime() - Date.now()) / 86400000
              )
              const urgency = getClaimUrgency(days, claim.response_due_date < today)
              return (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      urgency === 'red' ? 'bg-red-500' : 'bg-amber-400'
                    }`} />
                    <span className="text-sm text-slate-700">Response due {claim.response_due_date}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    ${Number(claim.amount_claimed).toLocaleString('en-AU')}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Urgent retentions */}
      {urgentRetentions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Retention releases due</h2>
          <div className="grid gap-2">
            {urgentRetentions.map((r) => (
              <Link
                key={r.id}
                href="/retentions"
                className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">
                    Release due {r.pc_release_date ?? r.dlp_release_date}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${Number(r.total_retention_held).toLocaleString('en-AU')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {urgentClaims.length === 0 && urgentRetentions.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
          <p className="text-green-600 font-medium text-sm">All clear — nothing urgent right now.</p>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Deadlines are indicative. Always confirm with a legal professional before making adjudication decisions.
      </p>
    </div>
  )
}

function KpiTile({
  label,
  value,
  href,
  urgent,
}: {
  label: string
  value: string
  href?: string
  urgent?: boolean
}) {
  const inner = (
    <div className={`bg-white rounded-xl border p-4 ${
      urgent ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${urgent ? 'text-red-700' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}
