alter table "public"."exercise_library" drop column "thumbnail_full_url";

alter table "public"."exercise_library" drop column "thumbnail_large_url";

alter table "public"."exercise_library" drop column "thumbnail_small_url";

alter table "public"."exercise_library" add column "thumbnail" text;


