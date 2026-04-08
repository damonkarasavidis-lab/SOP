import type { AustralianState } from './states'

export type { AustralianState }

export type ProjectStatus = 'active' | 'completed' | 'disputed' | 'archived'

export type ClaimStatus =
  | 'submitted'
  | 'response_received'
  | 'paid'
  | 'disputed'
  | 'adjudication'
  | 'overdue'

export type RetentionReleaseStatus = 'pending' | 'released' | 'overdue'

export type OrgMemberRole = 'owner' | 'admin' | 'member'

export type NotificationType =
  | 'claim_response_due_5_days'
  | 'claim_response_due_today'
  | 'claim_response_overdue'
  | 'claim_adjudication_window_closing_5_days'
  | 'retention_pc_due_30_days'
  | 'retention_pc_due_7_days'
  | 'retention_pc_overdue'
  | 'retention_dlp_due_30_days'
  | 'retention_dlp_due_7_days'
  | 'retention_dlp_overdue'

export type NotificationEntityType = 'payment_claim' | 'retention'

/** Urgency level for UI colour coding */
export type UrgencyLevel = 'red' | 'amber' | 'green'

export function getClaimUrgency(daysUntilResponseDue: number, isOverdue: boolean): UrgencyLevel {
  if (isOverdue || daysUntilResponseDue <= 3) return 'red'
  if (daysUntilResponseDue <= 7) return 'amber'
  return 'green'
}

export function getRetentionUrgency(daysUntilRelease: number | null, isOverdue: boolean): UrgencyLevel {
  if (isOverdue) return 'red'
  if (daysUntilRelease == null) return 'green'
  if (daysUntilRelease <= 7) return 'red'
  if (daysUntilRelease <= 30) return 'amber'
  return 'green'
}
