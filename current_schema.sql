--
-- current_schema.sql - schema-only dump of Supabase public schema (no data)
-- Source: db.iagatkkfrpfynkrtlvxx.supabase.co (PostgreSQL 17.6)
-- Dumped: 2026-07-11 via pg_dump 18.1
--
-- Included: tables, views, functions, indexes, constraints, triggers, RLS policies
-- Excluded: table data, owners, privileges, Supabase system schemas (auth, storage, etc.)
--
-- Required extensions (managed by Supabase; not recreated here):
--   unaccent (public), uuid-ossp (extensions), pgcrypto (extensions), plpgsql
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: articles_search_vector_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.articles_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.title, ''))),   'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.summary, ''))), 'B');
  RETURN NEW;
END;
$$;


--
-- Name: get_dashboard_all_timeframes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_all_timeframes() RETURNS jsonb
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


--
-- Name: get_dashboard_stats_range(date, date, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_stats_range(p_start_date date, p_end_date date, p_prev_start_date date, p_prev_end_date date) RETURNS jsonb
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

    -- Map period â†’ today* so existing admin client custom path works
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


--
-- Name: get_dashboard_top_ads_range(date, date, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_top_ads_range(p_start_date date, p_end_date date, p_limit integer DEFAULT 5) RETURNS jsonb
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


--
-- Name: get_dashboard_top_articles_range(date, date, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_top_articles_range(p_start_date date, p_end_date date, p_limit integer DEFAULT 5) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(sub) INTO result FROM (
    SELECT a.id, a.title, COALESCE(c.name, 'Tin tá»©c') AS category, ranked.total_views AS views
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


--
-- Name: get_top_ads(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_top_ads(p_limit integer, p_days integer) RETURNS TABLE(ad_id bigint, total_impressions bigint)
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


--
-- Name: get_trending_articles(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_trending_articles(p_limit integer, p_days integer) RETURNS TABLE(article_id bigint, total_views bigint)
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


--
-- Name: profiles_prevent_last_admin_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.profiles_prevent_last_admin_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.role = 'admin'
        AND p.id IS DISTINCT FROM OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot delete the last admin profile'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;


--
-- Name: profiles_prevent_last_admin_demotion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.profiles_prevent_last_admin_demotion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF OLD.role = 'admin' AND NEW.role IS DISTINCT FROM 'admin' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.role = 'admin'
        AND p.id IS DISTINCT FROM OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot demote the last admin profile'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_stats_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_stats_daily (
    id bigint NOT NULL,
    ad_id bigint NOT NULL,
    date date NOT NULL,
    impressions bigint DEFAULT 0 NOT NULL,
    clicks bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: ad_stats_daily_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ad_stats_daily ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ad_stats_daily_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ads (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(30) NOT NULL,
    "position" character varying(50) NOT NULL,
    media_key text,
    html_code text,
    target_url text,
    priority integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT ads_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))),
    CONSTRAINT ads_type_check CHECK (((type)::text = ANY ((ARRAY['image'::character varying, 'html'::character varying, 'video'::character varying])::text[])))
);


--
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ads ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: article_stats_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.article_stats_daily (
    id bigint NOT NULL,
    article_id bigint NOT NULL,
    date date NOT NULL,
    views bigint DEFAULT 0 NOT NULL,
    unique_views bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: article_stats_daily_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.article_stats_daily ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.article_stats_daily_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    summary text,
    thumbnail_key text,
    content jsonb NOT NULL,
    category_id bigint,
    author_id uuid,
    views bigint DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    featured boolean DEFAULT false,
    seo_title character varying(255),
    seo_description text,
    search_vector tsvector,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT articles_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying])::text[])))
);


--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.articles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT categories_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: page_stats_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_stats_daily (
    date date NOT NULL,
    page_views bigint DEFAULT 0 NOT NULL,
    unique_visitors bigint DEFAULT 0 NOT NULL,
    sessions bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username character varying(50) NOT NULL,
    display_name character varying(100),
    avatar_key text,
    -- Admin-only until multi-role is implemented (editor removed from CHECK).
    role character varying(20) DEFAULT 'admin'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK (((role)::text = 'admin'::text))
);


--
-- Name: redirects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redirects (
    id bigint NOT NULL,
    from_path text NOT NULL,
    to_path text NOT NULL,
    status_code integer DEFAULT 301 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT redirects_status_code_check CHECK ((status_code = ANY (ARRAY[301, 302, 307, 308])))
);


