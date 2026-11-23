-- IU 08623, расшифровка списков ITTF. В самом PDF «List of Active International
-- Umpires 01.01.2026» одна колонка Name, и строка там такая:
--   8623 NUR ASMARA DIANA BT ABDULLAH MALAYSIA
-- Имя напечатано целиком одним полем; на listed_family и listed_first его
-- разделил наш разбор, причём в фамилию попала вся строка, а в имя — её часть,
-- поэтому сайт показывал «Nur Asmara Diana NUR ASMARA DIANA BT ABDULLAH».
-- Решение владельца 23.11.2026: first = «Nur Asmara Diana», family = «BT ABDULLAH»
-- (малайское «bt» — binti, «дочь»; Abdullah — имя отца).
-- Это исправление нашей расшифровки, а не подмена источника: сам текст списка
-- остаётся таким, как напечатан.
-- Условие по прежнему значению: повторный прогон ничего не делает.
update core.ittf_list_entries le
   set listed_family = 'BT ABDULLAH'
 where le.official_id = (select id from core.officials where ittf_ump_id = '08623')
   and le.listed_family = 'NUR ASMARA DIANA BT ABDULLAH';
