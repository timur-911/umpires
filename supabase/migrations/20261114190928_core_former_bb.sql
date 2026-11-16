-- =====================================================================
--  UMPIR.ES — 14 бывших Blue Badge без профиля на сайте (15.11.2026)
--
--  Их номера были только в BBQ (даты Blue Badge), без имени. Найдены в
--  списках ITTF «Blue Badge Umpires» (Umpires_Lists): все 14 — в списке
--  01.01.2024, PATANE — ещё в списках 01.07.2025 и 01.10.2025. В более поздних
--  списках их нет, в активном списке IU 2026 и в назначениях — тоже.
--  Решение куратора 15.11.2026: это неактивные IU. Статус «IU, неакт.»
--  выводится представлением v_iu_status сам. На сайт они не добавляются
--  (правило iu-status-rules.md), хранятся только в core.
--
--  История категорий: WB с года экзамена -> BB с даты «Qualified on» ->
--  выход из списка BB (первый список без человека; точность — месяц) -> WB.
-- =====================================================================

do $$ begin
  if exists (select 1 from core.officials where ittf_ump_id = '02633') then
    raise exception 'бывшие BB уже добавлены';
  end if;
end $$;

insert into core.sources (source_type, list_kind, publisher, title, doc_date, notes)
values ('ittf_list', 'bb_list', 'ITTF URC', 'Blue Badge Umpires 1 Jan 2024', '2024-01-01',
        'Отдельный список; последний, где есть 13 из 14 бывших Blue Badge (добавлено 15.11.2026)');

create temp table t_fbb (iu text, fam text, first text, sex char(1), code text, bb date, gone date, last_list text);
insert into t_fbb values
  ('02633', 'PONOMAREV', 'Valentine',  'M', 'RUS', '2007-12-07', '2025-07-01', '01.01.2024'),
  ('10035', 'GRYAZNOVA', 'Lyudmila',   'F', 'RUS', '2016-12-20', '2025-07-01', '01.01.2024'),
  ('10043', 'TULENKOVA', 'Ksenia',     'F', 'RUS', '2016-11-24', '2025-07-01', '01.01.2024'),
  ('10429', 'REITE',     'Karl Börre', 'M', 'NOR', '2014-05-20', '2025-07-01', '01.01.2024'),
  ('12415', 'ISHII',     'Shoichi',    'M', 'JPN', '2020-02-08', '2025-07-01', '01.01.2024'),
  ('12520', 'SVEILE',    'Sanita',     'F', 'LAT', '2018-05-02', '2025-07-01', '01.01.2024'),
  ('14730', 'FRANSMAN',  'Claire',     'F', 'RSA', '2019-01-15', '2025-07-01', '01.01.2024'),
  ('14909', 'ARENAS',    'Javier',     'M', 'COL', '2020-02-21', '2025-07-01', '01.01.2024'),
  ('16301', 'PATANE',    'Mark',       'M', 'AUS', '2022-09-29', '2026-01-01', '01.10.2025'),
  ('88657', 'AKUTSU',    'Kimie',      'F', 'JPN', '2009-05-01', '2025-07-01', '01.01.2024'),
  ('94407', 'ESSL',      'Hartmut',    'M', 'GER', '2006-12-04', '2025-07-01', '01.01.2024'),
  ('94526', 'KAMIYA',    'Akiko',      'F', 'JPN', '2007-06-29', '2025-07-01', '01.01.2024'),
  ('96426', 'MUSTAPHY',  'Sudipta',    'M', 'IND', '2010-05-14', '2025-07-01', '01.01.2024'),
  ('96721', 'BYSTRICAN', 'Marian',     'M', 'SVK', '2016-07-04', '2025-07-01', '01.01.2024');

create temp table t_ids as select
  (select id from core.sources where title = 'Blue Badge Umpires 1 Jan 2024') s_list,
  (select id from core.sources where list_kind = 'bb_list' and title like 'Blue Badge Umpires lists%') s_bb;

insert into core.officials (ittf_ump_id, family_name, first_name, gender, source_id, notes)
select iu, fam, first, sex, (select s_list from t_ids), 'Бывший Blue Badge; неактивный IU (решение куратора 15.11.2026); на сайте не показывается'
from t_fbb;

insert into core.official_associations (official_id, assc_id, source_id)
select f.id, a.id, (select s_list from t_ids)
from t_fbb t join core.officials f on f.ittf_ump_id = t.iu join core.associations a on a.ittf_code = t.code;

insert into core.ittf_list_entries (source_id, official_id, listed_family, listed_first, listed_assc, listed_cat, listed_status, listed_extra)
select (select s_list from t_ids), f.id, t.fam, t.first, t.code, 'BB', null, jsonb_build_object('qualified_on', t.bb)
from t_fbb t join core.officials f on f.ittf_ump_id = t.iu;

insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, date_to, to_precision, source_id, notes)
select f.id, 'WB', 'ump', make_date(f.iu_exam_year, 1, 1), 'year', t.bb, 'day', (select s_list from t_ids), null
from t_fbb t join core.officials f on f.ittf_ump_id = t.iu
union all
select f.id, 'BB', 'ump', t.bb, 'day', t.gone, 'month', (select s_bb from t_ids),
       'Последний список с этим судьёй — ' || t.last_list || '; в следующем имеющемся списке его нет'
from t_fbb t join core.officials f on f.ittf_ump_id = t.iu
union all
select f.id, 'WB', 'ump', t.gone, 'month', null, null, (select s_bb from t_ids),
       'Выбыл из списка Blue Badge; дата перехода — первый имеющийся список без судьи'
from t_fbb t join core.officials f on f.ittf_ump_id = t.iu;

update core.load_report
set loaded = (select count(*) from core.official_categories where cat_code = 'BB' and source_id = (select s_bb from t_ids)),
    note = 'нет человека ни в одном разделе: 14 — найдены в списках Blue Badge (01.01.2024; PATANE до 01.10.2025) и добавлены 15.11.2026 как неактивные IU'
where item = 'BBQ -> BB dates';

drop table t_fbb, t_ids;
