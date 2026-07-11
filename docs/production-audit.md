# Production Audit Report — WebTinTuc

**Date:** 2026-07-10  
**Stack:** Next.js 15 (App Router) · Supabase · Cloudflare R2 · Upstash Redis · Zod  
**Scope:** Security, performance, data integrity, ops/reliability  

**Note:** Older docs (`docs/code-review-2026-07-02.md`) still describe auth bypass / hardcoded secrets. **Those appear fixed.** This report reflects the **current** codebase at audit time.

---

## Executive summary

The architecture is reasonable (actions → services → repositories, validation, rate limits, analytics buffering). Auth is no longer the “wide open” state from the July review. **Several issues would still hurt production hard**, especially:

1. Public image proxy (SSRF / abuse)
2. Missing RLS on core tables
3. Public CDN caching of **admin** API responses
4. Stored XSS via HTML ads + article content
5. Analytics flush correctness (lost / overwritten counts)
6. Build config that can ship type errors

**Production readiness:** not ready without addressing the Critical/High items below.

---

## Critical

### 1. Open SSRF + bandwidth abuse — `/api/image-proxy`

**File:** `app/api/image-proxy/route.ts`

Public, unauthenticated endpoint that `fetch`es **any** `http(s)` URL. Weak protections only:

- Protocol check
- Blocks same-origin loopback
- Size cap **after** full download
- Allows SVG (`image/svg+xml`)

**Risks:**

| Risk | Detail |
|------|--------|
| SSRF | Probe internal IPs (`169.254.169.254`, localhost, VPC) via DNS rebinding / redirect chains |
| Amplification | Attackers force your server to fetch large/slow remote resources |
| XSS | Proxied SVG can execute script when rendered |
| Cost | CPU/egress on every uncached miss |

**Also:** `app/api/admin/proxy-image` has the same fetch pattern (admin-only, still SSRF if an admin session or `ADMIN_API_SECRET` is stolen).

**Fix:** Allowlist hostnames (R2/Unsplash only), block private IP ranges, disable redirects or re-validate redirect targets, reject SVG, stream with early size cutoff, rate-limit by IP.

---

### 2. Incomplete RLS — most tables unprotected

**File:** `current_schema.sql` (RLS only on `redirects`, `page_stats_daily`)

No RLS on `articles`, `ads`, `categories`, `profiles`, `site_settings`, stats tables, etc.

