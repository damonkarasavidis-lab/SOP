// TODO (Week 5): Resend email reminder functions
// See CLAUDE.md — Email Reminders section for full spec.

import type { NotificationType } from '@/lib/sop/types'

export interface ReminderPayload {
  to: string
  orgName: string
  notificationType: NotificationType
  entityId: string
  amount?: number
  dueDate?: string
  projectName?: string
}

/** Send a reminder email via Resend */
export async function sendReminder(_payload: ReminderPayload): Promise<void> {
  // Stub — implement in Week 5
  throw new Error('Email reminders not yet implemented — coming in Week 5')
}
