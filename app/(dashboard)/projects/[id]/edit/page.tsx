import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { EditProjectForm } from '@/components/projects/EditProjectForm'

export const metadata = { title: 'Edit project — ClaimTrack' }

export default async function EditProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  return (
    <div>
      <Link
        href={`/projects/${params.id}`}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block"
      >
        ← Back to project
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit project</h1>
      <div className="max-w-2xl">
        <EditProjectForm project={project} />
      </div>
    </div>
  )
}
