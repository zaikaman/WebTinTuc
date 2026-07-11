# Admin Panel Audit Report

**Date:** 2026-07-11  
**Scope:** `app/admin/**`, `components/admin/**`, `lib/api/adminClient.ts`, `lib/hooks/useAdminAuth.tsx`, `lib/query/**`, and admin-facing server paths (dashboard, storage, articles, validations).  
**Stack:** Next.js 15 App Router · Supabase · Cloudflare R2 · TanStack React Query · Zod  

**Note:** This document consolidates findings from performance work, bugfixes, and a full re-audit of the admin panel. Status reflects the codebase after recent optimizations (shared layout, React Query, dashboard RPCs, spacing, `includeDeleted` boolean fix, custom date-range RPC).

---

## Executive summary

The admin panel architecture is much healthier after the performance pass (shared shell, React Query, client-side dashboard time filters, Link prefetch). Several **real product bugs** remain—especially **base64 cover/ad images instead of R2 upload**, missing **restore UI** for soft-deleted posts, **nested media folder paths**, and **logout cache leakage**.

| Priority | Count | Theme |
|----------|------:|--------|
| Critical | 2 | Media upload / storage correctness |
| High | 5 | Data recovery, R2 listing, auth edge cases |
| Medium | 13 | UX accuracy, validation, consistency |
| Low | 8 | Polish, copy, edge cases |
| Already OK | — | See bottom section |

---

## Critical

### 1. Cover image is saved as a base64 data URL, not uploaded to R2

**Files:**

- `app/admin/posts/PostEditorView.tsx` (cover upload + save payload)
- Save sends `thumbnail_key: postCoverImage`

**What happens:** Cover picker uses `FileReader.readAsDataURL` and stores the result in state. On save, that string is sent as `thumbnail_key`.

**Impact:**

- Public thumbnails break or never resolve on CDN
- Huge payloads in DB / API
- Draft restore in `localStorage` can hit quota

**Fix:** Upload via `uploadAdminMedia(FormData)` with folder `articles`, then persist `res.url` or `res.key` as `thumbnail_key` (same pattern as inline image insert / logo upload).

---

### 2. Ad creative image has the same data-URL bug

**Files:**

- `components/admin/AdDialog.tsx`
- `app/admin/ads/page.tsx` (submit maps `adForm.image` → `media_key`)

**What happens:** Ad image is read as data URL → form state → API `media_key`.

**Impact:** Ads never get real R2/CDN assets; list/public render fails or stores massive strings.

**Fix:** Upload to R2 (`folder: "ads"`) before create/update; persist returned URL/key only.

---

## High

### 3. Soft-deleted posts can be listed, but cannot be restored in UI

**Files:**

- `app/admin/posts/page.tsx`
- `components/admin/DefaultTab.tsx`
- API exists: `restoreAdminArticle` in `lib/api/adminClient.ts`, route `app/api/admin/articles/[id]/restore`

**What happens:** When “Ẩn bài viết đã xóa” is off, deleted rows show (dimmed) with only Edit/Delete. No Restore. Re-deleting or editing deleted content is confusing without a recovery path.

**Fix:** For `isDeleted` rows, show **Restore** (`restoreAdminArticle`), badge “Đã xóa”, and hide/disable re-delete or clarify. Same gap exists for categories/ads restore APIs if soft-delete is exposed later.

---

### 4. Nested media folders are modeled as top-level names (wrong prefix)

**Files:**

- `app/admin/media/page.tsx` (`activeFolder`, folder create)
- `components/admin/FolderDialog.tsx`

**What happens:** Creating a folder under e.g. `articles` correctly hits R2 as `articles/{name}/`, but UI only appends the bare name to `folders[]`. Clicking the new folder builds prefix `foo/` instead of `articles/foo/`. Nested tree is flat; parent path is lost.

**Fix:** Store full folder paths (use `subFolders[].path` from API). Tree should be hierarchical; `activeFolder` / list prefix must be the full path.

---

### 5. Root recursive media listing is not paginated (S3/R2 default ≤1000 keys)

**Files:**

