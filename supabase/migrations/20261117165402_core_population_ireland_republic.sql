-- Ireland: только Республика Ирландия (решение владельца 17.11.2026), без Северной Ирландии.
update core.association_population p
set population = 5196630, ref_year = 2023,
    source = 'UN World Population Prospects 2024, 1 July 2023',
    note = 'Republic of Ireland only (owner decision 17.11.2026)', updated_at = now()
from core.associations a
where a.id = p.association_id and a.ittf_code = 'IRL';
