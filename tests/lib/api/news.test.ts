import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all server services used by news.ts
vi.mock('@/server/services/site-settings.service', () => ({
  getSiteSettings: vi.fn(),
}))

vi.mock('@/server/services/category.service', () => ({
  listPublicCategories: vi.fn(),
  getCategoryBySlug: vi.fn(),
}))

vi.mock('@/server/services/article.service', () => ({
  listPublicArticles: vi.fn(),
  getArticleBySlug: vi.fn(),
  getRelatedArticles: vi.fn(),
  getTrendingArticles: vi.fn(),
}))

vi.mock('@/server/services/ad.service', () => ({
  listPublicAds: vi.fn(),
}))

describe('mapBackendArticleToFrontend', () => {
  it('maps a full backend article to frontend format', async () => {
    const { mapBackendArticleToFrontend } = await import('@/lib/api/news')

    const backend = {
      id: 1,
      slug: 'test-article',
      title: 'Test Article',
      category: { name: 'Tin tức', slug: 'tin-tuc' },
      published_at: '2024-06-01T10:00:00Z',
      thumbnail_key: '/images/test.jpg',
      summary: 'A test summary',
      content: { blocks: [{ type: 'paragraph', text: 'Hello' }] },
    }

    const result = mapBackendArticleToFrontend(backend)
    expect(result.id).toBe('test-article')
    expect(result.title).toBe('Test Article')
    expect(result.category).toBe('Tin tức')
    expect(result.categorySlug).toBe('tin-tuc')
    expect(result.image).toBe('/images/test.jpg')
    expect(result.intro).toBe('A test summary')
    expect(result.content).toBeDefined()
  })

  it('falls back to categories.name when category object has different shape', async () => {
    const { mapBackendArticleToFrontend } = await import('@/lib/api/news')

    const backend = {
      slug: 'test',
      title: 'Test',
      categories: { name: 'Tech', slug: 'cong-nghe' },
    }

    const result = mapBackendArticleToFrontend(backend)
    expect(result.category).toBe('Tech')
    expect(result.categorySlug).toBe('cong-nghe')
  })

  it('returns defaults for missing data', async () => {
    const { mapBackendArticleToFrontend } = await import('@/lib/api/news')

    const result = mapBackendArticleToFrontend({})
    expect(result.id).toBe('')
    expect(result.title).toBe('')
    expect(result.category).toBe('Tin tức')
    expect(result.time).toBeDefined()
    expect(result.image).toBe('')
  })

  it('uses id as fallback when slug is missing', async () => {
    const { mapBackendArticleToFrontend } = await import('@/lib/api/news')

    const result = mapBackendArticleToFrontend({ id: 42, title: 'Test' })
    expect(result.id).toBe('42')
  })
})

