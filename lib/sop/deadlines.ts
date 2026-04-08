import { STATE_RULES, type AustralianState } from './states'

// ============================================================
// PUBLIC HOLIDAYS
// Keep updated annually or integrate a public holidays API.
// ============================================================

const PUBLIC_HOLIDAYS: Record<AustralianState, string[]> = {
  NSW: [
    '2024-01-01','2024-01-26','2024-03-29','2024-04-01','2024-04-25','2024-06-10','2024-08-05','2024-10-07','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-04-18','2025-04-21','2025-04-25','2025-06-09','2025-08-04','2025-10-06','2025-12-25','2025-12-26',
  ],
  VIC: [
    '2024-01-01','2024-01-26','2024-03-11','2024-03-29','2024-04-01','2024-04-25','2024-06-10','2024-11-05','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-03-10','2025-04-18','2025-04-21','2025-04-25','2025-06-09','2025-11-04','2025-12-25','2025-12-26',
  ],
  QLD: [
    '2024-01-01','2024-01-26','2024-03-29','2024-04-01','2024-04-25','2024-05-06','2024-08-14','2024-10-07','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-04-18','2025-04-21','2025-04-25','2025-05-05','2025-08-13','2025-10-06','2025-12-25','2025-12-26',
  ],
  SA: [
    '2024-01-01','2024-01-26','2024-03-29','2024-04-01','2024-04-25','2024-06-10','2024-10-07','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-04-18','2025-04-21','2025-04-25','2025-06-09','2025-10-06','2025-12-25','2025-12-26',
  ],
  WA: [
    '2024-01-01','2024-01-26','2024-03-04','2024-03-29','2024-04-01','2024-04-25','2024-06-03','2024-09-23','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-03-03','2025-04-18','2025-04-21','2025-04-25','2025-06-02','2025-09-22','2025-12-25','2025-12-26',
  ],
  TAS: [
    '2024-01-01','2024-01-26','2024-03-29','2024-04-01','2024-04-25','2024-06-10','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-04-18','2025-04-21','2025-04-25','2025-06-09','2025-12-25','2025-12-26',
  ],
  NT: [
    '2024-01-01','2024-01-26','2024-03-29','2024-04-01','2024-04-25','2024-05-06','2024-06-10','2024-08-05','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-04-18','2025-04-21','2025-04-25','2025-05-05','2025-06-09','2025-08-04','2025-12-25','2025-12-26',
  ],
  ACT: [
    '2024-01-01','2024-01-26','2024-03-11','2024-03-29','2024-04-01','2024-04-25','2024-05-27','2024-06-10','2024-08-05','2024-10-07','2024-12-25','2024-12-26',
    '2025-01-01','2025-01-27','2025-03-10','2025-04-18','2025-04-21','2025-04-25','2025-05-26','2025-06-09','2025-08-04','2025-10-06','2025-12-25','2025-12-26',
  ],
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isPublicHoliday(date: Date, state: AustralianState): boolean {
  const dateStr = date.toISOString().split('T')[0]
  return PUBLIC_HOLIDAYS[state]?.includes(dateStr) ?? false
}

function isBusinessDay(date: Date, state: AustralianState): boolean {
  return !isWeekend(date) && !isPublicHoliday(date, state)
}

export function addBusinessDays(startDate: Date, days: number, state: AustralianState): Date {
  const current = new Date(startDate)
  let added = 0
  while (added < days) {
    current.setDate(current.getDate() + 1)
    if (isBusinessDay(current, state)) {
      added++
    }
  }
  return current
}

// ============================================================
// CLAIM DEADLINES
// ============================================================

export interface ClaimDeadlines {
  referenceDate: Date
  responseScheduleDueDate: Date
  adjudicationWindowStart: Date
  adjudicationWindowEnd: Date
  daysUntilResponseDue: number
  daysUntilAdjudicationWindowEnd: number
  isResponseOverdue: boolean
  isAdjudicationWindowOpen: boolean
  isAdjudicationWindowClosed: boolean
  statutoryReference: string
}

/**
 * Calculate statutory deadlines for a payment claim.
 *
 * IMPORTANT: Always call this server-side. Deadline logic is core IP and must
 * never be exposed or calculated on the client.
 */
export function calculateClaimDeadlines(
  referenceDate: Date,
  state: AustralianState,
  today: Date = new Date()
): ClaimDeadlines {
  const rules = STATE_RULES[state]

  const responseScheduleDueDate = addBusinessDays(
    referenceDate,
    rules.paymentScheduleBusinessDays,
    state
  )

  const adjudicationWindowStart = addBusinessDays(responseScheduleDueDate, 1, state)

  const adjudicationWindowEnd = addBusinessDays(
    responseScheduleDueDate,
    rules.adjudicationWindowBusinessDays,
    state
  )

  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntilResponseDue = Math.ceil(
    (responseScheduleDueDate.getTime() - today.getTime()) / msPerDay
  )
  const daysUntilAdjudicationWindowEnd = Math.ceil(
    (adjudicationWindowEnd.getTime() - today.getTime()) / msPerDay
  )

  return {
    referenceDate,
    responseScheduleDueDate,
    adjudicationWindowStart,
    adjudicationWindowEnd,
    daysUntilResponseDue,
    daysUntilAdjudicationWindowEnd,
    isResponseOverdue: today > responseScheduleDueDate,
    isAdjudicationWindowOpen: today >= adjudicationWindowStart && today <= adjudicationWindowEnd,
    isAdjudicationWindowClosed: today > adjudicationWindowEnd,
    statutoryReference: rules.claimStatutoryReference,
  }
}

// ============================================================
// RETENTION DEADLINES
// ============================================================

export interface RetentionDeadlines {
  totalRetentionHeld: number
  pcReleaseDate: Date | null
  pcReleaseAmount: number
  pcDaysUntilRelease: number | null
  pcIsOverdue: boolean
  dlpReleaseDate: Date | null
  dlpReleaseAmount: number
  dlpDaysUntilRelease: number | null
  dlpIsOverdue: boolean
}

export function calculateRetentionDeadlines(
  contractValue: number,
  retentionPercentage: number,
  practicalCompletionDate: Date | null,
  defectsLiabilityPeriodDays: number,
  today: Date = new Date()
): RetentionDeadlines {
  const totalRetentionHeld = contractValue * (retentionPercentage / 100)
  const pcReleaseAmount = totalRetentionHeld * 0.5
  const dlpReleaseAmount = totalRetentionHeld * 0.5
  const msPerDay = 1000 * 60 * 60 * 24

  let pcReleaseDate: Date | null = null
  let dlpReleaseDate: Date | null = null
  let pcDaysUntilRelease: number | null = null
  let dlpDaysUntilRelease: number | null = null
  let pcIsOverdue = false
  let dlpIsOverdue = false

  if (practicalCompletionDate) {
    pcReleaseDate = new Date(practicalCompletionDate)
    dlpReleaseDate = new Date(practicalCompletionDate)
    dlpReleaseDate.setDate(dlpReleaseDate.getDate() + defectsLiabilityPeriodDays)

    pcDaysUntilRelease = Math.ceil((pcReleaseDate.getTime() - today.getTime()) / msPerDay)
    dlpDaysUntilRelease = Math.ceil((dlpReleaseDate.getTime() - today.getTime()) / msPerDay)
    pcIsOverdue = today > pcReleaseDate
    dlpIsOverdue = today > dlpReleaseDate
  }

  return {
    totalRetentionHeld,
    pcReleaseDate,
    pcReleaseAmount,
    pcDaysUntilRelease,
    pcIsOverdue,
    dlpReleaseDate,
    dlpReleaseAmount,
    dlpDaysUntilRelease,
    dlpIsOverdue,
  }
}
