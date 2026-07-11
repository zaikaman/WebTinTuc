import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Serialize data for embedding in a <script type="application/ld+json"> tag.
 * Escapes `<` so a string value containing `</script>` cannot break out of the tag.
 * (Common Next.js / OWASP pattern for JSON-in-script.)
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function formatCategory(category: string): string {
  if (!category) return "";
  const lower = category.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function formatVietnameseDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const hour = parts.find(p => p.type === 'hour')?.value || '00';
    const minute = parts.find(p => p.type === 'minute')?.value || '00';
    const day = parts.find(p => p.type === 'day')?.value || '01';
    const month = parts.find(p => p.type === 'month')?.value || '01';
    const year = parts.find(p => p.type === 'year')?.value || '2026';
    
    return `${hour}:${minute} - ${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

