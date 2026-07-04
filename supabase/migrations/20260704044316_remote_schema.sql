drop function if exists "public"."get_official_average_time_per_order"(certain_date date);

drop function if exists "public"."get_posts_per_day"(certain_date date);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_duration_histogram(certain_date date)
 RETURNS TABLE(duration_range text, total_tasks bigint)
 LANGUAGE sql
AS $function$WITH ordered AS (
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
time_batch AS (
  SELECT
    group_id,
    MIN(created_at) AS batch_start,
    MAX(completed_at) AS batch_end,
    EXTRACT(EPOCH FROM MAX(completed_at) - MIN(created_at))/60 AS batch_duration,
    COUNT(*) AS tasks_in_batch,
    EXTRACT(EPOCH FROM MAX(completed_at) - MIN(created_at))/60 / COUNT(*) AS average_duration,
    DATE(MIN(created_at)) AS created_date
  FROM grouped
  GROUP BY group_id
  ORDER BY group_id
), ordering AS (
  SELECT
    CASE
      WHEN average_duration < 2 THEN '0-2 mins'
      WHEN average_duration < 3 THEN '2-3 mins'
      WHEN average_duration < 4 THEN '3-4 mins'
      WHEN average_duration < 5 THEN '4-5 mins'
      WHEN average_duration < 6 THEN '5-6 mins'
      WHEN average_duration < 7 THEN '6-7 mins'
      WHEN average_duration < 8 THEN '7-8 mins'
      ELSE '8+ mins'
    END AS duration_range,
    CASE
      WHEN average_duration < 2 THEN 1
      WHEN average_duration < 3 THEN 2
      WHEN average_duration < 4 THEN 3
      WHEN average_duration < 5 THEN 4
      WHEN average_duration < 6 THEN 5
      WHEN average_duration < 7 THEN 6
      WHEN average_duration < 8 THEN 7
      ELSE 8
    END AS bucket,
    SUM(tasks_in_batch) AS total_tasks
  FROM time_batch
  GROUP BY 1, 2
  ORDER BY bucket)
SELECT duration_range, total_tasks
FROM ordering;$function$
;

CREATE OR REPLACE FUNCTION public.get_mean_median(certain_date date)
 RETURNS TABLE(median numeric, mean numeric)
 LANGUAGE sql
AS $function$

  WITH ordered AS (
    SELECT created_at, completed_at, is_completed, in_progress, 
      LAG(completed_at) OVER (ORDER BY completed_at) AS prev_completed
    FROM posts
    WHERE created_at AT TIME ZONE 'Australia/Melbourne' >= (certain_date + TIME '10:00')
    AND created_at AT TIME ZONE 'Australia/Melbourne' < (certain_date + TIME '20:00')
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
  ),
  cumulative AS (
    SELECT
      average_duration,
      tasks_in_batch,
      SUM(tasks_in_batch) OVER (ORDER BY average_duration) AS cumulative_add,
      SUM(tasks_in_batch) OVER () AS total_tasks
    FROM official
    ORDER BY average_duration
  )
  SELECT
    (SELECT average_duration
    FROM cumulative
    WHERE cumulative_add >= total_tasks/2
    LIMIT 1) AS median,
    (SELECT SUM(average_duration * tasks_in_batch)/SUM(tasks_in_batch)
    FROM cumulative) AS mean


$function$
;

CREATE OR REPLACE FUNCTION public.get_posts_per_day(start_date date, end_date date)
 RETURNS TABLE(dates date, total_requests numeric)
 LANGUAGE sql
AS $function$

WITH dateOnly AS(
  SELECT
    DATE(created_at) created_at_date
  FROM posts
  WHERE created_at AT TIME ZONE 'Australia/Melbourne' >= (start_date + TIME '10:00')
  AND created_at AT TIME ZONE 'Australia/Melbourne' < (end_date + TIME '22:00')
  AND (created_at AT TIME ZONE 'Australia/Melbourne')::time >= TIME '10:00'
  AND (created_at AT TIME ZONE 'Australia/Melbourne')::time < TIME '22:00'
) 
SELECT
  created_at_date,
  COUNT (*) AS total_requests
FROM dateOnly
GROUP BY created_at_date
ORDER BY created_at_date

$function$
;

CREATE OR REPLACE FUNCTION public.get_posts_per_hour_per_day_name(start_date date, end_date date)
 RETURNS TABLE(created_day numeric, created_hour numeric, average_per_hour_day numeric)
 LANGUAGE sql
AS $function$

WITH dateTimeRequest AS (
  SELECT
    DATE_TRUNC('hour', created_at AT TIME ZONE 'Australia/Melbourne') AS hour,
    COUNT(*) AS number_of_request
  FROM posts
  WHERE created_at AT TIME ZONE 'Australia/Melbourne' >= (start_date + TIME '10:00')
  AND created_at AT TIME ZONE 'Australia/Melbourne' < (end_date + TIME '22:00')
  GROUP BY hour
  ORDER BY hour),
hours AS (
  SELECT generate_series(
        start_date + TIME '10:00',
        end_date + TIME '22:00',
        INTERVAL '1 hour'
    ) AS hour
)
SELECT
  EXTRACT(DOW FROM h.hour) AS created_day,
  EXTRACT(HOUR FROM h.hour) AS created_hour,
  AVG(COALESCE(r.number_of_request, 0)) AS average_per_hour_day
  FROM hours h
  LEFT JOIN dateTimeRequest r USING (hour)
  WHERE EXTRACT(HOUR FROM h.hour) >= 10
  AND EXTRACT(HOUR FROM h.hour) < 22
  GROUP BY created_day, created_hour
  ORDER BY created_day, created_hour;

$function$
;

CREATE OR REPLACE FUNCTION public.call_cleanup_image()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  PERFORM
    net.http_post(
      url := 'https://qbbbsznsxhfllwhborju.supabase.co/functions/v1/cleanup-post-image'::text,
      headers := '{"Content-Type":"application/json","Authorization":"Bearer sb_publishable_LDCyZsuJQpcfURXumdCnUA_zm5FQ6R1", "apikey": "sb_publishable_LDCyZsuJQpcfURXumdCnUA_zm5FQ6R1"}'::jsonb,
      body := json_build_object(
        'image_path', OLD.image_path
      )::jsonb
    );
  RETURN OLD;
END;$function$
;


