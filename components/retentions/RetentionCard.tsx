'use client'

import { useTransition } from 'react'
import { markRetentionReleased } from '@/app/actions/retentions'

interface RetentionCardProps {
  retentionId: string
  projectName: string
  totalHeld: number
  pcReleaseDate: string | null
  pcReleaseAmount: number
  pcDaysUntil: number | null
  pcIsOverdue: boolean
  pcStatus: string
  dlpReleaseDate: string | null
  dlpReleaseAmount: number
  dlpDaysUntil: number | null
  dlpIsOverdue: boolean
  dlpStatus: string
}

export function RetentionCard({
  retentionId,
  projectName,
  totalHeld,
  pcReleaseDate,
  pcReleaseAmount,
  pcDaysUntil,
  pcIsOverdue,
  pcStatus,
  dlpReleaseDate,
  dlpReleaseAmount,
  dlpDaysUntil,
  dlpIsOverdue,
  dlpStatus,
}: RetentionCardProps) {
  const [pending, startTransition] = useTransition()

  function release(type: 'pc' | 'dlp') {
    startTransition(() => markRetentionReleased(retentionId, type))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <h2 className="font-semibold text-slate-900">{projectName}</h2>
        <span className="text-lg font-bold text-slate-900">
          ${totalHeld.toLocaleString('en-AU')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ReleasePanel
          label="PC release (50%)"
          amount={pcReleaseAmount}
          date={pcReleaseDate}
          daysUntil={pcDaysUntil}
          isOverdue={pcIsOverdue}
          status={pcStatus}
          onRelease={pcStatus !== 'released' ? () => release('pc') : undefined}
          pending={pending}
        />
        <ReleasePanel
          label="DLP release (50%)"
          amount={dlpReleaseAmount}
          date={dlpReleaseDate}
          daysUntil={dlpDaysUntil}
          isOverdue={dlpIsOverdue}
          status={dlpStatus}
          onRelease={dlpStatus !== 'released' ? () => release('dlp') : undefined}
          pending={pending}
        />
      </div>
    </div>
  )
}

function ReleasePanel({
  label, amount, date, daysUntil, isOverdue, status, onRelease, pending,
}: {
  label: string
  amount: number
  date: string | null
  daysUntil: number | null
  isOverdue: boolean
  status: string
  onRelease?: () => void
  pending: boolean
}) {
  const urgency =
    status === 'released' ? 'green' :
    isOverdue ? 'red' :
    (daysUntil != null && daysUntil <= 30) ? 'amber' : 'green'

  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900 mt-0.5">
        ${amount.toLocaleString('en-AU')}
      </p>
      {date ? (
        <>
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
          {onRelease && (
            <button
              onClick={onRelease}
              disabled={pending}
              className="mt-2 text-xs font-medium text-green-700 hover:text-green-800 disabled:opacity-50"
            >
              Mark released →
            </button>
          )}
        </>
      ) : (
        <p className="text-xs text-slate-400 mt-1">No PC date set</p>
      )}
    </div>
  )
}
