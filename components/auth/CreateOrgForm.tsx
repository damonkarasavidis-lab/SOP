'use client'

import { useTransition, useState } from 'react'
import { createOrganisation } from '@/app/actions/onboarding'
import { AUSTRALIAN_STATES } from '@/lib/sop/states'

export function CreateOrgForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createOrganisation(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
      )}

      <div>
        <label htmlFor="org-name" className="block text-sm font-medium text-slate-700 mb-1">
          Business name <span className="text-red-500">*</span>
        </label>
        <input
          id="org-name"
          name="name"
          type="text"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Smith Electrical Pty Ltd"
        />
      </div>

      <div>
        <label htmlFor="abn" className="block text-sm font-medium text-slate-700 mb-1">
          ABN <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          id="abn"
          name="abn"
          type="text"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="12 345 678 901"
          maxLength={14}
        />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
          Primary state <span className="text-red-500">*</span>
        </label>
        <select
          id="state"
          name="state"
          required
          defaultValue=""
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
        >
          <option value="">Select state…</option>
          {AUSTRALIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">
          This sets your default SOP legislation. You can use different states per project.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Setting up…' : 'Create organisation'}
      </button>
    </form>
  )
}
