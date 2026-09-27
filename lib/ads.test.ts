import { describe, it, expect, vi } from 'vitest'
import {
  isWithinFlight,
  eligibleAds,
  pickAd,
  inArticleSplitIndex,
  MIN_BLOCKS_FOR_IN_ARTICLE_AD,
  type Advertisement,
  type AdSlotName,
} from '@/lib/ads'
import type { BodyBlock } from '@/types/content'

describe('isWithinFlight', () => {
  it('returns true when no date restrictions', () => {
    const ad: Advertisement = { _id: '1', targetUrl: 'http://example.com' }
    expect(isWithinFlight(ad)).toBe(true)
  })

  it('returns true within date range', () => {
    const now = Date.now()
    const ad: Advertisement = {
      _id: '1',
      targetUrl: 'http://example.com',
      startDate: new Date(now - 86400000).toISOString(), // 1 day ago
      endDate: new Date(now + 86400000).toISOString(), // 1 day from now
    }
    expect(isWithinFlight(ad, now)).toBe(true)
  })

  it('returns false before start date', () => {
    const now = Date.now()
    const ad: Advertisement = {
      _id: '1',
      targetUrl: 'http://example.com',
      startDate: new Date(now + 86400000).toISOString(), // starts tomorrow
    }
    expect(isWithinFlight(ad, now)).toBe(false)
  })

  it('returns false after end date', () => {
    const now = Date.now()
    const ad: Advertisement = {
      _id: '1',
      targetUrl: 'http://example.com',
      endDate: new Date(now - 86400000).toISOString(), // ended yesterday
    }
    expect(isWithinFlight(ad, now)).toBe(false)
  })

  it('returns true with only start date in the past', () => {
    const now = Date.now()
    const ad: Advertisement = {
      _id: '1',
      targetUrl: 'http://example.com',
      startDate: new Date(now - 86400000).toISOString(),
    }
    expect(isWithinFlight(ad, now)).toBe(true)
  })

  it('returns true with only end date in the future', () => {
    const now = Date.now()
    const ad: Advertisement = {
      _id: '1',
      targetUrl: 'http://example.com',
      endDate: new Date(now + 86400000).toISOString(),
    }
    expect(isWithinFlight(ad, now)).toBe(true)
  })

  it('returns false at exact end time (boundary)', () => {
    const now = Date.now()
    const endTime = new Date(now).toISOString()
    const ad: Advertisement = {
      _id: '1',
      targetUrl: 'http://example.com',
      endDate: endTime,
    }
    expect(isWithinFlight(ad, now + 1)).toBe(false)
  })

  it('returns true at exact start time (boundary)', () => {
    const now = Date.now()
    const startTime = new Date(now).toISOString()
    const ad: Advertisement = {
      _id: '1',
      targetUrl: 'http://example.com',
      startDate: startTime,
    }
    expect(isWithinFlight(ad, now)).toBe(true)
  })
})

describe('eligibleAds', () => {
  const baseAd = (overrides?: Partial<Advertisement>): Advertisement => ({
    _id: '1',
    targetUrl: 'http://example.com',
    ...overrides,
  })

  it('returns empty array when no ads match slot', () => {
    const ads = [baseAd({ slots: ['header-leaderboard'] })]
    const result = eligibleAds(ads, 'article-inline')
    expect(result).toEqual([])
  })

  it('filters ads by slot', () => {
    const ads = [
      baseAd({ _id: '1', slots: ['header-leaderboard'] }),
      baseAd({ _id: '2', slots: ['article-inline'] }),
      baseAd({ _id: '3', slots: ['header-leaderboard', 'footer'] }),
    ]
    const result = eligibleAds(ads, 'header-leaderboard')
    expect(result.map((a) => a._id)).toEqual(['1', '3'])
  })

  it('filters ads by date range', () => {
    const now = Date.now()
    const ads = [
      baseAd({
        _id: '1',
        slots: ['header-leaderboard'],
        endDate: new Date(now - 86400000).toISOString(),
      }),
      baseAd({
        _id: '2',
        slots: ['header-leaderboard'],
        startDate: new Date(now - 86400000).toISOString(),
        endDate: new Date(now + 86400000).toISOString(),
      }),
    ]
    const result = eligibleAds(ads, 'header-leaderboard', undefined, now)
    expect(result.map((a) => a._id)).toEqual(['2'])
  })

  it('includes ads with no category restrictions when category is provided', () => {
    const ads = [
      baseAd({ _id: '1', slots: ['article-inline'], categories: [] }),
      baseAd({ _id: '2', slots: ['article-inline'], categories: ['business'] }),
    ]
    const result = eligibleAds(ads, 'article-inline', 'sports')
    expect(result.map((a) => a._id)).toEqual(['1'])
  })

  it('filters ads by category match', () => {
    const ads = [
      baseAd({ _id: '1', slots: ['article-inline'], categories: ['business'] }),
      baseAd({ _id: '2', slots: ['article-inline'], categories: ['sports', 'business'] }),
      baseAd({ _id: '3', slots: ['article-inline'], categories: ['sports'] }),
    ]
    const result = eligibleAds(ads, 'article-inline', 'business')
    expect(result.map((a) => a._id)).toEqual(['1', '2'])
  })

  it('returns all ads when no category specified and no category filter on ads', () => {
    const ads = [
      baseAd({ _id: '1', slots: ['footer'] }),
      baseAd({ _id: '2', slots: ['footer'] }),
    ]
    const result = eligibleAds(ads, 'footer')
    expect(result.length).toBe(2)
  })

  it('excludes category-targeted ads when no category provided', () => {
    const ads = [
      baseAd({ _id: '1', slots: ['article-inline'] }),
      baseAd({ _id: '2', slots: ['article-inline'], categories: ['sports'] }),
    ]
    const result = eligibleAds(ads, 'article-inline', undefined)
    expect(result.map((a) => a._id)).toEqual(['1'])
  })
})

