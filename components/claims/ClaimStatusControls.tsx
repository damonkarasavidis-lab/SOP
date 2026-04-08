'use client'

import { useState, useTransition } from 'react'
import { updateClaimStatus, markPaymentScheduleReceived } from '@/app/actions/claims'

type ClaimStatus = 'submitted' | 'response_received' | 'paid' | 'disputed' | 'adjudication' | 'overdue'

export function ClaimStatusControls({
  claimId,
  currentStatus,
}: {
  claimId: string
  currentStatus: string
}) {
  const [pending, startTransition] = useTransition()
  const [showPaymentScheduleForm, setShowPaymentScheduleForm] = useState(false)
  const [showMarkPaidForm, setShowMarkPaidForm] = useState(false)

  function setStatus(status: ClaimStatus) {
    startTransition(() => updateClaimStatus(claimId, status))
  }

  function handlePaymentSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const date = form.get('schedule_date') as string
    const amount = parseFloat(form.get('schedule_amount') as string)
    startTransition(() => markPaymentScheduleReceived(claimId, date, amount))
    setShowPaymentScheduleForm(false)
  }

  function handleMarkPaid(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const amount = parseFloat(form.get('amount_paid') as string)
    startTransition(() => updateClaimStatus(claimId, 'paid', amount))
    setShowMarkPaidForm(false)
  }

  if (currentStatus === 'paid') return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
      <h2 className="font-semibold text-slate-900 mb-3">Update claim</h2>

      <div className="flex flex-wrap gap-2">
        {currentStatus === 'submitted' && (
          <>
            <button
              onClick={() => setShowPaymentScheduleForm(true)}
              disabled={pending}
              className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Payment schedule received
            </button>
            <button
              onClick={() => setStatus('adjudication')}
              disabled={pending}
              className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              Lodge adjudication
            </button>
            <button
              onClick={() => setStatus('disputed')}
              disabled={pending}
              className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              Mark disputed
            </button>
          </>
        )}

        {(currentStatus === 'response_received' || currentStatus === 'adjudication') && (
          <button
            onClick={() => setShowMarkPaidForm(true)}
            disabled={pending}
            className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            Mark paid
          </button>
        )}

        {currentStatus === 'disputed' && (
          <>
            <button
              onClick={() => setStatus('adjudication')}
              disabled={pending}
              className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              Lodge adjudication
            </button>
            <button
              onClick={() => setShowMarkPaidForm(true)}
              disabled={pending}
              className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              Mark paid
            </button>
          </>
        )}
      </div>

      {/* Payment schedule form */}
      {showPaymentScheduleForm && (
        <form onSubmit={handlePaymentSchedule} className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <p className="text-sm font-medium text-slate-700">Payment schedule details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date received</label>
              <input
                name="schedule_date" type="date" required
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Amount scheduled ($)</label>
              <input
                name="schedule_amount" type="number" required min="0" step="0.01"
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending}
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => setShowPaymentScheduleForm(false)}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Mark paid form */}
      {showMarkPaidForm && (
        <form onSubmit={handleMarkPaid} className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <p className="text-sm font-medium text-slate-700">Amount paid</p>
          <input
            name="amount_paid" type="number" required min="0" step="0.01"
            placeholder="Enter amount paid"
            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={pending}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
              Mark paid
            </button>
            <button type="button" onClick={() => setShowMarkPaidForm(false)}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
