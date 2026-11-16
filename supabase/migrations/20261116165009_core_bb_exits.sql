-- =====================================================================
--  UMPIR.ES — до шага 3: 55 бывших Blue Badge и BEN ATTIA (16.11.2026)
--  См. claude/core-step3-risks.md («Разбор 16.11.2026»).
--
--  1. 55 человек, у которых в BBQ есть дата Blue Badge, а в core — только WB.
--     По 7 спискам ITTF Blue Badge (01.01.2024 … 01.10.2026; разбор субагентом,
--     перепроверен отдельно) у каждого найден последний список с ним и первый
--     список без него. История: WB с года IU -> BB с даты BBQ -> WB с первого
--     списка без человека (точность 'list'). 48 из них в активном списке IU 2026
--     как White Badge — у них последний WB текущий; у 7 вне активного списка
--     текущая категория неизвестна (end_unknown).
--     43 человека последний раз есть в списке 01.01.2024, а в папке нет списков
--     Blue Badge за 2024 – начало 2025: переход был между 01.01.2024 и 01.07.2025.
--     08501 DIAZ: есть в 01.01.2024 и 01.10.2025, но не в 01.07.2025 — выход взят
--     после 01.10.2025.
--  2. BEN ATTIA (16367): GB не терял — добровольная пауза в списке 06.2025–01.2026
--     (решение куратора 16.11.2026). В core один непрерывный период GB с 10.2022.
--     Разрывы у 14604 JIA (настоящий, решение куратора) и 08022 COLLDEFORN
--     (не подтверждено) не трогаем.
-- =====================================================================

create temp table t_exit (iu text, last_list date, exit_list date);
insert into t_exit values
 ('00807', date '2024-01-01', date '2025-07-01'), ('02239', date '2025-10-01', date '2026-01-01'), ('02637', date '2024-01-01', date '2025-07-01'), ('02642', date '2024-01-01', date '2025-07-01'), ('04009', date '2024-01-01', date '2025-07-01'), ('04107', date '2024-01-01', date '2025-07-01'), ('04507', date '2024-01-01', date '2025-07-01'), ('04701', date '2024-01-01', date '2025-07-01'), ('04713', date '2025-10-01', date '2026-01-01'), ('05008', date '2024-01-01', date '2025-07-01'), ('06215', date '2024-01-01', date '2025-07-01'), ('06303', date '2024-01-01', date '2025-07-01'), ('06311', date '2024-01-01', date '2025-07-01'), ('06411', date '2024-01-01', date '2025-07-01'), ('06523', date '2025-10-01', date '2026-01-01'), ('06609', date '2025-10-01', date '2026-01-01'), ('06628', date '2024-01-01', date '2025-07-01'), ('08501', date '2025-10-01', date '2026-01-01'), ('08505', date '2024-01-01', date '2025-07-01'), ('10002', date '2024-01-01', date '2025-07-01'), ('10049', date '2024-01-01', date '2025-07-01'), ('10106', date '2025-10-01', date '2026-01-01'), ('10206', date '2024-01-01', date '2025-07-01'), ('10207', date '2025-10-01', date '2026-01-01'), ('10241', date '2024-01-01', date '2025-07-01'), ('10311', date '2025-10-01', date '2026-01-01'), ('10329', date '2024-01-01', date '2025-07-01'), ('10334', date '2024-01-01', date '2025-07-01'), ('10527', date '2024-01-01', date '2025-07-01'), ('10626', date '2025-10-01', date '2026-01-01'), ('10918', date '2024-01-01', date '2025-07-01'), ('12103', date '2024-01-01', date '2025-07-01'), ('12315', date '2024-01-01', date '2025-07-01'), ('12508', date '2024-01-01', date '2025-07-01'), ('12820', date '2024-01-01', date '2025-07-01'), ('14721', date '2025-10-01', date '2026-01-01'), ('14723', date '2024-01-01', date '2025-07-01'), ('14728', date '2025-10-01', date '2026-01-01'), ('14806', date '2024-01-01', date '2025-07-01'), ('14920', date '2024-01-01', date '2025-07-01'), ('16228', date '2024-01-01', date '2025-07-01'), ('80191', date '2024-01-01', date '2025-07-01'), ('80910', date '2024-01-01', date '2025-07-01'), ('84350', date '2024-01-01', date '2025-07-01'), ('90878', date '2024-01-01', date '2025-07-01'), ('90967', date '2024-01-01', date '2025-07-01'), ('92515', date '2025-10-01', date '2026-01-01'), ('92803', date '2024-01-01', date '2025-07-01'), ('94224', date '2024-01-01', date '2025-07-01'), ('94325', date '2024-01-01', date '2025-07-01'), ('94716', date '2024-01-01', date '2025-07-01'), ('94727', date '2024-01-01', date '2025-07-01'), ('96414', date '2024-01-01', date '2025-07-01'), ('98705', date '2024-01-01', date '2025-07-01'), ('98711', date '2024-01-01', date '2025-07-01');

