-- UMPIR.ES — Mediterranean Games 2026: метка по фактическому месту (26.11.2026).
-- Решение владельца, отменяющее вчерашнее «по городу Игр»: настольный теннис
-- Игр шёл в Массафре (35 км от Таранто), и так точнее. Город Игр Taranto был
-- заведён только ради этого турнира, поэтому удаляется, если больше ни с чем
-- не связан — в справочник GEO попадают только города, у которых есть турниры.

insert into core.cities (name_en, country_code, latitude, longitude, coord_source)
values ('Massafra','IT',40.5862,17.1164,'GeoNames cities1000; решение владельца 26.11.2026 — метка по месту соревнований')
on conflict (name_en, country_code) do nothing;

update core.events e set city_id = c.id, updated_at = now()
from core.cities c
where c.name_en = 'Massafra' and c.country_code = 'IT' and e.site_idx = 107;

delete from core.cities c
where c.name_en = 'Taranto' and c.country_code = 'IT'
  and not exists (select 1 from core.events e where e.city_id = c.id);

do $$
declare n int; nm text;
begin
  select count(*) into n from core.events where city_id is null;
  if n > 0 then raise exception 'у % событий нет города', n; end if;
  select c.name_en into nm from core.events e join core.cities c on c.id = e.city_id where e.site_idx = 107;
  if nm is distinct from 'Massafra' then raise exception 'у Mediterranean Games город %, а не Massafra', nm; end if;
  if exists (select 1 from core.cities where name_en = 'Taranto') then raise exception 'Taranto остался в core.cities'; end if;
end $$;
