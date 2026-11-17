-- =====================================================================
--  UMPIR.ES — имя 12022: SASIDHARAN Bindu Mohana (17.11.2026)
--  Решение владельца 17.11.2026: фамилия SASIDHARAN, имена Bindu Mohana.
--  В PDF списков Gold Badge имя разнесено по строкам («Bindu» сверху,
--  «MOHANA» и «SASIDHARAN» снизу), разбор 16.11 принял «MOHANA» за часть
--  фамилии. Исправлены записи списков Gold Badge и каноническое имя.
--  Запись активного списка IU 2026 (DATA.o) не меняется: там так и написано
--  «MOHANA SASIDHARAN Bindu»; это написание сохранено как list_spelling.
-- =====================================================================

update core.ittf_list_entries le
set listed_family = 'SASIDHARAN', listed_first = 'Bindu Mohana'
from core.officials f, core.sources s
where le.official_id = f.id and le.source_id = s.id and s.list_kind = 'gb_list' and s.period_date is not null
  and f.ittf_ump_id = '12022' and le.listed_family = 'MOHANA SASIDHARAN' and le.listed_first = 'Bindu';

insert into core.name_aliases (official_id, family_name, first_name, alias_kind, source_id)
select f.id, 'MOHANA SASIDHARAN', 'Bindu', 'list_spelling', (select id from core.sources where list_kind = 'active_iu')
from core.officials f where f.ittf_ump_id = '12022'
on conflict do nothing;

update core.officials
set family_name = 'SASIDHARAN', first_name = 'Bindu Mohana',
    notes = concat_ws('; ', notes, 'Имя — решение владельца 17.11.2026; в активном списке IU 2026 «MOHANA SASIDHARAN Bindu»')
where ittf_ump_id = '12022' and family_name = 'MOHANA SASIDHARAN';

do $$ begin
  if (select count(*) from core.ittf_list_entries le join core.officials f on f.id = le.official_id
      join core.sources s on s.id = le.source_id
      where f.ittf_ump_id = '12022' and s.list_kind = 'gb_list' and s.period_date is not null and le.listed_family = 'SASIDHARAN') <> 10 then
    raise exception '12022: ожидалось 10 исправленных записей списков Gold Badge';
  end if;
end $$;
