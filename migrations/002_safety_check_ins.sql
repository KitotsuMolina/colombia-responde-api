CREATE TABLE IF NOT EXISTS safety_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name varchar(180) NOT NULL,
  department_code char(2) NOT NULL,
  department_name varchar(100) NOT NULL,
  municipality_code char(5) NOT NULL,
  municipality_name varchar(120) NOT NULL,
  locality varchar(160),
  message varchar(500),
  coordinates geography(Point,4326),
  public_code varchar(16) NOT NULL UNIQUE,
  delete_token_hash char(64) NOT NULL,
  status varchar(30) NOT NULL DEFAULT 'self_reported' CHECK(status IN ('self_reported','verified','removed')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS safety_check_ins_name_trgm_idx ON safety_check_ins USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS safety_check_ins_coordinates_gix ON safety_check_ins USING gist(coordinates);
CREATE INDEX IF NOT EXISTS safety_check_ins_active_idx ON safety_check_ins(expires_at DESC) WHERE status <> 'removed';
