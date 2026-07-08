import { z } from 'zod'
import { paginationSchema } from './common.schema'
import './i18n'

export const accountListQuerySchema = paginationSchema.extend({
  search: z.string().optional()
})

export const createAccountSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự'),
  username: z.string().trim().min(3, 'Tên đăng nhập phải chứa ít nhất 3 ký tự').max(50),
  display_name: z.string().trim().min(2, 'Tên hiển thị phải chứa ít nhất 2 ký tự').max(100),
  role: z.enum(['admin']).default('admin')
})

export const updateAccountSchema = z.object({
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  password: z.string().min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự').optional().or(z.literal('')),
  username: z.string().trim().min(3, 'Tên đăng nhập phải chứa ít nhất 3 ký tự').max(50).optional(),
  display_name: z.string().trim().min(2, 'Tên hiển thị phải chứa ít nhất 2 ký tự').max(100).optional(),
  role: z.enum(['admin']).optional()
}).transform((val) => {
  const data = { ...val }
  if (data.email === '') delete data.email
  if (data.password === '') delete data.password
  return data
})
