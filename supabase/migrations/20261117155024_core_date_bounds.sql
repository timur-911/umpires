-- =====================================================================
--  UMPIR.ES — диапазоны неопределённости дат категорий (17.11.2026)
--  Решение владельца: делать после шага 3 (claude/core-temporal-model.md).
--
--  У каждой границы периода — промежуток, в котором лежит настоящая дата
--  перехода: «не раньше» и «не позже». date_from / date_to остаются датой
--  для показа (что сайт показывал и раньше); на сборку справочника сайта
--  новые поля не влияют.
--
--  Переход — одно событие: конец периода и начало следующего. Поэтому
--  to_not_before / to_not_after периода = from_not_before / from_not_after
--  следующего периода (проверяет core.check_category_order).
--
--  Правила:
--    day   — промежуток в один день;
--    month — весь месяц;  year — весь год;
--    list  — от дня после последнего списка, где человек был в прежней
--            категории, до первого списка, где он уже в новой;
--    начало неизвестно — от начала предыдущего периода до дня перед концом
--            этого (IR Advanced — до списка IR 01.01.2026);
--    период закончился, дата неизвестна — «не раньше» = день после начала,
--            «не позже» неизвестно.
--  Выход из списка Gold Badge и возвращение 08.01.2024 датированы днём
--  публикации списка — точность исправлена с month на list.
-- =====================================================================

alter table core.official_categories
  add column from_not_before date,
  add column from_not_after  date,
  add column to_not_before   date,
  add column to_not_after    date;

comment on column core.official_categories.from_not_before is 'Настоящее начало периода не раньше этой даты';
comment on column core.official_categories.from_not_after  is 'Настоящее начало периода не позже этой даты';
comment on column core.official_categories.to_not_before   is 'Настоящий конец (первый день следующей категории) не раньше этой даты';
comment on column core.official_categories.to_not_after    is 'Настоящий конец не позже этой даты; NULL — неизвестно или период действует';

-- ---------------------------------------------------------------------
--  Вычисление
-- ---------------------------------------------------------------------

create temp table t_seen (iu text, last_seen date);   -- последний список BB, где человек ещё был BB
insert into t_seen values ('06129', '2025-10-01'), ('12324', '2024-01-01'), ('10042', '2024-01-01'), ('00021', null);

create temp table t_b as
with r as (
  select c.*, f.ittf_ump_id iu,
         lag(c.cat_code)  over w p_cat,
         lag(c.date_from) over w p_from,
         lag(c.notes)     over w p_notes,
         lag(c.official_id) over w p_off
  from core.official_categories c join core.officials f on f.id = c.official_id
  window w as (partition by c.official_id, c.line order by c.seq))
select r.id, r.official_id, r.line, r.seq, r.cat_code, r.p_cat, r.date_from, r.date_to, r.end_unknown,
  case
    when r.date_from is null and r.cat_code = 'IRA' then r.p_from
    when r.date_from is null then r.p_from
    when r.from_precision = 'day' then r.date_from
    when r.from_precision = 'year' then r.date_from
    when r.from_precision = 'list' and r.p_cat = 'BB' then
      greatest(coalesce(
        to_date(substring(r.p_notes from 'Последний список[^—]*— (\d\d\.\d\d\.\d{4})'), 'DD.MM.YYYY'),
        (select s.last_seen from t_seen s where s.iu = r.iu)) + 1,
        (select p.date_from from core.official_categories p where p.official_id = r.official_id and p.line = r.line and p.seq = r.seq - 1))
    when r.from_precision = 'month' and r.p_cat = 'GB' then
      (select max(v.doc_date) from core.v_gb_presence v where v.official_id = r.official_id and v.doc_date < r.date_from) + 1
    when r.from_precision = 'month' and r.cat_code = 'GB' and extract(day from r.date_from) <> 1 then
      (select max(s.doc_date) from core.sources s where s.list_kind = 'gb_list' and s.period_date is not null and s.doc_date < r.date_from) + 1
    when r.from_precision = 'month' then r.date_from
  end s_nb,
  case
    when r.date_from is null and r.cat_code = 'IRA' then date '2026-01-01'
    when r.date_from is null then r.date_to - 1
    when r.from_precision = 'day' then r.date_from
    when r.from_precision = 'year' then (r.date_from + interval '1 year' - interval '1 day')::date
    when r.from_precision = 'list' then r.date_from
    when r.from_precision = 'month' and (r.p_cat = 'GB' or (r.cat_code = 'GB' and extract(day from r.date_from) <> 1)) then r.date_from
    when r.from_precision = 'month' then (r.date_from + interval '1 month' - interval '1 day')::date
  end s_na,
  (r.from_precision = 'month' and (r.p_cat = 'GB' or (r.cat_code = 'GB' and extract(day from r.date_from) <> 1))) relabel
from r;

-- первый период каждой линии не имеет предыдущего: начало — по точности (у всех есть дата)
do $$ begin
  if exists (select 1 from t_b where s_nb is null or s_na is null) then
    raise exception 'не вычислены границы начала у % строк', (select count(*) from t_b where s_nb is null or s_na is null);
  end if;
end $$;

update core.official_categories c
set from_not_before = b.s_nb, from_not_after = b.s_na,
    from_precision = case when b.relabel then 'list' else c.from_precision end
from t_b b where b.id = c.id;

