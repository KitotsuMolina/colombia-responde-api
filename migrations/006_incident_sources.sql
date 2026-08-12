ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source_name varchar(120);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS external_id varchar(120);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source_updated_at timestamptz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source_data jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS incidents_external_source_uidx ON incidents(source_name, external_id);
