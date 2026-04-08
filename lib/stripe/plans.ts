export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID!,
    limits: {
      projects: 3,
      users: 1,
    },
  },
  growth: {
    name: 'Growth',
    price: 129,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    limits: {
      projects: 15,
      users: 3,
    },
  },
  business: {
    name: 'Business',
    price: 299,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    limits: {
      projects: Infinity,
      users: 10,
    },
  },
} as const

export type PlanKey = keyof typeof PLANS
