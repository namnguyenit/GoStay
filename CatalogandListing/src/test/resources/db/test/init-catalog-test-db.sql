DROP EXTENSION IF EXISTS postgis_topology CASCADE;
DROP EXTENSION IF EXISTS postgis CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'gotravel_db'
    ) THEN
        CREATE ROLE gotravel_db LOGIN PASSWORD 'test';
    END IF;
END $$;

ALTER ROLE gotravel_db
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    NOBYPASSRLS;
