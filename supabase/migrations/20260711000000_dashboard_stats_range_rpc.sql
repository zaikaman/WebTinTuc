-- ============================================================
-- Custom date-range dashboard stats RPC
-- Used by admin dashboard day/month/year "Lọc" filter.
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats_range(
  p_start_date date,
  p_end_date date,
  p_prev_start_date date,
  p_prev_end_date date
)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH
    total_counts AS (
      SELECT
        (SELECT COUNT(*)::int FROM articles WHERE deleted_at IS NULL) AS total_articles,
        (SELECT COUNT(*)::int FROM categories WHERE deleted_at IS NULL) AS total_categories,
        (SELECT COUNT(*)::int FROM ads WHERE deleted_at IS NULL) AS total_ads
    ),
    period_views AS (
      SELECT
        COALESCE(SUM(views) FILTER (WHERE date >= p_start_date AND date <= p_end_date), 0)::bigint AS views,
        COALESCE(SUM(views) FILTER (WHERE date >= p_prev_start_date AND date <= p_prev_end_date), 0)::bigint AS prev_views
      FROM article_stats_daily
      WHERE date >= LEAST(p_start_date, p_prev_start_date)
        AND date <= GREATEST(p_end_date, p_prev_end_date)
    ),
    period_clicks AS (
      SELECT
        COALESCE(SUM(clicks) FILTER (WHERE date >= p_start_date AND date <= p_end_date), 0)::bigint AS clicks,
        COALESCE(SUM(clicks) FILTER (WHERE date >= p_prev_start_date AND date <= p_prev_end_date), 0)::bigint AS prev_clicks
      FROM ad_stats_daily
      WHERE date >= LEAST(p_start_date, p_prev_start_date)
        AND date <= GREATEST(p_end_date, p_prev_end_date)
    ),
    period_articles AS (
      SELECT
        (SELECT COUNT(*)::int FROM articles
          WHERE deleted_at IS NULL
            AND created_at >= p_start_date::timestamptz
            AND created_at < (p_end_date + 1)::timestamptz) AS period_articles,
        (SELECT COUNT(*)::int FROM articles
          WHERE deleted_at IS NULL
            AND created_at >= p_prev_start_date::timestamptz
            AND created_at < (p_prev_end_date + 1)::timestamptz) AS prev_period_articles
    )
  SELECT jsonb_build_object(
    'totalArticles', (SELECT total_articles FROM total_counts),
    'totalCategories', (SELECT total_categories FROM total_counts),
    'totalAds', (SELECT total_ads FROM total_counts),

    -- Map period → today* so existing admin client custom path works
    'todayViews', (SELECT views FROM period_views),
    'yesterdayViews', (SELECT prev_views FROM period_views),
    'todayClicks', (SELECT clicks FROM period_clicks),
    'yesterdayClicks', (SELECT prev_clicks FROM period_clicks),

    'weekViews', (SELECT views FROM period_views),
    'prevWeekViews', (SELECT prev_views FROM period_views),
    'weekClicks', (SELECT clicks FROM period_clicks),
    'prevWeekClicks', (SELECT prev_clicks FROM period_clicks),

    'monthViews', (SELECT views FROM period_views),
    'prevMonthViews', (SELECT prev_views FROM period_views),
    'monthClicks', (SELECT clicks FROM period_clicks),
    'prevMonthClicks', (SELECT prev_clicks FROM period_clicks),

    'yearViews', (SELECT views FROM period_views),
    'prevYearViews', (SELECT prev_views FROM period_views),
    'yearClicks', (SELECT clicks FROM period_clicks),
    'prevYearClicks', (SELECT prev_clicks FROM period_clicks),

    'totalViews', (SELECT views FROM period_views),
    'totalClicks', (SELECT clicks FROM period_clicks),

    'periodArticles', (SELECT period_articles FROM period_articles),
    'prevPeriodArticles', (SELECT prev_period_articles FROM period_articles)
  ) INTO result;

  RETURN result;
END;
$$;