describe('pickAd', () => {
  const baseAd = (overrides?: Partial<Advertisement>): Advertisement => ({
    _id: '1',
    targetUrl: 'http://example.com',
    ...overrides,
  })

  it('returns null when no eligible ads', () => {
    const ads = [baseAd({ slots: ['header-leaderboard'] })]
    expect(pickAd(ads, 'article-inline')).toBeNull()
  })

  it('returns the only eligible ad', () => {
    const ads = [baseAd({ _id: 'solo', slots: ['article-inline'] })]
    const result = pickAd(ads, 'article-inline')
    expect(result?._id).toBe('solo')
  })

  it('treats weight of 0 as 1', () => {
    const ad1 = baseAd({ _id: '1', slots: ['footer'], weight: 0 })
    const ad2 = baseAd({ _id: '2', slots: ['footer'], weight: 1 })
    const results = new Map<string, number>()
    // Run multiple times to check distribution (0-weighted ad should still have 50% chance)
    for (let i = 0; i < 100; i++) {
      const picked = pickAd([ad1, ad2], 'footer')
      if (picked) {
        results.set(picked._id, (results.get(picked._id) ?? 0) + 1)
      }
    }
    expect(results.get('1')! > 0).toBe(true) // Should have some picks
  })

  it('treats negative weight as 1', () => {
    const ad1 = baseAd({ _id: '1', slots: ['footer'], weight: -5 })
    const ad2 = baseAd({ _id: '2', slots: ['footer'], weight: 1 })
    const picked = pickAd([ad1, ad2], 'footer')
    expect(picked).not.toBeNull()
  })

  it('treats non-finite weight as 1', () => {
    const ad1 = baseAd({ _id: '1', slots: ['footer'], weight: Infinity })
    const ad2 = baseAd({ _id: '2', slots: ['footer'], weight: 1 })
    const picked = pickAd([ad1, ad2], 'footer')
    expect(picked).not.toBeNull()
  })

  it('respects weight distribution (higher weight = higher probability)', () => {
    const ad1 = baseAd({ _id: '1', slots: ['footer'], weight: 1 })
    const ad2 = baseAd({ _id: '2', slots: ['footer'], weight: 9 })
    const results = new Map<string, number>()
    for (let i = 0; i < 1000; i++) {
      const picked = pickAd([ad1, ad2], 'footer')
      if (picked) {
        results.set(picked._id, (results.get(picked._id) ?? 0) + 1)
      }
    }
    const count1 = results.get('1') ?? 0
    const count2 = results.get('2') ?? 0
    // Ad2 with weight 9 should be picked roughly 9x more often than Ad1 with weight 1
    // Allow 20% variance due to randomness
    const ratio = count2 / count1
    expect(ratio).toBeGreaterThan(7)
    expect(ratio).toBeLessThan(11)
  })
})

describe('inArticleSplitIndex', () => {
  const para = (text = 'x'): BodyBlock => ({ _type: 'block', style: 'normal', children: [{ text }] })
  const item = (text = 'x'): BodyBlock => ({
    _type: 'block',
    listItem: 'bullet',
    children: [{ text }],
  })
  const paras = (n: number) => Array.from({ length: n }, (_, i) => para(`p${i}`))

  it('returns null for an undefined body', () => {
    expect(inArticleSplitIndex(undefined)).toBeNull()
  })

  it('returns null for an empty body', () => {
    expect(inArticleSplitIndex([])).toBeNull()
  })

  it('returns null just below the minimum length', () => {
    expect(inArticleSplitIndex(paras(MIN_BLOCKS_FOR_IN_ARTICLE_AD - 1))).toBeNull()
  })

  it('splits at the midpoint once the minimum is reached', () => {
    expect(inArticleSplitIndex(paras(MIN_BLOCKS_FOR_IN_ARTICLE_AD))).toBe(
      Math.floor(MIN_BLOCKS_FOR_IN_ARTICLE_AD / 2),
    )
  })

  it('splits an odd-length body just past the middle', () => {
    expect(inArticleSplitIndex(paras(9))).toBe(4)
  })

  it('never splits above the first block', () => {
    expect(inArticleSplitIndex(paras(8))!).toBeGreaterThan(0)
  })

  it('never splits below the last block', () => {
    const blocks = paras(8)
    expect(inArticleSplitIndex(blocks)!).toBeLessThan(blocks.length)
  })

  it('moves the split to the edge of a list rather than inside it', () => {
    // Midpoint is 4, which sits between two list items. The nearest clean
    // boundaries are 2 (list starts) and 6 (list ends); 2 is reached first.
    const blocks = [para(), para(), item(), item(), item(), item(), para(), para()]
    expect(inArticleSplitIndex(blocks)).toBe(2)
  })

  it('splits cleanly at the boundary where a list ends', () => {
    const blocks = [para(), item(), item(), item(), para(), para(), para(), para()]
    expect(inArticleSplitIndex(blocks)).toBe(4)
  })

  it('returns null when every boundary is inside one long list', () => {
    expect(inArticleSplitIndex(Array.from({ length: 8 }, () => item()))).toBeNull()
  })

  it('honours a custom minimum', () => {
    expect(inArticleSplitIndex(paras(4), 4)).toBe(2)
    expect(inArticleSplitIndex(paras(4), 5)).toBeNull()
  })
})
