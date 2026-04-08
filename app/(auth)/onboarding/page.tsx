import { CreateOrgForm } from '@/components/auth/CreateOrgForm'

export const metadata = { title: 'Set up your organisation — ClaimTrack' }

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to ClaimTrack</h1>
          <p className="mt-2 text-sm text-slate-500">
            Set up your organisation to start tracking claims and retentions.
          </p>
        </div>
        <CreateOrgForm />
      </div>
    </div>
  )
}
