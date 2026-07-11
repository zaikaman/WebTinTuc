-- =============================================================================
-- Admin-only account model + last-admin DB guards
--
-- Multi-role (editor) is not product-ready. App only creates/uses admin accounts.
-- This migration:
--   1) Removes unusable non-admin profiles so CHECK can be admin-only
--   2) Restricts profiles.role to 'admin' only (drops editor from schema)
--   3) Sets default role to 'admin' (only valid value)
--   4) Enforces last-admin protection on DELETE and demotion UPDATE
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Clear unusable non-admin profiles (they cannot access admin UI/API)
--    Do NOT promote them to admin (would be privilege escalation).
--    Detach article authorship first (FK has no ON DELETE SET NULL).
-- ---------------------------------------------------------------------------
UPDATE public.articles
SET author_id = NULL
WHERE author_id IN (
  SELECT id FROM public.profiles WHERE role IS DISTINCT FROM 'admin'
);

DELETE FROM public.profiles
WHERE role IS DISTINCT FROM 'admin';

-- ---------------------------------------------------------------------------
-- 2) Role column: admin-only CHECK + default
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'admin'::character varying;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (((role)::text = 'admin'::text));

COMMENT ON COLUMN public.profiles.role IS
  'Account privilege. Admin-only until multi-role is implemented. Only admin is valid.';

-- ---------------------------------------------------------------------------
-- 3) Last-admin guards (defense in depth; app layer also enforces)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_prevent_last_admin_delete()
RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.profiles_prevent_last_admin_demotion()
RETURNS trigger
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

DROP TRIGGER IF EXISTS profiles_prevent_last_admin_delete ON public.profiles;
CREATE TRIGGER profiles_prevent_last_admin_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_prevent_last_admin_delete();

DROP TRIGGER IF EXISTS profiles_prevent_last_admin_demotion ON public.profiles;
CREATE TRIGGER profiles_prevent_last_admin_demotion
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_prevent_last_admin_demotion();

COMMIT;
