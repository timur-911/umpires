-- UMPIR.ES — ключ справочника GEO: города турниров с координатами (26.11.2026).
-- Сайт читает только public.catalog, поэтому координаты из core.cities выводятся
-- отдельным ключом. Состав: c — города [name, ISO-2, широта, долгота]; ev — индекс
-- города по site_idx каждого из 163 турниров; g — города Игр по годам.
-- Ключей в сборке становится 13.

create or replace function core.build_geo() returns jsonb
language sql stable set search_path = '' as $fn$
  with used as (
    select distinct c.id, c.name_en, c.country_code, c.latitude, c.longitude
    from core.events e join core.cities c on c.id = e.city_id
  ), ord as (
    select u.*, (row_number() over (order by u.name_en, u.country_code)) - 1 as idx from used u
  )
  select jsonb_build_object(
    'c', (select coalesce(jsonb_agg(jsonb_build_array(o.name_en, o.country_code, o.latitude::float8, o.longitude::float8) order by o.idx), '[]'::jsonb) from ord o),
    'ev', (select coalesce(jsonb_agg(o.idx order by e.site_idx), '[]'::jsonb)
           from core.events e join ord o on o.id = e.city_id where e.site_idx is not null),
    'g', (select coalesce(jsonb_object_agg(y::text, idx), '{}'::jsonb)
          from (select distinct e.games_year as y, o.idx from core.events e join ord o on o.id = e.city_id
                where e.site_idx is null and e.games_year is not null) t)
  )
$fn$;
comment on function core.build_geo() is 'Ключ GEO: города турниров и Игр с координатами из core.cities';

create or replace function core.build_catalog() returns table (key text, data jsonb)
language sql stable set search_path = '' as $fn$
  select 'DATA', core.build_data()
  union all select 'EV', core.build_ev()
  union all select 'OLY', core.build_games('oly')
  union all select 'PARA', core.build_games('para')
  union all select 'OLY_NAMES', core.build_oly_names()
  union all select 'BBQ', core.build_bbq()
  union all select 'GBH', core.build_gbh()
  union all select 'GANTT', core.build_gantt()
  union all select 'REF_IU', core.build_ref_iu()
  union all select 'POP', core.build_pop()
  union all select 'SINCE', core.build_since()
  union all select 'LISTS', core.build_lists()
  union all select 'GEO', core.build_geo()
$fn$;

create or replace function core.publish_catalog()
returns table (key text, changed boolean)
language plpgsql set search_path = '' as $fn$
declare v_at timestamptz := now();
begin
  perform core.refresh_catalog_built();
  if (select count(*) from core.catalog_built) <> 13 then
    raise exception 'сборка неполная: % ключей вместо 13', (select count(*) from core.catalog_built);
  end if;
  insert into core.catalog_site_backup (key, data, taken_at)
  select c.key, c.data, v_at from public.catalog c
  join core.catalog_built b on b.key = c.key where b.data is distinct from c.data;
  return query
    with upd as (
      update public.catalog c set data = b.data
      from core.catalog_built b where b.key = c.key and b.data is distinct from c.data
      returning c.key),
    ins as (
      insert into public.catalog as pc (key, data)
      select b.key, b.data from core.catalog_built b
      where not exists (select 1 from public.catalog c where c.key = b.key)
      returning pc.key)
    select b.key, b.key in (select u.key from upd u) or b.key in (select i.key from ins i)
    from core.catalog_built b order by b.key;
end $fn$;

revoke execute on function core.build_geo(), core.build_catalog(), core.publish_catalog()
  from public, anon, authenticated;
