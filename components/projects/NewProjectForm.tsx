'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AUSTRALIAN_STATES } from '@/lib/sop/states'

export function NewProjectForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { data: membership } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!membership) { setError('No organisation found'); setLoading(false); return }

    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        org_id: membership.org_id,
        name: form.get('name') as string,
        head_contractor: form.get('head_contractor') as string,
        contract_value: parseFloat(form.get('contract_value') as string),
        retention_percentage: parseFloat(form.get('retention_percentage') as string) || 5,
        state: form.get('state') as string,
        contract_start_date: form.get('contract_start_date') as string,
        practical_completion_date: (form.get('practical_completion_date') as string) || null,
        defects_liability_period_days: parseInt(form.get('defects_liability_period_days') as string) || 365,
        notes: (form.get('notes') as string) || null,
      })
      .select('id')
      .single()

    if (insertError || !project) {
      setError(insertError?.message ?? 'Failed to create project')
      setLoading(false)
      return
    }

    router.push(`/projects/${project.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
      )}

      <Field label="Project name" name="name" required placeholder="City Hall Fit-out" />
      <Field label="Head contractor" name="head_contractor" required placeholder="BuildCo Pty Ltd" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Contract value ($)" name="contract_value" type="number" required placeholder="500000" min="0" step="0.01" />
        <Field label="Retention (%)" name="retention_percentage" type="number" defaultValue="5" placeholder="5" min="0" max="20" step="0.01" />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <select
          id="state"
          name="state"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">Select state…</option>
          {AUSTRALIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Contract start date" name="contract_start_date" type="date" required />
        <Field label="Practical completion date" name="practical_completion_date" type="date" />
      </div>

      <Field
        label="Defects liability period (days)"
        name="defects_liability_period_days"
        type="number"
        defaultValue="365"
        placeholder="365"
        min="1"
      />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Any additional notes…"
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
          {loading ? 'Saving…' : 'Add project'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  defaultValue,
  min,
  max,
  step,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  min?: string
  max?: string
  step?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>
  )
}
