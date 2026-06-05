# Frontend API Contract

This app is frontend-only today. Mock data remains the default source. When the backend is ready, set:

```bash
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

The frontend accepts either a direct JSON payload or an envelope:

```json
{ "data": {} }
```

## Shared Models

```ts
type ContentBlockType = "paragraph" | "bold-paragraph" | "image" | "ad";

interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  src?: string;
  caption?: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  time: string;
  image: string;
  badge?: string;
  intro?: string;
  content?: ContentBlock[];
}

interface CategoryFeed {
  label: string;
  featured: Article;
  list: Article[];
}

interface HomeFeed {
  featuredArticle?: Article;
  latestArticles: Article[];
}

interface PostRecommendations {
  relatedPosts: Article[];
  likePosts: Article[];
}

interface NavigationItem {
  label: string;
  href: string;
}

interface SocialLink extends NavigationItem {
  platform?: "facebook" | "youtube" | "discord" | "other";
}

interface FooterColumn {
  title: string;
  links: NavigationItem[];
}

interface SiteSettings {
  brand: {
    name: string;
    tagline: string;
    footerDescription: string;
    copyright: string;
  };
  header: {
    logoText: string;
    logoSubtitle: string;
    primaryLinks: NavigationItem[];
    utilityLinks: NavigationItem[];
    socialLinks: SocialLink[];
    searchPlaceholder: string;
  };
  footer: {
    columns: FooterColumn[];
  };
}
```

## Endpoints Expected By The Frontend

### `GET /site-settings`

Returns admin-editable layout settings for the header navbar, utility links, social links, footer columns, and brand text.

```ts
SiteSettings
```

### `GET /articles/home`

Returns homepage data.

```ts
HomeFeed
```

### `GET /articles/:id`

Returns a detail article. Return `404` when the article does not exist.

```ts
Article
```

### `GET /articles/:id/recommendations`

Returns recommendation blocks for the detail page.

```ts
PostRecommendations
```

### `GET /categories/:slug`

Returns category page data. Return `404` when the category does not exist.

```ts
CategoryFeed
```

Current slugs:

- `tin-tuc`
- `anime-manga`
- `cong-nghe`
- `phim`
- `kien-thuc`

## Integration Notes

- Keep `id` stable because routes use `/posts/:id`.
- `image` can be a public path such as `/image.png` or an absolute URL.
- `time` is currently rendered as a display string and split by the first space. A later cleanup can switch this to ISO timestamps plus formatted labels.
- Header/footer labels and links are rendered from `SiteSettings`, so admin can edit them from backend data instead of changing frontend code.
- Backend only needs to match these response shapes. Frontend pages import from `lib/api/news.ts`, so endpoint paths or mapping can be changed in one place.
