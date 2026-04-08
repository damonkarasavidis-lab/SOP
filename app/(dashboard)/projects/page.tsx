import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Projects — ClaimTrack' }

export default async function ProjectsPage() {
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
    .select('*')
    .eq('org_id', membership!.org_id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          + New project
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">No projects yet.</p>
          <Link href="/projects/new" className="mt-3 inline-block text-brand-600 text-sm font-medium hover:underline">
            Add your first project →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{project.head_contractor} · {project.state}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  project.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : project.status === 'disputed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-2">
                Contract: ${Number(project.contract_value).toLocaleString('en-AU')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
