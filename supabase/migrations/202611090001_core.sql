-- Additive migration. Does not delete or change any Firebase resources.
-- JSONB retains the existing structured editor fields and any legacy fields;
-- generated typed columns enforce relational keys and support indexed queries.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table public.staff (
  id uuid primary key references auth.users(id) on delete restrict,
  legacy_firebase_uid text unique,
  email text not null,
  role text not null check (role in ('owner','editor','enquiries')),
  active boolean not null default false
);
create unique index staff_email_ci on public.staff(lower(email));

create function private.has_permission(permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.staff s where s.id = (select auth.uid()) and s.active
    and (s.role = 'owner' or (permission = 'content' and s.role = 'editor')
      or (permission = 'enquiries' and s.role = 'enquiries')));
$$;
revoke all on function private.has_permission(text) from public;
grant execute on function private.has_permission(text) to authenticated;

create table public.content (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id),
  kind text generated always as (data->>'kind') stored not null check(kind in ('holiday','road-trip','resort','destination')),
  slug text generated always as (data->>'slug') stored not null,
  status text generated always as (data->>'status') stored not null check(status in ('draft','published','archived')),
  region text generated always as (data->>'region') stored,
  country text generated always as (data->>'country') stored,
  days integer generated always as ((data->>'days')::integer) stored check(days >= 0),
  display_order integer generated always as ((data->>'order')::integer) stored,
  demo boolean generated always as ((data->>'demo')::boolean) stored not null,
  unique(kind, slug)
);
create index content_status_order on public.content(status, display_order, id);
create table public.published_content (
  id text primary key references public.content(id) on delete restrict,
  data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id and data->>'status' = 'published'),
  kind text generated always as (data->>'kind') stored not null,
  slug text generated always as (data->>'slug') stored not null,
  region text generated always as (data->>'region') stored,
  country text generated always as (data->>'country') stored,
  days integer generated always as ((data->>'days')::integer) stored,
  display_order integer generated always as ((data->>'order')::integer) stored,
  featured boolean generated always as ((data->>'featured')::boolean) stored,
  demo boolean generated always as ((data->>'demo')::boolean) stored not null,
  search_document tsvector generated always as (to_tsvector('simple'::regconfig,
    coalesce(data->>'title','') || ' ' || coalesce(data->>'location','') || ' ' || coalesce(data->>'country','') || ' ' || coalesce(data->>'region',''))) stored,
  unique(kind, slug)
);
create index published_catalogue_order on public.published_content(kind, display_order, id);
create index published_destination_filters on public.published_content(region, country, days);
create index published_search on public.published_content using gin(search_document);
create table public.content_revisions (
  id text primary key,
  content_id text not null references public.content(id) on delete restrict,
  data jsonb not null
);
create index revisions_content on public.content_revisions(content_id);

create table public.enquiries (
  id text primary key,
  data jsonb not null check(jsonb_typeof(data) = 'object' and data->>'id' = id),
  content_id text generated always as (nullif(data->>'itemId','')) stored references public.content(id) on delete restrict,
  status text generated always as (data->>'status') stored not null check(status in ('new','contacted','quote sent','confirmed','closed')),
  created_at text generated always as (data->>'createdAt') stored not null,
  follow_up text generated always as (nullif(data->>'followUp','')) stored,
  demo boolean generated always as ((data->>'demo')::boolean) stored not null
);
-- Notes/history remain ordered JSON arrays in the preserved record. No duplicated child rows.
create index enquiry_status_date on public.enquiries(status, created_at desc, id);
create index enquiry_follow_up on public.enquiries(follow_up) where follow_up is not null;
create index enquiry_content on public.enquiries(content_id);
create table public.delivery_jobs (
  enquiry_id text not null references public.enquiries(id) on delete restrict,
  kind text not null check(kind in ('excel','notification')),
  data jsonb not null,
  status text generated always as (data->>'status') stored,
  primary key(enquiry_id,kind)
);
create index pending_delivery_jobs on public.delivery_jobs(kind,status);
create table public.site_settings(id text primary key check(id = 'site'), data jsonb not null);
create table public.runtime_config(id text primary key, data jsonb not null);
create table public.audit_events(id text primary key, data jsonb not null);
create table public.rate_limits(id text primary key, data jsonb not null);

