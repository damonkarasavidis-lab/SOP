'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/projects', label: 'Projects', icon: '◻' },
  { href: '/claims', label: 'Claims', icon: '◈' },
  { href: '/retentions', label: 'Retentions', icon: '◎' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <span className="text-base font-bold text-slate-900">ClaimTrack</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <span className="text-base leading-none">→</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
