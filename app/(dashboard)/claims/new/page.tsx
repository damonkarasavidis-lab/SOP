import { createServerClient } from '@/lib/supabase/server'
import { NewClaimForm } from '@/components/claims/NewClaimForm'

export const metadata = { title: 'Log claim — ClaimTrack' }

export default async function NewClaimPage({
  searchParams,
}: {
  searchParams: { project?: string }
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, state')
    .eq('org_id', membership!.org_id)
    .eq('status', 'active')
    .order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Log payment claim</h1>
      <div className="max-w-2xl">
        <NewClaimForm
          projects={projects ?? []}
          defaultProjectId={searchParams.project}
          orgId={membership!.org_id}
        />
      </div>
    </div>
  )
}
