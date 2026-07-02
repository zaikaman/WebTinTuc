export interface GetArticlesOptions {
  category?: string | null
  tag?: string | null
  limit?: number | string | null
  featured?: boolean
  published?: boolean | string
  status?: 'draft' | 'published'
}

export type ArticleContent = {
  type?: string
  text?: string
  content?: ContentBlock[]
}

export type ContentBlock = {
  type: string
  attrs?: Record<string, unknown>
  text?: string
}

export type CreateArticleDto = {
  title: string
  slug?: string
  summary?: string
  content?: ArticleContent | string
  thumbnail_key?: string
  category_id?: number | null
  featured?: boolean
  status?: 'draft' | 'published'
  published_at?: string | null
}

export type UpdateArticleDto = Partial<CreateArticleDto>

