-- =====================================================================
--  UMPIR.ES — шаг 3, часть 1: сборка public.catalog из core (17.11.2026)
--  Правила — claude/core-step3-build.md. Сайт и public.catalog не меняются:
--  результат пишется в core.catalog_built функцией core.refresh_catalog_built().
-- =====================================================================

-- ---------------------------------------------------------------------
--  Вспомогательное
-- ---------------------------------------------------------------------

create or replace function core.jsonb_rtrim(a jsonb, keep int, vals jsonb default '[]')
returns jsonb language plpgsql immutable set search_path = '' as $$
declare n int := jsonb_array_length(a);
begin
  -- обрезать хвост массива: null и значения из vals, но не короче keep
  while n > keep and (a->(n-1) = 'null'::jsonb or vals @> jsonb_build_array(a->(n-1))) loop
    a := a - (n-1); n := n - 1;
  end loop;
  return a;
end $$;

-- позиции массивов сайта: DATA.o, EV.ir, EV.x (номер по порядку, с нуля)
create or replace view core.v_site_o with (security_invoker = true) as
select (row_number() over (order by idx) - 1)::int pos, official_id from core.catalog_map where part = 'o';

create or replace view core.v_site_ir with (security_invoker = true) as
select (row_number() over (order by idx) - 1)::int pos, official_id from core.catalog_map where part = 'ir';

-- EV.x: имя первой позиции человека — каноническое; у остальных позиций и у
-- людей, которые есть в DATA.o / EV.ir, — вариант имени (name_aliases variant)
create or replace view core.v_site_x with (security_invoker = true) as
with x as (
  select (row_number() over (order by m.idx) - 1)::int pos, m.official_id, m.extra,
         row_number() over (partition by m.official_id order by m.idx) rn,
         exists (select 1 from core.catalog_map o where o.part in ('o','ir') and o.official_id = m.official_id) other
  from core.catalog_map m where m.part = 'x')
select x.pos, x.official_id, x.extra,
       case when v.family_name is not null and (x.other or x.rn > 1) then v.family_name else f.family_name end sur,
       case when v.family_name is not null and (x.other or x.rn > 1) then v.first_name  else f.first_name  end first
from x join core.officials f on f.id = x.official_id
left join lateral (select na.family_name, na.first_name from core.name_aliases na
                   where na.official_id = x.official_id and na.alias_kind = 'variant' order by na.id limit 1) v on true;

comment on view core.v_site_x is 'Позиции EV.x сайта и написание имени в каждой (правило — claude/core-step3-build.md)';

-- ---------------------------------------------------------------------
--  DATA
-- ---------------------------------------------------------------------

create or replace function core.build_data() returns jsonb language sql stable set search_path = '' as $$
select jsonb_build_object(
  'c', (select jsonb_agg(jsonb_build_array(a.name_en, a.ittf_code) order by a.site_idx)
        from core.associations a where a.site_idx < 124),
  'o', (select jsonb_agg(jsonb_build_array(
            f.ittf_ump_id::int, le.listed_family, le.listed_first, a.site_idx,
            case cc.cat_code when 'WB' then 0 when 'BB' then 1 when 'GB' then 2 end,
            case when cc.cat_code in ('BB','GB') then coalesce(f.gender, '') else '' end,
            coalesce(le.listed_extra->>'bb', ''), coalesce(le.listed_extra->>'gb', ''), coalesce(le.listed_extra->>'are', ''),
            case le.listed_status when 'active' then 1 else 0 end) order by o.pos)
        from core.v_site_o o
        join core.officials f on f.id = o.official_id
        left join core.ittf_list_entries le on le.official_id = f.id
             and le.source_id = (select id from core.sources where list_kind = 'active_iu')
        left join core.official_associations oa on oa.official_id = f.id
        left join core.associations a on a.id = oa.assc_id
        left join core.v_current_categories cc on cc.official_id = f.id and cc.line = 'ump'))
$$;

-- ---------------------------------------------------------------------
--  EV
-- ---------------------------------------------------------------------

