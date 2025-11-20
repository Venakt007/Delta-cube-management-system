-- Create technologies table
CREATE TABLE IF NOT EXISTS technologies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default technologies
INSERT INTO technologies (name) VALUES 
  ('Web Development'),
  ('Mobile Development'),
  ('Data Science'),
  ('DevOps'),
  ('Cloud Computing'),
  ('AI/ML')
ON CONFLICT (name) DO NOTHING;
