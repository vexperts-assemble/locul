-- Check what columns exist in the series table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'series' 
ORDER BY ordinal_position;

