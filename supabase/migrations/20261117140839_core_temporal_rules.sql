-- =====================================================================
--  UMPIR.ES — правила временной модели core (17.11.2026)
--  Основание: аудит временной модели от 17.11.2026, решения владельца.
--  Данные не меняются: на 17.11.2026 все строки уже удовлетворяют правилам.
--
--  1. date_to — первый день СЛЕДУЮЩЕЙ категории, сам в период не входит
--     (диапазон [date_from, date_to)). Период нулевой длины запрещён.
--  2. Запрет пересечений проверяет у каждого периода хотя бы один заведомо
--     достоверный день. Раньше 284 периода с одной неизвестной границей
--     давали пустой диапазон и не проверялись вовсе:
--       * начало неизвестно  -> последний день перед date_to;
--       * окончание неизвестно (end_unknown) -> день date_from.
--     Период без обеих дат (14 текущих IR Advanced) проверить диапазоном
--     нельзя — его место проверяет правило порядка (п. 3).
--  3. seq > 0 и идёт в порядке дат; период без обеих дат — только последним
--     в линии. Проверяется в конце транзакции, чтобы миграции могли
--     перенумеровывать периоды.
--  4. «Текущая категория» — открытый период, уже начавшийся.
--  5. Порядок дат у кандидатств и назначений.
-- =====================================================================

-- 1 ------------------------------------------------------------------
alter table core.official_categories drop constraint official_cat_dates_chk;
alter table core.official_categories add constraint official_cat_dates_chk
  check (date_to is null or date_from is null or date_to > date_from);

comment on column core.official_categories.date_from is
  'Первый день периода (входит в период). NULL — начало неизвестно';
comment on column core.official_categories.date_to is
  'Первый день СЛЕДУЮЩЕЙ категории — в период не входит: период = [date_from, date_to). NULL и end_unknown = false — действует сейчас; NULL и end_unknown = true — закончился, дата неизвестна';
comment on table core.official_categories is
  'История категорий. Период = [date_from, date_to): date_to — первый день следующей категории. date_from NULL — начало неизвестно; date_to NULL — действует сейчас или (end_unknown) закончился в неизвестную дату. В одной линии (судья / рефери) периоды не пересекаются и идут в порядке seq';

-- 2 ------------------------------------------------------------------
alter table core.official_categories drop constraint official_cat_no_overlap;
alter table core.official_categories add constraint official_cat_no_overlap exclude using gist (
  official_id with =,
  line with =,
  daterange(
    coalesce(date_from, date_to - 1),
    case when end_unknown then date_from + 1 else coalesce(date_to, 'infinity'::date) end,
    '[)') with &&
) where (date_from is not null or date_to is not null);

comment on constraint official_cat_no_overlap on core.official_categories is
  'Периоды одной линии не пересекаются. Проверяется достоверная часть периода: при неизвестном начале — последний день перед date_to, при неизвестном окончании — день date_from. Периоды без обеих дат проверяет core.check_category_order';

-- 3 ------------------------------------------------------------------
alter table core.official_categories add constraint official_cat_seq_pos_chk check (seq > 0);

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
  return null;
end $$;

comment on function core.check_category_order() is
  'Проверка в конце транзакции: в линии человека seq идёт в порядке дат, период без обеих дат — последним';

create constraint trigger official_categories_order
  after insert or update or delete on core.official_categories
  deferrable initially deferred
  for each row execute function core.check_category_order();

-- 4 ------------------------------------------------------------------
create or replace view core.v_current_categories with (security_invoker = true) as
select oc.official_id, oc.line, oc.cat_code, oc.date_from, oc.from_precision
from core.official_categories oc
where oc.date_to is null and not oc.end_unknown
  and (oc.date_from is null or oc.date_from <= current_date);

comment on view core.v_current_categories is
  'Категория, действующая сегодня: открытый период, который уже начался. Уникальность открытого периода в линии обеспечивает индекс official_cat_current_uq';

-- 5 ------------------------------------------------------------------
alter table core.candidacies add constraint candidacies_dates_chk
  check (since is null or closed_on is null or closed_on >= since);
alter table core.appointments add constraint appointments_dates_chk
  check (date_from is null or date_to is null or date_to >= date_from);

revoke execute on function core.check_category_order() from public, anon, authenticated;
