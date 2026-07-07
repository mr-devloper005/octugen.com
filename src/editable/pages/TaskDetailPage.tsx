import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Mail, MapPin, Phone, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function DetailMeta({ post, category }: { post: SitePost; category?: string }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--slot4-cream)] text-[var(--slot4-cream)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task="article" />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
            {images[0] ? <img src={images[0]} alt="" className="aspect-[16/8] w-full object-cover" /> : null}
            <div className="p-6 sm:p-8">
              <Kicker task="article">{categoryOf(post, 'Article')}</Kicker>
              <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-5xl">{post.title}</h1>
              <div className="mt-4 text-sm text-[var(--tk-muted)]">{SITE_CONFIG.name}</div>
              {leadText(post) ? <p className="mt-5 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
              <BodyContent post={post} />
              <div className="mx-auto max-w-6xl px-4 py-6">
                <Ads slot="article-bottom" showLabel eager className="mx-auto w-full" />
              </div>
              <EditableArticleComments slug={post.slug} comments={comments} />
            </div>
          </article>
          <aside className="space-y-6">
            <InfoPanel title="Quick overview" rows={[['Category', categoryOf(post, 'Article')], ['Source', SITE_CONFIG.name]]} />
            <RelatedPanel task="article" post={post} related={related} />
          </aside>
        </div>
      </section>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task="listing" />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full min-h-[320px] w-full object-cover" /> : <div className="flex min-h-[320px] items-center justify-center"><Building2 className="h-12 w-12 text-[var(--tk-muted)]" /></div>}
              </div>
              <div className="p-6 sm:p-8">
                <Kicker task="listing">Business listing</Kicker>
                <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.03] tracking-[-0.04em]">{post.title}</h1>
                <DetailMeta post={post} category={categoryOf(post, 'Business')} />
                {leadText(post) ? <p className="mt-5 text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
                <div className="mt-6 grid gap-3">
                  <BadgeLine label="Location" value={getField(post, ['location', 'address', 'city']) || 'See detail section'} />
                  {getField(post, ['phone', 'telephone', 'mobile']) ? <BadgeLine label="Phone" value={getField(post, ['phone', 'telephone', 'mobile'])} /> : null}
                  {getField(post, ['website', 'url']) ? <BadgeLine label="Website" value={getField(post, ['website', 'url'])} /> : null}
                </div>
                <div className="mt-6">
                  <ContactAction website={getField(post, ['website', 'url'])} phone={getField(post, ['phone', 'telephone', 'mobile'])} email={getField(post, ['email'])} />
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <BodyContent post={post} />
              <ImageStrip images={images.slice(1)} label="Business gallery" />
            </div>
          </article>
          <aside className="space-y-6">
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="sidebar" showLabel eager className="mx-auto w-full" />
            </div>
            {mapSrc ? <MapBox src={mapSrc} label={getField(post, ['location', 'address', 'city']) || post.title} /> : null}
            <InfoPanel title="Business details" rows={[['Category', categoryOf(post, 'Business')], ['Location', getField(post, ['location', 'address', 'city']) || 'Available on request']]} />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>
      <RelatedStrip task="listing" related={related} />
    </>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task="classified" />
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8 xl:sticky xl:top-24 xl:self-start">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-3xl font-semibold leading-tight">{post.title}</h1>
            <p className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[var(--slot4-cream)]">{getField(post, ['price', 'amount', 'budget']) || 'Open offer'}</p>
            <DetailMeta post={post} category={categoryOf(post, 'Listing')} />
            <div className="mt-6 grid gap-3">
              {getField(post, ['condition', 'availability', 'type']) ? <BadgeLine label="Condition" value={getField(post, ['condition', 'availability', 'type'])} /> : null}
              <BadgeLine label="Location" value={getField(post, ['location', 'address', 'city']) || 'Available on detail page'} />
            </div>
            <div className="mt-6">
              <ContactAction website={getField(post, ['website', 'url'])} phone={getField(post, ['phone', 'telephone', 'mobile'])} email={getField(post, ['email'])} />
            </div>
          </aside>
          <article className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
            <ImageStrip images={images.length ? images : ['/placeholder.svg?height=900&width=1200']} label="Listing photos" large />
            <BodyContent post={post} />
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task="image" />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="columns-1 gap-5 sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8 xl:sticky xl:top-24 xl:self-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tk-accent)]"><Camera className="h-3.5 w-3.5" /> Image story</div>
            <h1 className="editable-display mt-5 text-4xl font-semibold leading-[1.03]">{post.title}</h1>
            {leadText(post) ? <p className="mt-5 text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task="sbm" />
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
            <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
            <h1 className="editable-display mt-4 text-3xl font-semibold leading-tight">{post.title}</h1>
            {website ? <Link href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)]">Open resource <ExternalLink className="h-4 w-4" /></Link> : null}
          </aside>
          <article className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
            <BodyContent post={post} />
          </article>
        </div>
      </section>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.4rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-9 w-9" /></div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-3xl font-semibold leading-tight">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)]">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6">
          {fileUrl ? (
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-sm font-semibold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)]">Download <Download className="h-4 w-4" /></Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-center sm:p-8 xl:sticky xl:top-24 xl:self-start">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
              {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
            </div>
            <h1 className="editable-display mt-6 text-2xl font-semibold">{post.title}</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--tk-accent)]">{getField(post, ['role', 'designation', 'company', 'location']) || categoryOf(post, 'Profile')}</p>
            <DetailMeta post={post} category={categoryOf(post, 'Profile')} />
            <div className="mt-6">
              <ContactAction website={getField(post, ['website', 'url'])} email={getField(post, ['email'])} bare />
            </div>
          </aside>
          <article className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="footer" showLabel eager className="mx-auto w-full" />
            </div>
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[1.4rem] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)]">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return buttons
  return <div>{buttons}</div>
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function InfoPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  const visible = rows.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-muted)]">{title}</p>
      <div className="mt-4 grid gap-3">
        {visible.map(([label, value]) => <BadgeLine key={label} label={label} value={value} />)}
      </div>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
          <p className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-[var(--tk-accent)]" /> {post.title}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-semibold">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-[1.2rem] border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[0.9rem] object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.9rem] bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
