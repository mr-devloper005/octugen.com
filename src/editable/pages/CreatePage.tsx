'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Lock, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const tone = {
  shell: 'bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]',
  panel: 'rounded-sm border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]',
  soft: 'rounded-sm border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]',
  muted: 'text-[var(--slot4-muted-text)]',
}

const fieldClass = 'rounded-sm border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)]'
const buttonClass = 'inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-[var(--slot4-accent)] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[var(--slot4-on-accent)] transition hover:brightness-95'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'classified'), [])
  const activeTask = enabledTasks[0]
  const task = (activeTask?.key || 'article') as TaskKey
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell className={tone.shell}>
        <main className="px-4 py-14 sm:px-6 lg:px-8">
          <section className="mx-auto grid max-w-[var(--editable-container)] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <article className={`${tone.panel} p-8 lg:p-12`}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{pagesContent.create.locked.badge}</p>
              <h1 className="editable-display mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.02em]">{pagesContent.create.locked.title}</h1>
              <p className={`mt-5 max-w-2xl text-base leading-8 ${tone.muted}`}>{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-sm bg-[var(--slot4-accent)] px-6 py-3 text-sm font-bold text-[var(--slot4-on-accent)]">Login <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-sm border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)]">Sign up</Link>
              </div>
            </article>
            <aside className={`${tone.soft} flex min-h-72 items-center justify-center p-8 lg:min-h-[28rem]`}>
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
                  <Lock className="h-9 w-9 text-[var(--slot4-accent)]" />
                </div>
                <p className="mt-6 text-sm leading-7 text-[var(--slot4-muted-text)]">Sign in to open the publishing workspace and submit new content.</p>
              </div>
            </aside>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell className={tone.shell}>
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-[var(--editable-container)] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <aside>
            <article className={`${tone.panel} p-8 lg:p-10`}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{pagesContent.create.hero.badge}</p>
              <h1 className="editable-display mt-5 max-w-lg text-5xl font-semibold tracking-[-0.02em]">{pagesContent.create.hero.title}</h1>
              <p className={`mt-5 max-w-xl text-base leading-8 ${tone.muted}`}>{pagesContent.create.hero.description}</p>
            </article>
          </aside>

          <form onSubmit={submit} className={`${tone.panel} p-6 sm:p-7`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Create {activeTask?.label || 'post'}</p>
                  <h2 className="editable-display mt-2 text-3xl font-semibold">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slot4-page-text)]">{session.name}</span>
              </div>

              <div className="mt-6 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
                  <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm text-emerald-50/80">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className={`mt-5 ${buttonClass}`}>
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
          </form>
        </section>
      </main>
    </EditableSiteShell>
  )
}
