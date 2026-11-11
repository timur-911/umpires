-- UMPIR.ES — схема Supabase.
-- Выполните целиком в Supabase → SQL Editor → New query → Run.
-- Повторный запуск безопасен.

create extension if not exists pgcrypto;

-- ---------- таблицы ----------

-- кураторы: кто может проверять заявки. Добавляются вручную (см. конец файла).
create table if not exists public.editors (
  uid  uuid primary key references auth.users(id) on delete cascade,
  note text
);

-- имя, которое показывается куратору вместо uid
create table if not exists public.profiles (
  uid  uuid primary key references auth.users(id) on delete cascade,
  name text
);

-- заявки с сайта: «я работал на этом турнире» и загруженные списки местных судей
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  uid         uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','accepted','rejected')),
  at          bigint not null,
  data        jsonb  not null default '{}'::jsonb,
  reviewed_at bigint,
  reviewer    uuid,
  created_at  timestamptz not null default now()
);
create index if not exists submissions_uid_idx    on public.submissions(uid);
create index if not exists submissions_status_idx on public.submissions(status);

-- принятые записи «я работал на турнире»: видны всем на странице турнира
create table if not exists public.approved (
  id         uuid primary key default gen_random_uuid(),
  at         bigint not null,
  from_path  text,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- доступ ----------

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.editors e where e.uid = auth.uid());
$$;

alter table public.editors     enable row level security;
alter table public.profiles    enable row level security;
alter table public.submissions enable row level security;
alter table public.approved    enable row level security;

drop policy if exists editors_read     on public.editors;
drop policy if exists profiles_read    on public.profiles;
drop policy if exists profiles_insert  on public.profiles;
drop policy if exists profiles_update  on public.profiles;
drop policy if exists subm_read        on public.submissions;
drop policy if exists subm_insert      on public.submissions;
drop policy if exists subm_update      on public.submissions;
drop policy if exists subm_delete      on public.submissions;
drop policy if exists appr_read        on public.approved;
drop policy if exists appr_insert      on public.approved;
drop policy if exists appr_delete      on public.approved;

-- вошедший пользователь может проверить, куратор ли он; список правится только через SQL Editor
create policy editors_read on public.editors for select to authenticated using (true);

create policy profiles_read   on public.profiles for select using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (uid = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (uid = auth.uid()) with check (uid = auth.uid());

-- автор видит только свои заявки, куратор — все
create policy subm_read   on public.submissions for select to authenticated using (uid = auth.uid() or public.is_editor());
create policy subm_insert on public.submissions for insert to authenticated with check (uid = auth.uid() and status = 'pending');
create policy subm_update on public.submissions for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy subm_delete on public.submissions for delete to authenticated using (public.is_editor());

-- принятые записи читают все, включая незалогиненных
create policy appr_read   on public.approved for select using (true);
create policy appr_insert on public.approved for insert to authenticated with check (public.is_editor());
create policy appr_delete on public.approved for delete to authenticated using (public.is_editor());

-- ---------- мгновенное обновление страниц ----------

do $$ begin
  alter publication supabase_realtime add table public.approved;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.submissions;
exception when duplicate_object then null; end $$;

-- ---------- файлы заявок ----------

insert into storage.buckets (id, name, public) values ('uploads','uploads',false)
on conflict (id) do nothing;

drop policy if exists uploads_insert on storage.objects;
drop policy if exists uploads_read   on storage.objects;

-- файл кладётся в папку с именем своего uid
create policy uploads_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy uploads_read on storage.objects for select to authenticated
  using (bucket_id = 'uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_editor()));

-- ---------- назначить куратора ----------
-- Войдите на сайте по ссылке из письма, затем выполните,
-- подставив адрес, которым входили:
--
--   insert into public.editors (uid, note)
--   select id, 'curator' from auth.users where email = 'you@example.com'
--   on conflict (uid) do nothing;
--
-- После этого в подвале сайта появится ссылка «Заявки».
