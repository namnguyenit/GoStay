CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX IF NOT EXISTS idx_landmarks_location ON landmarks USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_complexes_location ON complexes USING GIST (location);
