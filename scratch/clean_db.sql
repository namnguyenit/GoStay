-- Drop databases (Terminating connections if needed)
REVOKE CONNECT ON DATABASE auth_db FROM public;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'auth_db' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS auth_db;

REVOKE CONNECT ON DATABASE cataloglisting FROM public;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'cataloglisting' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS cataloglisting;

REVOKE CONNECT ON DATABASE bookinginventory FROM public;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'bookinginventory' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS bookinginventory;

REVOKE CONNECT ON DATABASE cartorder FROM public;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'cartorder' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS cartorder;

REVOKE CONNECT ON DATABASE paymentwallet FROM public;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'paymentwallet' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS paymentwallet;

REVOKE CONNECT ON DATABASE recommendation_db FROM public;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'recommendation_db' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS recommendation_db;

-- Recreate databases
CREATE DATABASE auth_db OWNER gotravel_db;
CREATE DATABASE cataloglisting OWNER gotravel_db;
CREATE DATABASE bookinginventory OWNER gotravel_db;
CREATE DATABASE cartorder OWNER gotravel_db;
CREATE DATABASE paymentwallet OWNER gotravel_db;
CREATE DATABASE recommendation_db OWNER gotravel_db;

-- Ensure node reader roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'catalog_readonly') THEN
    CREATE ROLE catalog_readonly;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'catalog_node_reader') THEN
    CREATE ROLE catalog_node_reader LOGIN PASSWORD 'secret_password' INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
    GRANT catalog_readonly TO catalog_node_reader;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'recommendation_user') THEN
    CREATE ROLE recommendation_user LOGIN PASSWORD 'secret_password';
  END IF;
END
$$;
