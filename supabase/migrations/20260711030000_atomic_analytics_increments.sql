-- Atomic increment helpers for analytics flush / fallback paths.
-- Replaces non-atomic read → add → upsert/update races under concurrent writers.

-- article_stats_daily.views
CREATE OR REPLACE FUNCTION public.increment_article_stats_daily(
  p_article_id bigint,
  p_date date,
  p_views bigint
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_views IS NULL OR p_views = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.article_stats_daily (article_id, date, views, updated_at)
  VALUES (p_article_id, p_date, p_views, now())
  ON CONFLICT (article_id, date)
  DO UPDATE SET
    views = public.article_stats_daily.views + EXCLUDED.views,
    updated_at = now();
END;
$$;

-- ad_stats_daily.impressions / clicks
CREATE OR REPLACE FUNCTION public.increment_ad_stats_daily(
  p_ad_id bigint,
  p_date date,
  p_impressions bigint DEFAULT 0,
  p_clicks bigint DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(p_impressions, 0) = 0 AND COALESCE(p_clicks, 0) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.ad_stats_daily (ad_id, date, impressions, clicks, updated_at)
  VALUES (
    p_ad_id,
    p_date,
    COALESCE(p_impressions, 0),
    COALESCE(p_clicks, 0),
    now()
  )
  ON CONFLICT (ad_id, date)
  DO UPDATE SET
    impressions = public.ad_stats_daily.impressions + EXCLUDED.impressions,
    clicks = public.ad_stats_daily.clicks + EXCLUDED.clicks,
    updated_at = now();
END;
$$;

-- page_stats_daily.page_views (additive, never overwrite)
CREATE OR REPLACE FUNCTION public.increment_page_stats_daily(
  p_date date,
  p_page_views bigint
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_page_views IS NULL OR p_page_views = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.page_stats_daily (date, page_views, updated_at)
  VALUES (p_date, p_page_views, now())
  ON CONFLICT (date)
  DO UPDATE SET
    page_views = public.page_stats_daily.page_views + EXCLUDED.page_views,
    updated_at = now();
END;
$$;

-- articles.views counter (lifetime)
CREATE OR REPLACE FUNCTION public.increment_article_views(
  p_id bigint,
  p_count bigint
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_count IS NULL OR p_count = 0 THEN
    RETURN;
  END IF;

  UPDATE public.articles
  SET
    views = COALESCE(views, 0) + p_count,
    updated_at = now()
  WHERE id = p_id;
END;
$$;