- `server/services/storage.service.ts` (`getStorageTree`)
- `app/admin/media/page.tsx` (root uses `recursive=true`)

**What happens:** Single `ListObjectsV2` with no `ContinuationToken` loop. Root recursive mode silently truncates large libraries. Users may also see empty/stale root if browser/CDN cache serves an old empty response (hard refresh often “fixes” it).

**Fix:** Paginate list until `!IsTruncated`; set admin storage responses to `private, no-store` (see security note on `ok()`); or avoid full-bucket recursive root (folder-scoped only + optional search).

---

### 6. Non-admin authenticated users can bounce between middleware and client gate

**Files:**

- `middleware.ts` (`handleAdminGate`)
- `lib/hooks/useAdminAuth.tsx`

**What happens:** Middleware only checks “has session”, not `profiles.role === "admin"`. A non-admin session on `/admin` may be redirected toward dashboard, client fails role check and signs out, then back to `/admin` → loop-ish UX.

**Fix:** Middleware (or edge-safe claim) should only admit admin role into `/admin/*` (login page excepted). Client remains fail-closed for role.

---

### 7. Query cache not cleared on logout; warm flag never resets

**Files:**

- `lib/hooks/useAdminAuth.tsx`
- `app/admin/layout.tsx` (`warmedRef`)

**What happens:** Logout does not `queryClient.clear()`. `warmedRef` stays `true` for the layout lifetime. Next admin session in the same SPA mount can briefly see previous user’s cached lists.

**Fix:** On logout (and login), `queryClient.clear()`; reset warm prefetch flag; session module cache is already mostly handled on logout.

---

## Medium

### 8. No React Query error UI on admin lists / dashboard

**Files:** all `app/admin/*/page.tsx`

Failed fetches look like empty data (“Không tìm thấy…”). No `isError` / retry control.

**Fix:** Surface `isError` + retry button; optional global `QueryCache.onError` toast.

---

### 9. Dashboard “Bài viết” metric ignores standard time tabs

**Files:**

- `app/admin/dashboard/page.tsx` (`periodArticles` / `currPosts`)
- `server/repositories/dashboard.repository.ts` (all-timeframes `periodArticles` ≈ last ~30 days)

Today / week / year tabs change views/clicks from one shared payload, but posts count stays the same period figure.

**Fix:** Return per-period article counts in `get_dashboard_all_timeframes` / fallback; or always show `totalArticles` and stop implying period-scoped posts.

---

### 10. Trend indicators always green / always TrendingUp

**Files:**

- `components/admin/DashboardTab.tsx`
- `app/admin/dashboard/page.tsx` computes `isViewsUp` but UI largely ignores it

Negative `viewsChange` still shows emerald + up arrow.

**Fix:** Drive color and icon from `isViewsUp` / sign of change (`TrendingDown`, red/gray).

---

### 11. Custom date filter UX holes

**Files:**

- `components/admin/DashboardTab.tsx`
- `app/admin/dashboard/page.tsx`
- `getPeriodDates` in `server/repositories/dashboard.repository.ts`

Issues:

- Day without month is allowed; backend invents current UTC month
- Hint can inject a year even if user only picked day/month
- Invalid calendar combos (e.g. day 31 + month 02) not blocked client-side

**Fix:** Require month when day is set; validate calendar date; show only selected parts; disable Apply until valid.

**Note:** Server custom range + RPC `get_dashboard_stats_range` was fixed/applied (migration `20260711000000_dashboard_stats_range_rpc.sql`). Full month ranges now aggregate correctly when RPC/fallback runs.

---

### 12. Accounts STT uses page size 10, list uses 6

**File:** `components/admin/DefaultTab.tsx` (accounts STT ~ `(accountsPage - 1) * 10`)

`itemsPerPage = 6` in `app/admin/accounts/page.tsx` → wrong row numbers from page 2+.

**Fix:** Shared `pageSize` prop or use `6` consistently.

---

### 13. New ad form seeds invalid position `"Header"`

**File:** `app/admin/ads/page.tsx` (`handleOpenAddDialog`)

Select options are lowercase (`header`, `sidebar_1`, …). `"Header"` is not a valid option value.