create or replace function core.build_ev() returns jsonb language sql stable set search_path = '' as $$
select jsonb_build_object(
  'src', (select jsonb_agg(jsonb_build_array(s.publisher, s.title, coalesce(s.url, '')) order by s.site_idx)
          from core.sources s where s.site_idx is not null),
  'ev',  (select jsonb_agg(case when e.event_type = 'cont' or e.region_code is not null
                                then jsonb_build_array(e.name, e.date_start::text, e.date_end::text, e.event_type, coalesce(og.abbrv, ''), coalesce(e.region_code, ''))
                                else jsonb_build_array(e.name, e.date_start::text, e.date_end::text, e.event_type) end order by e.site_idx)
          from core.events e left join core.organizations og on og.id = e.organizer_id and e.event_type = 'cont'
          where e.site_idx is not null),
  'ir',  (select jsonb_agg(jsonb_build_array(
             f.ittf_ref_id::int, le.listed_family, le.listed_first,
             coalesce(case when a.site_idx < 124 then a.site_idx end, -1), le.listed_assc, coalesce(a.continent_code, ''),
             coalesce(f.gender, ''), coalesce(o.pos, -1), le.listed_status) order by i.pos)
          from core.v_site_ir i
          join core.officials f on f.id = i.official_id
          join core.ittf_list_entries le on le.official_id = f.id
               and le.source_id = (select id from core.sources where list_kind = 'ir_list')
          left join core.associations a on a.ittf_code = le.listed_assc
          left join core.v_site_o o on o.official_id = f.id),
  'x',   (select jsonb_agg(core.jsonb_rtrim(jsonb_build_array(
             x.sur, x.first, x.extra->>'cname', (x.extra->>'cidx')::int, coalesce(x.extra->>'csv', ''),
             coalesce(x.extra->>'code', ''), coalesce((x.extra->>'iux')::int, 0), x.extra->'flag'), 5, '["", 0]') order by x.pos)
          from core.v_site_x x),
  'ua',  (select jsonb_agg(core.jsonb_rtrim(jsonb_build_array(
             e.site_idx,
             coalesce(o.pos, -1 - (select min(x.pos) from core.v_site_x x where x.official_id = a.official_id)),
             a.badge_at_event, s.site_idx, a.venue_note, a.date_from::text, a.date_to::text, a.duty), 3) order by a.site_idx)
          from core.assignments a
          join core.events e on e.id = a.event_id
          left join core.sources s on s.id = a.source_id
          left join core.v_site_o o on o.official_id = a.official_id
          where a.site_part = 'ua'),
  'ra',  (select jsonb_agg(core.jsonb_rtrim(jsonb_build_array(
             e.site_idx,
             case when a.official_id is null then to_jsonb(a.unlinked_name)
                  else coalesce(to_jsonb(i.pos), to_jsonb(-1 - o.pos),
                                to_jsonb('x' || (select min(x.pos) from core.v_site_x x where x.official_id = a.official_id))) end,
             a.role_code, s.site_idx, a.venue_note, a.date_from::text, a.date_to::text), 3) order by a.site_idx)
          from core.assignments a
          join core.events e on e.id = a.event_id
          left join core.sources s on s.id = a.source_id
          left join core.v_site_ir i on i.official_id = a.official_id
          left join core.v_site_o o on o.official_id = a.official_id
          where a.site_part = 'ra'))
$$;

-- ---------------------------------------------------------------------
--  Олимпийские и Паралимпийские игры
-- ---------------------------------------------------------------------

create or replace function core.build_games(p_part text) returns jsonb language sql stable set search_path = '' as $$
with gsrc(code, sid) as (
  select 'b', id from core.sources where source_type = 'results_book'
  union all select 'o', id from core.sources where source_type = 'olympedia'
  union all select 'c', id from core.sources where notes = 'Код c в OLY / PARA'
  union all select 's', id from core.sources where source_type = 'self_report'
  union all select 'p', id from core.sources where notes = 'Код p в OLY / PARA'),
rmap(code, role) as (values ('u','Umpire'),('r','Referee'),('d','Deputy Referee'),('a','Assistant Referee'),
  ('td','Technical Delegate'),('atd','Assistant Technical Delegate'),('jc','Jury Chair'),('jd','Jury Deputy Chair'),
  ('j','Jury Member'),('rc','Racket Control'),('nto','National Technical Official')),
g as (
  select coalesce(ltrim(f.ittf_ump_id, '0'),
                  'n:' || (select x.sur || '|' || x.first from core.v_site_x x where x.official_id = f.id order by x.pos limit 1)) k,
         e.games_year y, r.code rc, gs.code sc
  from core.assignments a
  join core.events e on e.id = a.event_id
  join core.officials f on f.id = a.official_id
  join rmap r on r.role = a.role_code
  join gsrc gs on gs.sid = a.source_id
  where a.site_part = p_part)
