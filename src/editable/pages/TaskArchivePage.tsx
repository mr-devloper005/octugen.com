import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, Heart, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const placeholder = '/placeholder.svg?height=900&width=1200'

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo) || asText(content.avatar)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
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

function archiveAdSlot(task: TaskKey): 'header' | 'sidebar' | 'in-feed' | 'footer' {
  if (task === 'article') return 'header'
  if (task === 'profile') return 'in-feed'
  if (task === 'listing') return 'sidebar'
  return 'footer'
}

function RatingLine({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--slot4-cream)] text-[var(--slot4-cream)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
    </div>
  )
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const adSlot = archiveAdSlot(task)

  const featured = posts[0]
  const gridPosts = featured ? posts.slice(1) : posts

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <section className="border-b border-[var(--tk-line)] bg-[rgba(8,12,8,0.78)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{theme.kicker}</span>
              <span className="text-sm text-[var(--tk-muted)]">{label}</span>
            </div>
            <div className="mt-5 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h1 className="editable-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl">{voice?.headline || `Browse ${label}`}</h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
              </div>
              <form action={basePath} className="self-end rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-12 w-full appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none"
                      aria-label={voice?.filterLabel || 'Filter category'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--slot4-accent-fill)] px-6 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">Apply filter</button>
                </div>
                <p className="mt-3 text-sm text-[var(--tk-muted)]"><span className="font-semibold text-[var(--tk-text)]">{posts.length}</span> results in {categoryLabel}</p>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-8 sm:px-6 lg:px-8">
          {featured ? <FeaturedArchiveCard post={featured} href={`${basePath}/${featured.slug}` || buildPostUrl(task, featured.slug)} /> : null}

          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
          </div>

          {posts.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {gridPosts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />)}
              {gridPosts.length > 3 ? <PromoSellCard /> : null}
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-xl rounded-[1.75rem] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return index % 4 === 0 ? <ArticleHorizontalCard post={post} href={href} /> : <ArticleArchiveCard post={post} href={href} />
}

function FavoriteButton() {
  return (
    <span className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(8,12,8,0.82)] text-white">
      <Heart className="h-5 w-5" />
    </span>
  )
}

function FeaturedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[320px] overflow-hidden bg-[var(--tk-raised)]">
          <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <FavoriteButton />
        </div>
        <div className="flex flex-col justify-center border-l border-[var(--tk-line)] p-6 sm:p-8">
          <span className="inline-flex w-fit rounded-full bg-[var(--slot4-cream)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#111]">Featured</span>
          <h2 className="editable-display mt-4 text-3xl font-semibold leading-tight text-[var(--tk-text)]">{post.title}</h2>
          <RatingLine post={post} />
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post) || 'Open the full post for complete details and related recommendations.'}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-[var(--tk-muted)]">
            <span className="font-semibold text-[var(--tk-accent)]">{getField(post, ['price', 'amount', 'budget']) || getCategory(post, 'Featured post')}</span>
            <span>{getField(post, ['location', 'address', 'city']) || 'Location available on detail page'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ArticleArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={getImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <FavoriteButton />
      </div>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Article')}</p>
        <h2 className="mt-3 line-clamp-2 text-2xl font-semibold tracking-[-0.03em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function ArticleHorizontalCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:col-span-2 xl:col-span-2">
      <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative min-h-[220px] overflow-hidden bg-[var(--tk-raised)]">
          <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </div>
        <div className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Article')}</p>
          <h2 className="editable-display mt-3 text-3xl font-semibold leading-tight">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
          <div className="mt-4 text-sm font-semibold text-[var(--tk-accent)]">Read article</div>
        </div>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  return (
    <Link href={href} className="group flex gap-4 rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Business')}</p>
        <h2 className="line-clamp-2 text-xl font-semibold">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--tk-muted)]">
          {getField(post, ['location', 'address', 'city']) ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {getField(post, ['location', 'address', 'city'])}</span> : null}
          {getField(post, ['phone', 'telephone', 'mobile']) ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {getField(post, ['phone', 'telephone', 'mobile'])}</span> : null}
          {getField(post, ['website', 'url']) ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="relative aspect-[5/4] overflow-hidden bg-[var(--tk-raised)]">
        <img src={getImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <FavoriteButton />
      </div>
      <div className="border-l-4 border-[var(--editable-cta-bg)] p-5">
        <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--tk-text)]">{getField(post, ['price', 'amount', 'budget']) || 'Open offer'}</p>
        <p className="mt-1 line-clamp-1 text-base font-medium">{post.title}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[var(--slot4-soft-muted-text)]">
          <span>{getField(post, ['location', 'address', 'city']) || 'See details'}</span>
          <span>{getField(post, ['condition', 'type', 'availability']) || getCategory(post, 'Listed')}</span>
        </div>
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}>
        <img src={getImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(5,8,5,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-cream)]">{getCategory(post, 'Visual')}</p>
          <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="flex gap-4 rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-muted)]">{getCategory(post, 'Resource')}</p>
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="flex flex-col rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-6 w-6" /></div>
        <Download className="h-5 w-5 text-[var(--tk-muted)]" />
      </div>
      <h2 className="mt-5 line-clamp-2 text-xl font-semibold">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  return (
    <Link href={href} className="flex flex-col items-center rounded-[1.65rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{post.title}</h2>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--tk-accent)]">{getField(post, ['role', 'designation', 'company', 'location']) || getCategory(post, 'Profile')}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}

function PromoSellCard() {
  return (
    <div className="flex min-h-[280px] flex-col justify-center rounded-[1.75rem] border border-[var(--tk-line)] bg-[linear-gradient(180deg,rgba(70,132,50,0.28),rgba(255,160,46,0.18))] p-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--tk-accent)]">Want to see your post here?</p>
      <h3 className="editable-display mt-3 text-3xl font-semibold leading-tight">Create a listing and get discovered faster.</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Publish a classified, business profile, or helpful resource through the same marketplace layout people already browse.</p>
      <Link href="/create" className="mx-auto mt-5 inline-flex rounded-full bg-[var(--slot4-accent-fill)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)]">Start posting</Link>
    </div>
  )
}
