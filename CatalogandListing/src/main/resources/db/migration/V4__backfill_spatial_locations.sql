-- Backfill PostGIS location for records created before application code started setting Point values.
-- Only valid WGS84 coordinates are converted: latitude [-90, 90], longitude [-180, 180].

UPDATE public.listings
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE location IS NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND latitude BETWEEN -90 AND 90
  AND longitude BETWEEN -180 AND 180;

UPDATE public.landmarks
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE location IS NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND latitude BETWEEN -90 AND 90

UPDATE public.complexes
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE location IS NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND latitude BETWEEN -90 AND 90
  AND longitude BETWEEN -180 AND 180;

DO $$
DECLARE
    missing_listing_locations integer;
    missing_landmark_locations integer;
    missing_complex_locations integer;
BEGIN
    SELECT COUNT(*)
    INTO missing_listing_locations
    FROM public.listings
    WHERE location IS NULL
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND latitude BETWEEN -90 AND 90
      AND longitude BETWEEN -180 AND 180;

    SELECT COUNT(*)
    INTO missing_landmark_locations
    FROM public.landmarks
    WHERE location IS NULL
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND latitude BETWEEN -90 AND 90
      AND longitude BETWEEN -180 AND 180;

    SELECT COUNT(*)
    INTO missing_complex_locations
    FROM public.complexes
    WHERE location IS NULL
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND latitude BETWEEN -90 AND 90
      AND longitude BETWEEN -180 AND 180;

    IF missing_listing_locations > 0
       OR missing_landmark_locations > 0
       OR missing_complex_locations > 0 THEN
        RAISE EXCEPTION
            'Spatial location backfill failed. Missing locations: listings=%, landmarks=%, complexes=%',
            missing_listing_locations,
            missing_landmark_locations,
            missing_complex_locations;
    END IF;
END $$;
