'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

// ── helpers ──────────────────────────────────────────────────────────────────

async function getOrgId(): Promise<string> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) throw new Error('No organisation found')
  return membership.org_id
}

// ── create project ────────────────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const supabase = createServerClient()
  const orgId = await getOrgId()

  const contractValue = parseFloat(formData.get('contract_value') as string)
  const retentionPct = parseFloat(formData.get('retention_percentage') as string) || 5
  const pcDate = (formData.get('practical_completion_date') as string) || null
  const dlpDays = parseInt(formData.get('defects_liability_period_days') as string) || 365

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      name: formData.get('name') as string,
      head_contractor: formData.get('head_contractor') as string,
      contract_value: contractValue,
      retention_percentage: retentionPct,
      state: formData.get('state') as string,
      contract_start_date: formData.get('contract_start_date') as string,
      practical_completion_date: pcDate,
      defects_liability_period_days: dlpDays,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (error || !project) throw new Error(error?.message ?? 'Failed to create project')

  // Auto-create retention record
  const totalRetention = contractValue * (retentionPct / 100)
  const pcReleaseAmount = totalRetention * 0.5
  const dlpReleaseAmount = totalRetention * 0.5

  let dlpReleaseDate: string | null = null
  if (pcDate) {
    const dlp = new Date(pcDate)
    dlp.setDate(dlp.getDate() + dlpDays)
    dlpReleaseDate = dlp.toISOString().split('T')[0]
  }

  await supabase.from('retentions').insert({
    project_id: project.id,
    org_id: orgId,
    total_retention_held: totalRetention,
    pc_release_date: pcDate,
    pc_release_amount: pcDate ? pcReleaseAmount : null,
    dlp_release_date: dlpReleaseDate,
    dlp_release_amount: dlpReleaseDate ? dlpReleaseAmount : null,
  })

  revalidatePath('/projects')
  redirect(`/projects/${project.id}`)
}

// ── update project ────────────────────────────────────────────────────────────

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = createServerClient()
  const orgId = await getOrgId()

  const contractValue = parseFloat(formData.get('contract_value') as string)
  const retentionPct = parseFloat(formData.get('retention_percentage') as string) || 5
  const pcDate = (formData.get('practical_completion_date') as string) || null
  const dlpDays = parseInt(formData.get('defects_liability_period_days') as string) || 365

  const { error } = await supabase
    .from('projects')
    .update({
      name: formData.get('name') as string,
      head_contractor: formData.get('head_contractor') as string,
      contract_value: contractValue,
      retention_percentage: retentionPct,
      state: formData.get('state') as string,
      contract_start_date: formData.get('contract_start_date') as string,
      practical_completion_date: pcDate,
      defects_liability_period_days: dlpDays,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', projectId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  // Sync retention record
  const totalRetention = contractValue * (retentionPct / 100)
  let dlpReleaseDate: string | null = null
  if (pcDate) {
    const dlp = new Date(pcDate)
    dlp.setDate(dlp.getDate() + dlpDays)
    dlpReleaseDate = dlp.toISOString().split('T')[0]
  }

  await supabase
    .from('retentions')
    .update({
      total_retention_held: totalRetention,
      pc_release_date: pcDate,
      pc_release_amount: pcDate ? totalRetention * 0.5 : null,
      dlp_release_date: dlpReleaseDate,
      dlp_release_amount: dlpReleaseDate ? totalRetention * 0.5 : null,
    })
    .eq('project_id', projectId)
    .eq('org_id', orgId)

  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}

// ── archive project ───────────────────────────────────────────────────────────

export async function archiveProject(projectId: string) {
  const supabase = createServerClient()
  const orgId = await getOrgId()

  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', projectId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  revalidatePath('/projects')
  redirect('/projects')
}
