import Link from 'next/link'
import {
  ArrowRight, BriefcaseBusiness, Building2, Camera, ChevronRight, FileText, Heart,
  Image as ImageIcon, MapPin, Megaphone, Search, Star, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'
const hiddenTaskButtons: TaskKey[] = ['listing', 'classified']
const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: BriefcaseBusiness,
  pdf: FileText,
  profile: UserRound,
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function displayPrice(post: SitePost) {
  const content = post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const price = typeof content.price === 'string' ? content.price : typeof content.amount === 'string' ? content.amount : typeof content.budget === 'string' ? content.budget : ''
  return price || 'Contact for price'
}

function displayLocation(post: SitePost) {
  const content = post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const location = typeof content.location === 'string' ? content.location : typeof content.address === 'string' ? content.address : typeof content.city === 'string' ? content.city : ''
  return location || 'Location available on detail page'
}

function RatingRow({ post }: { post: SitePost }) {
  const rating = 3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10
  const rounded = Math.round(rating)
  return (
    <div className="mt-2 flex items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < rounded ? 'fill-[var(--slot4-cream)] text-[var(--slot4-cream)]' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'}`} />
        ))}
      </span>
      <span className="font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
    </div>
  )
}

function CategoryTile({ label, href, Icon, image }: { label: string; href: string; Icon: typeof FileText; image?: string }) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-3 rounded-[1.65rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-[var(--slot4-accent)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,239,145,0.08),rgba(154,216,114,0.12))]">
        {image && !image.includes('placeholder') ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Icon className="h-8 w-8 text-[var(--slot4-accent)]" />}
      </div>
      <span className="text-sm font-semibold text-[var(--slot4-page-text)]">{label}</span>
    </Link>
  )
}

function FeaturedMarketplaceCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,5,0.08),rgba(5,8,5,0.82))]" />
      <div className="relative flex min-h-[360px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-8">
        <span className="inline-flex w-fit rounded-full bg-[var(--slot4-cream)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#111]">Featured</span>
        <h2 className="editable-display mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">{post.title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-white/78">{getEditableExcerpt(post, 180) || 'Browse the full details, images, and related recommendations for this featured post.'}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/78">
          <span>{displayPrice(post)}</span>
          <span className="h-1 w-1 rounded-full bg-white/40" />
          <span>{displayLocation(post)}</span>
        </div>
      </div>
    </Link>
  )
}

function CompactMarketplaceCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)]">
      <div className="relative aspect-[5/4] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <button type="button" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(8,12,8,0.75)] text-white">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <div className="border-l-4 border-[var(--editable-cta-bg)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{index % 3 === 0 ? 'Featured' : getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--slot4-page-text)]">{displayPrice(post)}</h3>
        <p className="mt-1 line-clamp-2 text-base font-medium text-[var(--slot4-page-text)]/90">{post.title}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--slot4-soft-muted-text)]">{displayLocation(post)}</p>
      </div>
    </Link>
  )
}

function HorizontalMarketplaceCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group grid overflow-hidden rounded-[1.75rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.28)] md:grid-cols-[240px_minmax(0,1fr)]">
      <div className="relative min-h-[230px] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-[var(--editable-border)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">{getEditableCategory(post)}</span>
          <Heart className="h-5 w-5 text-[var(--slot4-soft-muted-text)]" />
        </div>
        <h3 className="editable-display mt-4 text-2xl font-semibold leading-tight text-[var(--slot4-page-text)]">{post.title}</h3>
        <RatingRow post={post} />
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 140) || 'Open this post to see the full description, location, and related actions.'}</p>
        <div className="mt-auto pt-5 text-sm font-semibold text-[var(--slot4-accent)]">Open details</div>
      </div>
    </Link>
  )
}

function EditorialMarketplaceCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group flex gap-4 rounded-[1.5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <BriefcaseBusiness className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">{getEditableCategory(post) || 'Fresh pick'}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 95) || 'Explore the summary and key details on the full page.'}</p>
      </div>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.75rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,8,5,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-cream)]">{getEditableCategory(post)}</p>
          <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-white">{post.title}</h3>
        </div>
      </div>
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const hero = pool[0]
  const heroImage = hero ? getEditablePostImage(hero) : '/placeholder.svg?height=1200&width=1800'
  const visibleTasks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskButtons.includes(task.key))

  return (
    <section className="pt-6 sm:pt-8">
      <div className={container}>
        <div className="editable-market-grid overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-[linear-gradient(135deg,rgba(20,26,18,0.98),rgba(9,13,8,0.98))]">
          <div className="grid gap-8 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="rounded-[1.85rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">{pagesContent.home.hero.badge}</p>
              <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.02] text-[var(--slot4-page-text)] sm:text-5xl lg:text-6xl">
                {pagesContent.home.hero.title.join(' ')}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.home.hero.description}</p>

              <form action="/search" className="mt-7 flex flex-col gap-3 rounded-[1.75rem] border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] p-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.2rem] bg-[var(--slot4-surface-bg)] px-4 py-3">
                  <Search className="h-5 w-5 shrink-0 text-[var(--slot4-soft-muted-text)]" />
                  <input
                    name="q"
                    placeholder={pagesContent.home.hero.searchPlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                  />
                </div>
                <button className="inline-flex items-center justify-center rounded-[1.2rem] bg-[var(--slot4-accent-fill)] px-7 py-3 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:brightness-110">
                  Search now
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {visibleTasks.slice(0, 6).map((task) => (
                  <Link key={task.key} href={task.route} className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-4 py-2 text-sm text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)]">
                    {task.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.35rem] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-4">
                  <p className="text-2xl font-semibold text-[var(--slot4-page-text)]">10+</p>
                  <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">Active categories</p>
                </div>
                <div className="rounded-[1.35rem] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-4">
                  <p className="text-2xl font-semibold text-[var(--slot4-page-text)]">Fresh</p>
                  <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">Daily browsing flow</p>
                </div>
                <div className="rounded-[1.35rem] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-4">
                  <p className="text-2xl font-semibold text-[var(--slot4-page-text)]">Direct</p>
                  <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">Listing to detail path</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.85rem] border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)]">
              <div className="relative aspect-[16/11] overflow-hidden">
                <img src={heroImage} alt={hero?.title || SITE_CONFIG.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,8,0.04),rgba(8,12,8,0.78))]" />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-cream)]">Featured board</p>
                <h2 className="editable-display mt-3 text-2xl font-semibold text-[var(--slot4-page-text)]">{hero?.title || 'Browse new arrivals across the marketplace'}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{hero ? getEditableExcerpt(hero, 145) : 'Explore highlighted listings and business posts from the latest feed.'}</p>
                <Link href={hero ? postHref(primaryTask, hero, primaryRoute) : primaryRoute} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)]">
                  View featured post <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskButtons.includes(task.key))
  return (
    <section className="pt-10">
      <div className={container}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="editable-display text-3xl font-semibold text-[var(--slot4-page-text)]">Top categories</h2>
            <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Jump into the sections people browse the most.</p>
          </div>
          <Link href={primaryRoute} className="hidden items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)] sm:inline-flex">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((task, index) => {
            const Icon = taskIcon[task.key]
            return <CategoryTile key={task.key} label={task.label} href={task.route} Icon={Icon} image={posts[index] ? getEditablePostImage(posts[index]) : undefined} />
          })}
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 10)
  if (!activity.length) return null

  return (
    <section className="pt-14">
      <div className={container}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="editable-display text-3xl font-semibold text-[var(--slot4-page-text)]">Fresh recommendations</h2>
            <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Featured picks, quick comparisons, and mixed card styles inspired by modern marketplace browsing.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <FeaturedMarketplaceCard post={activity[0]} href={postHref(primaryTask, activity[0], primaryRoute)} />
          <div className="grid gap-5 sm:grid-cols-2">
            {activity.slice(1, 5).map((post, index) => (
              <CompactMarketplaceCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <HorizontalMarketplaceCard post={activity[5] || activity[1]} href={postHref(primaryTask, activity[5] || activity[1], primaryRoute)} />
          <div className="rounded-[1.75rem] border border-[var(--editable-border)] bg-[linear-gradient(180deg,rgba(154,216,114,0.12),rgba(255,160,46,0.14))] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Start selling</p>
            <h3 className="editable-display mt-3 text-3xl font-semibold leading-tight text-[var(--slot4-page-text)]">Want to see your post here?</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">Share a listing, showcase a service, or publish a useful profile with the same premium browsing experience.</p>
            <Link href="/create" className="mt-5 inline-flex items-center rounded-full bg-[var(--slot4-accent-fill)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-on-accent)]">Start posting</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'New this week', title: 'Recent listings and discoveries' },
  browse: { eyebrow: 'Trending picks', title: 'Popular marketplace finds' },
  index: { eyebrow: 'Archive picks', title: 'Older posts still worth opening' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 6), href: primaryRoute },
          { key: 'browse', posts: posts.slice(6, 12), href: primaryRoute },
          { key: 'index', posts: posts.slice(12, 18), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        const featured = section.posts[0]
        const editorial = section.posts.slice(1, 4)
        const imageCard = section.posts[4]
        return (
          <section key={section.key} className="pt-14">
            <div className={container}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-2 text-3xl font-semibold text-[var(--slot4-page-text)]">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)]">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className={`mt-6 grid gap-5 ${index % 2 === 0 ? 'lg:grid-cols-[1.05fr_0.95fr]' : 'lg:grid-cols-[0.95fr_1.05fr]'}`}>
                {featured ? <HorizontalMarketplaceCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} /> : <div />}
                <div className="grid gap-4">
                  {editorial.map((post) => (
                    <EditorialMarketplaceCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  ))}
                </div>
              </div>

              {imageCard ? (
                <div className="mt-5 grid gap-5 md:grid-cols-[0.7fr_1.3fr]">
                  <ImageFirstCard post={imageCard} href={postHref(primaryTask, imageCard, primaryRoute)} />
                  <div className="rounded-[1.75rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-cream)]">Discovery note</p>
                    <h3 className="editable-display mt-3 text-2xl font-semibold text-[var(--slot4-page-text)]">Search, compare, and open details without losing your place.</h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--slot4-muted-text)]">Each block is designed to feel like a different browsing rhythm: image-led, editorial, compact, and comparison-friendly, while still pulling from the same live post feed.</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <span className="rounded-full border border-[var(--editable-border)] px-4 py-2 text-sm text-[var(--slot4-muted-text)]">Featured cards</span>
                      <span className="rounded-full border border-[var(--editable-border)] px-4 py-2 text-sm text-[var(--slot4-muted-text)]">Compact picks</span>
                      <span className="rounded-full border border-[var(--editable-border)] px-4 py-2 text-sm text-[var(--slot4-muted-text)]">Editorial list</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section id="get-app" className="pt-14 pb-16 sm:pb-20">
      <div className={container}>
        <div className="grid gap-6 rounded-[2rem] border border-[var(--editable-border)] bg-[linear-gradient(135deg,rgba(255,160,46,0.16),rgba(70,132,50,0.2),rgba(8,12,8,0.96))] p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-cream)]">Marketplace access</p>
            <h2 className="editable-display mt-3 text-3xl font-semibold leading-tight text-[var(--slot4-page-text)] sm:text-4xl">Browse local opportunities with a cleaner, faster flow.</h2>
          </div>
          <div>
            <p className="text-sm leading-7 text-[var(--slot4-muted-text)]">Use the platform to discover businesses, compare listings, read supporting content, and move from search to detail pages with less clutter and better visual hierarchy.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/create" className="inline-flex items-center rounded-full bg-[var(--editable-cta-bg)] px-6 py-3 text-sm font-semibold text-[var(--editable-cta-text)] transition hover:-translate-y-0.5">Create a post</Link>
              <Link href="/contact" className="inline-flex items-center rounded-full border border-[var(--editable-border)] px-6 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]">Contact us</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
