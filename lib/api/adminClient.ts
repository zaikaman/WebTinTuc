// lib/api/adminClient.ts
import type {
  AdminArticle,
  AdminCategory,
  AdminAd,
  AdminSettings,
  AdminStorageResponse,
  AdminUploadResponse,
  AdminDashboardStats,
  CreateArticlePayload,
  CreateCategoryPayload,
  CreateAdPayload,
  UpdateSettingsPayload,
} from "@/lib/types/admin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const ADMIN_SECRET = "admin-api-secret";

async function fetchAdmin<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/admin${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-secret": ADMIN_SECRET,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { cache: "no-store", ...options, headers });
  
  if (!response.ok) {
    let message = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (e) {}
    throw new Error(message);
  }

  const payload = await response.json();
  return payload.data !== undefined && payload.success !== undefined ? payload.data : payload;
}

// ARTICLES
export const getAdminArticles = (qs = "") => fetchAdmin<{ items: AdminArticle[] }>(`/articles${qs}`);
export const createAdminArticle = (data: CreateArticlePayload) => fetchAdmin<AdminArticle>("/articles", { method: "POST", body: JSON.stringify(data) });
export const updateAdminArticle = (id: number, data: Partial<CreateArticlePayload>) => fetchAdmin<AdminArticle>(`/articles/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminArticle = (id: number) => fetchAdmin<{ id: number }>(`/articles/${id}`, { method: "DELETE" });
export const restoreAdminArticle = (id: number) => fetchAdmin<AdminArticle>(`/articles/${id}/restore`, { method: "POST" });

// CATEGORIES
export const getAdminCategories = (qs = "") => fetchAdmin<{ items: AdminCategory[] }>(`/categories${qs}`);
export const createAdminCategory = (data: CreateCategoryPayload) => fetchAdmin<AdminCategory>("/categories", { method: "POST", body: JSON.stringify(data) });
export const updateAdminCategory = (id: number, data: Partial<CreateCategoryPayload>) => fetchAdmin<AdminCategory>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminCategory = (id: number) => fetchAdmin<{ id: number }>(`/categories/${id}`, { method: "DELETE" });
export const restoreAdminCategory = (id: number) => fetchAdmin<AdminCategory>(`/categories/${id}/restore`, { method: "POST" });

// ADS
export const getAdminAds = (query: string = "") => fetchAdmin<{ items: AdminAd[] }>(`/ads${query}`);
export const createAdminAd = (data: CreateAdPayload) => fetchAdmin<AdminAd>("/ads", { method: "POST", body: JSON.stringify(data) });
export const updateAdminAd = (id: number, data: Partial<CreateAdPayload>) => fetchAdmin<AdminAd>(`/ads/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminAd = (id: number) => fetchAdmin<{ id: number }>(`/ads/${id}`, { method: "DELETE" });
export const restoreAdminAd = (id: number) => fetchAdmin<AdminAd>(`/ads/${id}/restore`, { method: "POST" });

// SETTINGS
export const getAdminSettings = () => fetchAdmin<AdminSettings>("/settings");
export const updateAdminSettings = (data: UpdateSettingsPayload) => fetchAdmin<AdminSettings>("/settings", { method: "PATCH", body: JSON.stringify(data) });

// STORAGE / MEDIA
export const getAdminMedia = (prefix: string = "", recursive: boolean = false) => fetchAdmin<AdminStorageResponse>(`/storage?prefix=${encodeURIComponent(prefix)}&recursive=${recursive}`);

export async function uploadAdminMedia(formData: FormData): Promise<AdminUploadResponse> {
  const url = `${API_BASE_URL}/admin/storage`;
  const options: RequestInit = {
    method: "POST",
    body: formData,
  };

  if (process.env.NEXT_PUBLIC_ADMIN_SECRET) {
    options.headers = {
      ...options.headers,
      "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET,
    };
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to upload media: ${response.status}`);
  }
  const data = await response.json();
  if (data.status === "error") {
    throw new Error(data.message || "Upload failed");
  }
  return data.data;
}

export const deleteAdminMedia = (key: string) => fetchAdmin<{ success: boolean }>(`/storage?key=${encodeURIComponent(key)}`, { method: "DELETE" });

export const moveAdminMedia = (fromKey: string, toKey: string) => fetchAdmin<{ success: boolean; fromKey: string; toKey: string }>("/storage/move", { method: "POST", body: JSON.stringify({ fromKey, toKey }) });

export const createAdminFolder = (folderName: string, parentPrefix: string = "") => fetchAdmin<{ success: boolean; key: string }>("/storage/folder", { method: "POST", body: JSON.stringify({ folderName, parentPrefix }) });

export const getAdminDashboardStats = () => fetchAdmin<AdminDashboardStats>("/dashboard");