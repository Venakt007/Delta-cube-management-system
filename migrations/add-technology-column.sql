-- Migration: Add technology column if it doesn't exist
-- Run this on Render database

-- Check if column exists and add if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'technology'
    ) THEN
        ALTER TABLE applications ADD COLUMN technology VARCHAR(255);
        RAISE NOTICE 'Column technology added successfully';
    ELSE
        RAISE NOTICE 'Column technology already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'applications' AND column_name = 'technology';
