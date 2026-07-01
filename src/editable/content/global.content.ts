import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Local classifieds and business discovery',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Buy, sell, list, and discover with confidence',
    primaryLinks: [
      { label: 'Marketplace', href: '/classified' },
      { label: 'Businesses', href: '/listing' },
      { label: 'Explore', href: '/article' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Browse now', href: '/' },
      secondary: { label: 'Post listing', href: '/create' },
    },
  },
  footer: {
    tagline: 'Marketplace discovery with a premium local feel',
    description: 'Browse classifieds, compare businesses, and explore fresh opportunities through a cleaner search-first experience.',
    columns: [
      {
        title: 'Browse',
        links: [
          { label: 'Classifieds', href: '/classified' },
          { label: 'Business listings', href: '/listing' },
          { label: 'Articles', href: '/article' },
          { label: 'Profiles', href: '/profile' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Search-first browsing built for everyday discovery.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
