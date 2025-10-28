-- Clean up corrupted series poster
-- This will set poster_url to NULL for the series with the corrupted image
UPDATE public.series 
SET poster_url = NULL 
WHERE poster_url LIKE '%1757712803298.jpg%';

-- Check results
SELECT id, title, poster_url 
FROM public.series 
WHERE poster_url IS NULL OR poster_url LIKE '%1757712803298.jpg%';









