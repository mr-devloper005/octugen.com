import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Plus Jakarta Sans', system-ui, sans-serif"
const BODY_FONT = "'Manrope', system-ui, sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#0b0f0a',
  surface: '#10150f',
  raised: '#171e14',
  text: '#f7f4de',
  muted: '#b8c0a7',
  line: 'rgba(255, 239, 145, 0.12)',
  accent: '#9AD872',
  accentSoft: 'rgba(154, 216, 114, 0.12)',
  onAccent: '#081006',
  glow: 'rgba(154, 216, 114, 0.14)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Guide', note: 'Useful reads and editorial updates with marketplace rhythm.' },
  listing: { ...base, kicker: 'Business', note: 'Business pages with stronger details, contact actions, and supporting context.' },
  classified: { ...base, kicker: 'Listing', note: 'Price-first local opportunities designed for quick scanning.' },
  image: { ...base, kicker: 'Gallery', note: 'Visual posts presented with richer image-first browsing.' },
  sbm: { ...base, kicker: 'Resource', note: 'Saved links and references with a clean premium shell.' },
  pdf: { ...base, kicker: 'Document', note: 'Reference files and downloads with clear actions and preview space.' },
  profile: { ...base, kicker: 'Profile', note: 'People and business profiles with focused identity layouts.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': '#468432',
    '--slot4-cream': '#FFEF91',
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
