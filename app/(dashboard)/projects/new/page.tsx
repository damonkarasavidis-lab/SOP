import { NewProjectForm } from '@/components/projects/NewProjectForm'

export const metadata = { title: 'New project — ClaimTrack' }

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add project</h1>
      <div className="max-w-2xl">
        <NewProjectForm />
      </div>
    </div>
  )
}
