'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

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

export async function markRetentionReleased(
  retentionId: string,
  releaseType: 'pc' | 'dlp'
) {
  const supabase = createServerClient()
  const orgId = await getOrgId()

  const field = releaseType === 'pc' ? 'pc_release_status' : 'dlp_release_status'

  const { error } = await supabase
    .from('retentions')
    .update({ [field]: 'released' })
    .eq('id', retentionId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  revalidatePath('/retentions')
}