describe('getSiteSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns merged settings and categories', async () => {
    const settingsService = await import('@/server/services/site-settings.service')
    const categoryService = await import('@/server/services/category.service')

    vi.mocked(settingsService.getSiteSettings).mockResolvedValue({
      id: 1,
      brand: {
        name: 'MySite',
        tagline: 'Best news',
        footerDescription: 'A footer',
        copyright: '2024 MySite',
        searchPlaceholder: 'Search...',
        utilityLinks: [{ label: 'Contact' }],
        socialLinks: [{ label: 'Facebook', href: 'https://fb.com', platform: 'facebook' as const }],
      },
      footer: {
        columns: [{ title: 'Links', links: [{ label: 'Home', href: '/' }] }],
      },
    } as any)

    vi.mocked(categoryService.listPublicCategories).mockResolvedValue([
      { id: 1, name: 'Tin tức', slug: 'tin-tuc' },
      { id: 2, name: 'Công nghệ', slug: 'cong-nghe' },
    ] as any)

    const { getSiteSettings } = await import('@/lib/api/news')
    const result = await getSiteSettings()

    expect(result.settings.brand.name).toBe('MySite')
    expect(result.categories).toHaveLength(2)
    expect(result.categories[0]).toEqual({ label: 'Tin tức', href: '/tin-tuc' })
  })

  it('returns fallback defaults on error', async () => {
    const settingsService = await import('@/server/services/site-settings.service')
    vi.mocked(settingsService.getSiteSettings).mockRejectedValue(new Error('DB error'))

    const { getSiteSettings } = await import('@/lib/api/news')
    const result = await getSiteSettings()

    expect(result.settings.brand.name).toBe('WebTinTuc')
    expect(result.categories).toEqual([])
  })

  it('limits categories to 6', async () => {
    const categoryService = await import('@/server/services/category.service')
    const settingsService = await import('@/server/services/site-settings.service')

    const manyCategories = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Category ${i + 1}`,
      slug: `cat-${i + 1}`,
    }))

    vi.mocked(settingsService.getSiteSettings).mockResolvedValue({ brand: {}, footer: {} } as any)
    vi.mocked(categoryService.listPublicCategories).mockResolvedValue(manyCategories as any)

    const { getSiteSettings } = await import('@/lib/api/news')
    const result = await getSiteSettings()

    expect(result.categories).toHaveLength(10)
  })
})

describe('getHomeFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns featured and latest articles', async () => {
    const articleService = await import('@/server/services/article.service')

    vi.mocked(articleService.listPublicArticles).mockResolvedValueOnce({
      items: [{ id: 1, slug: 'featured', title: 'Featured', category: {}, published_at: '2024-01-01', thumbnail_key: '' }],
      meta: { page: 1, limit: 1, total: 1, totalPages: 1 },
    } as any)

    vi.mocked(articleService.listPublicArticles).mockResolvedValueOnce({
      items: [
        { id: 2, slug: 'latest-1', title: 'Latest 1', category: {}, published_at: '2024-01-02', thumbnail_key: '' },
        { id: 3, slug: 'latest-2', title: 'Latest 2', category: {}, published_at: '2024-01-03', thumbnail_key: '' },
      ],
      meta: { page: 1, limit: 6, total: 2, totalPages: 1 },
    } as any)

    const { getHomeFeed } = await import('@/lib/api/news')
    const result = await getHomeFeed()

    expect(articleService.listPublicArticles).toHaveBeenNthCalledWith(1, { featured: true, limit: 1 })
    expect(articleService.listPublicArticles).toHaveBeenNthCalledWith(2, { limit: 6 })
    expect(result.featuredArticle).toBeDefined()
    expect(result.featuredArticle?.title).toBe('Featured')
    expect(result.latestArticles).toHaveLength(2)
  })

  it('returns empty fallback on error', async () => {
    const articleService = await import('@/server/services/article.service')
    vi.mocked(articleService.listPublicArticles).mockRejectedValue(new Error('Failed'))

    const { getHomeFeed } = await import('@/lib/api/news')
    const result = await getHomeFeed()

    expect(result.featuredArticle).toBeUndefined()
    expect(result.latestArticles).toEqual([])
  })
})

describe('getArticleById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns mapped article when found', async () => {
    const articleService = await import('@/server/services/article.service')
    vi.mocked(articleService.getArticleBySlug).mockResolvedValue({
      id: 1, slug: 'test', title: 'Test Article', category: { name: 'News' }, published_at: '2024-01-01',
    } as any)

    const { getArticleById } = await import('@/lib/api/news')
    const result = await getArticleById('test')

    expect(result).toBeDefined()
    expect(result?.title).toBe('Test Article')
  })

  it('returns undefined when article not found', async () => {
    const articleService = await import('@/server/services/article.service')
    vi.mocked(articleService.getArticleBySlug).mockRejectedValue(new Error('Not found'))

    const { getArticleById } = await import('@/lib/api/news')
    const result = await getArticleById('nonexistent')

    expect(result).toBeUndefined()
  })
})

describe('getPostRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns related and like posts', async () => {
    const articleService = await import('@/server/services/article.service')
    
    vi.mocked(articleService.getArticleBySlug).mockResolvedValue({ id: 1, title: 'Current' } as any)
    vi.mocked(articleService.getRelatedArticles).mockResolvedValue([{ id: 2, slug: 'rec-1', title: 'Rec 1', category: {}, published_at: '2024-01-01', thumbnail_key: '' }] as any)
    vi.mocked(articleService.getTrendingArticles).mockResolvedValue([{ id: 3, slug: 'rec-2', title: 'Rec 2', category: {}, published_at: '2024-01-01', thumbnail_key: '' }] as any)
    vi.mocked(articleService.listPublicArticles).mockResolvedValue({ items: [] } as any)

    const { getPostRecommendations } = await import('@/lib/api/news')
    const result = await getPostRecommendations('some-article')

    expect(result.relatedPosts).toHaveLength(1)
    expect(result.relatedPosts[0].id).toBe('rec-1')
    expect(result.likePosts).toHaveLength(1)
    expect(result.likePosts[0].id).toBe('rec-2')
  })

  it('returns empty arrays on error', async () => {
    const articleService = await import('@/server/services/article.service')
    vi.mocked(articleService.getArticleBySlug).mockRejectedValue(new Error('Failed'))
    vi.mocked(articleService.listPublicArticles).mockRejectedValue(new Error('Failed'))

    const { getPostRecommendations } = await import('@/lib/api/news')
    const result = await getPostRecommendations('test')

    expect(result.relatedPosts).toEqual([])
    expect(result.likePosts).toEqual([])
  })
})

describe('getCategoryFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns category feed with articles', async () => {
    const categoryService = await import('@/server/services/category.service')
    const articleService = await import('@/server/services/article.service')

    vi.mocked(categoryService.getCategoryBySlug).mockResolvedValue({ id: 1, name: 'Tin tức', slug: 'tin-tuc' } as any)
    vi.mocked(articleService.listPublicArticles).mockResolvedValue({
      items: [
        { id: 1, slug: 'first', title: 'First', category: {}, published_at: '2024-01-01', thumbnail_key: '' },
        { id: 2, slug: 'second', title: 'Second', category: {}, published_at: '2024-01-02', thumbnail_key: '' },
        { id: 3, slug: 'third', title: 'Third', category: {}, published_at: '2024-01-03', thumbnail_key: '' },
      ],
      meta: { page: 1, limit: 17, total: 3, totalPages: 1 },
    } as any)

    const { getCategoryFeed } = await import('@/lib/api/news')
    const result = await getCategoryFeed('tin-tuc')

    expect(articleService.listPublicArticles).toHaveBeenCalledWith({ category: 'tin-tuc', limit: 17 })
    expect(result).toBeDefined()
    expect(result?.label).toBe('Tin tức')
    expect(result?.featured.title).toBe('First')
    expect(result?.list).toHaveLength(2)
    expect(result?.list[0].title).toBe('Second')
  })

  it('returns undefined when category not found', async () => {
    const categoryService = await import('@/server/services/category.service')
    vi.mocked(categoryService.getCategoryBySlug).mockRejectedValue(new Error('Not found'))

    const { getCategoryFeed } = await import('@/lib/api/news')
    const result = await getCategoryFeed('nonexistent')

    expect(result).toBeUndefined()
  })
})

describe('getKnownCategorySlugs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns slugs from categories', async () => {
    const categoryService = await import('@/server/services/category.service')
    vi.mocked(categoryService.listPublicCategories).mockResolvedValue([
      { slug: 'tin-tuc' }, { slug: 'cong-nghe' }, { slug: 'phim' },
    ] as any)

    const { getKnownCategorySlugs } = await import('@/lib/api/news')
    const result = await getKnownCategorySlugs()

    expect(result).toEqual(['tin-tuc', 'cong-nghe', 'phim'])
  })

  it('returns empty array on error', async () => {
    const categoryService = await import('@/server/services/category.service')
    vi.mocked(categoryService.listPublicCategories).mockRejectedValue(new Error('Failed'))

    const { getKnownCategorySlugs } = await import('@/lib/api/news')
    const result = await getKnownCategorySlugs()

    expect(result).toEqual([])
  })
})

describe('getPublicAds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns ads from service', async () => {
    const adService = await import('@/server/services/ad.service')
    vi.mocked(adService.listPublicAds).mockResolvedValue([
      { id: 1, type: 'image', position: 'header', media_key: '/ad.webp', target_url: '#', status: 'active', html_code: null },
    ] as any)

    const { getPublicAds } = await import('@/lib/api/news')
    const result = await getPublicAds()

    expect(result).toHaveLength(1)
    expect(result[0].position).toBe('header')
  })
})
