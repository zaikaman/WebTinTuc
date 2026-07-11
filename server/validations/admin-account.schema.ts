import { z } from 'zod'
import { paginationSchema } from './common.schema'
import './i18n'

export const accountListQuerySchema = paginationSchema.extend({
  search: z.string().optional()
})

/** Public admin login body (rate-limited server route). */
export const adminLoginSchema = z.object({
  email: z.string().trim().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

// Multi-role (editor) is not product-ready — accounts are always admin.
// Role is assigned server-side; clients must not send or choose a role.
export const createAccountSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  username: z.string().trim().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(50),
  display_name: z.string().trim().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').max(100),
})

export const updateAccountSchema = z.object({
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
  username: z.string().trim().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(50).optional(),
  display_name: z.string().trim().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').max(100).optional(),
}).transform((val) => {
  const data = { ...val }
  if (data.email === '') delete data.email
  if (data.password === '') delete data.password
  return data
})

export const deleteAccountBodySchema = z.object({
  confirmSelfDelete: z.boolean().optional(),
}).optional().default({})
