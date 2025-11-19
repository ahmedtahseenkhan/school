-- Enable crypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- School table (single row)
CREATE TABLE IF NOT EXISTS school (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  motto TEXT,
  established_year INTEGER,
  logo_url VARCHAR(500),
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
