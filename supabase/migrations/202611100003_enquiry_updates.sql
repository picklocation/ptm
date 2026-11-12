-- Enquiry staff may update existing requests, never create arbitrary ones.
create or replace function public.ptm_batch(writes jsonb) returns void language plpgsql security invoker set search_path='' as $$
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
    elsif tab='enquiries' then
      update public.enquiries set data=payload where id=key;
      if not found then raise exception 'Enquiry not found or access denied'; end if;
    elsif tab='content_revisions' then
      insert into public.content_revisions(id,content_id,data) values(key,payload->>'id',payload);
    elsif tab='audit_events' then
      insert into public.audit_events(id,data) values(key,payload);
    else
      execute format('insert into public.%I(id,data) values($1,$2) on conflict(id) do update set data=excluded.data',tab) using key,payload;
    end if;
  end loop;
end $$;
