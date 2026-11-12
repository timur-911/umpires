-- UMPIR.ES — таблица справочника.
-- Сюда переехало содержимое, которое раньше было вшито в index.html:
-- по строке на блок, значение — тот же JSON, что читает страница.
--
--   DATA       судьи и страны
--   EV         турниры
--   OLY        участники Олимпийских игр
--   OLY_NAMES  имена для списков ОИ
--   PARA       Паралимпийские игры
--   BBQ        Blue Badge
--   GBH        Gold Badge
--   GANTT      назначения по датам
--   REF_IU     соответствие рефери и номеров IU
--
-- Наполняется отдельным файлом catalog_seed.sql, который не коммитится.

create table if not exists public.catalog (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.catalog enable row level security;

drop policy if exists catalog_read  on public.catalog;
drop policy if exists catalog_write on public.catalog;

-- читают все: сайт открыт без входа
create policy catalog_read on public.catalog for select using (true);

-- правит только куратор
create policy catalog_write on public.catalog for all to authenticated
  using (public.is_editor()) with check (public.is_editor());
