-- =====================================================================
--  UMPIR.ES — правило White Badge (16.11.2026)
--
--  Правило куратора: год получения WB всегда один — первые две цифры номера
--  IU (стать IU и получить WB — одно событие). BB и GB остаются IU, но уже не
--  WB; вернуться в WB можно, потеряв сначала GB, затем BB.
--
--  Что меняется:
--   1. В official_categories можно записать период, который закончился в
--      неизвестную дату (end_unknown), и порядок периодов в линии (seq).
--      Пустая date_to без end_unknown по-прежнему значит «действует сейчас».
--   2. Точность 'list' — дата первого списка ITTF, где видно изменение;
--      сам переход был между этим и предыдущим списком.
--   3. Запрет пересечений проверяет только достоверную часть периода:
--      период с неизвестным началом или концом пересечений не создаёт.
--   4. Данные:
--      * у всех с номером IU первый период судейской линии — WB с года IU;
--      * KOH, SEMENOVA, MILINSKI: дата BB из списков Blue Badge; после GB —
--        снова BB (по спискам BB), затем WB;
--      * BERGFELDT: после GB — BB, затем WB (подтверждено куратором 16.11.2026);
--      * у 14 бывших BB точность перехода — 'list';
--      * у рефери IR Advanced — сначала IR с года по номеру IR.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1–3. Структура
-- ---------------------------------------------------------------------

alter table core.official_categories
  add column seq smallint,
  add column end_unknown boolean not null default false;

comment on column core.official_categories.end_unknown is
  'Период закончился, но дата неизвестна. date_to NULL и end_unknown = false — действует сейчас';
comment on column core.official_categories.seq is 'Порядок периода в линии человека (1 — первый)';

alter table core.official_categories drop constraint official_cat_no_overlap;
alter table core.official_categories drop constraint official_categories_from_precision_check;
alter table core.official_categories drop constraint official_categories_to_precision_check;
alter table core.official_categories drop constraint official_cat_prec_chk;

alter table core.official_categories
  add constraint official_cat_from_prec_chk check (from_precision in ('day','month','year','list')),
  add constraint official_cat_to_prec_chk   check (to_precision   in ('day','month','year','list')),
  add constraint official_cat_prec_chk check ((date_from is null) = (from_precision is null) and (date_to is null) = (to_precision is null)),
  add constraint official_cat_end_unknown_chk check (not end_unknown or (date_to is null and date_from is not null));

comment on column core.official_categories.from_precision is
  'day / month / year — точность даты; list — дата первого списка ITTF, где видно изменение (переход был между этим и предыдущим списком)';

-- ---------------------------------------------------------------------
--  4. Данные
-- ---------------------------------------------------------------------

create temp table t_src as select
  (select id from core.sources where title = 'Blue Badge Umpires 1 Jan 2024') s_bb2024,
  (select id from core.sources where list_kind = 'bb_list' and title like 'Blue Badge Umpires lists%') s_bb,
  (select id from core.sources where list_kind = 'active_iu') s_act,
  (select id from core.sources where list_kind = 'ir_list') s_ir;

-- KOH, SEMENOVA, MILINSKI, BERGFELDT: убрать WB сразу после GB
delete from core.official_categories c
using core.officials f
where c.official_id = f.id and f.ittf_ump_id in ('06129','10042','12324','00021')
  and c.cat_code = 'WB' and c.date_to is null;

-- дата BB по спискам Blue Badge («Qualified on»)
update core.official_categories c
set date_from = v.bb, from_precision = 'day', source_id = (select s_bb from t_src)
from core.officials f, (values ('06129', date '2012-02-24'), ('10042', date '2013-07-24'), ('12324', date '2017-04-02')) v(iu, bb)
where c.official_id = f.id and f.ittf_ump_id = v.iu and c.cat_code = 'BB' and c.date_from is null;

