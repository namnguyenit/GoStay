-- Keep geometry(Point,4326) for Hibernate/JTS compatibility, but add geography
-- expression indexes so Node.js can run meter-based PostGIS queries efficiently.
-- Node.js radius queries must keep status = 'ACTIVE' and location IS NOT NULL
-- in the WHERE clause so PostgreSQL can use these partial expression indexes.

CREATE INDEX IF NOT EXISTS idx_listings_active_location_geog_gist
ON public.listings
USING GIST ((location::geography))
WHERE status = 'ACTIVE'
  AND location IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_landmarks_active_location_geog_gist
ON public.landmarks
USING GIST ((location::geography))
WHERE status = 'ACTIVE'
  AND location IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_complexes_active_location_geog_gist
ON public.complexes
USING GIST ((location::geography))
WHERE status = 'ACTIVE'
  AND location IS NOT NULL;
