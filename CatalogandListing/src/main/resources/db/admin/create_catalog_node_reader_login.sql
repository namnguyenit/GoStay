-- Run with a PostgreSQL admin/role-owner account after Flyway V6 has created
-- the catalog_readonly role.
--
-- Example:
-- psql -U postgres -d cataloglisting ^
--   -v node_reader_password="replace_with_real_secret" ^
--   -f CatalogandListing/src/main/resources/db/admin/create_catalog_node_reader_login.sql

\set ON_ERROR_STOP on

\if :{?node_reader_password}
\else
\echo 'Missing required psql variable: node_reader_password'
\echo 'Usage: psql -d cataloglisting -v node_reader_password="replace_with_real_secret" -f create_catalog_node_reader_login.sql'
\quit 1
\endif

SELECT format(
    'CREATE ROLE catalog_node_reader LOGIN PASSWORD %L INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
    :'node_reader_password'
)
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'catalog_node_reader'
)
\gexec

ALTER ROLE catalog_node_reader
    LOGIN
    INHERIT
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    NOBYPASSRLS;

ALTER ROLE catalog_node_reader PASSWORD :'node_reader_password';
ALTER ROLE catalog_node_reader SET search_path TO public;

GRANT catalog_readonly TO catalog_node_reader;
