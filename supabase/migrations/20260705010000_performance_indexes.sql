-- Performance Indexes for Admin Panel & Public Page Queries

-- 1. Index for articles sorting by created_at and deleted_at filter
CREATE INDEX IF NOT EXISTS "articles_deleted_created_idx" ON "articles" ("deleted_at", "created_at" DESC);

-- 2. Index for sorting by published_at (used in public feed and homepage listings)
CREATE INDEX IF NOT EXISTS "articles_published_at_desc_idx" ON "articles" ("published_at" DESC) WHERE ("status" = 'published' AND "deleted_at" IS NULL);

-- 3. Composite Index for category joins, status, and deletion filters
CREATE INDEX IF NOT EXISTS "articles_category_status_deleted_idx" ON "articles" ("category_id", "status", "deleted_at");

-- 4. Index for sorting ads by priority and active status
CREATE INDEX IF NOT EXISTS "ads_status_deleted_priority_idx" ON "ads" ("status", "priority" DESC) WHERE ("deleted_at" IS NULL);

-- 5. Index for sorting categories by priority
CREATE INDEX IF NOT EXISTS "categories_status_deleted_priority_idx" ON "categories" ("status", "priority" DESC) WHERE ("deleted_at" IS NULL);
