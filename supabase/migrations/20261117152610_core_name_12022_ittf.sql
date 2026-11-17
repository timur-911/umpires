-- =====================================================================
--  UMPIR.ES — 12022: написание как в списках ITTF (17.11.2026)
--  Решение владельца 17.11.2026: имя и в профиле, и на диаграмме Gold Badge —
--  как в списках ITTF, «MOHANA SASIDHARAN Bindu». Миграция 20261117152309
--  отменяется: записи списков Gold Badge и каноническое имя возвращаются к
--  написанию списков. «SASIDHARAN Bindu Mohana» (фамилия SASIDHARAN —
--  со слов владельца) остаётся вариантом имени.
-- =====================================================================

update core.ittf_list_entries le
set listed_family = 'MOHANA SASIDHARAN', listed_first = 'Bindu'
from core.officials f, core.sources s
where le.official_id = f.id and le.source_id = s.id and s.list_kind = 'gb_list' and s.period_date is not null
  and f.ittf_ump_id = '12022' and le.listed_family = 'SASIDHARAN' and le.listed_first = 'Bindu Mohana';

update core.officials
set family_name = 'MOHANA SASIDHARAN', first_name = 'Bindu',
    notes = 'Имя — как в списках ITTF (решение владельца 17.11.2026); «SASIDHARAN Bindu Mohana» — вариант (фамилия SASIDHARAN со слов владельца)'
where ittf_ump_id = '12022' and family_name = 'SASIDHARAN';

-- бывшее list_spelling теперь совпадает с основным именем: превратить его в вариант «SASIDHARAN Bindu Mohana»
update core.name_aliases na
set family_name = 'SASIDHARAN', first_name = 'Bindu Mohana', alias_kind = 'variant', source_id = null
from core.officials f
where na.official_id = f.id and f.ittf_ump_id = '12022'
  and na.family_name = 'MOHANA SASIDHARAN' and na.first_name = 'Bindu' and na.alias_kind = 'list_spelling';

do $$ begin
  if (select count(*) from core.ittf_list_entries le join core.officials f on f.id = le.official_id
      join core.sources s on s.id = le.source_id
      where f.ittf_ump_id = '12022' and s.list_kind = 'gb_list' and s.period_date is not null and le.listed_family = 'MOHANA SASIDHARAN') <> 10
     or not exists (select 1 from core.officials where ittf_ump_id = '12022' and family_name = 'MOHANA SASIDHARAN' and first_name = 'Bindu') then
    raise exception '12022: откат не прошёл';
  end if;
end $$;
