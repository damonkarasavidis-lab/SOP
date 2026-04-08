'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AUSTRALIAN_STATES } from '@/lib/sop/states'

export function CreateOrgForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [abn, setAbn] = useState('')
  const [state, setState] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be signed in to create an organisation.')
      setLoading(false)
      return
    }

    // Create org
    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .insert({ name, abn: abn || null, state })
      .select('id')
      .single()

    if (orgError || !org) {
      setError(orgError?.message ?? 'Failed to create organisation.')
      setLoading(false)
      return
    }

    // Add current user as owner
    const { error: memberError } = await supabase
      .from('org_members')
      .insert({ org_id: org.id, user_id: user.id, role: 'owner' })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          type="text"
          value={abn}
          onChange={(e) => setAbn(e.target.value)}
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
          required
          value={state}
          onChange={(e) => setState(e.target.value)}
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
        disabled={loading}
        className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Setting up…' : 'Create organisation'}
      </button>
    </form>
  )
}
