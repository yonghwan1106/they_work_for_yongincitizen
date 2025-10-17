-- Add councillor_type field to distinguish between different types of elected officials
-- 국회의원 (National Assembly Member), 경기도의원 (Provincial Assembly Member), 용인시의원 (City Council Member)

-- Add councillor_type column with enum-like constraint
ALTER TABLE councillors
ADD COLUMN councillor_type VARCHAR(20) NOT NULL DEFAULT '용인시의원'
CHECK (councillor_type IN ('국회의원', '경기도의원', '용인시의원'));

-- Add comment for documentation
COMMENT ON COLUMN councillors.councillor_type IS '의원 유형: 국회의원(National Assembly), 경기도의원(Provincial Assembly), 용인시의원(City Council)';

-- Create index for filtering by councillor_type
CREATE INDEX idx_councillors_type ON councillors(councillor_type);

-- Update existing records to be '용인시의원' (already set by DEFAULT, but explicit for clarity)
UPDATE councillors SET councillor_type = '용인시의원' WHERE councillor_type IS NULL;
