set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_posts_per_day(certain_date date)
 RETURNS TABLE(posts_per_day numeric)
 LANGUAGE sql
AS $function$
  SELECT
    COUNT(*)
  FROM posts
  WHERE DATE(created_at AT TIME ZONE 'Australia/Melbourne') = certain_date;
$function$
;


