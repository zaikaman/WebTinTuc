// lib/api/adminClient.ts
import { ApiError } from "./http";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const ADMIN_SECRET = "admin-api-secret"; // Tạm thời dùng hardcode secret hoặc để trống do BE đang tắt auth

async function fetchAdmin<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/admin${path}`;
  const headers = {
    "Content-Type": "application/json",
    "x-admin-secret": ADMIN_SECRET,
    ...(options.headers || {}),
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
  // Backend returns { success: true, data: T } or just T? 
  // Let's assume ok() wraps it in { data, ... } or just raw data.
  // Looking at ok() in server/http.ts, it returns NextResponse.json(data).
  return payload.data !== undefined && payload.success !== undefined ? payload.data : payload;
}

// ARTICLES
export const getAdminArticles = (qs = "") => fetchAdmin<any>(`/articles${qs}`);
export const createAdminArticle = (data: any) => fetchAdmin<any>("/articles", { method: "POST", body: JSON.stringify(data) });
export const updateAdminArticle = (id: number, data: any) => fetchAdmin<any>(`/articles/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminArticle = (id: number) => fetchAdmin<any>(`/articles/${id}`, { method: "DELETE" });
export const restoreAdminArticle = (id: number) => fetchAdmin<any>(`/articles/${id}/restore`, { method: "POST" });

// CATEGORIES
export const getAdminCategories = (qs = "") => fetchAdmin<any>(`/categories${qs}`);
export const createAdminCategory = (data: any) => fetchAdmin<any>("/categories", { method: "POST", body: JSON.stringify(data) });
export const updateAdminCategory = (id: number, data: any) => fetchAdmin<any>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminCategory = (id: number) => fetchAdmin<any>(`/categories/${id}`, { method: "DELETE" });
export const restoreAdminCategory = (id: number) => fetchAdmin<any>(`/categories/${id}/restore`, { method: "POST" });

// ADS
export const getAdminAds = (query: string = "") => fetchAdmin<any>(`/ads${query}`);
export const createAdminAd = (data: any) => fetchAdmin<any>("/ads", { method: "POST", body: JSON.stringify(data) });
export const updateAdminAd = (id: number, data: any) => fetchAdmin<any>(`/ads/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminAd = (id: number) => fetchAdmin<any>(`/ads/${id}`, { method: "DELETE" });
export const restoreAdminAd = (id: number) => fetchAdmin<any>(`/ads/${id}/restore`, { method: "POST" });

// SETTINGS
export const getAdminSettings = () => fetchAdmin<any>("/settings");
export const updateAdminSettings = (data: any) => fetchAdmin<any>("/settings", { method: "PATCH", body: JSON.stringify(data) });

// STORAGE / MEDIA
export const getAdminMedia = (prefix: string = "") => fetchAdmin<any>(`/storage?prefix=${encodeURIComponent(prefix)}`);

export async function uploadAdminMedia(formData: FormData) {
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

export const deleteAdminMedia = (key: string) => fetchAdmin<any>(`/storage?key=${encodeURIComponent(key)}`, { method: "DELETE" });

export const moveAdminMedia = (fromKey: string, toKey: string) => fetchAdmin<any>("/storage/move", { method: "POST", body: JSON.stringify({ fromKey, toKey }) });

export const createAdminFolder = (folderName: string, parentPrefix: string = "") => fetchAdmin<any>("/storage/folder", { method: "POST", body: JSON.stringify({ folderName, parentPrefix }) });