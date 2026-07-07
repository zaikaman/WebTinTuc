export type ContentBlockType = "paragraph" | "bold-paragraph" | "image" | "ad";

export interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  src?: string;
  caption?: string;
}

export interface Article {
  id: string;
  dbId?: number | undefined;
  title: string;
  category: string;
  categorySlug?: string | undefined;
  time: string;
  image: string;
  badge?: string | undefined;
  intro?: string | undefined;
  content?: ContentBlock[] | undefined;
  views?: number | undefined;
}

export interface CategoryFeed {
  label: string;
  featured: Article;
  list: Article[];
}

export interface HomeFeed {
  featuredArticle?: Article;
  latestArticles: Article[];
}

export interface PostRecommendations {
  relatedPosts: Article[];
  likePosts: Article[];
}

export interface NavigationItem {
  label: string;
  href?: string;
}

export interface SocialLink extends NavigationItem {
  platform?: "zalo" | "email" | "facebook" | "youtube" | "discord" | "other";
}

export interface FooterColumn {
  title: string;
  links: NavigationItem[];
}

export interface SiteSettings {
  brand: {
    name: string;
    logo_url?: string | null;
    tagline: string;
    footerDescription: string;
    copyright: string;
    searchPlaceholder: string;
    utilityLinks: NavigationItem[];
    socialLinks: SocialLink[];
  };
  footer: {
    columns: FooterColumn[];
    address?: string;
    phone?: string;
    email?: string;
    license?: string;
    responsible?: string;
  };
}

