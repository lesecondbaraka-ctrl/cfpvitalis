DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vitalis') THEN
    CREATE ROLE vitalis WITH LOGIN PASSWORD 'vitalis2025';
  END IF;
END $$;

ALTER ROLE vitalis WITH SUPERUSER;
CREATE DATABASE vitalis_center OWNER vitalis;
