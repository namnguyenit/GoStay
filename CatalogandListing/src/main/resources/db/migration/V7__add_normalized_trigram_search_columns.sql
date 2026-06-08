-- Normalized search fields for Node.js autocomplete/keyword search.
-- Java continues writing the canonical name/title fields; PostgreSQL keeps
-- normalized fields in sync for fast accent-insensitive trigram queries.

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.gostay_normalize_search_text(raw_text text)
RETURNS text
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
    SELECT NULLIF(
        trim(
            regexp_replace(
                lower(public.unaccent('public.unaccent', coalesce(raw_text, ''))),
                '[[:space:]]+',
                ' ',
                'g'
            )
        ),
        ''
    );
$$;

ALTER TABLE public.landmarks
    ADD COLUMN IF NOT EXISTS name_normalized text;

ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS title_normalized text;

UPDATE public.landmarks
SET name_normalized = public.gostay_normalize_search_text(name)
WHERE name_normalized IS DISTINCT FROM public.gostay_normalize_search_text(name);

UPDATE public.listings
SET title_normalized = public.gostay_normalize_search_text(title)
WHERE title_normalized IS DISTINCT FROM public.gostay_normalize_search_text(title);

CREATE OR REPLACE FUNCTION public.gostay_set_landmark_name_normalized()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.name_normalized := public.gostay_normalize_search_text(NEW.name);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.gostay_set_listing_title_normalized()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.title_normalized := public.gostay_normalize_search_text(NEW.title);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_landmarks_set_name_normalized ON public.landmarks;
CREATE TRIGGER trg_landmarks_set_name_normalized
BEFORE INSERT OR UPDATE OF name
ON public.landmarks
FOR EACH ROW
EXECUTE FUNCTION public.gostay_set_landmark_name_normalized();

DROP TRIGGER IF EXISTS trg_listings_set_title_normalized ON public.listings;
CREATE TRIGGER trg_listings_set_title_normalized
BEFORE INSERT OR UPDATE OF title
ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.gostay_set_listing_title_normalized();

CREATE INDEX IF NOT EXISTS idx_landmarks_active_name_normalized_trgm
ON public.landmarks
USING GIN (name_normalized gin_trgm_ops)
WHERE status = 'ACTIVE'
  AND name_normalized IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_active_title_normalized_trgm
ON public.listings
USING GIN (title_normalized gin_trgm_ops)
WHERE status = 'ACTIVE'
  AND title_normalized IS NOT NULL;

COMMENT ON COLUMN public.landmarks.name_normalized IS
    'Lowercase unaccented Landmark name for Node.js autocomplete/search.';

COMMENT ON COLUMN public.listings.title_normalized IS
    'Lowercase unaccented Listing title for Node.js keyword search.';

GRANT EXECUTE ON FUNCTION public.gostay_normalize_search_text(text) TO catalog_readonly;

DO $$
DECLARE
    missing_landmark_normalized integer;
    missing_listing_normalized integer;
BEGIN
    SELECT COUNT(*)
    INTO missing_landmark_normalized
    FROM public.landmarks
    WHERE name IS NOT NULL
      AND trim(name) <> ''
      AND name_normalized IS NULL;

    SELECT COUNT(*)
    INTO missing_listing_normalized
    FROM public.listings
    WHERE title IS NOT NULL
      AND trim(title) <> ''
      AND title_normalized IS NULL;

    IF missing_landmark_normalized > 0
       OR missing_listing_normalized > 0 THEN
        RAISE EXCEPTION
            'Normalized search backfill failed. Missing normalized values: landmarks=%, listings=%',
            missing_landmark_normalized,
            missing_listing_normalized;
    END IF;
END $$;
