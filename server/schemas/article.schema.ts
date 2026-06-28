import { z } from 'zod'

const YoutubeEmbedAttrsSchema = z.object({
  url: z.string().url('Đường dẫn YouTube không hợp lệ'),
  videoId: z.string().min(1, 'Video ID không được để trống'),
  caption: z.string().optional()
})

const StorageMediaAttrsSchema = z.object({
  mediaType: z.enum(['image', 'video', 'gif']),
  key: z.string().min(1, 'Key của media không được để trống'),
  url: z.string().url('Đường dẫn media không hợp lệ'),
  mimeType: z.string().min(1, 'MimeType không được để trống'),
  caption: z.string().optional()
})

const ContentBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('youtubeEmbed'),
    attrs: YoutubeEmbedAttrsSchema
  }),
  z.object({
    type: z.literal('storageMedia'),
    attrs: StorageMediaAttrsSchema
  })
])

const ArticleContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(ContentBlockSchema)
})

export const CreateArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Tiêu đề bài viết phải có ít nhất 5 ký tự')
    .max(255, 'Tiêu đề bài viết không được vượt quá 255 ký tự'),
    
    
  content: ArticleContentSchema,
  
  summary: z.string().max(500, 'Tóm tắt không được vượt quá 500 ký tự').optional(),
  
  thumbnail_key: z.string().optional(),
  
  category_id: z.number().int('ID danh mục phải là số nguyên').positive('ID danh mục không hợp lệ').optional(),
  
  author_id: z.string().uuid('Author ID phải là định dạng UUID hợp lệ').optional(),
  
  published: z.boolean().default(false),
  
  featured: z.boolean().default(false),
  
  seo_title: z.string().max(70, 'Tiêu đề SEO nên dưới 70 ký tự').optional(),
  
  seo_description: z.string().max(160, 'Mô tả SEO nên dưới 160 ký tự').optional()
})

export const UpdateArticleSchema = CreateArticleSchema.partial()

export type CreateArticleDTO = z.infer<typeof CreateArticleSchema>
export type UpdateArticleDTO = z.infer<typeof UpdateArticleSchema>