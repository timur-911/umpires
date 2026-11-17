-- Население ассоциаций ITTF для удельного числа судей на страницах стран (решение владельца 17.11.2026).
-- Источник: UN World Population Prospects 2024 (1 July 2023); Англия, Шотландия, Уэльс — ONS mid-2023;
-- Ireland — всеостровная ассоциация: Ирландия (UN) + Северная Ирландия (ONS); Bonaire — CBS 1.01.2024; Norfolk Island — перепись ABS 2021.
create table if not exists core.association_population (
  association_id integer primary key references core.associations(id) on delete cascade,
  population     bigint  not null check (population > 0),
  ref_year       integer not null,
  source         text    not null,
  note           text,
  updated_at     timestamptz not null default now()
);
alter table core.association_population enable row level security;
comment on table core.association_population is 'Население территории ассоциации ITTF; на сайт — ключ POP справочника';

insert into core.association_population (association_id, population, ref_year, source, note)
select a.id, v.population, v.ref_year, v.source, v.note
from (values
  ('AFG',41454761,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ALB',2811655,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ALG',46164219,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ASA',47521,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('AND',80856,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ANG',36749906,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('AIA',14410,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ANT',93316,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ARG',45538401,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ARM',2943393,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ARU',107939,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('AUS',26451124,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('AUT',9130429,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('AZE',10318207,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BAH',399440,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BRN',1569666,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BAN',171466990,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BAR',282336,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BLR',9115680,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BEL',11712893,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BIZ',411106,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BEN',14111034,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BER',64698,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BHU',786385,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BOL',12244159,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BIH',3185073,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BOT',2480244,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BRA',211140729,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('IVB',38985,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BRU',458949,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BUL',6795803,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BUR',23025776,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('BDI',13689450,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CAM',17423880,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CMR',28372687,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CAN',39299105,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CPV',522331,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CAY',73038,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CAF',5152421,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CHA',19319064,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CHI',19658835,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CHN',1422584933,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TPE',23317145,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('COL',52321152,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('COM',850387,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CGO',6182885,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('COD',105789731,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('COK',14222,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CRC',5105525,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CIV',31165654,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CRO',3896023,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CUB',11019931,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CUW',185427,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CYP',1344976,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('CZE',10809716,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PRK',26418204,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('DEN',5948136,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('DJI',1152944,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('DMA',66510,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('DOM',11331265,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TLS',1384286,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ECU',17980083,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('EGY',114535772,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ESA',6309624,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GEQ',1847549,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ERI',3470390,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('EST',1367196,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SWZ',1230506,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ETH',128691692,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('FLK',3477,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('FRO',54714,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('FIJ',924145,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('FIN',5601185,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('FRA',66438822,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GAB',2484789,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GAM',2697845,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GEO',3807492,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GER',84548231,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GHA',33787914,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GIB',38471,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GRE',10242908,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GRL',55922,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GRN',117081,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GUM',166506,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GUA',18124838,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GGY',64017,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GUI',14405465,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GBS',2153339,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('GUY',826353,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('HAI',11637398,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('HON',10644851,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('HKG',7442734,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('HUN',9686463,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ISL',387558,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('IND',1438069596,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('INA',281190067,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('IRI',90608707,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('IRQ',45074049,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('IMN',84165,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ISR',9256314,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ITA',59499453,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('JAM',2839786,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('JPN',124370947,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('JEY',103674,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('JOR',11439213,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KAZ',20330104,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KEN',55339003,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KIR',132530,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KOS',1700031,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KUW',4838782,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KGZ',7073516,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LAO',7664993,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LAT',1882396,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LBN',5733493,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LES',2311472,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LBR',5493031,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LBA',7305659,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LIE',39598,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LTU',2854099,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LUX',665098,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MAC',713912,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MAD',31195932,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MAW',21104482,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MAS',35126298,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MDV',525994,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MLI',23769127,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MLT',532956,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MHL',38827,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MTN',5022441,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MRI',1273588,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MEX',129739759,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('FSM',112630,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MDA',3067070,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MON',38956,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MGL',3431932,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MNE',633552,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MAR',37712505,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MOZ',33635160,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MYA',54133798,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NAM',2963095,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NRU',11875,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NEP',29964614,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NED',18092524,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NCL',289870,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NZL',5172836,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NCA',6823613,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NIG',26159867,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NGR',227882945,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NIU',1817,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MKD',1831802,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MNP',45143,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('NOR',5519167,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('OMA',5049269,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PAK',247504495,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PLW',17727,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PLE',5409202,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PAN',4458759,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PNG',10389635,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PAR',6844146,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PER',33845617,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PHI',114891199,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('POL',38762844,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('POR',10430738,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PUR',3242023,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('QAT',2979082,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KOR',51748739,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ROU',19118479,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('RUS',145440500,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('RWA',13954471,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SKN',46758,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SAM',216663,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SMR',33733,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('STP',230871,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('KSA',32264292,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SEN',18077573,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SRB',6773201,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SEY',127951,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SLE',8460512,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SGP',5789090,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SVK',5518055,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SLO',2118396,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SOL',800005,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SOM',18358615,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('RSA',63212384,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SSD',11483374,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ESP',47911579,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SRI',22971617,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('LCA',179285,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('MAF',42749,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('VIN',101323,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SUD',50042791,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SUR',628886,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SWE',10551494,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SUI',8870561,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('SYR',23594623,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('PYF',281118,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TJK',10389799,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TAN',66617606,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('THA',71702435,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TOG',9304337,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TKL',2397,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TGA',104597,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TTO',1502932,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TUN',12200431,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TUR',87270501,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TKM',7364438,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('TUV',9816,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('UGA',48656601,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('UKR',37732836,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('UAE',10642081,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('USA',343477335,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('URU',3388081,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ISV',85701,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('UZB',35652307,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('VAN',320409,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('VEN',28300854,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('VIE',100352192,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('WLF',11370,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('YEM',39390799,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ZAM',20723965,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ZIM',16340822,2023,'UN World Population Prospects 2024, 1 July 2023',null),
  ('ENG',57690300,2023,'ONS mid-2023 population estimates (UK nations)',null),
  ('SCO',5490100,2023,'ONS mid-2023 population estimates (UK nations)',null),
  ('WAL',3164400,2023,'ONS mid-2023 population estimates (UK nations)',null),
  ('IRL',7117030,2023,'UN WPP 2024 (Ireland, 1 July 2023) + ONS mid-2023 (Northern Ireland)','all-island association: Ireland and Northern Ireland'),
  ('BES',25133,2024,'Statistics Netherlands (CBS), 1 January 2024','Bonaire only'),
  ('NFK',2188,2021,'Australian Bureau of Statistics, 2021 Census',null)
) as v(code, population, ref_year, source, note)
join core.associations a on a.ittf_code = v.code and a.is_ittf_member
on conflict (association_id) do update set population=excluded.population, ref_year=excluded.ref_year, source=excluded.source, note=excluded.note, updated_at=now();

-- POP: {код ассоциации: население} только для членов ITTF
create or replace function core.build_pop() returns jsonb language sql stable set search_path to '' as $$
  select coalesce(jsonb_object_agg(trim(a.ittf_code), p.population order by a.ittf_code), '{}'::jsonb)
  from core.association_population p join core.associations a on a.id = p.association_id
  where a.is_ittf_member
$$;

create or replace function core.build_catalog() returns table(key text, data jsonb) language sql stable set search_path to '' as $function$
  select 'DATA', core.build_data()
  union all select 'EV', core.build_ev()
  union all select 'OLY', core.build_games('oly')
  union all select 'PARA', core.build_games('para')
  union all select 'OLY_NAMES', core.build_oly_names()
  union all select 'BBQ', core.build_bbq()
  union all select 'GBH', core.build_gbh()
  union all select 'GANTT', core.build_gantt()
  union all select 'REF_IU', core.build_ref_iu()
  union all select 'POP', core.build_pop()
$function$;

-- публикация: 10 ключей; ключ, которого ещё нет в public.catalog, добавляется
create or replace function core.publish_catalog() returns table(key text, changed boolean) language plpgsql set search_path to '' as $function$
declare v_at timestamptz := now();
begin
  perform core.refresh_catalog_built();
  if (select count(*) from core.catalog_built) <> 10 then
    raise exception 'сборка неполная: % ключей вместо 10', (select count(*) from core.catalog_built);
  end if;
  insert into core.catalog_site_backup (key, data, taken_at)
  select c.key, c.data, v_at from public.catalog c
  join core.catalog_built b on b.key = c.key where b.data is distinct from c.data;
  return query
    with upd as (
      update public.catalog c set data = b.data
      from core.catalog_built b where b.key = c.key and b.data is distinct from c.data
      returning c.key),
    ins as (
      insert into public.catalog as pc (key, data)
      select b.key, b.data from core.catalog_built b
      where not exists (select 1 from public.catalog c where c.key = b.key)
      returning pc.key)
    select b.key, b.key in (select u.key from upd u) or b.key in (select i.key from ins i) from core.catalog_built b order by b.key;
end $function$;