select jsonb_object_agg(k, arr) from (
  select k, jsonb_agg(jsonb_build_array(y, rc, sc) order by y, rc) arr from g group by k) z
$$;

create or replace function core.build_oly_names() returns jsonb language sql stable set search_path = '' as $$
select jsonb_object_agg(ltrim(f.ittf_ump_id, '0'),
         jsonb_build_array(le.listed_family, le.listed_first, coalesce(le.listed_assc::text, ''), le.listed_extra->>'cname'))
from core.ittf_list_entries le
join core.sources s on s.id = le.source_id and s.title = 'Spellings and associations in Olympic sources'
join core.officials f on f.id = le.official_id
$$;

-- ---------------------------------------------------------------------
--  BBQ, REF_IU
-- ---------------------------------------------------------------------

create or replace function core.build_bbq() returns jsonb language sql stable set search_path = '' as $$
select jsonb_object_agg(ltrim(f.ittf_ump_id, '0'), le.listed_extra->>'qualified_on')
from core.ittf_list_entries le
join core.sources s on s.id = le.source_id and s.list_kind = 'bb_list' and s.title like 'Blue Badge Umpires lists%'
join core.officials f on f.id = le.official_id
$$;

-- рефери с известным номером IU, у которых нет профиля в DATA.o
create or replace function core.build_ref_iu() returns jsonb language sql stable set search_path = '' as $$
select jsonb_object_agg(f.ittf_ref_id::int::text, f.ittf_ump_id::int)
from core.officials f
where f.ittf_ref_id is not null and f.ittf_ump_id is not null
  and exists (select 1 from core.v_site_ir i where i.official_id = f.id)
  and not exists (select 1 from core.v_site_o o where o.official_id = f.id)
$$;

-- ---------------------------------------------------------------------
--  Gold Badge: из списков Gold Badge (core.sources list_kind gb_list с period_date)
-- ---------------------------------------------------------------------

-- присутствие в каждом списке
create or replace view core.v_gb_presence with (security_invoker = true) as
with l as (
  select s.id source_id, s.doc_date, s.period_date, to_char(s.period_date, 'YYYY-MM') ym,
         (row_number() over (order by s.doc_date, s.id))::int ln,
         (dense_rank() over (order by to_char(s.period_date, 'YYYY-MM')))::int mn
  from core.sources s where s.list_kind = 'gb_list' and s.period_date is not null)
select l.*, le.official_id, le.listed_family, le.listed_first, le.listed_extra,
       (le.listed_extra->>'qualified_on')::date qualified_on
from l join core.ittf_list_entries le on le.source_id = l.source_id;

comment on view core.v_gb_presence is 'Кто есть в каком списке Gold Badge: ln — номер списка по дате публикации, mn — номер месяца';

-- периоды по отдельным спискам (для GANTT): конец — дата публикации первого списка без человека
create or replace function core.build_gantt() returns jsonb language sql stable set search_path = '' as $$
with p as (select *, ln - row_number() over (partition by official_id order by ln) grp from core.v_gb_presence),
isl as (
  select official_id, min(ln) si, max(ln) ei from p group by official_id, grp),
lists as (select distinct ln, doc_date, period_date from core.v_gb_presence),
per as (
  select i.official_id, i.si, i.ei,
         (select qualified_on from p where p.official_id = i.official_id and p.ln = i.si) q,
         (select period_date from lists where ln = i.si) first_list,
         (select doc_date from lists where ln = i.ei + 1) end_date,
         (select listed_family || ' ' || listed_first from p where p.official_id = i.official_id and p.ln = i.ei) nm,
         (select listed_extra->>'sex' from p where p.official_id = i.official_id and p.ln = i.si) sex
  from isl i),
per2 as (
  select per.*, lag(end_date) over (partition by official_id order by si) prev_end from per),
g as (
  select f.ittf_ump_id::int iu, per2.sex, per2.nm,
         case when per2.q is not null and (per2.prev_end is null or per2.q > per2.prev_end) then per2.q else per2.first_list end s,
         per2.end_date e, f.iu_exam_year y, a.ittf_code code
  from per2 join core.officials f on f.id = per2.official_id
  left join core.official_associations oa on oa.official_id = f.id
  left join core.associations a on a.id = oa.assc_id)
