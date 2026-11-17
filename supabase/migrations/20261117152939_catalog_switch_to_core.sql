-- =====================================================================
--  UMPIR.ES — шаг 3, часть 2: сайт читает справочник, собранный из core
--  (17.11.2026, разрешение владельца). С этого момента источник правды — core;
--  public.catalog обновляется функцией core.publish_catalog(), вручную не правится.
--
--  Отличия от прежнего справочника — только согласованные (claude/core-step3-build.md):
--  EV (один профиль ZHAO Ying, хвосты массивов, ссылка NEPOMUCENO), GBH (порядок
--  ленты внутри месяца), REF_IU (без 23257 → 4009).
--  Откат: update public.catalog c set data = b.data from core.catalog_site_backup b
--         where b.key = c.key and b.taken_at = '<момент>';
-- =====================================================================

create table core.catalog_site_backup (
  key text not null,
  data jsonb not null,
  taken_at timestamptz not null,
  primary key (key, taken_at)
);
comment on table core.catalog_site_backup is 'Копии public.catalog перед публикацией из core — для отката';
alter table core.catalog_site_backup enable row level security;
revoke all on core.catalog_site_backup from public, anon, authenticated;

create or replace function core.publish_catalog()
returns table (key text, changed boolean)
language plpgsql set search_path = '' as $$
declare v_at timestamptz := now();
begin
  perform core.refresh_catalog_built();
  if (select count(*) from core.catalog_built) <> 9 then
    raise exception 'сборка неполная: % ключей вместо 9', (select count(*) from core.catalog_built);
  end if;
  insert into core.catalog_site_backup (key, data, taken_at)
  select c.key, c.data, v_at from public.catalog c
  join core.catalog_built b on b.key = c.key where b.data is distinct from c.data;
  return query
    with upd as (
      update public.catalog c set data = b.data
      from core.catalog_built b where b.key = c.key and b.data is distinct from c.data
      returning c.key)
    select b.key, b.key in (select u.key from upd u) from core.catalog_built b order by b.key;
end $$;

comment on function core.publish_catalog() is
  'Собрать справочник из core и записать изменившиеся ключи в public.catalog (сайт). Прежние значения — в core.catalog_site_backup';
revoke execute on function core.publish_catalog() from public, anon, authenticated;

-- первое переключение: ожидаются ровно три ключа
do $$
declare n int; ks text;
begin
  select count(*), string_agg(key, ',' order by key) into n, ks from core.publish_catalog() where changed;
  if ks is distinct from 'EV,GBH,REF_IU' then
    raise exception 'ожидались изменения EV,GBH,REF_IU, получено: %', ks;
  end if;
end $$;
