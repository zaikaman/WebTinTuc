-- Composite Indexes for Dashboard & Public Queries
--
-- These indexes optimize the most common filter + sort patterns
-- that are NOT covered by existing single-column or partial indexes.

-- ===================================================================
-- 1. Partial composite index for category page queries
--    Pattern: category_id = ? AND status = 'published' AND deleted_at IS NULL
--             ORDER BY published_at DESC
--    Used by: listPublicArticles(category), listRelatedArticles
--    Covers both filter AND sort in a single index scan,
--    avoiding a separate sort operation for category-scoped listings.
--
--    Note: the existing articles_category_status_deleted_idx covers
--    (category_id, status, deleted_at) but lacks published_at DESC
--    for ORDER BY pushdown.
-- ===================================================================
CREATE INDEX IF NOT EXISTS "articles_category_published_idx"
ON "articles" ("category_id", "published_at" DESC)
WHERE ("status" = 'published' AND "deleted_at" IS NULL);


-- ===================================================================
-- 2. Composite index for ads dashboard list
--    Pattern: deleted_at IS NULL ORDER BY created_at DESC
--    Used by: getDashboardStats() — latest 5 ads query
--    Previously no index existed for this pattern on the ads table.
-- ===================================================================
CREATE INDEX IF NOT EXISTS "ads_deleted_created_idx"
ON "ads" ("deleted_at", "created_at" DESC);


-- ===================================================================
-- 3. Composite index for categories dashboard list
--    Pattern: deleted_at IS NULL ORDER BY created_at DESC
--    Used by: getDashboardStats() — latest 5 categories query
--    Previously no index existed for this pattern on the categories table.
-- ===================================================================
CREATE INDEX IF NOT EXISTS "categories_deleted_created_idx"
ON "categories" ("deleted_at", "created_at" DESC);

