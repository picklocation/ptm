-- Atomic operations; caller-scoped edits retain RLS. Privileged public-form
-- operations are callable only by the server service role after validation.
create function public.ptm_showcase() returns boolean language sql stable security definer set search_path='' as $$ select private.showcase_enabled(); $$;
revoke all on function public.ptm_showcase() from public;
grant execute on function public.ptm_showcase() to anon,authenticated,service_role;
grant insert on public.audit_events to authenticated;
create policy audit_append on public.audit_events for insert to authenticated
with check (private.has_permission('content') or private.has_permission('enquiries'));

create function public.ptm_batch(writes jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare w jsonb; tab text; payload jsonb; key text;
begin
  if jsonb_typeof(writes) <> 'array' or jsonb_array_length(writes)>100 then raise exception 'Invalid batch'; end if;
  for w in select value from jsonb_array_elements(writes) loop
    key:=w->>'id'; payload:=w->'data';
    tab:=case w->>'collection'
      when 'content' then 'content' when 'publishedContent' then 'published_content'
      when 'enquiries' then 'enquiries' when 'settings' then 'site_settings'
      when 'auditEvents' then 'audit_events' when 'runtimeConfig' then 'runtime_config'
      when 'revisions' then 'content_revisions' end;
    if w->>'collection' in ('excelJobs','notificationJobs') then
      if payload='null'::jsonb then raise exception 'Job deletion is not supported'; end if;
      insert into public.delivery_jobs(enquiry_id,kind,data) values(key,case w->>'collection' when 'excelJobs' then 'excel' else 'notification' end,payload)
      on conflict(enquiry_id,kind) do update set data=excluded.data;
    elsif tab is null then raise exception 'Unsupported collection';
    elsif payload='null'::jsonb then
      execute format('delete from public.%I where id=$1',tab) using key;
    elsif tab='content_revisions' then
      insert into public.content_revisions(id,content_id,data) values(key,payload->>'id',payload);
    elsif tab='audit_events' then
      insert into public.audit_events(id,data) values(key,payload);
    else
      execute format('insert into public.%I(id,data) values($1,$2) on conflict(id) do update set data=excluded.data',tab) using key,payload;
    end if;
  end loop;
end $$;
revoke all on function public.ptm_batch(jsonb) from public;
grant execute on function public.ptm_batch(jsonb) to authenticated,service_role;

create function public.ptm_enquiry_once(payload jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb; job jsonb;
begin
  insert into public.enquiries(id,data) values(payload->>'id',payload) on conflict(id) do nothing;
  select data into result from public.enquiries where id=payload->>'id';
  job:=jsonb_build_object('id',result->>'id','status','pending','attempts',0,'updatedAt',result->>'updatedAt');
  insert into public.delivery_jobs(enquiry_id,kind,data) values(result->>'id','excel',job),(result->>'id','notification',job) on conflict do nothing;
  return result;
end $$;
revoke all on function public.ptm_enquiry_once(jsonb) from public;
grant execute on function public.ptm_enquiry_once(jsonb) to service_role;

create function public.ptm_rate_limit(key text, maximum integer, window_ms bigint) returns boolean language plpgsql security invoker set search_path='' as $$
declare now_ms bigint := (extract(epoch from clock_timestamp())*1000)::bigint; accepted integer;
begin
  if maximum < 1 or window_ms < 1 then raise exception 'Invalid limit'; end if;
  insert into public.rate_limits(id,data) values(key,jsonb_build_object('count',1,'until',now_ms+window_ms))
  on conflict(id) do update set data=case
    when (rate_limits.data->>'until')::bigint <= now_ms then jsonb_build_object('count',1,'until',now_ms+window_ms)
    else jsonb_set(rate_limits.data,'{count}',to_jsonb((rate_limits.data->>'count')::integer+1)) end
  where (rate_limits.data->>'until')::bigint <= now_ms or (rate_limits.data->>'count')::integer < maximum
  returning 1 into accepted;
  return accepted=1 and accepted is not null;
end $$;
revoke all on function public.ptm_rate_limit(text,integer,bigint) from public;
grant execute on function public.ptm_rate_limit(text,integer,bigint) to service_role;