select jsonb_agg(jsonb_build_array(iu, sex, nm, s::text, e::text, y, code, 'obs') order by s, iu) from g
$$;

-- GBH: gbp — периоды по месяцам (конец — последний месяц со списком, где человек есть);
--      gev — события года последнего списка: gn новый GB, gr вернулся в GB, br вернулся в BB
create or replace function core.build_gbh() returns jsonb language sql stable set search_path = '' as $$
with pm as (select distinct official_id, mn, ym from core.v_gb_presence),
months as (select distinct mn, ym from core.v_gb_presence),
p as (select *, mn - row_number() over (partition by official_id order by mn) grp from pm),
isl as (select official_id, min(mn) sm, max(mn) em from p group by official_id, grp),
per as (
  select i.official_id, i.sm, i.em,
         (select ym from months where mn = i.sm) first_m,
         (select ym from months where mn = i.em) last_m,
         (select to_char(v.qualified_on, 'YYYY-MM') from core.v_gb_presence v
           where v.official_id = i.official_id and v.mn = i.sm order by v.ln limit 1) qm,
         i.em = (select max(mn) from months) open
  from isl i),
per2 as (select per.*, lag(last_m) over (partition by official_id order by sm) prev_end from per),
gbp as (
  select ltrim(f.ittf_ump_id, '0') k,
         jsonb_agg(jsonb_build_array(
           case when qm is not null and (prev_end is null or qm > prev_end) then qm else first_m end,
           case when open then null else last_m end) order by sm) arr
  from per2 join core.officials f on f.id = per2.official_id group by f.ittf_ump_id),
ev as (
  select m.ym, m.mn, cur.official_id, case when exists (select 1 from pm e where e.official_id = cur.official_id and e.mn < m.mn - 1) then 'gr' else 'gn' end kind
  from months m join pm cur on cur.mn = m.mn
  where m.mn > 1 and not exists (select 1 from pm pr where pr.official_id = cur.official_id and pr.mn = m.mn - 1)
  union all
  select m.ym, m.mn, pr.official_id, 'br'
  from months m join pm pr on pr.mn = m.mn - 1
  where not exists (select 1 from pm cur where cur.official_id = pr.official_id and cur.mn = m.mn)),
gev as (
  select jsonb_agg(jsonb_build_array(ev.ym, f.ittf_ump_id::int, ev.kind)
                   order by ev.mn, case ev.kind when 'gn' then 0 when 'gr' then 1 else 2 end, f.family_name, f.ittf_ump_id) j
  from ev join core.officials f on f.id = ev.official_id
  where left(ev.ym, 4) = (select left(max(ym), 4) from months))
select jsonb_build_object('gbp', (select jsonb_object_agg(k, arr) from gbp), 'gev', (select j from gev))
$$;

-- ---------------------------------------------------------------------
--  Собранный справочник
-- ---------------------------------------------------------------------

create table core.catalog_built (
  key text primary key,
  data jsonb not null,
  built_at timestamptz not null default now()
);
comment on table core.catalog_built is 'Справочник сайта, собранный из core (шаг 3). Сайт читает public.catalog, не эту таблицу';
alter table core.catalog_built enable row level security;
revoke all on core.catalog_built from public, anon, authenticated;

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
$$;

create or replace function core.refresh_catalog_built()
returns table (key text, same_as_site boolean, bytes_built int, bytes_site int)
language plpgsql set search_path = '' as $$
begin
  delete from core.catalog_built;
  insert into core.catalog_built (key, data) select b.key, b.data from core.build_catalog() b;
  return query
    select b.key, b.data = c.data, length(b.data::text), length(c.data::text)
    from core.catalog_built b left join public.catalog c on c.key = b.key
    order by b.key;
end $$;

comment on function core.refresh_catalog_built() is 'Пересобрать core.catalog_built из core и сравнить с public.catalog по ключам';

revoke execute on function core.jsonb_rtrim(jsonb, int, jsonb), core.build_data(), core.build_ev(), core.build_games(text),
  core.build_oly_names(), core.build_bbq(), core.build_ref_iu(), core.build_gantt(), core.build_gbh(),
  core.build_catalog(), core.refresh_catalog_built() from public, anon, authenticated;
