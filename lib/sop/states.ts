export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'

export interface SOPStateRules {
  state: AustralianState
  actName: string
  actYear: number
  /** Business days the respondent has to provide a payment schedule */
  paymentScheduleBusinessDays: number
  /** Business days after payment schedule due date to lodge adjudication */
  adjudicationWindowBusinessDays: number
  /** Whether the state uses 'business days' or 'calendar days' */
  dayType: 'business' | 'calendar'
  /** Statement printed on PDF claim — must reference the act */
  claimStatutoryReference: string
}

export const STATE_RULES: Record<AustralianState, SOPStateRules> = {
  NSW: {
    state: 'NSW',
    actName: 'Building and Construction Industry Security of Payment Act',
    actYear: 1999,
    paymentScheduleBusinessDays: 10,
    adjudicationWindowBusinessDays: 20,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Building and Construction Industry Security of Payment Act 1999 (NSW).',
  },
  VIC: {
    state: 'VIC',
    actName: 'Building and Construction Industry Security of Payment Act',
    actYear: 2002,
    paymentScheduleBusinessDays: 10,
    adjudicationWindowBusinessDays: 20,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Building and Construction Industry Security of Payment Act 2002 (VIC).',
  },
  QLD: {
    state: 'QLD',
    actName: 'Building Industry Fairness (Security of Payment) Act',
    actYear: 2017,
    paymentScheduleBusinessDays: 15,
    adjudicationWindowBusinessDays: 30,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Building Industry Fairness (Security of Payment) Act 2017 (QLD).',
  },
  SA: {
    state: 'SA',
    actName: 'Building and Construction Industry Security of Payment Act',
    actYear: 2009,
    paymentScheduleBusinessDays: 10,
    adjudicationWindowBusinessDays: 20,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Building and Construction Industry Security of Payment Act 2009 (SA).',
  },
  WA: {
    // WA operates under Construction Contracts Act 2004 — different structure
    // Payment disputes rather than payment claims — handle separately in v2
    state: 'WA',
    actName: 'Construction Contracts Act',
    actYear: 2004,
    paymentScheduleBusinessDays: 14,
    adjudicationWindowBusinessDays: 28,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Construction Contracts Act 2004 (WA).',
  },
  TAS: {
    state: 'TAS',
    actName: 'Building and Construction Industry Security of Payment Act',
    actYear: 2009,
    paymentScheduleBusinessDays: 10,
    adjudicationWindowBusinessDays: 20,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Building and Construction Industry Security of Payment Act 2009 (TAS).',
  },
  NT: {
    state: 'NT',
    actName: 'Construction Contracts (Security of Payments) Act',
    actYear: 2004,
    paymentScheduleBusinessDays: 14,
    adjudicationWindowBusinessDays: 28,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Construction Contracts (Security of Payments) Act 2004 (NT).',
  },
  ACT: {
    state: 'ACT',
    actName: 'Building and Construction Industry (Security of Payment) Act',
    actYear: 2009,
    paymentScheduleBusinessDays: 10,
    adjudicationWindowBusinessDays: 20,
    dayType: 'business',
    claimStatutoryReference:
      'This is a payment claim made under the Building and Construction Industry (Security of Payment) Act 2009 (ACT).',
  },
}

export const AUSTRALIAN_STATES: AustralianState[] = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']

/** WA has a structurally different act — flag as coming soon in the UI */
export const WA_COMING_SOON = true
