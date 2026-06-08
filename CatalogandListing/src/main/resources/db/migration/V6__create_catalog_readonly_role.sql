-- Read-only database role for Node.js Search & Location Service and Recommendation Engine.
-- The LOGIN user is created by db/admin/create_catalog_node_reader_login.sql so
-- the Node password is not hardcoded in a Flyway migration.
-- Requires the migration connection user to have CREATEROLE, or this migration
-- must be run once by a PostgreSQL admin role.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'catalog_readonly'
    ) THEN
        CREATE ROLE catalog_readonly NOLOGIN;
    END IF;
END $$;

DO $$
BEGIN
    EXECUTE format(
        'GRANT CONNECT ON DATABASE %I TO catalog_readonly',
        current_database()
    );
END $$;

GRANT USAGE ON SCHEMA public TO catalog_readonly;

GRANT SELECT ON TABLE
    public.listings,
    public.landmarks,
    public.complexes,
    public.reviews
TO catalog_readonly;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE
    public.listings,
    public.landmarks,
    public.complexes,
    public.reviews
FROM catalog_readonly;

-- New read models/views for Node.js must explicitly grant SELECT to catalog_readonly
-- in the migration that creates them.
