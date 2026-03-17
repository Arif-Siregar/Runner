alter table "public"."posts" add column "completed_at" timestamp with time zone;

alter table "public"."posts" add column "created_at" timestamp with time zone not null default now();

alter table "public"."posts" add column "in_progress_at" timestamp with time zone;

alter table "public"."posts" add column "in_view" boolean not null default true;

CREATE INDEX posts_visible_idx ON public.posts USING btree (id) WHERE (in_view = true);


