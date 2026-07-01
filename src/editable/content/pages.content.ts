import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Local classifieds, business listings, and fresh finds',
      description: 'Search local listings, discover businesses, and browse new posts through a premium marketplace experience.',
      openGraphTitle: 'Local classifieds, business listings, and fresh finds',
      openGraphDescription: 'Explore listings, services, and new opportunities through a polished marketplace-style homepage.',
      keywords: ['classifieds', 'business listing', 'local marketplace', 'discover businesses'],
    },
    hero: {
      badge: 'Premium local marketplace',
      title: ['Find the next great deal, service,', 'or business near you.'],
      description: 'Search recent listings, browse trusted businesses, and explore useful updates from across the platform in one clear flow.',
      primaryCta: { label: 'Browse classifieds', href: '/classified' },
      secondaryCta: { label: 'Explore businesses', href: '/listing' },
      searchPlaceholder: 'Search cars, properties, services, mobiles, and more',
      focusLabel: 'Focus',
      featureCardBadge: 'featured marketplace board',
      featureCardTitle: 'A search-led homepage designed for fast browsing.',
      featureCardDescription: 'Highlighted posts, category shortcuts, and fresh recommendations stay visible without interrupting discovery.',
    },
    intro: {
      badge: 'Why people browse here',
      title: 'Search-first, category-led, and built for everyday local discovery.',
      paragraphs: [
        'The experience is designed to help visitors move quickly from search to category browsing to individual listing pages without losing context.',
        'Classifieds, business listings, editorial posts, and supporting resources stay connected so the site feels practical rather than fragmented.',
        'Every major surface is optimized for scanning prices, locations, images, and contact details on both desktop and mobile.',
      ],
      sideBadge: 'Highlights',
      sidePoints: [
        'Large search bar and fast category access from the first screen.',
        'Mixed card layouts that create variety without breaking consistency.',
        'Stronger detail pages for listings, businesses, and supporting content.',
        'Mobile-friendly browsing with polished spacing and compact controls.',
      ],
      primaryLink: { label: 'Browse classifieds', href: '/classified' },
      secondaryLink: { label: 'See businesses', href: '/listing' },
    },
    cta: {
      badge: 'Ready to post',
      title: 'Share a listing, promote a service, or publish something useful.',
      description: 'Bring your next listing or business profile to the marketplace through the same polished experience visitors use to browse.',
      primaryCta: { label: 'Create a post', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'About',
    title: 'A sharper way to explore local opportunities and useful listings.',
    description: `${slot4BrandConfig.siteName} brings together listings, businesses, and supporting content in one polished browsing experience.`,
    paragraphs: [
      'The goal is simple: make it easier to search, compare, and discover without burying visitors under clutter.',
      'Whether someone arrives looking for a service, a listing, or a resource, the interface stays clear and direct.',
    ],
    values: [
      {
        title: 'Search-first structure',
        description: 'Key actions stay visible so people can start browsing immediately.',
      },
      {
        title: 'Connected sections',
        description: 'Listings, business pages, profiles, and supporting posts stay easy to move between.',
      },
      {
        title: 'Practical design',
        description: 'Important details like images, summaries, categories, and contact actions remain easy to scan.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Questions, partnerships, or support requests all start here.',
    description: 'Send a message about listings, business profiles, content updates, or general support and we will route it to the right place.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search posts, categories, listings, and businesses across the site.',
    },
    hero: {
      badge: 'Search everything',
      title: 'Find listings, businesses, articles, and resources faster.',
      description: 'Use keywords and filters to move through every active section of the site from one search surface.',
      placeholder: 'Search by keyword, business, product, service, or category',
    },
    resultsTitle: 'Fresh searchable content',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Creator access',
      title: 'Login to add a new listing or post.',
      description: 'Use your account to open the publishing workspace and submit content to the active sections of the site.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Create content across every active section.',
      description: 'Choose the content type, add the details, and publish with images, summary text, and structured fields.',
    },
    formTitle: 'Content details',
    submitLabel: 'Submit content',
    successTitle: 'Content submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for this site.',
      badge: 'Member access',
      title: 'Welcome back to your account.',
      description: 'Login to continue browsing, managing submissions, and creating new posts from your account.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Site access',
      title: 'Create your account and start posting.',
      description: 'Create an account to access the publishing workspace, save your details, and submit content through the site.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested articles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