-- после GB: BB, затем WB
insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, date_to, to_precision, source_id, notes)
select f.id, 'BB', 'ump', v.gb_end, 'month', v.wb_from, 'list', (select s_bb from t_src), v.note
from core.officials f join (values
  ('06129', date '2024-01-02', date '2026-01-01', 'После выхода из списка Gold Badge. В списках Blue Badge 01.01.2024, 01.07.2025 и 01.10.2025 есть, в 01.01.2026 — нет'),
  ('10042', date '2024-01-02', date '2025-07-01', 'После выхода из списка Gold Badge. В списке Blue Badge 01.01.2024 есть, в 01.07.2025 — нет'),
  ('12324', date '2024-01-02', date '2025-07-01', 'После выхода из списка Gold Badge. В списке Blue Badge 01.01.2024 есть, в 01.07.2025 — нет'),
  ('00021', date '2025-10-09', date '2026-01-01', 'После выхода из списка Gold Badge ; была Blue Badge (подтверждено куратором 16.11.2026). В списке Blue Badge 01.01.2026 её нет')
) v(iu, gb_end, wb_from, note) on f.ittf_ump_id = v.iu
union all
select f.id, 'WB', 'ump', v.wb_from, 'list', null, null, (select s_act from t_src), 'Вернулся в White Badge, потеряв GB, затем BB'
from core.officials f join (values ('06129', date '2026-01-01'), ('10042', date '2025-07-01'), ('12324', date '2025-07-01'), ('00021', date '2026-01-01')) v(iu, wb_from)
  on f.ittf_ump_id = v.iu;

-- 14 бывших BB: переход BB -> WB по спискам
update core.official_categories set to_precision = 'list'
where notes like 'Последний список с этим судьёй%' and to_precision = 'month';
update core.official_categories set from_precision = 'list'
where notes like 'Выбыл из списка Blue Badge%' and from_precision = 'month';

-- WB с года IU — первым периодом у всех, у кого он ещё не записан
with first_period as (
  select distinct on (c.official_id) c.official_id, c.date_from, c.from_precision
  from core.official_categories c
  where c.line = 'ump'
  order by c.official_id, coalesce(c.date_from, c.date_to), (c.date_from is null) desc
)
insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, date_to, to_precision, end_unknown, source_id, notes)
select f.id, 'WB', 'ump', make_date(f.iu_exam_year, 1, 1), 'year',
       fp.date_from, fp.from_precision, fp.date_from is null,
       f.source_id,
       case when fp.date_from is null then 'WB с года IU по номеру; дата перехода в BB неизвестна'
            else 'WB с года IU по номеру' end
from core.officials f
join first_period fp on fp.official_id = f.id
where f.ittf_ump_id is not null
  and not exists (select 1 from core.official_categories c
                  where c.official_id = f.id and c.cat_code = 'WB' and c.date_from = make_date(f.iu_exam_year, 1, 1));

-- IU без истории категорий: WB с года IU, текущая категория неизвестна
insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, end_unknown, source_id, notes)
select f.id, 'WB', 'ump', make_date(f.iu_exam_year, 1, 1), 'year', true, f.source_id,
       'WB с года IU по номеру; текущая категория неизвестна (нет в активном списке IU 2026)'
from core.officials f
where f.ittf_ump_id is not null
  and not exists (select 1 from core.official_categories c where c.official_id = f.id and c.line = 'ump');

-- рефери IR Advanced: сначала IR с года по номеру IR
insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, end_unknown, source_id, notes)
select f.id, 'IR', 'ref', make_date(f.ir_year, 1, 1), 'year', true, (select s_ir from t_src),
       'IR с года по номеру IR; дата перехода в IR Advanced неизвестна'
from core.officials f
where exists (select 1 from core.official_categories c where c.official_id = f.id and c.cat_code = 'IRA')
  and not exists (select 1 from core.official_categories c where c.official_id = f.id and c.cat_code = 'IR');

-- порядок периодов
update core.official_categories c set seq = s.rn
from (select id, row_number() over (partition by official_id, line
        order by coalesce(date_from, date_to) nulls last, (date_from is null) desc, id) rn
      from core.official_categories) s
where s.id = c.id;

alter table core.official_categories alter column seq set not null;
alter table core.official_categories add constraint official_cat_seq_uq unique (official_id, line, seq);

-- одна текущая категория в линии
create unique index official_cat_current_uq on core.official_categories (official_id, line)
  where date_to is null and not end_unknown;

-- запрет пересечений: только достоверная часть периода
alter table core.official_categories add constraint official_cat_no_overlap exclude using gist (
  official_id with =,
  line with =,
  daterange(
    coalesce(date_from, date_to, '-infinity'::date),
    case when end_unknown then date_from else coalesce(date_to, 'infinity'::date) end,
    '[)') with &&
);

create or replace view core.v_current_categories with (security_invoker = true) as
select oc.official_id, oc.line, oc.cat_code, oc.date_from, oc.from_precision
from core.official_categories oc
where oc.date_to is null and not oc.end_unknown;

drop table t_src;
