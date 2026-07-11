/** Central React Query keys for admin data */
export const adminKeys = {
  all: ["admin"] as const,
  dashboardRoot: ["admin", "dashboard"] as const,
  dashboard: (params?: Record<string, string | undefined>) =>
    ["admin", "dashboard", params ?? {}] as const,
  articlesRoot: ["admin", "articles"] as const,
  articles: (params?: Record<string, string | number | boolean | undefined>) =>
    ["admin", "articles", params ?? {}] as const,
  article: (id: number) => ["admin", "article", id] as const,
  categoriesRoot: ["admin", "categories"] as const,
  categories: (params?: string) => ["admin", "categories", params ?? ""] as const,
  adsRoot: ["admin", "ads"] as const,
  ads: (params?: string) => ["admin", "ads", params ?? ""] as const,
  accountsRoot: ["admin", "accounts"] as const,
  accounts: (params?: string) => ["admin", "accounts", params ?? ""] as const,
  settings: ["admin", "settings"] as const,
  mediaRoot: ["admin", "media"] as const,
  media: (prefix = "", recursive = false) =>
    ["admin", "media", prefix, recursive] as const,
};
