-- Coordinate range guardrails for data written outside the Java API.
-- API DTOs reject invalid coordinates before service code creates PostGIS Points;
-- these constraints protect direct SQL writes and imports.

DO $$
DECLARE
    invalid_listings integer;
    invalid_landmarks integer;
    invalid_complexes integer;
    invalid_landmark_suggestions integer;
BEGIN
    SELECT COUNT(*)
    INTO invalid_listings
    FROM public.listings
    WHERE (latitude IS NOT NULL AND latitude NOT BETWEEN -90 AND 90)
       OR (longitude IS NOT NULL AND longitude NOT BETWEEN -180 AND 180);

    SELECT COUNT(*)
    INTO invalid_landmarks
    FROM public.landmarks
    WHERE (latitude IS NOT NULL AND latitude NOT BETWEEN -90 AND 90)
       OR (longitude IS NOT NULL AND longitude NOT BETWEEN -180 AND 180);

    SELECT COUNT(*)
    INTO invalid_complexes
    FROM public.complexes
    WHERE (latitude IS NOT NULL AND latitude NOT BETWEEN -90 AND 90)
       OR (longitude IS NOT NULL AND longitude NOT BETWEEN -180 AND 180);

    SELECT COUNT(*)
    INTO invalid_landmark_suggestions
    FROM public.landmark_suggestions
    WHERE (suggested_latitude IS NOT NULL AND suggested_latitude NOT BETWEEN -90 AND 90)
       OR (suggested_longitude IS NOT NULL AND suggested_longitude NOT BETWEEN -180 AND 180);

    IF invalid_listings > 0
       OR invalid_landmarks > 0
       OR invalid_complexes > 0
       OR invalid_landmark_suggestions > 0 THEN
        RAISE EXCEPTION
            'Coordinate range validation failed. Invalid rows: listings=%, landmarks=%, complexes=%, landmark_suggestions=%',
            invalid_listings,
            invalid_landmarks,
            invalid_complexes,
            invalid_landmark_suggestions;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_listings_latitude_range'
          AND conrelid = 'public.listings'::regclass
    ) THEN
        ALTER TABLE public.listings
            ADD CONSTRAINT chk_listings_latitude_range
            CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_listings_longitude_range'
          AND conrelid = 'public.listings'::regclass
    ) THEN
        ALTER TABLE public.listings
            ADD CONSTRAINT chk_listings_longitude_range
            CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_landmarks_latitude_range'
          AND conrelid = 'public.landmarks'::regclass
    ) THEN
        ALTER TABLE public.landmarks
            ADD CONSTRAINT chk_landmarks_latitude_range
            CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_landmarks_longitude_range'
          AND conrelid = 'public.landmarks'::regclass
    ) THEN
        ALTER TABLE public.landmarks
            ADD CONSTRAINT chk_landmarks_longitude_range
            CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_complexes_latitude_range'
          AND conrelid = 'public.complexes'::regclass
    ) THEN
        ALTER TABLE public.complexes
            ADD CONSTRAINT chk_complexes_latitude_range
            CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_complexes_longitude_range'
          AND conrelid = 'public.complexes'::regclass
    ) THEN
        ALTER TABLE public.complexes
            ADD CONSTRAINT chk_complexes_longitude_range
            CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_landmark_suggestions_latitude_range'
          AND conrelid = 'public.landmark_suggestions'::regclass
    ) THEN
        ALTER TABLE public.landmark_suggestions
            ADD CONSTRAINT chk_landmark_suggestions_latitude_range
            CHECK (suggested_latitude IS NULL OR suggested_latitude BETWEEN -90 AND 90);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_landmark_suggestions_longitude_range'
          AND conrelid = 'public.landmark_suggestions'::regclass
    ) THEN
        ALTER TABLE public.landmark_suggestions
            ADD CONSTRAINT chk_landmark_suggestions_longitude_range
            CHECK (suggested_longitude IS NULL OR suggested_longitude BETWEEN -180 AND 180);
    END IF;
END $$;
