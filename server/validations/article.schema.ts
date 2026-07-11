import { z } from 'zod'
import { paginationSchema, queryBooleanSchema } from './common.schema'
import './i18n'

// ==========================================
// Content Block Schemas (flat format matching app usage)
// ==========================================

const ParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string().optional(),
  align: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  style: z.string().optional()
})

const BoldParagraphBlockSchema = z.object({
  type: z.literal('bold-paragraph'),
  text: z.string().optional()
})

const ImageBlockSchema = z.object({
  type: z.literal('image'),
  src: z.string().optional(),
  caption: z.string().optional(),
  width: z.string().optional(),
  /** DOM id used by the editor crop dialog to target the wrapper */
  id: z.string().optional()
})

const VideoBlockSchema = z.object({
  type: z.literal('video'),
  src: z.string().optional(),
  width: z.string().optional()
})

const IFrameBlockSchema = z.object({
  type: z.literal('iframe'),
  src: z.string().optional(),
  width: z.string().optional()
})

const YoutubeEmbedBlockSchema = z.object({
  type: z.literal('youtubeEmbed'),
  url: z.string().url('Đường dẫn YouTube không hợp lệ'),
  videoId: z.string().min(1, 'Video ID không được để trống'),
  caption: z.string().optional()
})

const StorageMediaBlockSchema = z.object({
  type: z.literal('storageMedia'),
  mediaType: z.enum(['image', 'video', 'gif']),
  key: z.string().min(1, 'Key của media không được để trống'),
  url: z.string().url('Đường dẫn media không hợp lệ'),
  mimeType: z.string().min(1, 'MimeType không được để trống'),
  caption: z.string().optional()
})

const ListBlockSchema = z.object({
  type: z.literal('list'),
  listType: z.enum(['ul', 'ol']),
  text: z.string().optional(),
  align: z.string().optional()
})

/** Discriminated union of all known content block types (flat format) */
const ArticleContentBlockSchema = z.discriminatedUnion('type', [
  ParagraphBlockSchema,
  BoldParagraphBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
  IFrameBlockSchema,
  YoutubeEmbedBlockSchema,
  StorageMediaBlockSchema,
  ListBlockSchema
])

/** Schema for content stored as a blocks array (the format used by the app) */
const ArticleContentArraySchema = z.array(ArticleContentBlockSchema)

/**
 * Schema for content that may be either a raw blocks array or
 * wrapped in { blocks: [...] } (both formats appear in the codebase).
 */
const ArticleContentSchema = z.union([
  ArticleContentArraySchema,
  z.object({ blocks: ArticleContentArraySchema })
])

const articleStatusSchema = z.enum(['draft', 'published'])

export const articleListQuerySchema = paginationSchema.extend({
  categoryId: z.coerce.number().int().positive().optional(),
  category: z.string().trim().optional(),
  status: articleStatusSchema.optional(),
  featured: queryBooleanSchema,
  publishedFrom: z.string().datetime().optional(),
  publishedTo: z.string().datetime().optional(),
  sortBy: z.enum(['title', 'published_at', 'views', 'created_at']).default('created_at'),
  includeDeleted: queryBooleanSchema
})

export const publicArticleListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().trim().optional(),
  featured: queryBooleanSchema
})

export const createArticleSchema = z.object({
  title: z.string().trim().min(5).max(255),
  slug: z.string().trim().min(3).max(255).optional(),
  summary: z.string().trim().nullable().optional(),
  thumbnail_key: z.string().trim().nullable().optional(),
  content: ArticleContentSchema,
  category_id: z.coerce.number().int().positive().nullable().optional(),
  author_id: z.string().uuid().nullable().optional(),
  status: articleStatusSchema.default('draft'),
  published: z.boolean().optional(),
  featured: z.boolean().default(false),
  seo_title: z.string().trim().max(255).nullable().optional(),
  seo_description: z.string().trim().nullable().optional(),
  published_at: z.string().datetime().nullable().optional()
})

export const updateArticleSchema = createArticleSchema.partial()

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
})


