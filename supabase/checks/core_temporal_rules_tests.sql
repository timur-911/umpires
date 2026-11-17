-- =====================================================================
--  UMPIR.ES — тесты правил временной модели core (миграция 20261117140839)
--
--  ЗАПУСКАТЬ ТОЛЬКО НА ТЕСТОВОЙ КОПИИ БАЗЫ, НЕ НА РАБОЧЕЙ: скрипт добавляет
--  тестовые категории и человека с номером IU 10001.
--  Порядок: схема (umpires_schema_*.sql) -> миграция -> этот файл:
--    psql -tA -f core_temporal_rules_tests.sql
--  Каждая строка результата — PASS или FAIL. Каждый тест выполняется в
--  подтранзакции и откатывается; отложенные проверки вызываются через
--  set constraints all immediate.
--  17.11.2026: 17 из 17 PASS на PostgreSQL 16.
-- =====================================================================
\set QUIET 1
insert into core.categories (code,name,line,level_order) values ('WB','White','ump',1),('BB','Blue','ump',2),('GB','Gold','ump',3),('IR','IR','ref',1),('IRA','IR Adv','ref',2) on conflict do nothing;
insert into core.officials (ittf_ump_id, family_name) values ('10001','TEST');

create function pg_temp.t(p_name text, p_sql text, p_expect text) returns text language plpgsql as $f$
declare st text;
begin
  begin
    execute p_sql;
    execute 'set constraints all immediate';
    raise exception using errcode = 'XX999', message = 'accepted';
  exception when others then st := sqlstate;
  end;
  if (p_expect is null and st = 'XX999') or st = p_expect then return 'PASS  ' || p_name;
  end if;
  return 'FAIL  ' || p_name || '  (получено ' || st || case when st='XX999' then ' = принято' else '' end || ', ожидалось ' || coalesce(p_expect,'принять') || ')';
end $f$;

create function pg_temp.ins(seq int, cat text, df text, dt text, eu boolean default false, line text default 'ump') returns text language sql as $f$
  select format('insert into core.official_categories (official_id,cat_code,line,seq,date_from,from_precision,date_to,to_precision,end_unknown) values ((select id from core.officials where ittf_ump_id=''10001''), %L, %L, %s, %s, %s, %s, %s, %L);',
    cat, line, seq, coalesce(quote_literal(df)||'::date','null'), case when df is null then 'null' else '''day''' end,
    coalesce(quote_literal(dt)||'::date','null'), case when dt is null then 'null' else '''day''' end, eu)
$f$;

select pg_temp.t('1. пересекающиеся периоды отклоняются',
  pg_temp.ins(1,'WB','2010-01-01','2015-01-01') || pg_temp.ins(2,'BB','2014-06-01',null), '23P01');
select pg_temp.t('2. соседние периоды с общей границей принимаются',
  pg_temp.ins(1,'WB','2010-01-01','2015-01-01') || pg_temp.ins(2,'BB','2015-01-01',null), null);
select pg_temp.t('3a. однодневный период принимается',
  pg_temp.ins(1,'WB','2010-01-01','2010-01-02') || pg_temp.ins(2,'BB','2010-01-02',null), null);
select pg_temp.t('3b. период нулевой длины отклоняется',
  pg_temp.ins(1,'WB','2010-01-01','2010-01-01'), '23514');
select pg_temp.t('4a. неизвестное начало: пересечение с последним днём отклоняется',
  pg_temp.ins(1,'WB','2010-01-01','2014-12-31') || pg_temp.ins(2,'BB',null,'2015-01-01') || pg_temp.ins(3,'GB','2014-12-31',null), '23P01');
select pg_temp.t('4b. неизвестное начало: как в данных (WB ?, BB ?..дата, GB) принимается',
  pg_temp.ins(1,'WB','2010-01-01',null,true) || pg_temp.ins(2,'BB',null,'2022-10-01') || pg_temp.ins(3,'GB','2022-10-01',null), null);
select pg_temp.t('5a. end_unknown: следующий период в тот же день отклоняется',
  pg_temp.ins(1,'WB','2010-01-01',null,true) || pg_temp.ins(2,'BB','2010-01-01',null), '23P01');
select pg_temp.t('5b. end_unknown не считается текущим (нет в v_current_categories)',
  pg_temp.ins(1,'WB','2010-01-01',null,true) || 'do $$ begin if exists (select 1 from core.v_current_categories) then raise exception using errcode=''XX001''; end if; end $$;', null);
select pg_temp.t('6. два открытых периода в линии отклоняются',
  pg_temp.ins(1,'WB','2010-01-01',null) || pg_temp.ins(2,'BB',null,null), '23505');
select pg_temp.t('7. будущее начало: открытый период не текущий сегодня',
  pg_temp.ins(1,'WB','2010-01-01','2099-01-01') || pg_temp.ins(2,'BB','2099-01-01',null) || 'do $$ begin if exists (select 1 from core.v_current_categories) then raise exception using errcode=''XX001''; end if; end $$;', null);
select pg_temp.t('8a. seq против хронологии отклоняется',
  pg_temp.ins(1,'BB','2015-01-01',null) || pg_temp.ins(2,'WB','2010-01-01','2015-01-01'), '23514');
select pg_temp.t('8b. seq = 0 отклоняется',
  pg_temp.ins(0,'WB','2010-01-01',null), '23514');
select pg_temp.t('8c. период без дат не последним отклоняется',
  pg_temp.ins(1,'IR',null,null,false,'ref') || pg_temp.ins(2,'IRA','2015-01-01','2016-01-01',false,'ref'), '23514');
select pg_temp.t('8d. IR с годом, затем IRA без дат (как в данных) принимается',
  pg_temp.ins(1,'IR','2003-01-01',null,true,'ref') || pg_temp.ins(2,'IRA',null,null,false,'ref'), null);
select pg_temp.t('8e. перенумерация в одной транзакции (как в миграциях) принимается',
  pg_temp.ins(1,'WB','2010-01-01','2015-01-01') || pg_temp.ins(2,'BB','2015-01-01',null) ||
  'update core.official_categories set seq = seq + 10; update core.official_categories set seq = seq - 10;', null);
select pg_temp.t('9a. кандидатство закрыто раньше начала — отклоняется',
  'insert into core.candidacies (official_id,target_cat,since,closed_on) values ((select id from core.officials where ittf_ump_id=''10001''),''BB'',''2020-05-01'',''2020-04-01'');', '23514');
select pg_temp.t('9b. назначение кончается раньше начала — отклоняется',
  'insert into core.appointments (official_id,appt_type,date_from,date_to) values ((select id from core.officials where ittf_ump_id=''10001''),''Mentor'',''2020-05-01'',''2020-04-01'');', '23514');
