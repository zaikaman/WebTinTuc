-- ============================================================
-- DASHBOARD OPTIMIZATION — Server-Side Aggregation RPCs
-- Migration: 20260708000000
-- 
-- These RPCs replace JS-side aggregation that was fetching
-- ALL rows from stats tables and aggregating in the application.
-- Instead, aggregation happens in PostgreSQL using proper indexes.
--
-- KEY OPTIMIZATION: get_dashboard_all_timeframes pre-computes
-- ALL standard timeframes (today, week, month, year) in one call,
-- so switching between tabs on the client is INSTANT.
-- ============================================================


-- ------------------------------------------------------------
-- 1. get_dashboard_all_timeframes
-- Pre-computes ALL standard timeframes in a single database call.
-- Returns today, yesterday, week, prev week, month, prev month,
-- year, prev year stats + total counts + period article counts.
--
-- This is the PRIMARY function used for standard time filters.
-- The result is cached aggressively.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_all_timeframes()
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  today date := (NOW() AT TIME ZONE 'UTC')::date;
  result jsonb;
BEGIN
  WITH 
    total_counts AS (
      SELECT
        (SELECT COUNT(*)::int FROM articles WHERE deleted_at IS NULL) AS total_articles,
        (SELECT COUNT(*)::int FROM categories WHERE deleted_at IS NULL) AS total_categories,
        (SELECT COUNT(*)::int FROM ads WHERE deleted_at IS NULL) AS total_ads
    ),
    -- Article views for all standard timeframes (aggregated ONCE)
    article_views AS (
      SELECT
        -- Today
        COALESCE(SUM(views) FILTER (WHERE date = today), 0)::bigint AS today_views,
        COALESCE(SUM(views) FILTER (WHERE date = today - 1), 0)::bigint AS yesterday_views,
        -- This week (last 7 days)
        COALESCE(SUM(views) FILTER (WHERE date >= today - 6 AND date <= today), 0)::bigint AS week_views,
        -- Prev week (7 days before this week)
        COALESCE(SUM(views) FILTER (WHERE date >= today - 13 AND date <= today - 7), 0)::bigint AS prev_week_views,
        -- This month (last 30 days)
        COALESCE(SUM(views) FILTER (WHERE date >= today - 29 AND date <= today), 0)::bigint AS month_views,
        -- Prev month (30 days before this month)
        COALESCE(SUM(views) FILTER (WHERE date >= today - 59 AND date <= today - 30), 0)::bigint AS prev_month_views,
        -- This year (from Jan 1)
        COALESCE(SUM(views) FILTER (WHERE date >= date_trunc('year', today)::date AND date <= today), 0)::bigint AS year_views,
        -- Prev year (all of last year)
        COALESCE(SUM(views) FILTER (WHERE date >= (date_trunc('year', today) - interval '1 year')::date AND date < date_trunc('year', today)::date), 0)::bigint AS prev_year_views
      FROM article_stats_daily
      WHERE date >= today - 365  -- Only scan up to 1 year of data
    ),
    -- Ad clicks for all standard timeframes (aggregated ONCE)
    ad_clicks AS (
      SELECT
        COALESCE(SUM(clicks) FILTER (WHERE date = today), 0)::bigint AS today_clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date = today - 1), 0)::bigint AS yesterday_clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date >= today - 6 AND date <= today), 0)::bigint AS week_clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date >= today - 13 AND date <= today - 7), 0)::bigint AS prev_week_clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date >= today - 29 AND date <= today), 0)::bigint AS month_clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date >= today - 59 AND date <= today - 30), 0)::bigint AS prev_month_clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date >= date_trunc('year', today)::date AND date <= today), 0)::bigint AS year_clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date >= (date_trunc('year', today) - interval '1 year')::date AND date < date_trunc('year', today)::date), 0)::bigint AS prev_year_clicks
      FROM ad_stats_daily
      WHERE date >= today - 365
    ),
    -- Period article counts for this month and prev month
    period_counts AS (
      SELECT
        -- Articles created in last 30 days
        (SELECT COUNT(*)::int FROM articles WHERE deleted_at IS NULL AND created_at >= (today - 29)::timestamptz) AS month_articles,
        -- Articles created in prev 30 days
        (SELECT COUNT(*)::int FROM articles WHERE deleted_at IS NULL AND created_at >= (today - 59)::timestamptz AND created_at < (today - 29)::timestamptz) AS prev_month_articles,
        -- Year article counts
        (SELECT COUNT(*)::int FROM articles WHERE deleted_at IS NULL AND created_at >= date_trunc('year', today)::timestamptz) AS year_articles,
        (SELECT COUNT(*)::int FROM articles WHERE deleted_at IS NULL AND created_at >= (date_trunc('year', today) - interval '1 year')::timestamptz AND created_at < date_trunc('year', today)::timestamptz) AS prev_year_articles
    )
  SELECT jsonb_build_object(
    'totalArticles', (SELECT total_articles FROM total_counts),
    'totalCategories', (SELECT total_categories FROM total_counts),
    'totalAds', (SELECT total_ads FROM total_counts),

    'todayViews', (SELECT today_views FROM article_views),
    'yesterdayViews', (SELECT yesterday_views FROM article_views),
    'todayClicks', (SELECT today_clicks FROM ad_clicks),
    'yesterdayClicks', (SELECT yesterday_clicks FROM ad_clicks),

    'weekViews', (SELECT week_views FROM article_views),
    'prevWeekViews', (SELECT prev_week_views FROM article_views),
    'weekClicks', (SELECT week_clicks FROM ad_clicks),
    'prevWeekClicks', (SELECT prev_week_clicks FROM ad_clicks),

    'monthViews', (SELECT month_views FROM article_views),
    'prevMonthViews', (SELECT prev_month_views FROM article_views),
    'monthClicks', (SELECT month_clicks FROM ad_clicks),
    'prevMonthClicks', (SELECT prev_month_clicks FROM ad_clicks),

    'yearViews', (SELECT year_views FROM article_views),
    'prevYearViews', (SELECT prev_year_views FROM article_views),
    'yearClicks', (SELECT year_clicks FROM ad_clicks),
    'prevYearClicks', (SELECT prev_year_clicks FROM ad_clicks),

    'totalViews', (SELECT year_views + prev_year_views FROM article_views),
    'totalClicks', (SELECT year_clicks + prev_year_clicks FROM ad_clicks),

    'periodArticles', (SELECT month_articles FROM period_counts),
    'prevPeriodArticles', (SELECT prev_month_articles FROM period_counts)
  ) INTO result;

  RETURN result;
