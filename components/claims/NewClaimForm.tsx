'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addBusinessDays } from '@/lib/sop/deadlines'
import { STATE_RULES, type AustralianState } from '@/lib/sop/states'

interface Project {
  id: string
  name: string
  state: string
}

export function NewClaimForm({
  projects,
  defaultProjectId,
  orgId,
}: {
  projects: Project[]
  defaultProjectId?: string
  orgId: string
}) {
  const router = useRouter()
  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const [referenceDate, setReferenceDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedProject = projects.find((p) => p.id === projectId)

  // Show computed deadlines live as user fills in date + project
  const previewDeadlines =
    selectedProject && referenceDate
      ? (() => {
          const state = selectedProject.state as AustralianState
          const rules = STATE_RULES[state]
          const refDate = new Date(referenceDate + 'T00:00:00')
          const responseDate = addBusinessDays(refDate, rules.paymentScheduleBusinessDays, state)
          const adjEnd = addBusinessDays(responseDate, rules.adjudicationWindowBusinessDays, state)
          return {
            responseDate: responseDate.toISOString().split('T')[0],
            adjEnd: adjEnd.toISOString().split('T')[0],
            state,
          }
        })()
      : null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!previewDeadlines) {
      setError('Select a project and reference date to calculate deadlines.')
      setLoading(false)
      return
    }

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: insertError } = await supabase.from('payment_claims').insert({
      project_id: projectId,
      org_id: orgId,
      claim_number: form.get('claim_number') as string,
      reference_date: referenceDate,
      amount_claimed: parseFloat(form.get('amount_claimed') as string),
      response_due_date: previewDeadlines.responseDate,
      adjudication_window_end: previewDeadlines.adjEnd,
      notes: (form.get('notes') as string) || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/claims')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
      )}

      {/* Project selector */}
      <div>
        <label htmlFor="project_id" className="block text-sm font-medium text-slate-700 mb-1">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          id="project_id"
          name="project_id"
          required
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">Select project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.state})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="claim_number" className="block text-sm font-medium text-slate-700 mb-1">
            Claim number <span className="text-red-500">*</span>
          </label>
          <input
            id="claim_number"
            name="claim_number"
            type="text"
            required
            placeholder="PC-001"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="reference_date" className="block text-sm font-medium text-slate-700 mb-1">
            Reference date <span className="text-red-500">*</span>
          </label>
          <input
            id="reference_date"
            name="reference_date"
            type="date"
            required
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="amount_claimed" className="block text-sm font-medium text-slate-700 mb-1">
          Amount claimed ($) <span className="text-red-500">*</span>
        </label>
        <input
          id="amount_claimed"
          name="amount_claimed"
          type="number"
          required
          min="0"
          step="0.01"
          placeholder="125000.00"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Live deadline preview */}
      {previewDeadlines && (
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Calculated deadlines ({previewDeadlines.state})
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Response (payment schedule) due</span>
            <span className="font-medium text-slate-900">{previewDeadlines.responseDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Adjudication window closes</span>
            <span className="font-medium text-slate-900">{previewDeadlines.adjEnd}</span>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            Based on {STATE_RULES[previewDeadlines.state].actName}{' '}
            {STATE_RULES[previewDeadlines.state].actYear}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Brief description of works claimed…"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : 'Log claim'}
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Deadlines are indicative. Always confirm with a legal professional before making adjudication decisions.
      </p>
    </form>
  )
}
