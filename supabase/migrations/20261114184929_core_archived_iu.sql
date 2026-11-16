-- =====================================================================
--  UMPIR.ES — признак «IU без известного номера» (15.11.2026)
--
--  Правило куратора (25.10 и 01.11.2026): официальное лицо Олимпийских игр
--  2000–2020 и любое лицо с несудейской ролью на международном турнире —
--  как минимум IU, даже если номер IU неизвестен. На сайте такие люди
--  показываются как «IU, неакт.» (флаги 1 и 3 в EV.x).
--  Без этого признака представление v_iu_status ставило им NU.
-- =====================================================================

alter table core.officials add column archived_iu boolean not null default false;
comment on column core.officials.archived_iu is
  'IU по косвенным признакам (официальное лицо Игр / несудейская роль на международном турнире), номер IU неизвестен';

update core.officials f set archived_iu = true
where f.ittf_ump_id is null
  and exists (select 1 from core.catalog_map m where m.official_id = f.id and m.part = 'x' and m.extra->>'flag' in ('1','3'));

create or replace view core.v_iu_status with (security_invoker = true) as
select o.id as official_id, o.ittf_ump_id, o.iu_exam_year,
  case
    when o.ittf_ump_id is null then case when o.archived_iu then 'inact' else 'nu' end
    when exists (select 1 from core.ittf_list_entries le join core.sources s on s.id = le.source_id
                 where le.official_id = o.id and s.list_kind = 'active_iu'
                   and extract(year from s.doc_date) = extract(year from current_date))
      then 'act'
    when exists (select 1 from core.assignments a
                 join core.events e on e.id = a.event_id
                 join core.event_roles r on r.code = a.role_code
                 where a.official_id = o.id and r.role_group = 'umpire'
                   and a.status in ('assigned','worked')
                   and e.event_type not in ('olympic','paralympic')
                   and e.date_start <= current_date
                   and extract(year from e.date_start) = extract(year from current_date))
      then 'act'
    when o.iu_exam_year >= extract(year from current_date) - 2 then 'new'
    else 'inact'
  end as iu_status
from core.officials o;

update core.load_report set note = note || '; archived_iu: ' || (select count(*) from core.officials where archived_iu)
where item = 'EV.x -> officials';
