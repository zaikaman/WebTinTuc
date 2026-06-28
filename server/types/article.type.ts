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

export type CreateArticleDto = Record<string, unknown>
export type UpdateArticleDto = Record<string, unknown>

