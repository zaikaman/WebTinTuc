import { z } from 'zod'

/**
 * Vietnamese error map for Zod validation.
 * Set globally so all schemas produce Vietnamese messages automatically.
 */
const vietnameseErrorMap: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case 'invalid_type': {
      if (issue.input === null) return 'không được để trống'
      if (issue.input === undefined) return 'là bắt buộc'
      if (issue.expected === 'string') return 'phải là chuỗi ký tự'
      if (issue.expected === 'number') return 'phải là số'
      if (issue.expected === 'boolean') return 'phải là đúng/sai'
      if (issue.expected === 'integer') return 'phải là số nguyên'
      if (issue.expected === 'object') return 'phải là đối tượng'
      if (issue.expected === 'array') return 'phải là mảng'
      return `kiểu dữ liệu không hợp lệ: mong đợi ${issue.expected}`
    }

    case 'invalid_value': {
      if (issue.values.length === 1) {
        return `giá trị phải là ${JSON.stringify(issue.values[0])}`
      }
      return `giá trị phải là một trong các giá trị: ${issue.values.map(o => `"${String(o)}"`).join(', ')}`
    }

    case 'unrecognized_keys':
      return `trường không được hỗ trợ: ${issue.keys.join(', ')}`

    case 'invalid_union': {
      if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
        const opts = issue.options.map(o => `"${o}"`).join(' | ');
        return `giá trị phân loại không hợp lệ. Mong đợi: ${opts}`;
      }
      return 'giá trị không khớp với bất kỳ định dạng nào'
    }

    case 'invalid_format': {
      const format = issue.format;
      if (format === 'email') return 'email không đúng định dạng'
      if (format === 'url') return 'đường dẫn URL không hợp lệ'
      if (format === 'uuid') return 'UUID không hợp lệ'
      if (format === 'cuid') return 'CUID không hợp lệ'
      if (format === 'regex') return 'chuỗi không đúng định dạng yêu cầu'
      if (format === 'datetime') return 'ngày giờ không đúng định dạng'
      if (format === 'starts_with') return `phải bắt đầu bằng "${(issue as any).prefix}"`
      if (format === 'ends_with') return `phải kết thúc bằng "${(issue as any).suffix}"`
      if (format === 'includes') return `phải bao gồm "${(issue as any).includes}"`
      return 'định dạng không hợp lệ'
    }

    case 'too_small': {
      const min = issue.minimum ?? 0
      const origin = issue.origin
      if (origin === 'string') {
        return `phải có ít nhất ${min} ký tự`
      }
      if (origin === 'number' || origin === 'int' || origin === 'bigint') {
        return `giá trị tối thiểu là ${min}`
      }
      if (origin === 'array') {
        return `phải có ít nhất ${min} phần tử`
      }
      return `giá trị không được nhỏ hơn ${min}`
    }

    case 'too_big': {
      const max = issue.maximum ?? 0
      const origin = issue.origin
      if (origin === 'string') {
        return `không được vượt quá ${max} ký tự`
      }
      if (origin === 'number' || origin === 'int' || origin === 'bigint') {
        return `giá trị tối đa là ${max}`
      }
      if (origin === 'array') {
        return `không được vượt quá ${max} phần tử`
      }
      return `giá trị không được lớn hơn ${max}`
    }

    case 'custom':
      return issue.message

    case 'not_multiple_of':
      return `phải là bội số của ${issue.divisor}`

    default:
      return issue.message
  }
}

// Apply globally at import time — the module system ensures it runs only once
z.setErrorMap(vietnameseErrorMap)

export const FIELD_TRANSLATIONS: Record<string, string> = {
  title: 'Tiêu đề',
  slug: 'Đường dẫn (slug)',
  summary: 'Tóm tắt',
  thumbnail_key: 'Ảnh bìa',
  content: 'Nội dung',
  category_id: 'Danh mục',
  category: 'Danh mục',
  author_id: 'Tác giả',
  status: 'Trạng thái',
  featured: 'Nổi bật',
  seo_title: 'Tiêu đề SEO',
  seo_description: 'Mô tả SEO',
  published_at: 'Ngày xuất bản',
  name: 'Tên',
  type: 'Loại',
  position: 'Vị trí',
  media_key: 'Khóa phương tiện',
  html_code: 'Mã HTML',
  target_url: 'Đường dẫn liên kết',
  priority: 'Độ ưu tiên',
  starts_at: 'Ngày bắt đầu',
  ends_at: 'Ngày kết thúc',
  email: 'Email',
  password: 'Mật khẩu',
  username: 'Tên đăng nhập',
  display_name: 'Tên hiển thị',
  role: 'Vai trò',
  description: 'Mô tả',
  from_path: 'Đường dẫn nguồn',
  to_path: 'Đường dẫn đích',
  status_code: 'Mã trạng thái',
  brand: 'Thương hiệu',
  footer: 'Chân trang',
  prefix: 'Tiền tố',
  key: 'Khóa',
  fromKey: 'Khóa nguồn',
  toKey: 'Khóa đích',
  url: 'Đường dẫn URL',
  videoId: 'ID Video',
  mimeType: 'Kiểu tệp (MimeType)',
  q: 'Từ khóa tìm kiếm'
}

export function formatZodIssue(issue: z.ZodIssue): string {
  const fieldPath = issue.path.length > 0 ? issue.path.join('.') : '';
  const message = issue.message;

  if (!fieldPath) {
    return message.charAt(0).toUpperCase() + message.slice(1);
  }

  const translatedParts = issue.path.map(part => {
    if (typeof part === 'number' || /^\d+$/.test(String(part))) {
      return `dòng ${Number(part) + 1}`;
    }
    return FIELD_TRANSLATIONS[String(part)] || String(part);
  });

  const fieldName = translatedParts.join(' -> ');

  // If the message already includes the fieldName (case-insensitive), return it directly
  if (message.toLowerCase().includes(fieldName.toLowerCase())) {
    return message.charAt(0).toUpperCase() + message.slice(1);
  }

  const lowerMsg = message.toLowerCase();

  // Natural phrasing transformations
  if (lowerMsg.startsWith('phải có ít nhất')) {
    const rest = message.slice('phải có ít nhất'.length).trim();
    return `${fieldName} không được có ít hơn ${rest}`;
  }
  if (lowerMsg.startsWith('không được vượt quá')) {
    const rest = message.slice('không được vượt quá'.length).trim();
    return `${fieldName} không được vượt quá ${rest}`;
  }
  if (lowerMsg === 'trường này không được để trống' || lowerMsg === 'không được để trống') {
    return `${fieldName} không được để trống`;
  }
  if (lowerMsg === 'trường này là bắt buộc' || lowerMsg === 'là bắt buộc' || lowerMsg === 'bắt buộc') {
    return `${fieldName} là bắt buộc`;
  }
  if (lowerMsg.startsWith('giá trị không được nhỏ hơn')) {
    const rest = message.slice('giá trị không được nhỏ hơn'.length).trim();
    return `${fieldName} không được nhỏ hơn ${rest}`;
  }
  if (lowerMsg.startsWith('giá trị không được lớn hơn')) {
    const rest = message.slice('giá trị không được lớn hơn'.length).trim();
    return `${fieldName} không được lớn hơn ${rest}`;
  }

  // If the message starts with an uppercase letter and doesn't sound like a suffix,
  // separate with a colon.
  if (message.charAt(0) === message.charAt(0).toUpperCase() && !message.startsWith('Không') && !message.startsWith('Phải')) {
    return `${fieldName}: ${message}`;
  }

  return `${fieldName} ${message}`;
}


