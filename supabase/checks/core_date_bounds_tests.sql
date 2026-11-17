-- =====================================================================
--  UMPIR.ES — тесты диапазонов неопределённости дат (миграция 20261117155024)
--
--  Можно запускать и на рабочей базе: всё выполняется в подтранзакциях и
--  откатывается; запрос всегда заканчивается ошибкой XX000, в тексте которой
--  результат — по строке PASS / FAIL на тест. Тестовый человек — IU 99999.
--  17.11.2026: 5 из 5 PASS на рабочей базе.
-- =====================================================================

do $$
declare st text; v_id int; res text := ''; r record;
begin
  for r in select * from (values
    ('A. day/month/year без границ — заполняются сами, переход согласован', null::text,
     $q$insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision,date_to,to_precision) values (%1$s,'WB','ump',1,'2010-01-01','year','2015-03-10','day'),(%1$s,'BB','ump',2,'2015-03-10','day',null,null);$q$),
    ('B. конец «месяц», начало следующего «день» — несогласованный переход отклоняется', '23514',
     $q$insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision,date_to,to_precision) values (%1$s,'WB','ump',1,'2010-01-01','year','2015-03-01','month'),(%1$s,'BB','ump',2,'2015-03-01','day',null,null);$q$),
    ('C. границы не охватывают дату — отклоняется', '23514',
     $q$insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision,from_not_before,from_not_after) values (%1$s,'WB','ump',1,'2010-01-01','year','2011-01-01','2011-12-31');$q$),
    ('D. переход «по списку», границы заданы с обеих сторон одинаково — принимается', null,
     $q$insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision,date_to,to_precision,to_not_before,to_not_after) values (%1$s,'BB','ump',1,'2010-05-05','day','2025-07-01','list','2024-01-02','2025-07-01');
        insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision,from_not_before,from_not_after) values (%1$s,'WB','ump',2,'2025-07-01','list','2024-01-02','2025-07-01');$q$),
    ('E. «по списку» только с одной стороны — отклоняется', '23514',
     $q$insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision,date_to,to_precision,to_not_before,to_not_after) values (%1$s,'BB','ump',1,'2010-05-05','day','2025-07-01','list','2024-01-02','2025-07-01');
        insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision) values (%1$s,'WB','ump',2,'2025-07-01','list');$q$)
  ) t(name, expect, sql) loop
    begin
      insert into core.officials (ittf_ump_id, family_name) values ('99999', 'TEST') returning id into v_id;
      execute format(r.sql, v_id);
      set constraints all immediate;
      if r.name like 'A.%' and not exists (select 1 from core.official_categories where official_id = v_id and seq = 1
           and from_not_before = '2010-01-01' and from_not_after = '2010-12-31' and to_not_before = '2015-03-10' and to_not_after = '2015-03-10') then
        raise exception using errcode = 'XX001', message = 'границы не заполнены';
      end if;
      raise exception using errcode = 'XX999', message = 'accepted';
    exception when others then st := sqlstate;
    end;
    res := res || case when (r.expect is null and st = 'XX999') or st = r.expect then 'PASS ' else 'FAIL(' || st || ') ' end || r.name || E'\n';
  end loop;
  raise exception using errcode = 'XX000', message = res;
end $$;
