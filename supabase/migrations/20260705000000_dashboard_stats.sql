-- Create view for top categories with article count
CREATE OR REPLACE VIEW view_top_categories AS
SELECT 
  c.id, 
  c.name, 
  c.slug, 
  c.updated_at,
  COUNT(a.id)::int AS article_count
FROM categories c
LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'published' AND a.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.slug, c.updated_at
ORDER BY article_count DESC;

-- Create view for top ads based on 7-day impressions
CREATE OR REPLACE VIEW view_top_ads_7d AS
SELECT 
  a.id,
  a.name,
  a.type,
  a.position,
  a.media_key,
  a.html_code,
  a.target_url,
  a.priority,
  a.status,
  a.starts_at,
  a.ends_at,
  a.created_at,
  a.updated_at,
  a.deleted_at,
  COALESCE(SUM(s.impressions), 0)::int AS impressions_7d
FROM ads a
LEFT JOIN ad_stats_daily s ON s.ad_id = a.id AND s.date >= (CURRENT_DATE - INTERVAL '7 days')::date
WHERE a.deleted_at IS NULL
GROUP BY a.id;


-- Create view for dashboard statistics
CREATE OR REPLACE VIEW view_dashboard_metrics AS
WITH 
  counts AS (
    SELECT
      (SELECT COUNT(*)::int FROM articles WHERE deleted_at IS NULL) AS total_articles,
      (SELECT COUNT(*)::int FROM categories WHERE deleted_at IS NULL) AS total_categories,
      (SELECT COUNT(*)::int FROM ads WHERE deleted_at IS NULL) AS total_ads
  ),
  article_sums AS (
    SELECT
      COALESCE(SUM(views), 0)::bigint AS total_views,
      COALESCE(SUM(CASE WHEN date = (NOW() AT TIME ZONE 'UTC')::date THEN views ELSE 0 END), 0)::bigint AS today_views,
      COALESCE(SUM(CASE WHEN date = (NOW() AT TIME ZONE 'UTC')::date - 1 THEN views ELSE 0 END), 0)::bigint AS yesterday_views,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 7 THEN views ELSE 0 END), 0)::bigint AS week_views,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 14 AND date < (NOW() AT TIME ZONE 'UTC')::date - 7 THEN views ELSE 0 END), 0)::bigint AS prev_week_views,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 30 THEN views ELSE 0 END), 0)::bigint AS month_views,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 60 AND date < (NOW() AT TIME ZONE 'UTC')::date - 30 THEN views ELSE 0 END), 0)::bigint AS prev_month_views
    FROM article_stats_daily
  ),
  ad_sums AS (
    SELECT
      COALESCE(SUM(clicks), 0)::bigint AS total_clicks,
      COALESCE(SUM(CASE WHEN date = (NOW() AT TIME ZONE 'UTC')::date THEN clicks ELSE 0 END), 0)::bigint AS today_clicks,
      COALESCE(SUM(CASE WHEN date = (NOW() AT TIME ZONE 'UTC')::date - 1 THEN clicks ELSE 0 END), 0)::bigint AS yesterday_clicks,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 7 THEN clicks ELSE 0 END), 0)::bigint AS week_clicks,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 14 AND date < (NOW() AT TIME ZONE 'UTC')::date - 7 THEN clicks ELSE 0 END), 0)::bigint AS prev_week_clicks,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 30 THEN clicks ELSE 0 END), 0)::bigint AS month_clicks,
      COALESCE(SUM(CASE WHEN date >= (NOW() AT TIME ZONE 'UTC')::date - 60 AND date < (NOW() AT TIME ZONE 'UTC')::date - 30 THEN clicks ELSE 0 END), 0)::bigint AS prev_month_clicks
    FROM ad_stats_daily
  )
SELECT
  c.total_articles,
  c.total_categories,
  c.total_ads,
  v.total_views,
  k.total_clicks,
  v.today_views,
  v.yesterday_views,
  k.today_clicks,
  k.yesterday_clicks,
  v.week_views,
  v.prev_week_views,
  k.week_clicks,
  k.prev_week_clicks,
  v.month_views,
  v.prev_month_views,
  k.month_clicks,
  k.prev_month_clicks
FROM counts c
CROSS JOIN article_sums v
CROSS JOIN ad_sums k;
