-- =====================================================================
--  UMPIR.ES — до шага 3: две поздние правки имён и BBQ дословно (16.11.2026)
--  См. claude/core-step3-risks.md, п. 1 и «Правило сборки для шага 3».
--
--  1. Правки имён, сделанные в catalog 16.11.2026 после снимка core
--     (решение владельца): 02660 «Hermógenes T.», 10409 «KADLČÁKOVÁ».
--     Прежние написания — следствие испорченной кодировки PDF ITTF,
--     поэтому в name_aliases не сохраняются.
--  2. BBQ (самая ранняя «Qualified on» по спискам Blue Badge 01.01.2024 –
--     01.10.2026) хранится дословно: запись в ittf_list_entries источника
--     «Blue Badge Umpires lists …» с listed_extra.qualified_on. Начало периода
--     BB в official_categories может отличаться — это другое поле.
-- =====================================================================

update core.officials set first_name = 'Hermógenes T.' where ittf_ump_id = '02660' and first_name = 'Hermógenes T';
update core.officials set family_name = 'KADLČÁKOVÁ'   where ittf_ump_id = '10409' and family_name = 'KADLČÍKOVÁ';

update core.ittf_list_entries le set listed_first = 'Hermógenes T.'
from core.officials f, core.sources s
where le.official_id = f.id and le.source_id = s.id and s.list_kind = 'active_iu'
  and f.ittf_ump_id = '02660' and le.listed_first = 'Hermógenes T';
update core.ittf_list_entries le set listed_family = 'KADLČÁKOVÁ'
from core.officials f, core.sources s
where le.official_id = f.id and le.source_id = s.id and s.list_kind = 'active_iu'
  and f.ittf_ump_id = '10409' and le.listed_family = 'KADLČÍKOVÁ';

insert into core.ittf_list_entries (source_id, official_id, listed_family, listed_first, listed_cat, listed_extra)
select (select id from core.sources where list_kind = 'bb_list' and title like 'Blue Badge Umpires lists%'),
       f.id, f.family_name, f.first_name, 'BB', jsonb_build_object('qualified_on', t.v)
from jsonb_each_text((select data from public.catalog where key = 'BBQ')) t(k, v)
join core.officials f on f.ittf_ump_id = lpad(t.k, 5, '0');

do $$
declare n int; m int;
begin
  select count(*) into n from core.officials where (ittf_ump_id = '02660' and first_name = 'Hermógenes T.') or (ittf_ump_id = '10409' and family_name = 'KADLČÁKOVÁ');
  if n <> 2 then raise exception 'правки имён: ожидалось 2, получено %', n; end if;
  select count(*) into m from core.ittf_list_entries le join core.sources s on s.id = le.source_id where s.title like 'Blue Badge Umpires lists%';
  if m <> 343 then raise exception 'BBQ: ожидалось 343 записи, получено %', m; end if;
end $$;

insert into core.load_report values
  ('BBQ verbatim -> ittf_list_entries', 343, 343, 'добавлено 16.11.2026: listed_extra.qualified_on, источник «Blue Badge Umpires lists 01.01.2024 – 01.10.2026»')
on conflict (item) do nothing;
