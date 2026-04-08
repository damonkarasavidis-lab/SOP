'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AUSTRALIAN_STATES } from '@/lib/sop/states'
import { updateProject, archiveProject } from '@/app/actions/projects'

interface Project {
  id: string
  name: string
  head_contractor: string
  contract_value: number
  retention_percentage: number
  state: string
  contract_start_date: string
  practical_completion_date: string | null
  defects_liability_period_days: number
  status: string
  notes: string | null
}

export function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [archiving, startArchive] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => updateProject(project.id, formData))
  }

  function handleArchive() {
    if (!confirm('Archive this project? It will be hidden from active views.')) return
    startArchive(() => archiveProject(project.id))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <Field label="Project name" name="name" required defaultValue={project.name} />
      <Field label="Head contractor" name="head_contractor" required defaultValue={project.head_contractor} />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Contract value ($)"
          name="contract_value"
          type="number"
          required
          defaultValue={String(project.contract_value)}
          min="0"
          step="0.01"
        />
        <Field
          label="Retention (%)"
          name="retention_percentage"
          type="number"
          defaultValue={String(project.retention_percentage)}
          min="0"
          max="20"
          step="0.01"
        />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <select
          id="state"
          name="state"
          required
          defaultValue={project.state}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          {AUSTRALIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Contract start date"
          name="contract_start_date"
          type="date"
          required
          defaultValue={project.contract_start_date}
        />
        <Field
          label="Practical completion date"
          name="practical_completion_date"
          type="date"
          defaultValue={project.practical_completion_date ?? ''}
        />
      </div>

      <Field
        label="Defects liability period (days)"
        name="defects_liability_period_days"
        type="number"
        defaultValue={String(project.defects_liability_period_days)}
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
          defaultValue={project.notes ?? ''}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
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
          disabled={pending}
          className="flex-1 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {project.status !== 'archived' && (
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleArchive}
            disabled={archiving}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {archiving ? 'Archiving…' : 'Archive project'}
          </button>
        </div>
      )}
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  min,
  max,
  step,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
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
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>
  )
}
