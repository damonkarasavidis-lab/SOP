import { createServerClient } from '@/lib/supabase/server'
import { calculateRetentionDeadlines } from '@/lib/sop/deadlines'
import { RetentionCard } from '@/components/retentions/RetentionCard'

export const metadata = { title: 'Retentions — ClaimTrack' }

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

  const projectMap = Object.fromEntries((projects ?? []).map((p) => [p.id, p]))
  const totalHeld = retentions?.reduce((sum, r) => sum + Number(r.total_retention_held), 0) ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Retention ledger</h1>
      <p className="text-sm text-slate-500 mb-6">Track your retention balances across all projects.</p>

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
              <RetentionCard
                key={retention.id}
                retentionId={retention.id}
                projectName={project.name}
                totalHeld={Number(retention.total_retention_held)}
                pcReleaseDate={deadlines.pcReleaseDate?.toISOString().split('T')[0] ?? null}
                pcReleaseAmount={deadlines.pcReleaseAmount}
                pcDaysUntil={deadlines.pcDaysUntilRelease}
                pcIsOverdue={deadlines.pcIsOverdue}
                pcStatus={retention.pc_release_status}
                dlpReleaseDate={deadlines.dlpReleaseDate?.toISOString().split('T')[0] ?? null}
                dlpReleaseAmount={deadlines.dlpReleaseAmount}
                dlpDaysUntil={deadlines.dlpDaysUntilRelease}
                dlpIsOverdue={deadlines.dlpIsOverdue}
                dlpStatus={retention.dlp_release_status}
              />
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
