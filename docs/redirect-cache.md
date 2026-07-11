# SEO redirect cache (middleware)

## What it is

Public path redirects are resolved in `middleware.ts` via Supabase `redirects` (anon SELECT). Results are stored in an **in-memory `Map` per process / Edge isolate** to avoid a database round-trip on every page view.

## Multi-instance limitation

On serverless (multiple instances or Edge isolates), **each isolate has its own Map**. Entries are never shared between instances. This is by design for latency; it is **not** a global CDN-style cache.

## Staleness after admin edits

| Environment | Typical lag after create / update / delete |
|-------------|--------------------------------------------|
| **Upstash Redis configured** (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) | ≤ ~10s — mutations `INCR redirects:cache:version`; each isolate polls and clears its Map |
| **Redis unavailable / unset** | Up to **60s** (`REDIRECT_CACHE_TTL_MS`) |

This is **acceptable for SEO redirects**. Admins who need a rule live sooner should wait one version-check interval (with Redis) or one TTL (without). Do not use this layer for security-sensitive access control.

## Explicit purge

There is no HTTP “purge all edges” endpoint. Purge is:

1. **Shared generation bump** — `bumpRedirectCacheVersion()` from `lib/redirect-cache.ts`, called by `server/actions/redirect.action.ts` after successful mutations.
2. **TTL expiry** — automatic safety net on every isolate.

## Tuning

Constants live in `lib/redirect-cache.ts`:

- `REDIRECT_CACHE_TTL_MS` — local entry lifetime (default 60_000)
- `REDIRECT_VERSION_CHECK_MS` — how often to read the Redis generation (default 10_000)
- `REDIRECT_CACHE_MAX_SIZE` — max Map entries per isolate (default 1000)

## Related files

- `middleware.ts` — lookup + local Map + version poll
- `lib/redirect-cache.ts` — TTL constants, Redis GET/INCR helpers
- `server/actions/redirect.action.ts` — bump after mutations
- `docs/production-audit.md` §17 — audit trail