END;
$$;


-- ------------------------------------------------------------
-- 2. get_dashboard_top_articles_range
-- Returns top N articles by views for a given date range.
-- Server-side aggregation with proper index usage.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_top_articles_range(
  p_start_date date,
  p_end_date date,
  p_limit integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(sub) INTO result FROM (
    SELECT a.id, a.title, COALESCE(c.name, 'Tin tức') AS category, ranked.total_views AS views
    FROM (
      SELECT asd.article_id, SUM(asd.views)::bigint AS total_views
      FROM article_stats_daily asd
      WHERE asd.date >= p_start_date AND asd.date <= p_end_date
      GROUP BY asd.article_id
      ORDER BY total_views DESC
      LIMIT p_limit
    ) ranked
    JOIN articles a ON a.id = ranked.article_id
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.status = 'published' AND a.deleted_at IS NULL
  ) sub;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;


-- ------------------------------------------------------------
-- 3. get_dashboard_top_ads_range
-- Returns top N ads by impressions for a given date range.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_top_ads_range(
  p_start_date date,
  p_end_date date,
  p_limit integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(sub) INTO result FROM (
    SELECT a.*, ranked.total_impressions AS impressions_7d
    FROM (
      SELECT asd.ad_id, SUM(asd.impressions)::bigint AS total_impressions
      FROM ad_stats_daily asd
      WHERE asd.date >= p_start_date AND asd.date <= p_end_date
      GROUP BY asd.ad_id
      ORDER BY total_impressions DESC
      LIMIT p_limit
    ) ranked
    JOIN ads a ON a.id = ranked.ad_id
    WHERE a.deleted_at IS NULL
  ) sub;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
