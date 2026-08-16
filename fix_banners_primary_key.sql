-- ==============================================================================
-- SAFE DATABASE MIGRATION: ADD PRIMARY KEY & REPLICA IDENTITY TO BANNERS
-- ==============================================================================
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/gaqyfjztpxvzijouiwwh/sql)
--
-- WHY THE ERROR OCCURRED:
-- When a table is added to 'supabase_realtime' publication without a Primary Key,
-- PostgreSQL forbids any DELETE operations until REPLICA IDENTITY is set to FULL.
-- Therefore, ALTER TABLE ... REPLICA IDENTITY FULL MUST be executed FIRST.
-- ==============================================================================

-- STEP 1: Enable REPLICA IDENTITY FULL first so PostgreSQL permits DELETE operations
ALTER TABLE public.banners REPLICA IDENTITY FULL;
ALTER TABLE public.banners_draft REPLICA IDENTITY FULL;

-- STEP 2: Safe Deduplication (removes duplicate rows while keeping the latest entry for each ID)
DELETE FROM public.banners a USING public.banners b
WHERE a.ctid < b.ctid AND a.id = b.id;

DELETE FROM public.banners_draft a USING public.banners_draft b
WHERE a.ctid < b.ctid AND a.id = b.id;

-- Clean up any test/deleted marker records
DELETE FROM public.banners 
WHERE status = 'deleted' OR id LIKE 'temp_test_del_%' OR id LIKE 'test_del_check_%';

DELETE FROM public.banners_draft 
WHERE status = 'deleted' OR id LIKE 'temp_test_del_%' OR id LIKE 'test_del_check_%';

-- STEP 3: Ensure 'id' column has NOT NULL constraint
ALTER TABLE public.banners ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.banners_draft ALTER COLUMN id SET NOT NULL;

-- STEP 4: Add PRIMARY KEY constraint on 'id' column safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'banners_pkey' AND conrelid = 'public.banners'::regclass
  ) THEN
    ALTER TABLE public.banners ADD CONSTRAINT banners_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'banners_draft_pkey' AND conrelid = 'public.banners_draft'::regclass
  ) THEN
    ALTER TABLE public.banners_draft ADD CONSTRAINT banners_draft_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- STEP 5: Set REPLICA IDENTITY to DEFAULT (Postgres uses the Primary Key) or FULL
ALTER TABLE public.banners REPLICA IDENTITY DEFAULT;
ALTER TABLE public.banners_draft REPLICA IDENTITY DEFAULT;

-- STEP 6: VERIFICATION QUERY (Run this to confirm Primary Key and Replica Identity)
SELECT 
    c.relname AS table_name,
    CASE c.relreplident
        WHEN 'd' THEN 'default (Primary Key active)'
        WHEN 'n' THEN 'nothing'
        WHEN 'f' THEN 'full'
        WHEN 'i' THEN 'index'
    END AS replica_identity_status,
    con.conname AS primary_key_constraint
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_constraint con ON con.conrelid = c.oid AND con.contype = 'p'
WHERE n.nspname = 'public' AND c.relname IN ('banners', 'banners_draft');
