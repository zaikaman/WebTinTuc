import type { NavigationItem, SocialLink } from './news'

export interface AdminArticle {
  id: number
  title: string
  slug: string
  summary?: string | null
  content?: unknown
  thumbnail_key?: string | null
  category_id?: number | null
  categories?: { name: string; slug: string } | null
  featured?: boolean
  status: string
  views?: number
  published_at?: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

export interface AdminPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminListResponse<T> {
  items: T[]
  meta: AdminPaginationMeta
}

export interface AdminCategory {
  id: number
  name: string
  slug: string
  postCount?: number
  priority?: number
  status?: string
}

export interface AdminAd {
  id: number
  name: string
  position?: string
  type?: string
  media_key?: string
  target_url?: string
  starts_at?: string | null
  ends_at?: string | null
  status?: string
  priority?: number
}

export interface AdminSettings {
  brand?: {
    name?: string
    logo_url?: string
    tagline?: string
    footerDescription?: string
    copyright?: string
    searchPlaceholder?: string
    utilityLinks?: NavigationItem[]
    socialLinks?: SocialLink[]
  }
  footer?: {
    columns?: Array<{
      title: string
      links: NavigationItem[]
    }>
    address?: string
    phone?: string
    email?: string
    license?: string
    responsible?: string
  }
}

export interface AdminStorageFile {
  key: string
  name: string
  type: string
  url: string
  size: number
  lastModified?: string
}

export interface AdminStorageFolder {
  name: string
  path: string
}

export interface AdminStorageResponse {
  files: AdminStorageFile[]
  subFolders: AdminStorageFolder[]
}

export interface AdminUploadResponse {
  success: boolean
  key: string
  url: string
}

export interface AdminDashboardStats {
  totalArticles: number
  totalCategories: number
  totalAds: number
  totalViews: number
  totalClicks: number
  prevYearViews?: number
  prevYearClicks?: number
  yearViews?: number
  yearClicks?: number
  periodArticles?: number
  prevPeriodArticles?: number
  todayViews: number
  yesterdayViews: number
  todayClicks: number
  yesterdayClicks: number
  weekViews: number
  prevWeekViews: number
  weekClicks: number
  prevWeekClicks: number
  monthViews: number
  prevMonthViews: number
  monthClicks: number
  prevMonthClicks: number
  topArticles: Array<{
    id: number
    title: string
    category?: string
    categories?: { name: string }
    views?: number
    trending_views?: number
  }>
  topCategories: Array<{
    id: number
    name: string
    slug: string
    article_count: number
  }>
  topAds: Array<{
    id: number
    name: string
    impressions_7d: number
  }>
  recentActivities: Array<{
    type: string
    title: string
    status?: string
    createdAt: string
  }>
}

export interface CreateArticlePayload {
  title: string
  slug?: string | undefined
  summary?: string | null | undefined
  content?: unknown
  thumbnail_key?: string | null | undefined
  category_id?: number | null | undefined
  featured?: boolean | undefined
  status?: 'draft' | 'published' | undefined
  published_at?: string | null | undefined
  author_id?: string | null | undefined
  seo_title?: string | null | undefined
  seo_description?: string | null | undefined
}

export interface CreateCategoryPayload {
  name: string
  slug?: string | undefined
  priority?: number | undefined
  status?: 'active' | 'inactive' | undefined
}

export interface CreateAdPayload {
  name: string
  position?: string | undefined
  type?: string | undefined
  media_key?: string | null | undefined
  target_url?: string | null | undefined
  starts_at?: string | null | undefined
  ends_at?: string | null | undefined
  status?: 'active' | 'inactive' | undefined
  priority?: number | undefined
}

export interface UpdateSettingsPayload {
  brand?: Record<string, unknown> | undefined
  footer?: Record<string, unknown> | undefined
}

export interface AdminAccount {
  id: string
  username: string
  display_name: string
  avatar_key?: string | null
  role: string
  email?: string | null
  created_at: string
  updated_at?: string
}

export interface CreateAccountPayload {
  email: string
  password?: string | undefined
  username: string
  display_name: string
  role?: string | undefined
}

