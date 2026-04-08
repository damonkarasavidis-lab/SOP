import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { calculateClaimDeadlines } from '@/lib/sop/deadlines'
import type { AustralianState } from '@/lib/sop/states'
import { ClaimStatusControls } from '@/components/claims/ClaimStatusControls'

export const metadata = { title: 'Claim — ClaimTrack' }

export default async function ClaimDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data: claim } = await supabase
    .from('payment_claims')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!claim) notFound()

  const { data: project } = await supabase
    .from('projects')
    .select('name, state, head_contractor')
    .eq('id', claim.project_id)
    .single()

  if (!project) notFound()

  const deadlines = calculateClaimDeadlines(
    new Date(claim.reference_date),
    project.state as AustralianState
  )

  return (
    <div>
      <Link href="/claims" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
        ← Claims
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claim #{claim.claim_number}</h1>
          <p className="text-slate-500 text-sm mt-1">{project.name} · {project.head_contractor}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            claim.status === 'overdue' || claim.status === 'disputed' ? 'bg-red-100 text-red-700' :
            claim.status === 'paid' ? 'bg-green-100 text-green-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {claim.status}
          </span>
          <Link
            href={`/api/pdf/claim/${claim.id}`}
            target="_blank"
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Download PDF
          </Link>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Amount claimed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${Number(claim.amount_claimed).toLocaleString('en-AU')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Amount paid</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {claim.amount_paid != null
              ? `$${Number(claim.amount_paid).toLocaleString('en-AU')}`
              : '—'}
          </p>
        </div>
      </div>

      {/* Deadlines */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Statutory deadlines</h2>
        <div className="grid gap-3">
          <DeadlineRow
            label="Response (payment schedule) due"
            date={deadlines.responseScheduleDueDate.toISOString().split('T')[0]}
            daysRemaining={deadlines.daysUntilResponseDue}
            isOverdue={deadlines.isResponseOverdue}
          />
          <DeadlineRow
            label="Adjudication window closes"
            date={deadlines.adjudicationWindowEnd.toISOString().split('T')[0]}
            daysRemaining={deadlines.daysUntilAdjudicationWindowEnd}
            isOverdue={deadlines.isAdjudicationWindowClosed}
          />
        </div>
        <p className="mt-4 text-xs text-slate-400">{deadlines.statutoryReference}</p>
      </div>

      {/* Status controls */}
      <ClaimStatusControls claimId={claim.id} currentStatus={claim.status} />

      {/* Payment schedule received */}
      {claim.payment_schedule_received && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">Payment schedule received</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Date received</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {claim.payment_schedule_date ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Amount scheduled</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {claim.payment_schedule_amount != null
                  ? `$${Number(claim.payment_schedule_amount).toLocaleString('en-AU')}`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {claim.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-2">Notes</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{claim.notes}</p>
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        ClaimTrack provides deadline tracking tools to help you manage your payment claims. Deadlines shown are
        calculated based on publicly available legislation and are indicative only. They do not constitute legal
        advice. Always consult a qualified construction lawyer before making adjudication decisions or taking legal action.
      </p>
    </div>
  )
}

function DeadlineRow({
  label, date, daysRemaining, isOverdue,
}: {
  label: string; date: string; daysRemaining: number; isOverdue: boolean
}) {
  const urgency = isOverdue ? 'red' : daysRemaining <= 3 ? 'red' : daysRemaining <= 7 ? 'amber' : 'green'
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-700">{label}</p>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          urgency === 'red' ? 'bg-red-100 text-red-700' :
          urgency === 'amber' ? 'bg-amber-100 text-amber-700' :
          'bg-green-100 text-green-700'
        }`}>
          {isOverdue ? 'Overdue' : `${daysRemaining}d`}
        </span>
        <span className="text-sm text-slate-500 tabular-nums">{date}</span>
      </div>
    </div>
  )
}
