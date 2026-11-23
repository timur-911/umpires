-- IU 08623: в фамилии дублировалось личное имя, поэтому и на сайте, и в адресе
-- профиля имя читалось дважды («Nur Asmara Diana NUR ASMARA DIANA BT ABDULLAH»).
-- Решение владельца 23.11.2026: first_name = «Nur Asmara Diana», family_name = «BT ABDULLAH».
-- Условие по прежнему значению: повторный прогон ничего не делает.
update core.officials
   set family_name = 'BT ABDULLAH',
       notes = concat_ws(E'\n', notes,
         'Фамилия до 23.11.2026: "NUR ASMARA DIANA BT ABDULLAH" — личное имя дублировалось внутри фамилии (так записано и в списках ITTF). Исправлено по решению владельца.')
 where ittf_ump_id = '08623'
   and family_name = 'NUR ASMARA DIANA BT ABDULLAH';
