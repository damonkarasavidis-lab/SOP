import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = { title: 'Create account — ClaimTrack' }

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">ClaimTrack</h1>
          <p className="mt-1 text-sm text-slate-500">Create your account to get started</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
