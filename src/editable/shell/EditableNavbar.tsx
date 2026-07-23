'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Menu, Plus, Search, User, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenTaskButtons = new Set(['listing', 'classified'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskButtons.has(task.key)).map((task) => ({ label: task.label, href: task.route })),
    []
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[var(--editable-container)] items-center gap-3 px-3 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-3 py-2">
          <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
          <span className="hidden min-w-0 md:block">
            <span className="editable-display block max-w-[150px] truncate text-lg font-semibold">{SITE_CONFIG.name}</span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">local marketplace</span>
          </span>
        </Link>

        <form action="/search" className="hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--editable-search-bg)] px-4 py-2.5 md:flex">
          <Search className="h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)]" />
          <input
            name="q"
            type="search"
            placeholder={globalContent.nav.tagline}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
          />
          <button type="submit" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--slot4-accent-fill)] text-[var(--slot4-on-accent)] transition hover:brightness-110">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link href="/search" className="inline-flex flex-col items-center px-2 text-xs font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
            <Heart className="h-4 w-4" />
            Wishlist
          </Link>
          {session ? (
            <button type="button" onClick={logout} className="inline-flex flex-col items-center px-2 text-xs font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
              <User className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link href="/login" className="inline-flex flex-col items-center px-2 text-xs font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
              <User className="h-4 w-4" />
              Login
            </Link>
          )}
          <Link href="/create" className="inline-flex items-center gap-2 rounded-full border border-[var(--slot4-accent-fill)] bg-[linear-gradient(90deg,var(--slot4-cream)_0_28%,var(--editable-cta-bg)_28%_100%)] px-5 py-3 text-sm font-bold text-[var(--editable-cta-text)] transition hover:-translate-y-0.5">
            <Plus className="h-4 w-4" />
            SELL
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto inline-flex items-center justify-center rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-3 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-5 md:hidden">
          <form action="/search" className="flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--editable-search-bg)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--slot4-soft-muted-text)]" />
            <input name="q" type="search" placeholder="Search listings, services, and more" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-soft-muted-text)]" />
          </form>
          <div className="mt-4 grid gap-2">
            {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    active
                      ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                      : 'border-[var(--editable-border)] text-[var(--slot4-page-text)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </header>
  )
}
