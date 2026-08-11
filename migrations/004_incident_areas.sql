ALTER TABLE incidents ADD COLUMN IF NOT EXISTS area jsonb;

ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_area_valid;
ALTER TABLE incidents ADD CONSTRAINT incidents_area_valid CHECK (
  area IS NULL OR (jsonb_typeof(area) = 'array' AND jsonb_array_length(area) BETWEEN 3 AND 50)
);