**Fix:** Initialize `position: "header"` (matches initial state and `AdDialog`).

---

### 14. Sidebar logo/name does not update after Logo & Footer save

**Files:**

- `lib/hooks/useSiteSettings.ts` (module-level cache, load once)
- `app/admin/logo-footer/page.tsx`

Save updates React Query `adminKeys.settings` but not `cachedSiteSettings` used by the shell.

**Fix:** Invalidate/update module cache on save; or drive shell brand from shared React Query.

---

### 15. Logo-footer hydrate is one-shot

**File:** `app/admin/logo-footer/page.tsx`

`hydrated` flag prevents resync after external invalidate/refetch (local `setQueryData` after save is partially OK).

---

### 16. Client validation weaker than server (posts title min 5)

**Files:**

- `PostEditorView.tsx` (non-empty title only)
- `server/validations/article.schema.ts` (`title` min 5)

User can submit short titles → API error after save toast.

**Fix:** Mirror Zod rules client-side (title length, category, etc.).

---

### 17. Dialogs close before mutation finishes

**Files:** categories / ads / accounts pages

`setXDialogOpen(false)` often runs before `await` completes. On error, dialog is gone and form state is lost.

**Fix:** Close only on success; keep form open on error.

---

### 18. Posts filter change can double-fetch

**File:** `app/admin/posts/page.tsx`

`listParams` includes `postsPage`; a separate effect resets page to 1 when filters change → request with old page then page 1.

**Fix:** Reset page in the same state update as filters, or derive `page: 1` when filter keys change.

---

### 19. Media “Chọn tất cả” is non-functional

**File:** `components/admin/MediaTab.tsx`

Checkbox has no state/handlers; no bulk delete.

**Fix:** Wire selection state or remove until implemented.

---

### 20. Folder “delete” only hides from local UI

**File:** `app/admin/media/page.tsx` (`handleFolderDelete`)

Confirm/toast language can sound like permanent delete; R2 is untouched. Title is “Ẩn thư mục”.

**Fix:** Clearer copy; or implement real empty-folder delete with server support.

---

### 21. Brand color inconsistency (Media vs rest of admin)

**Files:** `MediaTab.tsx` uses `#eb5757`; shell/sidebar/dashboard use `#E55956` / `#cb4643`.

**Fix:** One brand token (e.g. `brand-red` / `#E55956`).

---

### 22. Invalid Tailwind utility classes (no effect)

**Files:** various admin components

Examples: `gray-150`, `gray-250`, `gray-350`, `gray-450`, `red-650`, `space-y-5.5`, `w-6.5`, `gap-4.5`, `scale-102`.

Not in `tailwind.config.ts` → borders/spacing silently fall back.

**Fix:** Use standard scale or extend theme.

---

### 23. Pagination renders every page button

**Files:** `DefaultTab.tsx`, `MediaTab.tsx`

`Array.from({ length: totalPages })` with no windowing. Large server totals hurt DOM/perf.

**Fix:** Ellipsis pagination (first/last + window around current).

---

### 24. Editor media library only lists `articles/` (non-recursive)

**File:** `PostEditorView.tsx` `loadMedia`

Images uploaded under other folders won’t appear in the library tab.

**Fix:** Optional recursive / multi-folder picker; or document the constraint in UI.

---

### 25. Spacing regression (historical — largely fixed)

**Root cause:** Global CSS had `* { margin: 0; padding: 0; }` which fought Tailwind `space-y-*`. Page wrappers also broke `main.space-y-6` by introducing a single child.

**Status:** Softened global reset; admin surfaces use `flex flex-col gap-6` on `AdminShell`, `DashboardTab`, `DefaultTab`, `MediaTab`, `LogoFooterTab`, skeletons.

---

## Low

