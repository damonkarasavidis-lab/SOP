'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { calculateClaimDeadlines } from '@/lib/sop/deadlines'
import type { AustralianState } from '@/lib/sop/states'

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

export async function createClaim(formData: FormData) {
  const supabase = createServerClient()
  const orgId = await getOrgId()

  const projectId = formData.get('project_id') as string
  const referenceDate = formData.get('reference_date') as string

  // Fetch project to get state for deadline calculation
  const { data: project } = await supabase
    .from('projects')
    .select('state')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error('Project not found')

  // Calculate deadlines server-side — core IP, never on client
  const deadlines = calculateClaimDeadlines(
    new Date(referenceDate + 'T00:00:00'),
    project.state as AustralianState
  )

  const { data: claim, error } = await supabase
    .from('payment_claims')
    .insert({
      project_id: projectId,
      org_id: orgId,
      claim_number: formData.get('claim_number') as string,
      reference_date: referenceDate,
      amount_claimed: parseFloat(formData.get('amount_claimed') as string),
      response_due_date: deadlines.responseScheduleDueDate.toISOString().split('T')[0],
      adjudication_window_end: deadlines.adjudicationWindowEnd.toISOString().split('T')[0],
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (error || !claim) throw new Error(error?.message ?? 'Failed to create claim')

  revalidatePath('/claims')
  revalidatePath(`/projects/${projectId}`)
  redirect(`/claims/${claim.id}`)
}

export async function updateClaimStatus(
  claimId: string,
  status: 'submitted' | 'response_received' | 'paid' | 'disputed' | 'adjudication' | 'overdue',
  amountPaid?: number
) {
  const supabase = createServerClient()
  const orgId = await getOrgId()

  const { error } = await supabase
    .from('payment_claims')
    .update({
      status,
      ...(amountPaid != null ? { amount_paid: amountPaid } : {}),
    })
    .eq('id', claimId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  revalidatePath(`/claims/${claimId}`)
  revalidatePath('/claims')
}

export async function markPaymentScheduleReceived(
  claimId: string,
  scheduleDate: string,
  scheduleAmount: number
) {
  const supabase = createServerClient()
  const orgId = await getOrgId()

  const { error } = await supabase
    .from('payment_claims')
    .update({
      payment_schedule_received: true,
      payment_schedule_date: scheduleDate,
      payment_schedule_amount: scheduleAmount,
      status: 'response_received',
    })
    .eq('id', claimId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  revalidatePath(`/claims/${claimId}`)
}