The browser exposes `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Client code already queries `profiles` (`lib/hooks/useAdminAuth.ts`). If Supabase defaults leave tables readable/writable to `anon`/`authenticated` without policies, **anyone can read drafts, overwrite content, or escalate roles** depending on your live Supabase config.

**Fix (required before prod):**

- Enable RLS on **every** table
- Public: SELECT only published + non-deleted content
- Writes: service role / admin only
- `profiles`: users can read own row; never allow role self-elevation
- Verify live project matches `current_schema.sql` (schema file alone is not proof of production DB state)

Default role on `profiles` is also dangerous:

```sql
"role" varchar(20) NOT NULL DEFAULT 'admin'
```

New profiles become admins unless explicitly set otherwise.

---

### 3. Admin API responses marked **publicly cacheable**

**File:** `server/http.ts` — `ok()` always sets:

```ts
Cache-Control: public, s-maxage=60, stale-while-revalidate=600
```

**All** admin GETs use `ok()`: accounts, articles (drafts), storage trees, **signed upload/download URLs**, dashboard stats, etc.

On Vercel/Cloudflare CDN, a successful admin GET can be cached **without auth** for subsequent anonymous requests (same URL, no `Vary: Cookie` / `Authorization`).

**Impact:** Leak drafts, emails, media keys, short-lived R2 signed URLs.

**Fix:** Default to `private, no-store` for admin/mutation routes; only set public cache on intentional public GETs. Or split `okPublic` / `okPrivate`.

---

### 4. Stored XSS — ads + article HTML

| Location | Mechanism |
|----------|-----------|
| `components/AdBanner.tsx`, `MobileAdsStack.tsx` | `dangerouslySetInnerHTML` with `html_code` (no sanitization) |
| `app/(site)/posts/[id]/page.tsx` | Paragraph/list blocks + full HTML strings via `dangerouslySetInnerHTML` |
| Iframe blocks | Unrestricted `src` (no allowlist) |

Admin-only write surface reduces risk, but any compromised admin, weak password, or future “editor” role becomes full site XSS (session theft, defacement, malware ads).

**Fix:** Sanitize HTML (DOMPurify or server-side equivalent), restrict iframe to YouTube/Vimeo, avoid raw HTML ads or sandbox them in `iframe sandbox`.

---

### 5. Cron endpoint auth is optional

**File:** `app/api/cron/flush/route.ts`

```ts
if (secret) {
  if (authHeader !== `Bearer ${secret}`) throw ...
}
// if CRON_SECRET unset → fully open
```

Anyone can trigger flushes, stress Redis/Postgres, and race analytics.

**Fix:** Require `CRON_SECRET` in production; fail closed if missing. Prefer Vercel Cron + secret header.

---

## High

### 6. Analytics data integrity bugs

**A. Ad flush deletes Redis before Postgres write** (`app/api/cron/flush/route.ts`):

```ts
await redisDel(key)  // then later flushAdStatsToPostgres
```

Crash or DB failure ⇒ **permanent loss** of impressions/clicks.

Article views correctly flush **then** delete.

**B. `page_stats_daily` overwrite, not increment:**

```ts
.upsert({ date, page_views: pageViews, ... })
```

After delete+rewrite cycles, second flush **replaces** totals with the partial Redis delta. Also: **no code writes** `page:views:*` keys (only flush exists) — dead/incomplete path.

**C. Non-atomic read-modify-write** in `flushArticleViewsToPostgres` / `incrementArticleViews` — concurrent flushes can under-count.

**Fix:** Delete Redis only after successful write; use SQL `views = views + excluded.views`; atomic RPCs; GET→INCR multi or Lua for rate limits.

---

### 7. Rate limiting fails open

**File:** `server/rate-limit.ts`

- Missing Redis → allow all
- Errors → allow all
- No logging
- `INCR` then `EXPIRE` not atomic (key can live forever without TTL)

Affects view fraud, ad impression/click spam, cost.

**Fix:** Fail closed for write/analytics endpoints (or in-memory fallback); use Upstash Ratelimit SDK / pipeline; log degraded mode.

---

### 8. Storage path / upload abuse (admin-authenticated)

| Issue | Detail |
|-------|--------|
| No `..` / absolute key validation | Presigned PutObject/GetObject accept arbitrary keys |
| No file size/MIME limits on upload action | Memory DoS via large FormData |
| `contentType` free-form | Upload HTML/SVG as “images” |
| 1h signed URLs | Long window if leaked |

**Files:** `app/api/admin/storage/upload-url`, `download-url`, `server/services/storage.service.ts`

**Fix:** Restrict key prefix, block `..`, allowlist MIME, max size, shorter expiry (5–15 min).

---

### 9. `ignoreBuildErrors: true`

**File:** `next.config.ts`

Production builds can ship **with TypeScript errors**. Combined with past non-strict history, this is a real ship risk even though `tsconfig` is now `strict: true`.

**Fix:** Set `ignoreBuildErrors: false`; make CI run `pnpm typecheck` + `pnpm build`.

---

### 10. Missing security headers

Only HSTS + DNS-Prefetch on non-API/admin routes. **No:**

- Content-Security-Policy  
- X-Frame-Options / `frame-ancestors`  
- X-Content-Type-Options  
- Referrer-Policy  
- Permissions-Policy  

Admin and article pages with HTML ads need CSP especially.

---

### 11. Secret comparison not constant-time; error leakage

- `providedSecret === configuredSecret` (timing side channel — lower severity)
- `fail()` returns raw `error.message` for non-`ApiError` failures — can leak DB/storage internals

**Fix:** `crypto.timingSafeEqual`; generic 500 messages in production; log details server-side only.

---

### 12. Test / debug surface in production routes

- `app/(site)/test-500/page.tsx` — intentional crash route  
- README still describes **mocks as default** — operational confusion  

Remove or gate `test-500` behind non-production env.

---

## Medium — performance & scale

### 13. Middleware hits Supabase on (almost) every page request

**File:** `middleware.ts`

Redirect lookup runs for most navigations (in-memory TTL cache helps per-instance only; cold starts / multi-instance still hit DB).

**Fix:** Edge config / KV for redirects, or longer shared cache (Redis).

---

### 14. Expensive fallback paths still present

- Trending: RPC preferred, but fallback loads **all** `article_stats_daily` rows in range into JS  
- Dashboard: multi-RPC with heavy fallbacks  
- Admin search with PostgREST `.or(\`...ilike.%${search}%\`)` — special characters (`,`, `.`) can break filters; treat as injection surface for filter syntax  

**Pagination:** `common.schema` allows `limit` up to **1000** on shared schema (some public routes cap lower).

---

### 15. Image proxy + Next Image double cost

External images go through `/api/image-proxy` **and** Next image optimization → extra origin work and cold-start cost.

---

### 16. Client-side admin gate is UX-only — **mitigated**

**Files:** `lib/hooks/useAdminAuth.ts`, `middleware.ts`, `lib/supabase/middleware.ts`

- ~~`localStorage.admin_logged_in` trusted for initial UI~~ → fail-closed: UI starts logged-out; flag is soft-only
- ~~Network failure “trusts localStorage”~~ → errors clear flag and hide admin UI
- ~~No middleware protection~~ → `/admin/*` requires valid Supabase session (`getUser`); `/admin` is login-only

API `requireAdmin` remains the real authorization boundary. Static JS chunks may still be downloadable (inherent client-bundle limit).

---

### 17. Password policy weak

`createAccountSchema`: min password length **6**. Prefer 10–12+ and breach checks for admins.

---

### 18. Env validation missing

No startup schema for required env vars (`SUPABASE_*`, `R2_*`, `ADMIN_API_SECRET`, `CRON_SECRET`, Redis). Misconfig fails at runtime mid-request. Empty R2 credentials fall back to `""`.

---

### 19. SEO / URL fallback

`NEXT_PUBLIC_SITE_URL ?? "https://example.com"` used in metadata, robots, sitemap, JSON-LD. Misconfigured deploys ship wrong canonicals/OG to Google.

---

### 20. Operational gaps

| Gap | Risk |
|-----|------|
| No health/readiness endpoint | Harder load balancer / uptime checks |
| No APM/error tracking (Sentry etc.) | Blind in prod |
| Redis REST without timeouts | Hung analytics / rate-limit calls |
| Cron flush N+1 Redis GETs | Slow as keys grow; needs pipeline/batch |
| No dependency audit in CI | Supply-chain drift |
| `vercel.json.example` only | Easy to forget cron wiring |

---

## Lower priority / positive notes

**Improvements since earlier review (good):**

- Real Supabase session + profile role checks in `server/auth.ts`
- Hardcoded admin secret removed from `adminClient.ts`
- Zod on many inputs; layered architecture
- Rate limits on view/impression/click
- Indexes + dashboard RPCs in migrations
- `strict` TypeScript enabled in `tsconfig.json`

**Lower severity:**

- `editor` role in DB but unused (only `admin` accepted)
- HTML ads + iframes without sandbox
- In-memory rate-limit key race under concurrency
- Signed URL APIs return under public cache headers (ties to #3)

---

## Priority fix order (recommended)

| # | Item | Effort |
|---|------|--------|
| 1 | Admin `Cache-Control: private, no-store` | Small |
| 2 | Require `CRON_SECRET`; fail closed | Small |
| 3 | Lock down image-proxy (allowlist / kill if unused) | Medium |
| 4 | Full RLS + secure profile defaults | Medium–High |
| 5 | Fix analytics flush order + atomic increments | Medium |
| 6 | Sanitize HTML ads/content; iframe allowlist | Medium |
| 7 | Storage key/MIME/size limits | Small–Medium |
| 8 | `ignoreBuildErrors: false` + CI typecheck/build | Small |
| 9 | Security headers + CSP | Medium |
| 10 | Rate-limit fail strategy + Redis timeouts | Medium |
| 11 | Remove `test-500`; validate env at boot | Small |
| 12 | Monitoring + health check | Medium |

---

## Suggested “go-live” checklist

- [ ] RLS verified in **live** Supabase (not only `current_schema.sql`)
- [ ] All secrets set: `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_SECRET`, `CRON_SECRET`, R2, Redis
- [ ] Admin APIs never publicly cached
- [ ] Image proxy restricted or removed
- [ ] Cron authenticated and scheduled
- [ ] Build fails on type errors
- [ ] No debug routes
- [ ] `NEXT_PUBLIC_SITE_URL` correct
- [ ] Error monitoring + uptime on `/` and `/api/articles`
- [ ] Backup/restore plan for Supabase + R2

---

## Related docs

- `docs/code-review-2026-07-02.md` — earlier code review (partially outdated)
- `docs/performance-audit.md` — performance-focused audit (2026-07-08)
- `docs/frontend-api-contract.md` — frontend/backend API contract
- `current_schema.sql` — current database schema reference
