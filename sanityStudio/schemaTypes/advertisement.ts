import {defineField, defineType} from 'sanity'

// Keep these values in sync with AD_SLOTS in lib/ads.ts — they are what the
// front-end matches on. The sizes in the titles are the container the site
// reserves for that slot, so creatives should be supplied at that ratio.
const SLOT_OPTIONS = [
  {title: 'Header Leaderboard — top of page (970×90)', value: 'header-leaderboard'},
  {title: 'Below Hero — home page (970×250)', value: 'hero-below'},
  {title: 'In-Feed — between home sections (728×90)', value: 'feed-inline'},
  {title: 'Article Sidebar (300×250)', value: 'article-inline'},
  {title: 'Below Article — sidebar lower (336×280)', value: 'article-below'},
  {title: 'Category Page Top (970×90)', value: 'category-top'},
  {title: 'Footer (970×90)', value: 'footer'},
]

// Mirrors the category list on the post schema.
const CATEGORY_OPTIONS = [
  {title: 'Uttar Pradesh', value: 'up'},
  {title: 'Uttarakhand', value: 'uk'},
  {title: 'Delhi', value: 'delhi'},
  {title: 'National', value: 'national'},
  {title: 'World', value: 'world'},
  {title: 'Dharma', value: 'dharma'},
  {title: 'Business', value: 'business'},
  {title: 'Sports', value: 'sports'},
  {title: 'Videos', value: 'videos'},
  {title: 'Mystery (Adbhut)', value: 'mystery'},
  {title: 'Lifestyle', value: 'lifestyle'},
  {title: 'Entertainment', value: 'entertainment'},
  {title: 'Web Stories', value: 'web-stories'},
]

export default defineType({
  name: 'advertisement',
  title: 'Advertisement',
  type: 'document',
  groups: [
    {name: 'creative', title: 'Creative', default: true},
    {name: 'targeting', title: 'Placement & Targeting'},
    {name: 'schedule', title: 'Schedule'},
  ],
  fields: [
    defineField({
      name: 'advertiser',
      title: 'Advertiser',
      description: 'Who booked this ad. Used to identify the booking in this list — not shown on the site.',
      type: 'string',
      group: 'creative',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'creative',
      title: 'Creative (desktop)',
      description: 'The banner image. Supply it at the size listed against the slot you pick below.',
      type: 'image',
      group: 'creative',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'creativeMobile',
      title: 'Creative (mobile)',
      description: 'Optional. A taller/squarer version shown under 640px wide. Without it, the desktop creative is scaled down.',
      type: 'image',
      group: 'creative',
      options: {hotspot: true},
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      description: 'Describes the ad for screen readers and shows if the image fails to load.',
      type: 'string',
      group: 'creative',
      validation: (rule) => rule.required().max(125),
    }),
    defineField({
      name: 'targetUrl',
      title: 'Click-through URL',
      type: 'url',
      group: 'creative',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'slots',
      title: 'Placements',
      description: 'Where this ad may appear. Pick at least one.',
      type: 'array',
      group: 'targeting',
      of: [{type: 'string'}],
      options: {list: SLOT_OPTIONS},
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'categories',
      title: 'Category Targeting',
      description: 'Leave empty to run site-wide. Otherwise the ad only appears on pages in these categories.',
      type: 'array',
      group: 'targeting',
      of: [{type: 'string'}],
      options: {list: CATEGORY_OPTIONS, layout: 'tags'},
    }),
    defineField({
      name: 'weight',
      title: 'Rotation Weight',
      description: 'When several ads compete for one slot, higher weight wins more often. A weight of 3 is shown three times as often as a weight of 1.',
      type: 'number',
      group: 'targeting',
      initialValue: 1,
      validation: (rule) => rule.min(1).max(10).integer(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      description: 'Switch off to pull the ad immediately without deleting the booking.',
      type: 'boolean',
      group: 'schedule',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Runs From',
      description: 'Optional. Leave empty to start as soon as the ad is active.',
      type: 'datetime',
      group: 'schedule',
    }),
    defineField({
      name: 'endDate',
      title: 'Runs Until',
      description: 'Optional. Leave empty to run until switched off.',
      type: 'datetime',
      group: 'schedule',
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const startDate = (context.document as {startDate?: string} | undefined)?.startDate
          if (!endDate || !startDate) return true
          return new Date(endDate) > new Date(startDate) || 'Runs Until must be after Runs From'
        }),
    }),
  ],
  preview: {
    select: {
      title: 'advertiser',
      media: 'creative',
      slots: 'slots',
      isActive: 'isActive',
      startDate: 'startDate',
      endDate: 'endDate',
    },
    prepare({title, media, slots, isActive, startDate, endDate}) {
      const now = Date.now()
      let status = '🟢 Live'
      if (isActive === false) status = '⚪ Paused'
      else if (startDate && new Date(startDate).getTime() > now) status = '🕒 Scheduled'
      else if (endDate && new Date(endDate).getTime() < now) status = '🔴 Expired'

      const placements = Array.isArray(slots) && slots.length ? slots.join(', ') : 'no placement'

      return {
        title: title || 'Untitled advertisement',
        subtitle: `${status} · ${placements}`,
        media,
      }
    },
  },
})
