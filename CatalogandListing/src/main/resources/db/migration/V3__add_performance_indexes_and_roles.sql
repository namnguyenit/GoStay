-- GIN index cho JSONB attributes
CREATE INDEX IF NOT EXISTS idx_listings_attributes_gin ON listings USING GIN (attributes jsonb_path_ops);

-- Trigram index cho tìm kiếm chuỗi (Autocomplete)
CREATE INDEX IF NOT EXISTS idx_landmarks_name_trgm ON landmarks USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING GIN (title gin_trgm_ops);

-- Composite indexes cho query public
CREATE INDEX IF NOT EXISTS idx_listings_search_public ON listings (status, category, province);
CREATE INDEX IF NOT EXISTS idx_listings_search_subcat ON listings (status, category, sub_category);
CREATE INDEX IF NOT EXISTS idx_listings_search_rating ON listings (status, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_listings_host_status ON listings (host_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_complex_status ON listings (complex_id, status);


