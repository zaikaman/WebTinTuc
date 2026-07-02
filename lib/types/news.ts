export type ContentBlockType = "paragraph" | "bold-paragraph" | "image" | "ad";

export interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  src?: string;
  caption?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  categorySlug?: string;
  time: string;
  image: string;
  badge?: string;
  intro?: string;
  content?: ContentBlock[];
  views?: number;
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
    tagline: string;
    footerDescription: string;
    copyright: string;
    searchPlaceholder: string;
    utilityLinks: NavigationItem[];
    socialLinks: SocialLink[];
  };
  footer: {
    columns: FooterColumn[];
  };
}
