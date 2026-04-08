import { createServerClient } from '@/lib/supabase/server'
import { calculateRetentionDeadlines } from '@/lib/sop/deadlines'
import type { Database } from '@/types/database'

export const metadata = { title: 'Retentions — ClaimTrack' }

type Project = Database['public']['Tables']['projects']['Row']

export default async function RetentionsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  const [{ data: retentions }, { data: projects }] = await Promise.all([
    supabase
      .from('retentions')
      .select('*')
      .eq('org_id', membership!.org_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('id, name, contract_value, retention_percentage, practical_completion_date, defects_liability_period_days')
      .eq('org_id', membership!.org_id),
  ])

  const projectMap = Object.fromEntries(
    (projects ?? []).map((p) => [p.id, p as Pick<Project, 'id' | 'name' | 'contract_value' | 'retention_percentage' | 'practical_completion_date' | 'defects_liability_period_days'>])
  )

  const totalHeld = retentions?.reduce((sum, r) => sum + Number(r.total_retention_held), 0) ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Retention ledger</h1>
      <p className="text-sm text-slate-500 mb-6">Track your retention balances across all projects.</p>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <p className="text-xs text-slate-500">Total retention held</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">${totalHeld.toLocaleString('en-AU')}</p>
      </div>

      {!retentions || retentions.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-12">No retentions tracked yet.</p>
      ) : (
        <div className="grid gap-4">
          {retentions.map((retention) => {
            const project = projectMap[retention.project_id]
            if (!project) return null

            const deadlines = calculateRetentionDeadlines(
              Number(project.contract_value),
              Number(project.retention_percentage),
              project.practical_completion_date ? new Date(project.practical_completion_date) : null,
              project.defects_liability_period_days
            )

            return (
              <div key={retention.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">{project.name}</h2>
                  <span className="text-lg font-bold text-slate-900">
                    ${Number(retention.total_retention_held).toLocaleString('en-AU')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <RetentionRelease
                    label="PC release (50%)"
                    amount={deadlines.pcReleaseAmount}
                    date={deadlines.pcReleaseDate?.toISOString().split('T')[0] ?? null}
                    daysUntil={deadlines.pcDaysUntilRelease}
                    isOverdue={deadlines.pcIsOverdue}
                    status={retention.pc_release_status}
                  />
                  <RetentionRelease
                    label="DLP release (50%)"
                    amount={deadlines.dlpReleaseAmount}
                    date={deadlines.dlpReleaseDate?.toISOString().split('T')[0] ?? null}
                    daysUntil={deadlines.dlpDaysUntilRelease}
                    isOverdue={deadlines.dlpIsOverdue}
                    status={retention.dlp_release_status}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Retention release dates are indicative. Always confirm with a legal professional.
      </p>
    </div>
  )
}

function RetentionRelease({
  label,
  amount,
  date,
  daysUntil,
  isOverdue,
  status,
}: {
  label: string
  amount: number
  date: string | null
  daysUntil: number | null
  isOverdue: boolean
  status: string
}) {
  const urgency = status === 'released' ? 'green' : isOverdue ? 'red' : (daysUntil != null && daysUntil <= 30) ? 'amber' : 'green'

  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900 mt-0.5">${amount.toLocaleString('en-AU')}</p>
      {date ? (
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            urgency === 'red' ? 'bg-red-100 text-red-700' :
            urgency === 'amber' ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>
            {status === 'released' ? 'Released' : isOverdue ? 'Overdue' : `${daysUntil}d`}
          </span>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
      ) : (
        <p className="text-xs text-slate-400 mt-1">No PC date set</p>
      )}
    </div>
  )
}
