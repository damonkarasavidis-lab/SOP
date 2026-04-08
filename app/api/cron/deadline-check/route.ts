import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  // TODO (Week 5): implement deadline checking + Resend email notifications
  // See CLAUDE.md — Email Reminders section for full spec.

  return Response.json({ ok: true, message: 'Cron stub — implement in Week 5' })
}
