-- Годы первоначального вступления в ITTF (данные владельца 17.11.2026): Mexico 1968 (femeteme.com), Indonesia 1961 (источник не указан).
update core.associations set ittf_since = 1968,
  ittf_since_note = 'Original ITTF membership 1968 (femeteme.com, per owner 17.11.2026); ITTF Directory gives 2026 (re-admission)', updated_at = now()
where ittf_code = 'MEX';
update core.associations set ittf_since = 1961,
  ittf_since_note = 'Original ITTF membership 1961 (per owner 17.11.2026, no source); ITTF Directory gives 2025 (re-admission)', updated_at = now()
where ittf_code = 'INA';
