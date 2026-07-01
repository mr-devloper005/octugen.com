'use client'

import Link from 'next/link'
import { MapPin, Search, ShieldCheck } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.95fr] lg:px-8">
        <div className="rounded-[5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-12 w-12 object-contain" />
            <span>
              <span className="editable-display block text-xl font-semibold">{SITE_CONFIG.name}</span>
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--slot4-soft-muted-text)]">classifieds + business listings</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--slot4-muted-text)]">{globalContent.footer.description || SITE_CONFIG.description}</p>
          <div className="mt-6 grid gap-3 text-sm text-[var(--slot4-muted-text)]">
            <div className="inline-flex items-center gap-2"><Search className="h-4 w-4 text-[var(--slot4-accent)]" /> Search-first browsing across categories</div>
            <div className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> Location-aware discovery with practical details</div>
            <div className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--slot4-accent)]" /> Clean, readable listing pages on every device</div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">Account</h3>
          <div className="mt-4 grid gap-2">
            <Link href="/about" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">About</Link>
            <Link href="/contact" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">Contact</Link>
            {session ? <Link href="/create" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">Create</Link> : null}
            {session ? (
              <button type="button" onClick={logout} className="text-left text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">Logout</button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">Login</Link>
                <Link href="/signup" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">Sign up</Link>
              </>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--editable-border)] bg-[linear-gradient(180deg,rgba(70,132,50,0.18),rgba(10,14,9,0.92))] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--slot4-cream)]">Post with confidence</p>
          <h3 className="editable-display mt-3 text-2xl font-semibold leading-tight text-[var(--slot4-page-text)]">Bring your next listing or business profile online.</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">Create a post, add images, and present details clearly with the same polished layout visitors use to browse.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/create" className="inline-flex items-center rounded-full bg-[var(--editable-cta-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--editable-cta-text)] transition hover:-translate-y-0.5">Create post</Link>
            <Link href="/search" className="inline-flex items-center rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]">Browse more</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--editable-border)] px-4 py-5 text-center text-xs uppercase tracking-[0.16em] text-[var(--slot4-soft-muted-text)]">
        Copyright {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}
