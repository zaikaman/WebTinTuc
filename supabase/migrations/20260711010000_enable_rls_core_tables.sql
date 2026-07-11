-- =============================================================================
-- Critical security: enable RLS on all public tables, least-privilege policies,
-- fix profiles.role default, lock down admin views/RPCs from anon/authenticated.
--
-- Design:
-- - App data writes go through service_role (bypasses RLS) on the server.
-- - anon/authenticated: SELECT only for public published content where needed.
-- - profiles: authenticated users may SELECT their own row only (admin gate).
-- - No public INSERT/UPDATE/DELETE on any table.
-- - Stats + admin RPCs/views: not exposed to anon/authenticated.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Fix privilege-escalation default on profiles.role
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'editor'::character varying;

-- ---------------------------------------------------------------------------
-- 2) Enable RLS on every public table
-- ---------------------------------------------------------------------------
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- redirects already has RLS enabled

-- Force RLS even for table owners (defense in depth; service_role still bypasses)
ALTER TABLE public.articles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.article_stats_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ad_stats_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE public.page_stats_daily FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.redirects FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3) Drop existing policies we are replacing (idempotent re-run safety)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS articles_public_read ON public.articles;
DROP POLICY IF EXISTS articles_service_all ON public.articles;

DROP POLICY IF EXISTS categories_public_read ON public.categories;
DROP POLICY IF EXISTS categories_service_all ON public.categories;

DROP POLICY IF EXISTS ads_public_read ON public.ads;
DROP POLICY IF EXISTS ads_service_all ON public.ads;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_service_all ON public.profiles;

DROP POLICY IF EXISTS article_stats_daily_service_all ON public.article_stats_daily;
DROP POLICY IF EXISTS ad_stats_daily_service_all ON public.ad_stats_daily;
DROP POLICY IF EXISTS page_stats_daily_service_all ON public.page_stats_daily;
DROP POLICY IF EXISTS page_stats_daily_public_read ON public.page_stats_daily;

DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
DROP POLICY IF EXISTS site_settings_service_all ON public.site_settings;

DROP POLICY IF EXISTS redirects_public_read ON public.redirects;
DROP POLICY IF EXISTS redirects_service_write ON public.redirects;
DROP POLICY IF EXISTS redirects_service_all ON public.redirects;

-- ---------------------------------------------------------------------------
-- 4) Public SELECT policies (published / active, not soft-deleted)
-- ---------------------------------------------------------------------------

-- Articles: only published, non-deleted rows are visible to clients
CREATE POLICY articles_public_read
  ON public.articles
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND deleted_at IS NULL
  );

-- Categories: only active, non-deleted
CREATE POLICY categories_public_read
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'
    AND deleted_at IS NULL
  );

-- Ads: only active, non-deleted (schedule filtering remains app-side)
CREATE POLICY ads_public_read
  ON public.ads
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'
    AND deleted_at IS NULL
  );

-- Site settings: public brand/footer config is safe to read; no public writes
CREATE POLICY site_settings_public_read
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Redirects: middleware uses anon key for from_path lookup
CREATE POLICY redirects_public_read
  ON public.redirects
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- 5) Profiles: authenticated users may read ONLY their own row
--    (required for middleware + admin login role check)
--    No UPDATE/INSERT/DELETE for anon/authenticated → role cannot be escalated
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 6) Explicit service_role full access policies
--    (Supabase service_role key bypasses RLS; these cover SET ROLE service_role
--     and keep parity with existing redirects_service_write)
-- ---------------------------------------------------------------------------
CREATE POLICY articles_service_all
  ON public.articles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY categories_service_all
  ON public.categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY ads_service_all
  ON public.ads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY profiles_service_all
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY article_stats_daily_service_all
  ON public.article_stats_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY ad_stats_daily_service_all
  ON public.ad_stats_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY page_stats_daily_service_all
  ON public.page_stats_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY site_settings_service_all
  ON public.site_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY redirects_service_all
  ON public.redirects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Stats tables intentionally have NO anon/authenticated policies → deny all.

-- ---------------------------------------------------------------------------
-- 7) Harden table grants: strip write privileges from client roles
--    (RLS already blocks writes without policies; this is defense in depth)
-- ---------------------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE
    public.articles,
    public.categories,
    public.ads,
    public.profiles,
    public.article_stats_daily,
    public.ad_stats_daily,
    public.page_stats_daily,
    public.site_settings,
    public.redirects
  FROM anon, authenticated;

-- Keep SELECT grants; RLS filters rows. Stats: revoke SELECT too.
REVOKE SELECT
  ON TABLE
    public.article_stats_daily,
    public.ad_stats_daily,
    public.page_stats_daily
  FROM anon, authenticated;

-- Profiles: only authenticated needs SELECT (own row via RLS); anon has no need
REVOKE SELECT ON TABLE public.profiles FROM anon;

-- ---------------------------------------------------------------------------
-- 8) Admin views: prevent PostgREST bypass of table RLS via view owner rights
-- ---------------------------------------------------------------------------
ALTER VIEW public.view_dashboard_metrics SET (security_invoker = true);
ALTER VIEW public.view_top_ads_7d SET (security_invoker = true);
ALTER VIEW public.view_top_categories SET (security_invoker = true);

REVOKE ALL ON TABLE public.view_dashboard_metrics FROM anon, authenticated;
REVOKE ALL ON TABLE public.view_top_ads_7d FROM anon, authenticated;
REVOKE ALL ON TABLE public.view_top_categories FROM anon, authenticated;

GRANT SELECT ON TABLE public.view_dashboard_metrics TO service_role;
GRANT SELECT ON TABLE public.view_top_ads_7d TO service_role;
GRANT SELECT ON TABLE public.view_top_categories TO service_role;

-- ---------------------------------------------------------------------------
-- 9) Admin / internal RPCs: service_role only (not callable via anon key)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_dashboard_all_timeframes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_dashboard_stats_range(date, date, date, date) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_dashboard_top_ads_range(date, date, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_dashboard_top_articles_range(date, date, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_top_ads(integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_trending_articles(integer, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_dashboard_all_timeframes() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats_range(date, date, date, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_dashboard_top_ads_range(date, date, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_dashboard_top_articles_range(date, date, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_top_ads(integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_trending_articles(integer, integer) TO service_role;

-- Trigger helper stays internal; revoke from client roles
REVOKE ALL ON FUNCTION public.articles_search_vector_update() FROM PUBLIC, anon, authenticated;

COMMIT;