| # | Issue | Notes |
|---|--------|--------|
| 26 | `fetchAdmin` always sets `Content-Type: application/json` | Fine for JSON; multipart upload path is separate. Upload errors often only show status. |
| 27 | Prefetch `includeDeleted=false` vs list omit param | Prefer one convention (omit when false). Keys still align for hide-deleted. |
| 28 | Dashboard empty sections | No empty state for empty top categories / top posts. |
| 29 | Posts `resetFilters` | Does not reset hide-deleted checkbox. |
| 30 | Hardcoded shell identity | “Administrator / Super Admin / AD” not real user. |
| 31 | Clipboard copy | Not awaited; no permission error handling on media copy. |
| 32 | Category add priority | Opens with `priority: 0` vs form default `1`. |
| 33 | Draft restore toast | Can fire noisily on remount; restore once per session is enough. |
| 34 | `app/admin/loading.tsx` | Full-screen flash over shell on transitions; content skeleton preferred. |

---

## Already OK

| Area | Notes |
|------|--------|
| **Boolean query coerce** | `queryBooleanSchema` avoids `Boolean("false") === true`. Posts only send `includeDeleted=true` when needed. Tests cover `includeDeleted` / `featured` strings. |
| **Hide deleted posts** | Server filter + client safety net against `placeholderData`. |
| **Dashboard standard time filters** | One shared stats payload; client switches today/week/month/year without refetch. |
| **Dashboard custom range** | RPC `get_dashboard_stats_range` + real fallback aggregation; period dates compute full month/year/day. |
| **React Query keys** | Centralized `adminKeys`; invalidation uses `*Root` prefixes. |
| **Auth provider / layout** | `AdminAuthProvider` + `AdminGate` + middleware soft gate; shared shell for logged-in routes. |
| **Post editor load** | Cancel-safe fetch; spinner instead of stacked loading toasts; content `blocks` / `{ blocks }` handled. |
| **Toast mutation pattern** | Stable toast `id` on save/upload/CRUD (less “stuck” loading toasts). |
| **Admin client envelope** | Unwraps `{ success, data }`. |
| **Sidebar navigation** | `next/link` + `prefetch` instead of only `router.push`. |
| **Spacing pattern** | `flex flex-col gap-6` on main admin surfaces. |
| **Empty/loading tables** | Skeletons + empty row messages in `DefaultTab`; media has empty copy. |
| **Restore/delete APIs** | Server + `adminClient` restore helpers exist even where UI doesn’t expose them. |
| **Media root vs folder listing** | Root intended as recursive all-files; subfolder non-recursive scoped list (aside from S3 pagination / nested path bugs). |

---

## Recent fixes already shipped (context)

These were addressed in the performance/bugfix sessions and should not be re-opened unless regressed:

1. Shared `app/admin/layout.tsx` + `AdminShell` + auth provider  
2. TanStack React Query + idle warm prefetch  
3. Dashboard instant standard filters (no per-tab refetch)  
4. Double-cache service layer removed for dashboard  
5. `includeDeleted` false→true Zod bug fixed  
6. Custom dashboard range RPC + fallback (not silent zeros)  
7. Spacing via `gap-6` + less aggressive global CSS reset  
8. Post edit load cancel/toast race fixed  
9. Code-split post editor + server-side posts pagination  

---

## Recommended fix order

1. **Critical #1–2** — Upload cover + ad images to R2  
2. **High #3–5** — Restore deleted posts UI; nested folder paths; R2 list pagination (+ private no-store for admin storage if needed)  
3. **High #6–7** — Non-admin middleware role gate; logout `queryClient.clear()` + reset warm flag  
4. **Medium batch** — Accounts STT, ad position default, trend colors, query error UI, logo shell cache, dialog close-on-success, brand color, invalid Tailwind classes  

---

## Related docs / migrations

| Path | Purpose |
|------|---------|
| `docs/production-audit.md` | Broader production security/performance audit |
| `supabase/migrations/20260708000000_dashboard_optimization_rpcs.sql` | All-timeframes + top lists RPCs |
| `supabase/migrations/20260711000000_dashboard_stats_range_rpc.sql` | Custom day/month/year stats RPC |
| `current_schema.sql` | Canonical schema snapshot (includes dashboard RPCs) |

---

## Changelog of this document

| Date | Note |
|------|------|
| 2026-07-11 | Initial full admin audit after perf + bugfix pass |
