-- Server-side aggregation functions for trending articles and top ads
-- Replaces the previous in-memory JS aggregation that loaded ALL stats rows

-- Leverages the article_stats_daily_trending_idx (date, article_id, views)
CREATE OR REPLACE FUNCTION get_trending_articles(p_limit integer, p_days integer)
RETURNS TABLE(article_id bigint, total_views bigint)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT asd.article_id, SUM(asd.views)::bigint AS total_views
  FROM article_stats_daily asd
  WHERE asd.date >= (CURRENT_DATE - p_days)
  GROUP BY asd.article_id
  ORDER BY total_views DESC
  LIMIT p_limit;
END;
$$;

-- Leverages the existing ad_stats_daily indexes
CREATE OR REPLACE FUNCTION get_top_ads(p_limit integer, p_days integer)
RETURNS TABLE(ad_id bigint, total_impressions bigint)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT asd.ad_id, SUM(asd.impressions)::bigint AS total_impressions
  FROM ad_stats_daily asd
  WHERE asd.date >= (CURRENT_DATE - p_days)
  GROUP BY asd.ad_id
  ORDER BY total_impressions DESC
  LIMIT p_limit;
END;
$$;
