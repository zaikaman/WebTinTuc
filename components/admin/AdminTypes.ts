export interface Post {
  id: number;
  title: string;
  category: string;
  views: number;
  status: "Đã đăng" | "Nháp";
  createdAt: string;
  content?: string;
  coverImage?: string;
  isDeleted?: boolean;
}

export interface Category {
  id: number;
  name: string;
  postCount: number;
  priority: number;
  status: "Hoạt động" | "Ngừng hoạt động" | "Chờ chạy" | "Đã kết thúc";
}

export interface Ad {
  id: number;
  name: string;
  position: string;
  clicks: number;
  startDate: string;
  endDate: string;
  status: "Hoạt động" | "Ngừng hoạt động" | "Chờ chạy" | "Đã kết thúc" | string;
  image?: string;
  link?: string;
}

export type TabType = "dashboard" | "posts" | "categories" | "ads" | "logo-footer" | "media";

export interface MediaItem {
  id: number;
  key: string;
  title: string;
  type: "image" | "video";
  url: string;
  size: string;
  dimensions?: string;
  duration?: string;
  createdAt: string;
  folder?: string;
}

export interface DashboardStats {
  views: string;
  viewsVal: string;
  posts: number;
  clicks: string;
  viewsChange: string;
  postsChange: string;
  clicksChange: string;
  isViewsUp: boolean;
  isPostsUp: boolean;
  isClicksUp: boolean;
}

export interface CategoryStat {
  name: string;
  count: number;
  percentage: number;
}

export interface TopPost {
  id: number;
  title: string;
  category: string;
  views: number;
}