-- конец периода = начало следующего; без следующего: закончился — «не раньше» день после начала;
-- Gold Badge без следующего периода (RAMOS 04008, RASINEN 86800 — категория после GB неизвестна) —
-- по спискам: от дня после последнего списка с человеком до первого списка без него
update core.official_categories c
set to_not_before = coalesce(n.from_not_before,
                      case when c.cat_code = 'GB' and c.date_to is not null then
                        (select max(v.doc_date) from core.v_gb_presence v where v.official_id = c.official_id and v.doc_date < c.date_to) + 1 end,
                      case when c.end_unknown then c.date_from + 1 end),
    to_not_after  = coalesce(n.from_not_after, case when c.cat_code = 'GB' and c.date_to is not null then c.date_to end),
    to_precision  = case when c.date_to is not null and c.to_precision = 'month'
                          and (n.from_precision = 'list' or (n.id is null and c.cat_code = 'GB')) then 'list' else c.to_precision end
from core.official_categories c2
left join core.official_categories n on n.official_id = c2.official_id and n.line = c2.line and n.seq = c2.seq + 1
where c.id = c2.id;

do $$ begin
  if exists (select 1 from core.official_categories where date_to is not null and (to_not_before is null or to_not_after is null)) then
    raise exception 'у завершённых периодов не хватает границ конца';
  end if;
  if exists (select 1 from core.official_categories where from_not_before > from_not_after or to_not_before > to_not_after
             or (date_from is not null and not date_from between from_not_before and from_not_after)
             or (date_to is not null and not date_to between to_not_before and to_not_after)) then
    raise exception 'границы не охватывают дату';
  end if;
end $$;

-- отложенные проверки порядка — сейчас, иначе ALTER TABLE ниже невозможен
set constraints all immediate;

-- ---------------------------------------------------------------------
--  Правила на будущее
-- ---------------------------------------------------------------------

alter table core.official_categories
  add constraint official_cat_from_bounds_chk check (
    (from_not_before is null or from_not_after is null or from_not_before <= from_not_after)
    and (date_from is null or ((from_not_before is null or from_not_before <= date_from) and (from_not_after is null or date_from <= from_not_after)))),
  add constraint official_cat_to_bounds_chk check (
    (to_not_before is null or to_not_after is null or to_not_before <= to_not_after)
    and (date_to is null or ((to_not_before is null or to_not_before <= date_to) and (to_not_after is null or date_to <= to_not_after))));

-- day / month / year: границы заполняются сами, если не заданы
create or replace function core.fill_category_bounds()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.date_from is not null and new.from_not_before is null and new.from_not_after is null then
    if new.from_precision = 'day' then new.from_not_before := new.date_from; new.from_not_after := new.date_from;
    elsif new.from_precision = 'month' then new.from_not_before := date_trunc('month', new.date_from)::date;
      new.from_not_after := (date_trunc('month', new.date_from) + interval '1 month' - interval '1 day')::date;
    elsif new.from_precision = 'year' then new.from_not_before := date_trunc('year', new.date_from)::date;
      new.from_not_after := (date_trunc('year', new.date_from) + interval '1 year' - interval '1 day')::date;
    end if;
  end if;
  if new.date_to is not null and new.to_not_before is null and new.to_not_after is null then
    if new.to_precision = 'day' then new.to_not_before := new.date_to; new.to_not_after := new.date_to;
    elsif new.to_precision = 'month' then new.to_not_before := date_trunc('month', new.date_to)::date;
      new.to_not_after := (date_trunc('month', new.date_to) + interval '1 month' - interval '1 day')::date;
    elsif new.to_precision = 'year' then new.to_not_before := date_trunc('year', new.date_to)::date;
      new.to_not_after := (date_trunc('year', new.date_to) + interval '1 year' - interval '1 day')::date;
    end if;
  end if;
  return new;
end $$;
comment on function core.fill_category_bounds() is 'Заполнить границы неопределённости по точности day / month / year, если они не заданы';
revoke execute on function core.fill_category_bounds() from public, anon, authenticated;

create trigger official_categories_bounds before insert or update on core.official_categories
  for each row execute function core.fill_category_bounds();

-- порядок периодов + переход как одно событие: конец периода = начало следующего
create or replace function core.check_category_order()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_official integer := coalesce(new.official_id, old.official_id);
  v_line text := coalesce(new.line, old.line);
  v_bad text;
begin
  select string_agg(format('seq %s (%s)', seq, cat_code), ', ' order by seq) into v_bad
  from (
    select seq, cat_code,
           coalesce(date_from, date_to) k,
           date_from is null and date_to is null nodate,
           max(coalesce(date_from, date_to)) over w_prev prev_k,
           max(seq) over () max_seq
    from core.official_categories
    where official_id = v_official and line = v_line
    window w_prev as (order by seq rows between unbounded preceding and 1 preceding)
  ) s
  where k < prev_k or (nodate and seq <> max_seq);

  if v_bad is not null then
    raise exception 'core.official_categories: порядок периодов (seq) не совпадает с датами у official_id %, линия %: %',
      v_official, v_line, v_bad
      using errcode = '23514';
  end if;

  select string_agg(format('seq %s → %s', a.seq, b.seq), ', ' order by a.seq) into v_bad
  from core.official_categories a
  join core.official_categories b on b.official_id = a.official_id and b.line = a.line and b.seq = a.seq + 1
  where a.official_id = v_official and a.line = v_line
    and (a.to_not_before, a.to_not_after) is distinct from (b.from_not_before, b.from_not_after);

  if v_bad is not null then
    raise exception 'core.official_categories: границы конца периода не совпадают с границами начала следующего у official_id %, линия %: %',
      v_official, v_line, v_bad
      using errcode = '23514';
  end if;
  return null;
end $$;

comment on function core.check_category_order() is
  'Проверка в конце транзакции: seq идёт в порядке дат, период без обеих дат — последним; границы конца периода = границы начала следующего';

drop table t_seen, t_b;
