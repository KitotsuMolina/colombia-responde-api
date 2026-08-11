CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind varchar(30) NOT NULL CHECK (kind IN ('help','damage','landslide','road','water','power','medical','shelter','aid')),
  title varchar(160) NOT NULL, description text NOT NULL,
  department_code char(2) NOT NULL, department_name varchar(100) NOT NULL,
  municipality_code char(5) NOT NULL, municipality_name varchar(120) NOT NULL, locality varchar(160),
  coordinates geography(Point,4326) NOT NULL, people_at_risk integer CHECK (people_at_risk >= 0),
  verification_status varchar(30) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','evidence','community','verified','official')),
  confirmation_count integer NOT NULL DEFAULT 0 CHECK (confirmation_count >= 0),
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','archived')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS incidents_coordinates_gix ON incidents USING gist(coordinates);
CREATE INDEX IF NOT EXISTS incidents_territory_idx ON incidents(department_code, municipality_code, status);
CREATE INDEX IF NOT EXISTS incidents_created_idx ON incidents(created_at DESC);

CREATE TABLE IF NOT EXISTS missing_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), full_name varchar(180) NOT NULL, age integer CHECK(age BETWEEN 0 AND 125),
  photo_url text, department_code char(2) NOT NULL, department_name varchar(100) NOT NULL,
  municipality_code char(5) NOT NULL, municipality_name varchar(120) NOT NULL, locality varchar(160),
  last_seen_at timestamptz NOT NULL, last_seen_details text NOT NULL,
  status varchar(30) NOT NULL DEFAULT 'missing' CHECK(status IN ('missing','sighting','located')),
  contact_token varchar(120) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS people_name_trgm_idx ON missing_persons USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS people_territory_idx ON missing_persons(department_code, municipality_code, status);

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), type varchar(30) NOT NULL CHECK(type IN ('medical','shelter','water','food','aid')),
  name varchar(180) NOT NULL, description text NOT NULL, department_code char(2) NOT NULL, department_name varchar(100) NOT NULL,
  municipality_code char(5) NOT NULL, municipality_name varchar(120) NOT NULL, locality varchar(160),
  coordinates geography(Point,4326) NOT NULL, source_name varchar(180) NOT NULL, source_url text,
  verified_at timestamptz, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS resources_coordinates_gix ON resources USING gist(coordinates);
CREATE INDEX IF NOT EXISTS resources_territory_idx ON resources(department_code, municipality_code, active);
