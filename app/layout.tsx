import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClaimTrack — SOP & Retention Tracker',
  description: 'Track Security of Payment claims, statutory deadlines, and retention balances for Australian subcontractors.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
