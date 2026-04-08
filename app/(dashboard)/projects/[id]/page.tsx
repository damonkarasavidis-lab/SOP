import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Project — ClaimTrack' }

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  const [{ data: claims }, { data: retention }] = await Promise.all([
    supabase
      .from('payment_claims')
      .select('*')
      .eq('project_id', params.id)
      .order('reference_date', { ascending: false }),
    supabase
      .from('retentions')
      .select('*')
      .eq('project_id', params.id)
      .single(),
  ])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/projects" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block">
            ← Projects
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{project.head_contractor} · {project.state}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            project.status === 'active' ? 'bg-green-100 text-green-700' :
            project.status === 'disputed' ? 'bg-red-100 text-red-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {project.status}
          </span>
          <Link
            href={`/projects/${params.id}/edit`}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Project details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Contract value', value: `$${Number(project.contract_value).toLocaleString('en-AU')}` },
          { label: 'Retention', value: `${project.retention_percentage}%` },
          { label: 'Contract start', value: project.contract_start_date },
          { label: 'Practical completion', value: project.practical_completion_date ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-base font-semibold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Claims */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Payment claims</h2>
          <Link
            href={`/claims/new?project=${project.id}`}
            className="text-sm text-brand-600 font-medium hover:underline"
          >
            + Log claim
          </Link>
        </div>
        {!claims || claims.length === 0 ? (
          <p className="text-sm text-slate-500">No claims yet.</p>
        ) : (
          <div className="grid gap-3">
            {claims.map((claim) => {
              const isOverdue = claim.response_due_date < today && claim.status === 'submitted'
              const isDueSoon =
                !isOverdue &&
                claim.response_due_date <=
                  new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

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
                      {claim.reference_date} · Response due {claim.response_due_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ${Number(claim.amount_claimed).toLocaleString('en-AU')}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${
                      isOverdue ? 'text-red-600' :
                      isDueSoon ? 'text-amber-600' :
                      claim.status === 'paid' ? 'text-green-600' :
                      'text-slate-500'
                    }`}>
                      {isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : claim.status}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Retention */}
      {retention && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Retention</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total held</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                ${Number(retention.total_retention_held).toLocaleString('en-AU')}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">PC release</p>
              <p className="text-base font-bold text-slate-900 mt-1">
                {retention.pc_release_date ?? '—'}
              </p>
              <p className={`text-xs font-medium mt-1 ${
                retention.pc_release_status === 'overdue' ? 'text-red-600' :
                retention.pc_release_status === 'released' ? 'text-green-600' :
                'text-amber-600'
              }`}>
                {retention.pc_release_status}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">DLP release</p>
              <p className="text-base font-bold text-slate-900 mt-1">
                {retention.dlp_release_date ?? '—'}
              </p>
              <p className={`text-xs font-medium mt-1 ${
                retention.dlp_release_status === 'overdue' ? 'text-red-600' :
                retention.dlp_release_status === 'released' ? 'text-green-600' :
                'text-amber-600'
              }`}>
                {retention.dlp_release_status}
              </p>
            </div>
          </div>
        </div>
      )}

      {project.notes && (
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-2">Notes</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}
    </div>
  )
}
