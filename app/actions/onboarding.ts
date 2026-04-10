'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createOrganisation(formData: FormData) {
  const name = formData.get('name') as string
  const abn = formData.get('abn') as string | null
  const state = formData.get('state') as string

  if (!name || !state) {
    return { error: 'Business name and state are required.' }
  }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to create an organisation.' }
  }

  const { data: org, error: orgError } = await supabase
    .from('organisations')
    .insert({ name, abn: abn || null, state })
    .select('id')
    .single()

  if (orgError || !org) {
    return { error: orgError?.message ?? 'Failed to create organisation.' }
  }

  const { error: memberError } = await supabase
    .from('org_members')
    .insert({ org_id: org.id, user_id: user.id, role: 'owner' })

  if (memberError) {
    return { error: memberError.message }
  }

  redirect('/dashboard')
}
