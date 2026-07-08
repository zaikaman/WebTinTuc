import { z } from 'zod'

/**
 * Vietnamese error map for Zod validation.
 * Set globally so all schemas produce Vietnamese messages automatically.
 */
const vietnameseErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type: {
      if (issue.expected === 'string') return { message: 'Phải là chuỗi ký tự' }
      if (issue.expected === 'number') return { message: 'Phải là số' }
      if (issue.expected === 'boolean') return { message: 'Phải là đúng/sai' }
      if (issue.expected === 'integer') return { message: 'Phải là số nguyên' }
      if (issue.expected === 'object') return { message: 'Phải là đối tượng' }
      if (issue.expected === 'array') return { message: 'Phải là mảng' }
      if (issue.received === 'null') return { message: 'Trường này không được để trống' }
      if (issue.received === 'undefined') return { message: 'Trường này là bắt buộc' }
      return { message: `Kiểu dữ liệu không hợp lệ: mong đợi ${issue.expected}, nhận được ${issue.received}` }
    }

    case z.ZodIssueCode.invalid_literal:
      return { message: `Giá trị phải là ${issue.expected}` }

    case z.ZodIssueCode.unrecognized_keys:
      return { message: `Trường không được hỗ trợ: ${issue.keys.join(', ')}` }

    case z.ZodIssueCode.invalid_union:
      return { message: 'Giá trị không khớp với bất kỳ định dạng nào' }

    case z.ZodIssueCode.invalid_union_discriminator:
      return { message: `Giá trị phân loại không hợp lệ. Mong đợi: ${issue.options.join(', ')}` }

    case z.ZodIssueCode.invalid_enum_value:
      return { message: `Giá trị không hợp lệ. Các giá trị hợp lệ: ${issue.options.map(o => `"${o}"`).join(', ')}` }

    case z.ZodIssueCode.invalid_arguments:
      return { message: 'Tham số không hợp lệ' }

    case z.ZodIssueCode.invalid_return_type:
      return { message: 'Kiểu trả về không hợp lệ' }

    case z.ZodIssueCode.invalid_date:
      return { message: 'Ngày tháng không hợp lệ' }

    case z.ZodIssueCode.invalid_string: {
      if (issue.validation === 'email') return { message: 'Email không đúng định dạng' }
      if (issue.validation === 'url') return { message: 'Đường dẫn URL không hợp lệ' }
      if (issue.validation === 'uuid') return { message: 'UUID không hợp lệ' }
      if (issue.validation === 'cuid') return { message: 'CUID không hợp lệ' }
      if (issue.validation === 'regex') return { message: 'Chuỗi không đúng định dạng yêu cầu' }
      if (issue.validation === 'datetime') return { message: 'Ngày giờ không đúng định dạng' }
      return { message: 'Chuỗi không hợp lệ' }
    }

    case z.ZodIssueCode.too_small: {
      const min = issue.minimum ?? 0
      if (issue.type === 'string') {
        return { message: `Phải có ít nhất ${min} ký tự` }
      }
      if (issue.type === 'number') {
        return { message: `Giá trị tối thiểu là ${min}` }
      }
      if (issue.type === 'array') {
        return { message: `Phải có ít nhất ${min} phần tử` }
      }
      return { message: `Giá trị không được nhỏ hơn ${min}` }
    }

    case z.ZodIssueCode.too_big: {
      const max = issue.maximum ?? 0
      if (issue.type === 'string') {
        return { message: `Không được vượt quá ${max} ký tự` }
      }
      if (issue.type === 'number') {
        return { message: `Giá trị tối đa là ${max}` }
      }
      if (issue.type === 'array') {
        return { message: `Không được vượt quá ${max} phần tử` }
      }
      return { message: `Giá trị không được lớn hơn ${max}` }
    }

    case z.ZodIssueCode.custom:
      return { message: ctx.defaultError }

    case z.ZodIssueCode.invalid_intersection_types:
      return { message: 'Không thể kết hợp các kiểu dữ liệu' }

    case z.ZodIssueCode.not_multiple_of:
      return { message: `Phải là bội số của ${issue.multipleOf}` }

    case z.ZodIssueCode.not_finite:
      return { message: 'Số phải hữu hạn' }

    default:
      return { message: ctx.defaultError }
  }
}

// Apply globally at import time — the module system ensures it runs only once
z.setErrorMap(vietnameseErrorMap)
