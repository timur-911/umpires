-- =====================================================================
--  UMPIR.ES — даты списков ITTF в справочнике, ключ LISTS
--  25.11.2026, разрешение владельца.
--
--  Зачем: на главной над картой показывается, когда в последний раз
--  менялись количества по ассоциациям. Это дата самого свежего из трёх
--  списков, из которых они собраны: активные International Umpires,
--  Blue Badge и Gold Badge. Даты лежат в core.sources, но сайт читает
--  только public.catalog, поэтому они выводятся отдельным ключом.
--
--  Дата списка — period_date (месяц, за который список составлен), а где
--  её нет — doc_date (дата публикации). У списков IU и Blue Badge
--  period_date не заполняется, у списков Gold Badge есть у всех, кроме
--  одного. Сайту нужен только месяц, день он не показывает.
--
--  Ключей в сборке становится 12.
-- =====================================================================

create or replace function core.build_lists() returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(jsonb_object_agg(t.k, t.d order by t.k), '{}'::jsonb)
  from (
    select case s.list_kind when 'active_iu' then 'iu' when 'bb_list' then 'bb' else 'gb' end as k,
           to_char(max(coalesce(s.period_date, s.doc_date)), 'YYYY-MM-DD') as d
    from core.sources s
    where s.list_kind in ('active_iu', 'bb_list', 'gb_list')
      and coalesce(s.period_date, s.doc_date) is not null
    group by 1
  ) t
$$;
comment on function core.build_lists() is
  'Ключ LISTS: дата самого свежего списка каждого вида — iu, bb, gb (period_date, иначе doc_date)';

create or replace function core.build_catalog() returns table (key text, data jsonb)
language sql stable set search_path = '' as $$
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
$$;

create or replace function core.publish_catalog()
returns table (key text, changed boolean)
language plpgsql set search_path = '' as $$
declare v_at timestamptz := now();
begin
  perform core.refresh_catalog_built();
  if (select count(*) from core.catalog_built) <> 12 then
    raise exception 'сборка неполная: % ключей вместо 12', (select count(*) from core.catalog_built);
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
end $$;

revoke execute on function core.build_lists(), core.build_catalog(), core.publish_catalog()
  from public, anon, authenticated;
