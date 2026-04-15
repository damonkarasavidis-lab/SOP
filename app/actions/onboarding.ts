'use server'

import { createServerClient as createSupabaseSSR, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createOrganisation(formData: FormData) {
  const name = formData.get('name') as string
  const abn = (formData.get('abn') as string) || null
  const state = formData.get('state') as string

  if (!name || !state) {
    return { error: 'Business name and state are required.' }
  }

  const cookieStore = cookies()
  const supabase = createSupabaseSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to create an organisation.' }

  const { error } = await supabase.rpc('create_organisation', {
    org_name: name,
    org_abn: abn,
    org_state: state,
  })

  if (error) return { error: error.message }

  redirect('/dashboard')
}