create table public.media_assets (
  id text primary key,
  bucket text not null check(bucket in ('website-public','website-private')),
  object_path text not null,
  source_url text,
  sha256 text check(sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  mime_type text not null,
  byte_size bigint not null check(byte_size >= 0),
  approved_public boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  unique(bucket,object_path),
  check(bucket <> 'website-public' or approved_public)
);
create index media_content_hash on public.media_assets(sha256);
create table public.content_media (
  content_id text not null references public.content(id) on delete restrict,
  media_id text not null references public.media_assets(id) on delete restrict,
  version text not null check(version in ('draft','published')),
  purpose text not null check(purpose in ('cover','gallery')),
  position integer not null check(position >= 0),
  alt text not null default '',
  primary key(content_id,version,purpose,position)
);
create index content_media_asset on public.content_media(media_id);

create function private.showcase_enabled() returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select (data->>'enabled')::boolean from public.runtime_config where id='demoShowcase'), false);
$$;
revoke all on function private.showcase_enabled() from public;
grant usage on schema private to anon;
grant execute on function private.showcase_enabled() to anon,authenticated;

do $$ declare t text; begin
  foreach t in array array['staff','content','published_content','content_revisions','enquiries','delivery_jobs','site_settings','runtime_config','audit_events','rate_limits','media_assets','content_media'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
grant select on public.published_content, public.site_settings to anon, authenticated;
create policy published_read on public.published_content for select to anon,authenticated
  using (not demo or private.showcase_enabled());
create policy settings_read on public.site_settings for select to anon,authenticated using(true);
grant select on public.staff to authenticated;
create policy staff_read on public.staff for select to authenticated
  using (id=(select auth.uid()) or private.has_permission('owner'));
-- Staff role changes are restricted to the owner-checked server operation. No self-promotion policy.
grant select,insert,update,delete on public.content,public.published_content,public.content_revisions,public.media_assets,public.content_media to authenticated;
do $$ declare t text; begin
  foreach t in array array['content','published_content','content_revisions','media_assets','content_media'] loop
    execute format('create policy content_staff on public.%I for all to authenticated using (private.has_permission(''content'')) with check(private.has_permission(''content''))',t);
  end loop;
end $$;
grant select,update on public.enquiries to authenticated;
create policy enquiry_read on public.enquiries for select to authenticated using(private.has_permission('enquiries'));
create policy enquiry_update on public.enquiries for update to authenticated using(private.has_permission('enquiries')) with check(private.has_permission('enquiries'));
grant select,insert,update on public.delivery_jobs to authenticated;
create policy job_staff on public.delivery_jobs for all to authenticated using(private.has_permission('enquiries')) with check(private.has_permission('enquiries'));
grant insert,update on public.site_settings to authenticated;
create policy settings_owner on public.site_settings for all to authenticated using(private.has_permission('owner')) with check(private.has_permission('owner'));
grant select on public.runtime_config,public.audit_events to authenticated;
create policy config_owner on public.runtime_config for select to authenticated using(private.has_permission('owner'));
create policy audit_owner on public.audit_events for select to authenticated using(private.has_permission('owner'));
-- No anonymous direct inserts, enquiry reads, staff mutations, rate-limit access or job access.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('website-public','website-public',true,8388608,array['image/jpeg','image/png','image/webp','image/svg+xml']),
 ('website-private','website-private',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
-- Public bucket writes only through approved server publish/migration paths.
-- SVG is for audited bundled assets, never general uploads.
create policy private_media_read on storage.objects for select to authenticated
  using(bucket_id='website-private' and private.has_permission('content'));
create policy private_media_upload on storage.objects for insert to authenticated
  with check(bucket_id='website-private' and private.has_permission('content') and lower(storage.extension(name)) in ('jpg','jpeg','png','webp'));
-- Immutable object names: no client update/delete. Server delete checks references before removing bytes.
