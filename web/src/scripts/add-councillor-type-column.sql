-- Add councillor_type column to the councillors table
-- Run this SQL in Supabase SQL Editor

-- Add the column
ALTER TABLE councillors
ADD COLUMN IF NOT EXISTS councillor_type VARCHAR(20) NOT NULL DEFAULT '용인시의원';

-- Add check constraint
ALTER TABLE councillors
ADD CONSTRAINT councillor_type_check
CHECK (councillor_type IN ('국회의원', '경기도의원', '용인시의원'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_councillors_type ON councillors(councillor_type);

-- Add comment
COMMENT ON COLUMN councillors.councillor_type IS '의원 유형: 국회의원(National Assembly), 경기도의원(Provincial Assembly), 용인시의원(City Council)';
