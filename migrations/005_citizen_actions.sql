CREATE TABLE IF NOT EXISTS citizen_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(160) NOT NULL,
  contact_name varchar(180) NOT NULL,
  contact_phone varchar(40) NOT NULL,
  action_description text NOT NULL,
  donation_method text,
  department_name varchar(100) NOT NULL,
  municipality_name varchar(120) NOT NULL,
  locality varchar(180),
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published')),
  validation_token_hash char(64) UNIQUE,
  validation_expires_at timestamptz NOT NULL,
  consented_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS citizen_actions_public_idx ON citizen_actions(status, consented_at DESC);
