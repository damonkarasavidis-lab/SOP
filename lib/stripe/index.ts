// TODO (Week 7): Stripe integration
// See CLAUDE.md — Stripe Plans section for full spec.

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})
