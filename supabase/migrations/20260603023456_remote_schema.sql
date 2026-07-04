alter table "public"."posts" add column "markdown" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_official_average_time_per_order(certain_date date)
 RETURNS TABLE(official_average_time_per_order numeric)
 LANGUAGE sql
AS $function$
  WITH ordered AS (
    SELECT created_at, completed_at, is_completed, in_progress, 
      LAG(completed_at) OVER (ORDER BY completed_at) AS prev_completed
    FROM posts
    WHERE created_at AT TIME ZONE 'Australia/Melbourne' >= (certain_date + TIME '10:00')
    AND created_at AT TIME ZONE 'Australia/Melbourne' < (certain_date + TIME '22:00')
    AND (completed_at - created_at) < INTERVAL '20 minutes'
    AND completed_at IS NOT NULL
  ),
  flagged AS (
    SELECT *,
      CASE
        WHEN prev_completed IS NULL THEN 0
        WHEN EXTRACT(EPOCH FROM completed_at - prev_completed) <= 10 THEN 0
        ELSE 1
      END AS new_group_flag
    FROM ordered
  ),
  grouped AS (
    SELECT *,
      SUM(new_group_flag) OVER (ORDER BY completed_at) AS group_id
    FROM flagged
  ),
  official AS (
    SELECT
      group_id,
      MIN(created_at) AS batch_start,
      MAX(completed_at) AS batch_end,
      EXTRACT(EPOCH FROM MAX(completed_at) - MIN(created_at))/60 AS batch_duration,
      COUNT(*) AS tasks_in_batch,
      EXTRACT(EPOCH FROM MAX(completed_at) - MIN(created_at))/60 / COUNT(*) AS average_duration
    FROM grouped
    GROUP BY group_id
    ORDER BY group_id
  ) 
  SELECT
    SUM(batch_duration)/SUM(tasks_in_batch) AS official_average_duration
  FROM official
$function$
;

CREATE OR REPLACE FUNCTION public.call_cleanup_image()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  PERFORM
    net.http_post(
      url := 'https://yjzbzkeboginztsuguxe.supabase.co/functions/v1/cleanup-post-image'::text,
      headers := '{"Content-Type":"application/json","Authorization":"Bearer sb_publishable_VtBYVlZZTJLnoFyOFiWUTg_hRuDVjQ0", "apikey": "sb_publishable_VtBYVlZZTJLnoFyOFiWUTg_hRuDVjQ0"}'::jsonb,
      body := json_build_object(
        'image_path', OLD.image_path
      )::jsonb
    );
  RETURN OLD;
END;$function$
;

CREATE OR REPLACE FUNCTION public.get_posts_per_day(certain_date date)
 RETURNS TABLE(posts_per_day numeric)
 LANGUAGE sql
AS $function$SELECT
    COUNT(*)
  FROM posts
  WHERE created_at AT TIME ZONE 'Australia/Melbourne' >= (certain_date + TIME '10:00')
  AND created_at AT TIME ZONE 'Australia/Melbourne' < (certain_date + TIME '22:00');$function$
;


