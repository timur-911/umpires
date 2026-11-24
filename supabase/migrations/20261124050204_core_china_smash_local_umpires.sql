-- Решение владельца 24.11.2026: на WTT CHINA SMASH 2026 (1–11 октября) добавлены
-- двое китайских судей, работавших 1–5 октября. Источник — куратор, как у местных
-- судей Монпелье и Франкфурта (sources 69, 71).
-- Категория на момент турнира по core.official_categories: 20409 — BB (с 09.10.2025), 16113 — WB.
with s as (
  insert into core.sources (source_type, publisher, title, site_idx, notes)
  values ('curator', 'UMPIR.ES curator',
          'WTT China Smash 2026: local (Chinese) umpires, 1–5 October (24.11.2026)',
          24,
          'Со слов владельца: IU 20409 ZHOU Yi и 16113 WANG Haiyan работали на турнире только 1–5 октября.')
  returning id
)
insert into core.assignments (event_id, official_id, role_code, badge_at_event, status, date_from, date_to, site_part, site_idx, source_id)
select 129, o.id, 'Umpire', b.badge, 'assigned', date '2026-10-01', date '2026-10-05', 'ua', b.idx, s.id
from s
cross join (values ('20409','BB',1223), ('16113','WB',1224)) as b(iu, badge, idx)
join core.officials o on o.ittf_ump_id = b.iu;
