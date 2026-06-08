-- Run after create_catalog_node_reader_login.sql.
-- Expected result: can_select = true and all write privileges = false.

SELECT
    table_name,
    has_table_privilege('catalog_node_reader', table_name, 'SELECT') AS can_select,
    has_table_privilege('catalog_node_reader', table_name, 'INSERT') AS can_insert,
    has_table_privilege('catalog_node_reader', table_name, 'UPDATE') AS can_update,
    has_table_privilege('catalog_node_reader', table_name, 'DELETE') AS can_delete,
    has_table_privilege('catalog_node_reader', table_name, 'TRUNCATE') AS can_truncate
FROM (
    VALUES
        ('public.listings'),
        ('public.landmarks'),
        ('public.complexes'),
        ('public.reviews')
) AS catalog_tables(table_name)
ORDER BY table_name;

SELECT
    has_database_privilege('catalog_node_reader', current_database(), 'CONNECT') AS can_connect_database,
    has_schema_privilege('catalog_node_reader', 'public', 'USAGE') AS can_use_public_schema;