--
-- Name: redirects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.redirects ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.redirects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer DEFAULT 1 NOT NULL,
    brand jsonb NOT NULL,
    footer jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT check_single_row CHECK ((id = 1))
);


--
-- Name: view_dashboard_metrics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_dashboard_metrics AS
 WITH counts AS (
         SELECT ( SELECT (count(*))::integer AS count
                   FROM public.articles
                  WHERE (articles.deleted_at IS NULL)) AS total_articles,
            ( SELECT (count(*))::integer AS count
                   FROM public.categories
                  WHERE (categories.deleted_at IS NULL)) AS total_categories,
            ( SELECT (count(*))::integer AS count
                   FROM public.ads
                  WHERE (ads.deleted_at IS NULL)) AS total_ads
        ), article_sums AS (
         SELECT (COALESCE(sum(article_stats_daily.views), (0)::numeric))::bigint AS total_views,
            (COALESCE(sum(
                CASE
                    WHEN (article_stats_daily.date = ((now() AT TIME ZONE 'UTC'::text))::date) THEN article_stats_daily.views
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS today_views,
            (COALESCE(sum(
                CASE
                    WHEN (article_stats_daily.date = (((now() AT TIME ZONE 'UTC'::text))::date - 1)) THEN article_stats_daily.views
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS yesterday_views,
            (COALESCE(sum(
                CASE
                    WHEN (article_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 7)) THEN article_stats_daily.views
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS week_views,
            (COALESCE(sum(
                CASE
                    WHEN ((article_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 14)) AND (article_stats_daily.date < (((now() AT TIME ZONE 'UTC'::text))::date - 7))) THEN article_stats_daily.views
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS prev_week_views,
            (COALESCE(sum(
                CASE
                    WHEN (article_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 30)) THEN article_stats_daily.views
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS month_views,
            (COALESCE(sum(
                CASE
                    WHEN ((article_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 60)) AND (article_stats_daily.date < (((now() AT TIME ZONE 'UTC'::text))::date - 30))) THEN article_stats_daily.views
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS prev_month_views
           FROM public.article_stats_daily
        ), ad_sums AS (
         SELECT (COALESCE(sum(ad_stats_daily.clicks), (0)::numeric))::bigint AS total_clicks,
            (COALESCE(sum(
                CASE
                    WHEN (ad_stats_daily.date = ((now() AT TIME ZONE 'UTC'::text))::date) THEN ad_stats_daily.clicks
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS today_clicks,
            (COALESCE(sum(
                CASE
                    WHEN (ad_stats_daily.date = (((now() AT TIME ZONE 'UTC'::text))::date - 1)) THEN ad_stats_daily.clicks
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS yesterday_clicks,
            (COALESCE(sum(
                CASE
                    WHEN (ad_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 7)) THEN ad_stats_daily.clicks
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS week_clicks,
            (COALESCE(sum(
                CASE
                    WHEN ((ad_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 14)) AND (ad_stats_daily.date < (((now() AT TIME ZONE 'UTC'::text))::date - 7))) THEN ad_stats_daily.clicks
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS prev_week_clicks,
            (COALESCE(sum(
                CASE
                    WHEN (ad_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 30)) THEN ad_stats_daily.clicks
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS month_clicks,
            (COALESCE(sum(
                CASE
                    WHEN ((ad_stats_daily.date >= (((now() AT TIME ZONE 'UTC'::text))::date - 60)) AND (ad_stats_daily.date < (((now() AT TIME ZONE 'UTC'::text))::date - 30))) THEN ad_stats_daily.clicks
                    ELSE (0)::bigint
                END), (0)::numeric))::bigint AS prev_month_clicks
           FROM public.ad_stats_daily
        )
 SELECT c.total_articles,
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
   FROM ((counts c
     CROSS JOIN article_sums v)
     CROSS JOIN ad_sums k);


--
-- Name: view_top_ads_7d; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_top_ads_7d AS
SELECT
    NULL::bigint AS id,
    NULL::character varying(100) AS name,
    NULL::character varying(30) AS type,
    NULL::character varying(50) AS "position",
    NULL::text AS media_key,
    NULL::text AS html_code,
    NULL::text AS target_url,
    NULL::integer AS priority,
    NULL::character varying(20) AS status,
    NULL::timestamp with time zone AS starts_at,
    NULL::timestamp with time zone AS ends_at,
    NULL::timestamp with time zone AS created_at,
    NULL::timestamp with time zone AS updated_at,
    NULL::timestamp with time zone AS deleted_at,
    NULL::integer AS impressions_7d;


--
-- Name: view_top_categories; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_top_categories AS
 SELECT c.id,
    c.name,
    c.slug,
    c.updated_at,
    (count(a.id))::integer AS article_count
   FROM (public.categories c
     LEFT JOIN public.articles a ON (((a.category_id = c.id) AND ((a.status)::text = 'published'::text) AND (a.deleted_at IS NULL))))
  WHERE (c.deleted_at IS NULL)
  GROUP BY c.id, c.name, c.slug, c.updated_at
  ORDER BY ((count(a.id))::integer) DESC;


--
-- Name: ad_stats_daily ad_stats_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_stats_daily
    ADD CONSTRAINT ad_stats_daily_pkey PRIMARY KEY (id);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: article_stats_daily article_stats_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_stats_daily
    ADD CONSTRAINT article_stats_daily_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: page_stats_daily page_stats_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_stats_daily
    ADD CONSTRAINT page_stats_daily_pkey PRIMARY KEY (date);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: redirects redirects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: ad_stats_daily_ad_date_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ad_stats_daily_ad_date_uidx ON public.ad_stats_daily USING btree (ad_id, date);


--
-- Name: ad_stats_daily_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ad_stats_daily_date_idx ON public.ad_stats_daily USING btree (date);


--
-- Name: ads_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ads_deleted_at_idx ON public.ads USING btree (deleted_at);


--
-- Name: ads_deleted_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ads_deleted_created_idx ON public.ads USING btree (deleted_at, created_at DESC);


--
-- Name: ads_position_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ads_position_status_idx ON public.ads USING btree ("position", status);


--
-- Name: ads_starts_ends_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ads_starts_ends_idx ON public.ads USING btree (starts_at, ends_at);


--
-- Name: ads_status_deleted_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ads_status_deleted_priority_idx ON public.ads USING btree (status, priority DESC) WHERE (deleted_at IS NULL);


--
-- Name: article_stats_daily_article_date_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX article_stats_daily_article_date_uidx ON public.article_stats_daily USING btree (article_id, date);


--
-- Name: article_stats_daily_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX article_stats_daily_date_idx ON public.article_stats_daily USING btree (date);


--
-- Name: article_stats_daily_trending_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX article_stats_daily_trending_idx ON public.article_stats_daily USING btree (date, article_id, views);


--
-- Name: articles_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_author_id_idx ON public.articles USING btree (author_id);


--
-- Name: articles_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_category_id_idx ON public.articles USING btree (category_id);


--
-- Name: articles_category_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_category_published_idx ON public.articles USING btree (category_id, published_at DESC) WHERE (((status)::text = 'published'::text) AND (deleted_at IS NULL));


--
-- Name: articles_category_status_deleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_category_status_deleted_idx ON public.articles USING btree (category_id, status, deleted_at);


--
-- Name: articles_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_deleted_at_idx ON public.articles USING btree (deleted_at);


--
-- Name: articles_deleted_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_deleted_created_idx ON public.articles USING btree (deleted_at, created_at DESC);


--
-- Name: articles_featured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_featured_idx ON public.articles USING btree (featured) WHERE ((featured = true) AND (deleted_at IS NULL));


--
-- Name: articles_published_at_desc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_published_at_desc_idx ON public.articles USING btree (published_at DESC) WHERE (((status)::text = 'published'::text) AND (deleted_at IS NULL));


--
-- Name: articles_published_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_published_at_idx ON public.articles USING btree (published_at);


--
-- Name: articles_search_vector_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_search_vector_idx ON public.articles USING gin (search_vector);


--
-- Name: articles_slug_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX articles_slug_unique_idx ON public.articles USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: articles_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX articles_status_idx ON public.articles USING btree (status);


--
-- Name: categories_deleted_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_deleted_created_idx ON public.categories USING btree (deleted_at, created_at DESC);


--
-- Name: categories_name_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_unique_idx ON public.categories USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: categories_slug_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_unique_idx ON public.categories USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: categories_status_deleted_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_status_deleted_priority_idx ON public.categories USING btree (status, priority DESC) WHERE (deleted_at IS NULL);


--
-- Name: redirects_from_path_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX redirects_from_path_uidx ON public.redirects USING btree (from_path);


--
-- Name: view_top_ads_7d _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.view_top_ads_7d AS
 SELECT a.id,
    a.name,
    a.type,
    a."position",
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
    (COALESCE(sum(s.impressions), (0)::numeric))::integer AS impressions_7d
   FROM (public.ads a
     LEFT JOIN public.ad_stats_daily s ON (((s.ad_id = a.id) AND (s.date >= ((CURRENT_DATE - '7 days'::interval))::date))))
  WHERE (a.deleted_at IS NULL)
  GROUP BY a.id;


--
-- Name: articles articles_search_vector_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER articles_search_vector_trigger BEFORE INSERT OR UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.articles_search_vector_update();


--
-- Name: profiles profiles_prevent_last_admin_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_prevent_last_admin_delete BEFORE DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_prevent_last_admin_delete();


--
-- Name: profiles profiles_prevent_last_admin_demotion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_prevent_last_admin_demotion BEFORE UPDATE OF role ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_prevent_last_admin_demotion();


--
-- Name: ad_stats_daily ad_stats_daily_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_stats_daily
    ADD CONSTRAINT ad_stats_daily_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;


--
-- Name: article_stats_daily article_stats_daily_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.article_stats_daily
    ADD CONSTRAINT article_stats_daily_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- Name: articles articles_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) DEFERRABLE;


--
-- Name: articles articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL DEFERRABLE;


--
-- Name: ad_stats_daily; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_stats_daily FORCE ROW LEVEL SECURITY;


--
-- Name: ads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads FORCE ROW LEVEL SECURITY;


--
-- Name: article_stats_daily; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.article_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_stats_daily FORCE ROW LEVEL SECURITY;


--
-- Name: articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles FORCE ROW LEVEL SECURITY;


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;


--
-- Name: page_stats_daily; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.page_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_stats_daily FORCE ROW LEVEL SECURITY;


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;


--
-- Name: redirects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects FORCE ROW LEVEL SECURITY;


--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;


--
-- Name: articles articles_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY articles_public_read ON public.articles FOR SELECT TO anon, authenticated
  USING (((status)::text = 'published'::text) AND (deleted_at IS NULL));


--
-- Name: articles articles_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY articles_service_all ON public.articles TO service_role USING (true) WITH CHECK (true);


--
-- Name: categories categories_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_public_read ON public.categories FOR SELECT TO anon, authenticated
  USING (((status)::text = 'active'::text) AND (deleted_at IS NULL));


--
-- Name: categories categories_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_service_all ON public.categories TO service_role USING (true) WITH CHECK (true);


--
-- Name: ads ads_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ads_public_read ON public.ads FOR SELECT TO anon, authenticated
  USING (((status)::text = 'active'::text) AND (deleted_at IS NULL));


--
-- Name: ads ads_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ads_service_all ON public.ads TO service_role USING (true) WITH CHECK (true);


--
-- Name: profiles profiles_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
  USING ((id = auth.uid()));


--
-- Name: profiles profiles_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_service_all ON public.profiles TO service_role USING (true) WITH CHECK (true);


--
-- Name: site_settings site_settings_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT TO anon, authenticated
  USING (true);


--
-- Name: site_settings site_settings_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY site_settings_service_all ON public.site_settings TO service_role USING (true) WITH CHECK (true);


--
-- Name: redirects redirects_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY redirects_public_read ON public.redirects FOR SELECT TO anon, authenticated
  USING (true);


--
-- Name: redirects redirects_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY redirects_service_all ON public.redirects TO service_role USING (true) WITH CHECK (true);


--
-- Name: article_stats_daily article_stats_daily_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY article_stats_daily_service_all ON public.article_stats_daily TO service_role USING (true) WITH CHECK (true);


--
-- Name: ad_stats_daily ad_stats_daily_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ad_stats_daily_service_all ON public.ad_stats_daily TO service_role USING (true) WITH CHECK (true);


--
-- Name: page_stats_daily page_stats_daily_service_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY page_stats_daily_service_all ON public.page_stats_daily TO service_role USING (true) WITH CHECK (true);


--
-- PostgreSQL database dump complete
--


