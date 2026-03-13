set check_function_bodies = off;

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

CREATE TRIGGER delete_post_image AFTER DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.call_cleanup_image();