create temp table t_p as
select f.id official_id, f.ittf_ump_id iu, f.iu_exam_year, (le.listed_extra->>'qualified_on')::date bb, e.last_list, e.exit_list,
       exists (select 1 from core.ittf_list_entries a join core.sources s on s.id = a.source_id and s.list_kind = 'active_iu'
               where a.official_id = f.id and a.listed_cat = 'WB') in_active_wb
from t_exit e
join core.officials f on f.ittf_ump_id = e.iu
join core.ittf_list_entries le on le.official_id = f.id
join core.sources sb on sb.id = le.source_id and sb.title like 'Blue Badge Umpires lists%';

do $$
declare n int;
begin
  select count(*) into n from t_p; if n <> 55 then raise exception 'ожидалось 55, найдено %', n; end if;
  select count(*) into n from t_p where bb < make_date(iu_exam_year,1,1) or bb >= exit_list or bb > last_list;
  if n > 0 then raise exception 'дата BB вне допустимого диапазона у % чел.', n; end if;
  select count(*) into n from core.official_categories c join t_p p using (official_id) where c.line = 'ump' and c.cat_code <> 'WB';
  if n > 0 then raise exception 'у % записей уже есть не-WB периоды', n; end if;
end $$;

alter table core.official_categories drop constraint official_cat_seq_uq;

delete from core.official_categories c using t_p p where c.official_id = p.official_id and c.line = 'ump';

insert into core.official_categories (official_id, cat_code, line, seq, date_from, from_precision, date_to, to_precision, end_unknown, source_id, notes)
select p.official_id, 'WB', 'ump', 1, make_date(p.iu_exam_year,1,1), 'year', p.bb, 'day', false,
       (select source_id from core.officials where id = p.official_id), 'WB с года IU по номеру'
from t_p p
union all
select p.official_id, 'BB', 'ump', 2, p.bb, 'day', p.exit_list, 'list', false,
       (select id from core.sources where title like 'Blue Badge Umpires lists%'),
       'Последний список Blue Badge с этим судьёй — ' || to_char(p.last_list,'DD.MM.YYYY') || '; в ' || to_char(p.exit_list,'DD.MM.YYYY') || ' его нет'
       || case when p.last_list = date '2024-01-01' then '. Списков Blue Badge между 01.01.2024 и 01.07.2025 в папке нет' else '' end
       || case when p.iu = '08501' then '. В списке 01.07.2025 его тоже нет' else '' end
from t_p p
union all
select p.official_id, 'WB', 'ump', 3, p.exit_list, 'list', null, null, not p.in_active_wb,
       (select id from core.sources where list_kind = 'active_iu'),
       case when p.in_active_wb then 'Вернулся в White Badge, выбыв из списка Blue Badge; White Badge в активном списке IU 2026'
            else 'Выбыл из списка Blue Badge; текущая категория неизвестна (нет в активном списке IU 2026)' end
from t_p p;

-- BEN ATTIA (16367): GB не терял — добровольная пауза в списке (решение куратора 16.11.2026).
-- Один непрерывный период GB с октября 2022 года; BB в паузе и второй период GB убираются.
delete from core.official_categories c using core.officials f
where c.official_id = f.id and f.ittf_ump_id = '16367' and c.line = 'ump'
  and ((c.cat_code = 'BB' and c.date_from = date '2025-06-20')
    or (c.cat_code = 'GB' and c.date_from = date '2026-01-01'));
update core.official_categories c set date_to = null, to_precision = null,
       notes = 'GB не терял: добровольно устранился из списка (официально объявлено), пауза в списке с 06.2025 по 01.2026; дата GB — первоначальная, October 2022 (решение куратора 16.11.2026)'
from core.officials f
where c.official_id = f.id and f.ittf_ump_id = '16367' and c.cat_code = 'GB' and c.date_from = date '2022-10-01';
do $$ begin
  if (select count(*) from core.official_categories c join core.officials f on f.id = c.official_id
      where f.ittf_ump_id = '16367' and c.cat_code = 'GB') <> 1 then
    raise exception 'BEN ATTIA: ожидался один период GB';
  end if;
end $$;

-- порядок периодов заново
update core.official_categories c set seq = s.rn
from (select id, row_number() over (partition by official_id, line
        order by coalesce(date_from, date_to) nulls last, (date_from is null) desc, id) rn
      from core.official_categories) s
where s.id = c.id;
alter table core.official_categories add constraint official_cat_seq_uq unique (official_id, line, seq);

drop table t_exit, t_p;
