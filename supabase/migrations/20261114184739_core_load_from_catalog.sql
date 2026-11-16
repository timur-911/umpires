-- =====================================================================
--  UMPIR.ES — перенос данных из public.catalog в схему core, шаг 2 из 3
--  15.11.2026
--
--  Читает public.catalog (DATA, EV, OLY, OLY_NAMES, PARA, BBQ, GBH, GANTT,
--  REF_IU) и справочники, которые сейчас зашиты в app.js (ASSOC_X, CONT,
--  TRN, BBP_IU, NAME_NOW — вставлены ниже как есть, по коммиту 3fc736c).
--  public.catalog НЕ меняется. Загрузка одноразовая: при непустой core.officials
--  скрипт останавливается.
--  Итог переноса — в таблице core.load_report.
-- =====================================================================

create temp table t_assoc_x (pos int, name text, code text);
insert into t_assoc_x values
  (0, 'Afghanistan', 'AFG'),
  (1, 'American Samoa', 'ASA'),
  (2, 'Andorra', 'AND'),
  (3, 'Angola', 'ANG'),
  (4, 'Anguilla', 'AIA'),
  (5, 'Antigua and Barbuda', 'ANT'),
  (6, 'Armenia', 'ARM'),
  (7, 'Aruba', 'ARU'),
  (8, 'Bahamas', 'BAH'),
  (9, 'Bangladesh', 'BAN'),
  (10, 'Belize', 'BIZ'),
  (11, 'Bermuda', 'BER'),
  (12, 'Bhutan', 'BHU'),
  (13, 'Bonaire', 'BES'),
  (14, 'British Virgin Islands', 'IVB'),
  (15, 'Burkina Faso', 'BUR'),
  (16, 'Burundi', 'BDI'),
  (17, 'Cambodia', 'CAM'),
  (18, 'Cape Verde', 'CPV'),
  (19, 'Cayman Islands', 'CAY'),
  (20, 'Central Africa', 'CAF'),
  (21, 'Chad', 'CHA'),
  (22, 'Comoros', 'COM'),
  (23, 'Congo Brazzaville', 'CGO'),
  (24, 'Congo Democratic', 'COD'),
  (25, 'Cook Islands', 'COK'),
  (26, 'Dominica W.I.', 'DMA'),
  (27, 'East Timor', 'TLS'),
  (28, 'Equatorial Guinea', 'GEQ'),
  (29, 'Eritrea', 'ERI'),
  (30, 'Eswatini', 'SWZ'),
  (31, 'Ethiopia', 'ETH'),
  (32, 'Falkland Islands', 'FLK'),
  (33, 'Faroe Islands', 'FRO'),
  (34, 'Fiji', 'FIJ'),
  (35, 'Gabon', 'GAB'),
  (36, 'Gambia', 'GAM'),
  (37, 'Gibraltar', 'GIB'),
  (38, 'Greenland', 'GRL'),
  (39, 'Grenada', 'GRN'),
  (40, 'Guam', 'GUM'),
  (41, 'Guinea', 'GUI'),
  (42, 'Guinea-Bissau', 'GBS'),
  (43, 'Guyana', 'GUY'),
  (44, 'Haiti', 'HAI'),
  (45, 'Ireland', 'IRL'),
  (46, 'Isle of Man', 'IMN'),
  (47, 'Jersey', 'JEY'),
  (48, 'Kenya', 'KEN'),
  (49, 'Kiribati', 'KIR'),
  (50, 'Kyrgyzstan', 'KGZ'),
  (51, 'Laos', 'LAO'),
  (52, 'Liberia', 'LBR'),
  (53, 'Liechtenstein', 'LIE'),
  (54, 'Malawi', 'MAW'),
  (55, 'Mali', 'MLI'),
  (56, 'Malta', 'MLT'),
  (57, 'Marshall Islands', 'MHL'),
  (58, 'Mauritania', 'MTN'),
  (59, 'Mauritius', 'MRI'),
  (60, 'Micronesia', 'FSM'),
  (61, 'Moldova', 'MDA'),
  (62, 'Monaco', 'MON'),
  (63, 'Mozambique', 'MOZ'),
  (64, 'Namibia', 'NAM'),
  (65, 'Nauru', 'NRU'),
  (66, 'Niger', 'NIG'),
  (67, 'Niue', 'NIU'),
  (68, 'Norfolk Island', 'NFK'),
  (69, 'Northern Mariana Islands', 'MNP'),
  (70, 'Palau', 'PLW'),
  (71, 'Papua New Guinea', 'PNG'),
  (72, 'Rwanda', 'RWA'),
  (73, 'Saint Kitts and Nevis', 'SKN'),
  (74, 'Samoa', 'SAM'),
  (75, 'San Marino', 'SMR'),
  (76, 'Sao Tome and Principe', 'STP'),
  (77, 'Seychelles', 'SEY'),
  (78, 'Sierra Leone', 'SLE'),
  (79, 'Solomon Islands', 'SOL'),
  (80, 'Somalia', 'SOM'),
  (81, 'South Sudan', 'SSD'),
  (82, 'Sri Lanka', 'SRI'),
  (83, 'St. Lucia', 'LCA'),
  (84, 'St. Maarten', 'MAF'),
  (85, 'St. Vincent', 'VIN'),
  (86, 'Sudan', 'SUD'),
  (87, 'Suriname', 'SUR'),
  (88, 'Tahiti', 'PYF'),
  (89, 'Tajikistan', 'TJK'),
  (90, 'Tanzania', 'TAN'),
  (91, 'Togo', 'TOG'),
  (92, 'Tokelau', 'TKL'),
  (93, 'Tonga', 'TGA'),
  (94, 'Turkmenistan', 'TKM'),
  (95, 'Tuvalu', 'TUV'),
  (96, 'US Virgin Islands', 'ISV'),
  (97, 'Uruguay', 'URU'),
  (98, 'Uzbekistan', 'UZB'),
  (99, 'Vanuatu', 'VAN'),
  (100, 'Vietnam', 'VIE'),
  (101, 'Wallis and Futuna', 'WLF'),
  (102, 'Zimbabwe', 'ZIM');

create temp table t_cont (code text primary key, cont text);
insert into t_cont values
  ('AFG', 'AS'),
  ('AIA', 'AM'),
  ('ALB', 'EU'),
  ('ALG', 'AF'),
  ('AND', 'EU'),
  ('ANG', 'AF'),
  ('ANT', 'AM'),
  ('ARG', 'AM'),
  ('ARM', 'EU'),
  ('ARU', 'AM'),
  ('ASA', 'OC'),
  ('AUS', 'OC'),
  ('AUT', 'EU'),
  ('AZE', 'EU'),
  ('BAH', 'AM'),
  ('BAN', 'AS'),
  ('BAR', 'AM'),
  ('BDI', 'AF'),
  ('BEL', 'EU'),
  ('BEN', 'AF'),
  ('BER', 'AM'),
  ('BES', 'AM'),
  ('BHU', 'AS'),
  ('BIH', 'EU'),
  ('BIZ', 'AM'),
  ('BLR', 'EU'),
  ('BOL', 'AM'),
  ('BOT', 'AF'),
  ('BRA', 'AM'),
  ('BRN', 'AS'),
  ('BRU', 'AS'),
  ('BUL', 'EU'),
  ('BUR', 'AF'),
  ('CAF', 'AF'),
  ('CAM', 'AS'),
  ('CAN', 'AM'),
  ('CAY', 'AM'),
  ('CGO', 'AF'),
  ('CHA', 'AF'),
  ('CHI', 'AM'),
  ('CHN', 'AS'),
  ('CIV', 'AF'),
  ('CMR', 'AF'),
  ('COD', 'AF'),
  ('COK', 'OC'),
  ('COL', 'AM'),
  ('COM', 'AF'),
  ('CPV', 'AF'),
  ('CRC', 'AM'),
  ('CRO', 'EU'),
  ('CUB', 'AM'),
  ('CUW', 'AM'),
  ('CYP', 'EU'),
  ('CZE', 'EU'),
  ('DEN', 'EU'),
  ('DJI', 'AF'),
  ('DMA', 'AM'),
  ('DOM', 'AM'),
  ('ECU', 'AM'),
  ('EGY', 'AF'),
  ('ENG', 'EU'),
  ('ERI', 'AF'),
  ('ESA', 'AM'),
  ('ESP', 'EU'),
  ('EST', 'EU'),
  ('ETH', 'AF'),
  ('FIJ', 'OC'),
  ('FIN', 'EU'),
  ('FLK', 'AM'),
  ('FRA', 'EU'),
  ('FRO', 'EU'),
  ('FSM', 'OC'),
  ('GAB', 'AF'),
  ('GAM', 'AF'),
  ('GBS', 'AF'),
  ('GEO', 'EU'),
  ('GEQ', 'AF'),
  ('GER', 'EU'),
  ('GGY', 'EU'),
  ('GHA', 'AF'),
  ('GIB', 'EU'),
  ('GRE', 'EU'),
  ('GRL', 'EU'),
  ('GRN', 'AM'),
  ('GUA', 'AM'),
  ('GUI', 'AF'),
  ('GUM', 'OC'),
  ('GUY', 'AM'),
  ('HAI', 'AM'),
  ('HKG', 'AS'),
  ('HON', 'AM'),
  ('HUN', 'EU'),
  ('IMN', 'EU'),
  ('INA', 'AS'),
  ('IND', 'AS'),
  ('IRI', 'AS'),
  ('IRL', 'EU'),
  ('IRQ', 'AS'),
  ('ISL', 'EU'),
  ('ISR', 'EU'),
  ('ISV', 'AM'),
  ('ITA', 'EU'),
  ('IVB', 'AM'),
  ('JAM', 'AM'),
  ('JEY', 'EU'),
  ('JOR', 'AS'),
  ('JPN', 'AS'),
  ('KAZ', 'AS'),
  ('KEN', 'AF'),
  ('KGZ', 'AS'),
  ('KIR', 'OC'),
  ('KOR', 'AS'),
  ('KOS', 'EU'),
  ('KSA', 'AS'),
  ('KUW', 'AS'),
  ('LAO', 'AS'),
  ('LAT', 'EU'),
  ('LBA', 'AF'),
  ('LBN', 'AS'),
  ('LBR', 'AF'),
  ('LCA', 'AM'),
  ('LES', 'AF'),
  ('LIE', 'EU'),
  ('LTU', 'EU'),
  ('LUX', 'EU'),
  ('MAC', 'AS'),
  ('MAD', 'AF'),
  ('MAF', 'AM'),
  ('MAR', 'AF'),
  ('MAS', 'AS'),
  ('MAW', 'AF'),
  ('MDA', 'EU'),
  ('MDV', 'AS'),
  ('MEX', 'AM'),
  ('MGL', 'AS'),
  ('MHL', 'OC'),
  ('MKD', 'EU'),
  ('MLI', 'AF'),
  ('MLT', 'EU'),
  ('MNE', 'EU'),
  ('MNP', 'OC'),
  ('MON', 'EU'),
  ('MOZ', 'AF'),
  ('MRI', 'AF'),
  ('MTN', 'AF'),
  ('MYA', 'AS'),
  ('NAM', 'AF'),
  ('NCA', 'AM'),
  ('NCL', 'OC'),
  ('NED', 'EU'),
  ('NEP', 'AS'),
  ('NFK', 'OC'),
  ('NGR', 'AF'),
  ('NIG', 'AF'),
  ('NIU', 'OC'),
  ('NOR', 'EU'),
  ('NRU', 'OC'),
  ('NZL', 'OC'),
  ('OMA', 'AS'),
  ('PAK', 'AS'),
  ('PAN', 'AM'),
  ('PAR', 'AM'),
  ('PER', 'AM'),
  ('PHI', 'AS'),
  ('PLE', 'AS'),
  ('PLW', 'OC'),
  ('PNG', 'OC'),
  ('POL', 'EU'),
  ('POR', 'EU'),
  ('PRK', 'AS'),
  ('PUR', 'AM'),
  ('PYF', 'OC'),
  ('QAT', 'AS'),
  ('ROU', 'EU'),
  ('RSA', 'AF'),
  ('RUS', 'EU'),
  ('RWA', 'AF'),
  ('SAM', 'OC'),
  ('SCO', 'EU'),
  ('SEN', 'AF'),
  ('SEY', 'AF'),
  ('SGP', 'AS'),
  ('SKN', 'AM'),
  ('SLE', 'AF'),
  ('SLO', 'EU'),
  ('SMR', 'EU'),
  ('SOL', 'OC'),
  ('SOM', 'AF'),
  ('SRB', 'EU'),
  ('SRI', 'AS'),
  ('SSD', 'AF'),
  ('STP', 'AF'),
  ('SUD', 'AF'),
  ('SUI', 'EU'),
  ('SUR', 'AM'),
  ('SVK', 'EU'),
  ('SWE', 'EU'),
  ('SWZ', 'AF'),
  ('SYR', 'AS'),
  ('TAN', 'AF'),
  ('TGA', 'OC'),
  ('THA', 'AS'),
  ('TJK', 'AS'),
  ('TKL', 'OC'),
  ('TKM', 'AS'),
  ('TLS', 'AS'),
  ('TOG', 'AF'),
  ('TPE', 'AS'),
  ('TTO', 'AM'),
  ('TUN', 'AF'),
  ('TUR', 'EU'),
  ('TUV', 'OC'),
  ('UAE', 'AS'),
  ('UGA', 'AF'),
  ('UKR', 'EU'),
  ('URU', 'AM'),
  ('USA', 'AM'),
  ('UZB', 'AS'),
  ('VAN', 'OC'),
  ('VEN', 'AM'),
  ('VIE', 'AS'),
  ('VIN', 'AM'),
  ('WAL', 'EU'),
  ('WLF', 'OC'),
  ('YEM', 'AS'),
  ('ZAM', 'AF'),
  ('ZIM', 'AF');

create temp table t_trn (iu int, ir int, ev int, mt int);
insert into t_trn values
  (2661,0,0,1),
  (16367,22253,0,1),
  (0,12202,1,0),
  (0,2107,1,1),
  (0,12201,0,1),
  (0,99086,1,1),
  (0,99084,1,0),
  (0,13211,1,1),
  (0,96050,1,0),
  (0,96049,1,1),
  (0,6156,1,0),
  (6129,16222,1,1),
  (4009,23257,1,1),
  (0,1105,0,1),
  (0,3128,1,0),
  (88221,1093,1,0),
  (0,5152,0,1),
  (605,0,1,0),
  (0,12195,0,1),
  (8311,0,1,0),
  (0,15217,0,1),
  (0,1099,0,1),
  (0,3135,0,1),
  (10042,0,1,1),
  (0,11192,1,0),
  (0,17236,0,1),
  (0,22245,1,1),
  (0,9161,0,1),
  (92803,0,1,0),
  (0,9160,1,0),
  (10106,0,1,0),
  (0,96045,0,1);

create temp table t_bbp (iu int);
insert into t_bbp values (16318), (22526);

create temp table t_name_now (iu int, sur text, first text);
insert into t_name_now values (14809, 'VASINOVA', 'Karina');

-- ---------------------------------------------------------------------
--  Проверка: загрузка одноразовая
-- ---------------------------------------------------------------------
do $$ begin
  if exists (select 1 from core.officials) then
    raise exception 'core уже заполнена — перенос не повторяется';
  end if;
end $$;

alter table core.sources add column if not exists site_idx integer unique;
comment on column core.sources.site_idx is 'Позиция в EV.src';

-- ---------------------------------------------------------------------
--  Разбор public.catalog во временные таблицы
-- ---------------------------------------------------------------------

create temp table t_o as
select (i-1)::int k, (x->>0)::int iu, x->>1 sur, x->>2 first, (x->>3)::int cidx, (x->>4)::int lvl,
       nullif(x->>5,'') sex, nullif(x->>6,'') bb, nullif(x->>7,'') gb, nullif(x->>8,'') are, (x->>9)::int act
from public.catalog c, jsonb_array_elements(c.data->'o') with ordinality t(x,i) where c.key = 'DATA';

create temp table t_c as
select (i-1)::int pos, x->>0 name, x->>1 code
from public.catalog c, jsonb_array_elements(c.data->'c') with ordinality t(x,i) where c.key = 'DATA';

create temp table t_x as
select (i-1)::int k, x->>0 sur, x->>1 first, x->>2 cname, coalesce((x->>3)::int,-1) cidx, nullif(x->>4,'') csv,
       nullif(x->>5,'') code, coalesce((x->>6)::int,0) iux, (x->>7)::int flag
from public.catalog c, jsonb_array_elements(c.data->'x') with ordinality t(x,i) where c.key = 'EV';

create temp table t_ir as
select (i-1)::int k, (x->>0)::int ir, x->>1 sur, x->>2 first, (x->>3)::int cidx, nullif(x->>4,'') code,
       nullif(x->>5,'') cont, nullif(x->>6,'') sex, (x->>7)::int oidx, coalesce(nullif(x->>8,''),'A') st
from public.catalog c, jsonb_array_elements(c.data->'ir') with ordinality t(x,i) where c.key = 'EV';

create temp table t_ev as
select (i-1)::int k, x->>0 name, (x->>1)::date s, (x->>2)::date e, x->>3 type, nullif(x->>4,'') fed, nullif(x->>5,'') region
from public.catalog c, jsonb_array_elements(c.data->'ev') with ordinality t(x,i) where c.key = 'EV';

create temp table t_src as
select (i-1)::int k, x->>0 publisher, x->>1 title, nullif(x->>2,'') url
from public.catalog c, jsonb_array_elements(c.data->'src') with ordinality t(x,i) where c.key = 'EV';

create temp table t_ua as
select (i-1)::int k, (x->>0)::int ei, (x->>1)::int r, nullif(x->>2,'') lv,
       case when jsonb_typeof(x->3) = 'number' then (x->>3)::int end src,
       case when jsonb_typeof(x->4) = 'string' then x->>4 end note,
       nullif(x->>5,'')::date ds, nullif(x->>6,'')::date de, nullif(x->>7,'') urole
from public.catalog c, jsonb_array_elements(c.data->'ua') with ordinality t(x,i) where c.key = 'EV';

create temp table t_ra as
select (i-1)::int k, (x->>0)::int ei, x->1 r, x->>2 role,
       case when jsonb_typeof(x->3) = 'number' then (x->>3)::int end src,
       case when jsonb_typeof(x->4) = 'string' then x->>4 end note,
       nullif(x->>5,'')::date ds, nullif(x->>6,'')::date de
from public.catalog c, jsonb_array_elements(c.data->'ra') with ordinality t(x,i) where c.key = 'EV';

create temp table t_ref_iu as
select k::int ir, v::int iu from public.catalog c, jsonb_each_text(c.data) t(k,v) where c.key = 'REF_IU';

create temp table t_gantt as
select (i-1)::int k, (x->>0)::int iu, nullif(x->>1,'') sex, x->>2 name, (x->>3)::date s, nullif(x->>4,'')::date e,
       (x->>5)::int y, x->>6 code, x->>7 src
from public.catalog c, jsonb_array_elements(c.data) with ordinality t(x,i) where c.key = 'GANTT';

create temp table t_bbq as
select k::int iu, v::date d from public.catalog c, jsonb_each_text(c.data) t(k,v) where c.key = 'BBQ';

create temp table t_gev as
select (x->>0 || '-01')::date m, (x->>1)::int iu, x->>2 kind
from public.catalog c, jsonb_array_elements(c.data->'gev') x where c.key = 'GBH';

create temp table t_games as
select c.key part, t.k pkey, (y->>0)::int yr, y->>1 role, y->>2 src
from public.catalog c, jsonb_each(c.data) t(k,v), jsonb_array_elements(t.v) y where c.key in ('OLY','PARA');

create temp table t_oly_names as
select k pkey, v->>0 sur, v->>1 first, v->>2 code, v->>3 cname
from public.catalog c, jsonb_each(c.data) t(k,v) where c.key = 'OLY_NAMES';

-- ---------------------------------------------------------------------
--  Источники
-- ---------------------------------------------------------------------

insert into core.sources (source_type, list_kind, publisher, title, doc_date, notes) values
  ('ittf_list', 'active_iu', 'ITTF URC', 'List of Active International Umpires 01.01.2026', '2026-01-01',
   'С правками куратора UMPIR.ES (потерянные двузначные номера, испорченные имена) и уровнями по спискам Blue / Gold Badge'),
  ('ittf_list', 'ir_list', 'ITTF URC', 'List of International Referees 01.01.2026', '2026-01-01', null),
  ('ittf_register', 'iu_register', 'ITTF URC', 'IU register 01.11.2022 and List of Active International Umpires 2025', '2022-11-01',
   'Номера IU рефери и судей, известных только по турнирам; сопоставлены по имени и ассоциации 19.10.2026'),
  ('ittf_list', 'bb_list', 'ITTF URC', 'Blue Badge Umpires lists 01.01.2024 – 01.10.2026', '2026-10-01',
   'Самая ранняя дата Qualified on по спискам (куратор, 28.10.2026)'),
  ('ittf_list', 'gb_list', 'ITTF URC', 'Gold Badge Umpires lists, archive 2021–2026', '2026-10-01',
   'Периоды в списке Gold Badge; точность — месяц'),
  ('ittf_register', 'trainers_evaluators', 'ITTF URC', 'URC Trainers & Evaluators Register 01.10.2025', '2025-10-01', null),
  ('selection', null, 'ITTF / WTT', 'Match officials selections (ITTF / WTT export)', null,
   'Назначения без отдельного источника на сайте');
insert into core.sources (source_type, publisher, title, notes) values
  ('results_book', 'IOC / organising committees', 'Official results books and reports of the Olympic Games (Competition Officials)', 'Код b в OLY'),
  ('olympedia', 'Olympedia', 'Olympedia — table tennis officials', 'Код o в OLY'),
  ('curator', 'UMPIR.ES curator', 'Information from the UMPIR.ES curator (Olympic and Paralympic Games)', 'Код c в OLY / PARA'),
  ('self_report', null, 'Self-reported by the official', 'Код s в OLY / PARA'),
  ('selection', 'ITTF', 'ITO lists of the Games (Rio 2016, Paris 2024), provided by the UMPIR.ES curator', 'Код p в OLY / PARA');

insert into core.sources (source_type, publisher, title, url, site_idx)
select case
         when publisher = 'ETTU' then 'ettu_letter'
         when publisher = 'ATTU' and title ilike '%form%' then 'attu_form'
         when publisher = 'ATTU' then 'attu_letter'
         when publisher = 'UMPIR.ES curator' then 'curator'
         when title ilike '%schedule%' then 'schedule'
         when url is not null then 'news'
         else 'selection' end,
       publisher, title, url, k
from t_src order by k;

create temp table t_s as
select (select id from core.sources where list_kind = 'active_iu')  s_active,
       (select id from core.sources where list_kind = 'ir_list')    s_ir,
       (select id from core.sources where list_kind = 'iu_register') s_reg,
       (select id from core.sources where list_kind = 'bb_list')    s_bb,
       (select id from core.sources where list_kind = 'gb_list')    s_gb,
       (select id from core.sources where list_kind = 'trainers_evaluators') s_trn,
       (select id from core.sources where title like 'Match officials selections%') s_sel;

create temp table t_games_src (code text, source_id int);
insert into t_games_src
select 'b', id from core.sources where source_type = 'results_book'
union all select 'o', id from core.sources where source_type = 'olympedia'
union all select 'c', id from core.sources where notes = 'Код c в OLY / PARA'
union all select 's', id from core.sources where source_type = 'self_report'
union all select 'p', id from core.sources where notes = 'Код p в OLY / PARA';

-- ---------------------------------------------------------------------
--  Ассоциации: DATA.c (124) + ASSOC_X (103) = 227 членов ITTF
-- ---------------------------------------------------------------------

create temp table t_assoc as
select pos site_idx, name, code from t_c
union all
select (select count(*) from t_c)::int + pos, name, code from t_assoc_x;

insert into core.associations (ittf_code, name_en, continent_code, cont_body_id, site_idx)
select a.code, a.name, ct.cont,
       (select o.id from core.organizations o where o.org_type = 'continental' and o.continent_code = ct.cont),
       a.site_idx
from t_assoc a left join t_cont ct on ct.code = a.code
order by a.site_idx;

-- нейтральный статус и коды, которые встречаются в данных, но не являются членами ITTF
insert into core.associations (ittf_code, name_en, continent_code, is_ittf_member, is_neutral)
values ('AIN', 'Individual Neutral Athletes', null, false, true)
on conflict (ittf_code) do nothing;

insert into core.associations (ittf_code, name_en, is_ittf_member)
select distinct on (code) code, coalesce(cname, code), false
from (
  select code, cname from t_x where code is not null
  union all select code, null from t_ir where code is not null
  union all select code, null from t_gantt
  union all select code, cname from t_oly_names where code is not null and code <> ''
) z
where code ~ '^[A-Z]{3}$' and code not in (select ittf_code from core.associations)
order by code, cname nulls last;

-- ---------------------------------------------------------------------
--  Люди
-- ---------------------------------------------------------------------

create temp table t_map (part text, idx int, official_id int, primary key (part, idx));

-- 1) активный список IU (DATA.o)
with ins as (
  insert into core.officials (ittf_ump_id, family_name, first_name, gender, source_id)
  select lpad(o.iu::text, 5, '0'), coalesce(n.sur, o.sur), coalesce(n.first, o.first), o.sex, (select s_active from t_s)
  from t_o o left join t_name_now n on n.iu = o.iu
  order by o.k
  returning id, ittf_ump_id
)
insert into t_map select 'o', o.k, ins.id from ins join t_o o on lpad(o.iu::text,5,'0') = ins.ittf_ump_id;

-- прежнее написание из списка ITTF для тех, у кого имя сменилось
insert into core.name_aliases (official_id, family_name, first_name, alias_kind, source_id)
select m.official_id, o.sur, o.first, 'list_spelling', (select s_active from t_s)
from t_o o join t_name_now n on n.iu = o.iu join t_map m on m.part = 'o' and m.idx = o.k;

-- 2) люди вне списка (EV.x): с номером IU, который уже есть, — тот же человек
insert into t_map
select 'x', x.k, f.id from t_x x join core.officials f on f.ittf_ump_id = lpad(x.iux::text,5,'0') where x.iux > 0;

do $$
declare r record; v_id int;
begin
  for r in select x.* from t_x x where not exists (select 1 from t_map m where m.part = 'x' and m.idx = x.k) order by x.k loop
    v_id := null;
    if r.iux > 0 then
      select id into v_id from core.officials where ittf_ump_id = lpad(r.iux::text,5,'0');
    end if;
    if v_id is null then
      insert into core.officials (ittf_ump_id, family_name, first_name, source_id)
      values (case when r.iux > 0 then lpad(r.iux::text,5,'0') end, r.sur, coalesce(r.first,''),
              case when r.iux > 0 then (select s_reg from t_s) end)
      returning id into v_id;
    end if;
    insert into t_map values ('x', r.k, v_id);
  end loop;
end $$;

-- написания из EV.x, отличные от основного имени (у склеенных профилей)
insert into core.name_aliases (official_id, family_name, first_name, alias_kind)
select distinct m.official_id, x.sur, coalesce(x.first,''), 'variant'
from t_x x join t_map m on m.part = 'x' and m.idx = x.k join core.officials f on f.id = m.official_id
where (f.family_name, f.first_name) is distinct from (x.sur, coalesce(x.first,''))
on conflict do nothing;

-- 3) рефери (EV.ir)
do $$
declare r record; v_id int; v_iu int;
begin
  for r in select * from t_ir order by k loop
    v_id := null;
    if r.oidx >= 0 then
      select official_id into v_id from t_map where part = 'o' and idx = r.oidx;
    end if;
    select iu into v_iu from t_ref_iu where ir = r.ir;
    if v_id is null and v_iu is not null then
      select id into v_id from core.officials where ittf_ump_id = lpad(v_iu::text,5,'0');
    end if;
    if v_id is null then
      insert into core.officials (ittf_ump_id, ittf_ref_id, family_name, first_name, gender, source_id)
      values (case when v_iu is not null then lpad(v_iu::text,5,'0') end, lpad(r.ir::text,5,'0'),
              upper(r.sur), coalesce(r.first,''), r.sex, (select s_ir from t_s))
      returning id into v_id;
    else
      update core.officials set ittf_ref_id = lpad(r.ir::text,5,'0'), gender = coalesce(gender, r.sex) where id = v_id;
      insert into core.name_aliases (official_id, family_name, first_name, alias_kind, source_id)
      select v_id, r.sur, coalesce(r.first,''), 'list_spelling', (select s_ir from t_s)
      from core.officials f where f.id = v_id
        and (upper(f.family_name), lower(f.first_name)) is distinct from (upper(r.sur), lower(coalesce(r.first,'')))
      on conflict do nothing;
    end if;
    insert into t_map values ('ir', r.k, v_id);
  end loop;
end $$;

-- 4) бывшие Gold Badge, которых больше нигде нет (GANTT)
insert into core.officials (ittf_ump_id, family_name, first_name, gender, source_id)
select distinct on (g.iu) lpad(g.iu::text,5,'0'),
       (select string_agg(w, ' ' order by n) from regexp_split_to_table(g.name, ' ') with ordinality t(w,n) where w = upper(w)),
       coalesce((select string_agg(w, ' ' order by n) from regexp_split_to_table(g.name, ' ') with ordinality t(w,n) where w <> upper(w)), ''),
       g.sex, (select s_gb from t_s)
from t_gantt g
where not exists (select 1 from core.officials f where f.ittf_ump_id = lpad(g.iu::text,5,'0'))
order by g.iu, g.k;

update core.officials f set gender = g.sex
from (select distinct on (iu) iu, sex from t_gantt where sex is not null order by iu, k) g
where f.ittf_ump_id = lpad(g.iu::text,5,'0') and f.gender is null;

-- 5) написания из разделов Олимпийских игр
insert into core.name_aliases (official_id, family_name, first_name, alias_kind)
select f.id, n.sur, coalesce(n.first,''), 'variant'
from t_oly_names n join core.officials f on f.ittf_ump_id = lpad(n.pkey,5,'0')
where n.pkey ~ '^\d+$'
  and (upper(f.family_name), lower(f.first_name)) is distinct from (upper(n.sur), lower(coalesce(n.first,'')))
on conflict do nothing;

insert into core.catalog_map (part, idx, official_id, extra)
select m.part, m.idx, m.official_id,
  case m.part
    when 'o'  then jsonb_strip_nulls(jsonb_build_object('act', o.act))
    when 'x'  then jsonb_strip_nulls(jsonb_build_object('cname', x.cname, 'cidx', x.cidx, 'csv', x.csv, 'code', x.code, 'flag', x.flag, 'iux', nullif(x.iux,0)))
    when 'ir' then jsonb_strip_nulls(jsonb_build_object('st', i.st, 'cidx', i.cidx, 'code', i.code))
  end
from t_map m
left join t_o o  on m.part = 'o'  and o.k = m.idx
left join t_x x  on m.part = 'x'  and x.k = m.idx
left join t_ir i on m.part = 'ir' and i.k = m.idx;

-- ---------------------------------------------------------------------
--  Ассоциация человека (текущая): список IU -> список IR -> EV.x -> GANTT
-- ---------------------------------------------------------------------

create temp table t_oa as
select official_id, assc_id, listed_as, source_id, prio from (
  select m.official_id, a.id assc_id, null::text listed_as, (select s_active from t_s) source_id, 1 prio
  from t_o o join t_map m on m.part='o' and m.idx=o.k join core.associations a on a.site_idx = o.cidx
  union all
  select m.official_id, a.id, null, (select s_ir from t_s), 2
  from t_ir i join t_map m on m.part='ir' and m.idx=i.k
  join core.associations a on (i.cidx >= 0 and a.site_idx = i.cidx) or (i.cidx < 0 and a.ittf_code = i.code)
  union all
  select m.official_id, a.id,
         case when x.cname is not null and x.cname <> a.name_en then x.cname end, null, 3
  from t_x x join t_map m on m.part='x' and m.idx=x.k
  join core.associations a on a.id = coalesce(
      (select id from core.associations where x.cidx >= 0 and site_idx = x.cidx),
      (select id from core.associations where x.code is not null and ittf_code = x.code),
      (select id from core.associations where name_en = x.cname limit 1))
  union all
  select f.id, a.id, null, (select s_gb from t_s), 4
  from t_gantt g join core.officials f on f.ittf_ump_id = lpad(g.iu::text,5,'0') join core.associations a on a.ittf_code = g.code
) z;

insert into core.official_associations (official_id, assc_id, listed_as, source_id)
select distinct on (official_id) official_id, assc_id, listed_as, source_id
from t_oa order by official_id, prio;

-- ---------------------------------------------------------------------
--  Записи в списках ITTF
-- ---------------------------------------------------------------------

insert into core.ittf_list_entries (source_id, official_id, listed_family, listed_first, listed_assc, listed_cat, listed_status, listed_extra)
select (select s_active from t_s), m.official_id, o.sur, o.first, a.ittf_code,
       (array['WB','BB','GB'])[o.lvl + 1], case o.act when 1 then 'active' else 'inactive' end,
       jsonb_strip_nulls(jsonb_build_object('bb', o.bb, 'gb', o.gb, 'are', o.are))
from t_o o join t_map m on m.part='o' and m.idx=o.k left join core.associations a on a.site_idx = o.cidx;

insert into core.ittf_list_entries (source_id, official_id, listed_family, listed_first, listed_assc, listed_cat, listed_status)
select (select s_ir from t_s), m.official_id, i.sur, i.first, coalesce(a.ittf_code, i.code),
       case when i.st like 'AR%' then 'IRA' else 'IR' end, i.st
from t_ir i join t_map m on m.part='ir' and m.idx=i.k left join core.associations a on i.cidx >= 0 and a.site_idx = i.cidx;

-- ---------------------------------------------------------------------
--  История категорий
--  Судейская линия: WB с года экзамена (по номеру) -> BB с даты квалификации
--  -> периоды Gold Badge из архива списков (между ними BB).
--  Линия рефери: IR с года по номеру; IR Advanced — дата неизвестна.
-- ---------------------------------------------------------------------

do $$
declare
  p record; g record;
  v_lvl int; v_bb date; v_bb_prec text; v_first_gb date; v_last_end date; v_has_open_gb boolean;
  v_cur date; v_gbtext text; v_gbdate date;
  s_bb int := (select s_bb from t_s); s_gb int := (select s_gb from t_s); s_act int := (select s_active from t_s);
begin
  for p in
    select f.id, f.ittf_ump_id, f.iu_exam_year, o.lvl, o.bb, o.gb, o.iu
    from core.officials f
    left join t_map m on m.part = 'o' and m.official_id = f.id
    left join t_o o on o.k = m.idx
    where f.ittf_ump_id is not null
      and (o.k is not null or exists (select 1 from t_gantt where lpad(iu::text,5,'0') = f.ittf_ump_id))
  loop
    v_lvl := p.lvl;                         -- 0 WB, 1 BB, 2 GB; NULL — нет в активном списке
    select min(s) into v_first_gb from t_gantt where lpad(iu::text,5,'0') = p.ittf_ump_id;

    -- дата BB: из текущего списка, иначе самая ранняя по спискам BB; только если раньше первого GB
    v_bb := p.bb::date; v_bb_prec := 'day';
    if v_lvl = 0 then v_bb := null;   -- сейчас White Badge: прошлый BB без даты окончания не восстановить
    elsif v_bb is null or (v_first_gb is not null and v_bb >= v_first_gb) then
      select d into v_bb from t_bbq where lpad(iu::text,5,'0') = p.ittf_ump_id;
      if v_bb is not null and v_first_gb is not null and v_bb >= v_first_gb then v_bb := null; end if;
    end if;
    if v_bb is not null and v_bb < make_date(p.iu_exam_year, 1, 1) then v_bb := null; end if;
    v_gbdate := case when p.gb ~ '^[A-Z][a-z]+ \d{4}$' then to_date('01 ' || p.gb, 'DD Month YYYY') end;

    -- WB: с года экзамена до BB (или до сих пор)
    if v_bb is not null then
      insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, date_to, to_precision, source_id)
      values (p.id, 'WB', 'ump', make_date(p.iu_exam_year,1,1), 'year', v_bb, 'day', s_act);
    elsif v_lvl = 0 and v_first_gb is null then
      insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, source_id)
      values (p.id, 'WB', 'ump', make_date(p.iu_exam_year,1,1), 'year', s_act);
    end if;

    -- BB до первого GB / до сих пор
    if v_lvl = 1 or v_first_gb is not null then
      insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, date_to, to_precision, source_id)
      values (p.id, 'BB', 'ump', v_bb, case when v_bb is not null then 'day' end,
              v_first_gb, case when v_first_gb is not null then 'month' end,
              case when v_bb is not null then s_bb else s_act end);
    end if;

    -- периоды GB и BB между ними
    v_last_end := null; v_has_open_gb := false;
    for g in select s, e from t_gantt where lpad(iu::text,5,'0') = p.ittf_ump_id order by s loop
      if v_last_end is not null and v_last_end < g.s then
        insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, date_to, to_precision, source_id, notes)
        values (p.id, 'BB', 'ump', v_last_end, 'month', g.s, 'month', s_gb, 'между периодами в списке Gold Badge');
      end if;
      insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, date_to, to_precision, source_id)
      values (p.id, 'GB', 'ump', g.s, 'month', g.e, case when g.e is not null then 'month' end, s_gb);
      v_last_end := g.e;
      if g.e is null then v_has_open_gb := true; end if;
    end loop;

    -- после последнего GB
    if v_first_gb is not null and not v_has_open_gb then
      if v_lvl = 1 then
        insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, source_id, notes)
        values (p.id, 'BB', 'ump', v_last_end, 'month', s_act, 'после выхода из списка Gold Badge');
      elsif v_lvl = 0 then
        -- бывший Gold Badge, в активном списке 2026 — White Badge
        insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, source_id, notes)
        values (p.id, 'WB', 'ump', v_last_end, 'month', s_act,
                'White Badge по активному списку 2026; дата перехода неизвестна, взят выход из списка Gold Badge');
      elsif v_lvl = 2 then
        -- в активном списке GB, но в архиве нет открытого периода: берём месяц из списка
        insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, source_id, notes)
        values (p.id, 'GB', 'ump', greatest(v_gbdate, v_last_end), 'month', s_act, 'дата из активного списка');
      end if;
    elsif v_first_gb is null and v_lvl = 2 then
      insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, source_id, notes)
      values (p.id, 'GB', 'ump', v_gbdate, case when v_gbdate is not null then 'month' end, s_act,
              case when v_gbdate is not null then 'дата из активного списка' else 'дата Gold Badge в списке не указана' end);
    end if;
  end loop;
end $$;

-- линия рефери
insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, source_id)
select distinct on (m.official_id) m.official_id, 'IR', 'ref', make_date(f.ir_year, 1, 1), 'year', (select s_ir from t_s)
from t_ir i join t_map m on m.part='ir' and m.idx=i.k join core.officials f on f.id = m.official_id
where i.st not like 'AR%' and i.st <> 'ARC'
order by m.official_id;

insert into core.official_categories (official_id, cat_code, line, date_from, from_precision, source_id, notes)
select distinct on (m.official_id) m.official_id, 'IR', 'ref', make_date(f.ir_year, 1, 1), 'year', (select s_ir from t_s), 'кандидат в IR Advanced'
from t_ir i join t_map m on m.part='ir' and m.idx=i.k join core.officials f on f.id = m.official_id
where i.st = 'ARC'
order by m.official_id;

insert into core.official_categories (official_id, cat_code, line, source_id, notes)
select distinct on (m.official_id) m.official_id, 'IRA', 'ref', (select s_ir from t_s), 'дата получения IR Advanced неизвестна'
from t_ir i join t_map m on m.part='ir' and m.idx=i.k
where i.st = 'AR'
order by m.official_id;

-- кандидаты: BB in progress, IR Advanced (C)
insert into core.candidacies (official_id, target_cat, source_id)
select distinct f.id, 'BB', (select s_active from t_s)
from core.officials f where f.ittf_ump_id in (select lpad(iu::text,5,'0') from t_bbp)
   or f.id in (select m.official_id from t_x x join t_map m on m.part='x' and m.idx=x.k where x.csv = 'BBP')
on conflict do nothing;

insert into core.candidacies (official_id, target_cat, source_id)
select distinct m.official_id, 'IRA', (select s_ir from t_s)
from t_ir i join t_map m on m.part='ir' and m.idx=i.k where i.st = 'ARC'
on conflict do nothing;

-- лента изменений списков Gold Badge
insert into core.badge_list_changes (list_month, official_id, change_kind, source_id)
select g.m, f.id, g.kind, (select s_gb from t_s)
from t_gev g join core.officials f on f.ittf_ump_id = lpad(g.iu::text,5,'0');

-- Evaluators и Mentors (реестр URC)
insert into core.appointments (official_id, appt_type, scope, source_id)
select distinct f.id, t.kind, 'ITTF URC', (select s_trn from t_s)
from (select iu, ir, 'Evaluator' kind from t_trn where ev = 1
      union all select iu, ir, 'Mentor' from t_trn where mt = 1) t
join core.officials f on (t.iu > 0 and f.ittf_ump_id = lpad(t.iu::text,5,'0'))
                      or (t.iu = 0 and f.ittf_ref_id = lpad(t.ir::text,5,'0'))
on conflict do nothing;

-- экзамены из списка Gold Badge: «ARE 2026, Conference 2026»
insert into core.exams (official_id, exam_type, exam_year, passed, source_id)
select m.official_id, z.t, z.y::smallint, true, (select s_gb from t_s)
from t_o o join t_map m on m.part='o' and m.idx=o.k,
lateral (select 'ARE' t, (regexp_match(o.are, 'ARE (\d{4})'))[1] y
         union all select 'conference', (regexp_match(o.are, 'Conference (\d{4})'))[1]) z
where o.are is not null and z.y is not null;

-- ---------------------------------------------------------------------
--  Турниры
-- ---------------------------------------------------------------------

insert into core.events (name, event_type, organizer_id, region_code, date_start, date_end, source_id, site_idx)
select e.name, e.type,
       case when e.type = 'cont' then (select id from core.organizations where abbrv = e.fed)
            when e.type in ('wtt','youth') then (select id from core.organizations where abbrv = 'WTT')
            when e.type in ('ittf','para') then (select id from core.organizations where abbrv = 'ITTF') end,
       e.region, e.s, e.e, (select s_sel from t_s), e.k
from t_ev e order by e.k;

-- Олимпийские и Паралимпийские игры (даты Игр целиком)
insert into core.events (name, event_type, organizer_id, date_start, date_end, games_year)
select g.name, g.type, (select id from core.organizations where abbrv = case g.type when 'olympic' then 'IOC' else 'IPC' end),
       g.s, g.e, g.yr
from (values
  ('Olympic Games Seoul 1988',      'olympic',    1988, date '1988-09-17', date '1988-10-02'),
  ('Olympic Games Barcelona 1992',  'olympic',    1992, date '1992-07-25', date '1992-08-09'),
  ('Olympic Games Atlanta 1996',    'olympic',    1996, date '1996-07-19', date '1996-08-04'),
  ('Olympic Games Sydney 2000',     'olympic',    2000, date '2000-09-15', date '2000-10-01'),
  ('Olympic Games Athens 2004',     'olympic',    2004, date '2004-08-13', date '2004-08-29'),
  ('Olympic Games Beijing 2008',    'olympic',    2008, date '2008-08-08', date '2008-08-24'),
  ('Olympic Games London 2012',     'olympic',    2012, date '2012-07-27', date '2012-08-12'),
  ('Olympic Games Rio 2016',        'olympic',    2016, date '2016-08-05', date '2016-08-21'),
  ('Olympic Games Tokyo 2020',      'olympic',    2020, date '2021-07-23', date '2021-08-08'),
  ('Olympic Games Paris 2024',      'olympic',    2024, date '2024-07-26', date '2024-08-11'),
  ('Paralympic Games Sydney 2000',  'paralympic', 2000, date '2000-10-18', date '2000-10-29'),
  ('Paralympic Games Athens 2004',  'paralympic', 2004, date '2004-09-17', date '2004-09-28'),
  ('Paralympic Games Beijing 2008', 'paralympic', 2008, date '2008-09-06', date '2008-09-17'),
  ('Paralympic Games London 2012',  'paralympic', 2012, date '2012-08-29', date '2012-09-09'),
  ('Paralympic Games Rio 2016',     'paralympic', 2016, date '2016-09-07', date '2016-09-18'),
  ('Paralympic Games Tokyo 2020',   'paralympic', 2020, date '2021-08-24', date '2021-09-05'),
  ('Paralympic Games Paris 2024',   'paralympic', 2024, date '2024-08-28', date '2024-09-08')
) g(name, type, yr, s, e)
where (g.type, g.yr) in (select case part when 'OLY' then 'olympic' else 'paralympic' end, yr from t_games);

-- площадки Лондона-2026 (коды wem / cb в назначениях)
insert into core.cities (name_en, name_ru, assc_id)
values ('London', 'Лондон', (select id from core.associations where ittf_code = 'ENG'));
insert into core.venues (name, short_code, city_id) values
  ('OVO Arena Wembley', 'wem', (select id from core.cities where name_en = 'London')),
  ('Copper Box Arena',  'cb',  (select id from core.cities where name_en = 'London'));
insert into core.event_venues (event_id, venue_id)
select distinct ev.id, v.id
from t_ua u join core.events ev on ev.site_idx = u.ei
join core.venues v on v.short_code = any (string_to_array(u.note, '+'))
where u.note is not null;
update core.events set city_id = (select id from core.cities where name_en = 'London')
where id in (select event_id from core.event_venues);

-- ---------------------------------------------------------------------
--  Назначения
-- ---------------------------------------------------------------------

create temp table t_srcmap as select site_idx k, id source_id from core.sources where site_idx is not null;

-- судьи (EV.ua): r >= 0 — DATA.o, r < 0 — EV.x[-1-r]
insert into core.assignments (event_id, official_id, role_code, duty, badge_at_event, date_from, date_to, venue_note, source_id, site_part, site_idx)
select ev.id, m.official_id, 'Umpire', u.urole, u.lv, u.ds, u.de, u.note,
       coalesce(sm.source_id, (select s_sel from t_s)), 'ua', u.k
from t_ua u
join core.events ev on ev.site_idx = u.ei
join t_map m on (u.r >= 0 and m.part = 'o' and m.idx = u.r) or (u.r < 0 and m.part = 'x' and m.idx = -1 - u.r)
left join t_srcmap sm on sm.k = u.src
order by u.k
on conflict (event_id, official_id, role_code) where official_id is not null do nothing;

-- рефери и официальные лица (EV.ra): число >= 0 — EV.ir, < 0 — DATA.o[-1-r], 'xN' — EV.x[N], иначе только имя
insert into core.assignments (event_id, official_id, unlinked_name, role_code, date_from, date_to, venue_note, source_id, site_part, site_idx)
select ev.id, m.official_id, case when m.official_id is null then a.r #>> '{}' end, a.role, a.ds, a.de, a.note,
       coalesce(sm.source_id, (select s_sel from t_s)), 'ra', a.k
from t_ra a
join core.events ev on ev.site_idx = a.ei
left join t_map m on
     (jsonb_typeof(a.r) = 'number' and (a.r #>> '{}')::int >= 0 and m.part = 'ir' and m.idx = (a.r #>> '{}')::int)
  or (jsonb_typeof(a.r) = 'number' and (a.r #>> '{}')::int < 0  and m.part = 'o'  and m.idx = -1 - (a.r #>> '{}')::int)
  or (jsonb_typeof(a.r) = 'string' and (a.r #>> '{}') ~ '^x\d+$' and m.part = 'x' and m.idx = substr(a.r #>> '{}', 2)::int)
left join t_srcmap sm on sm.k = a.src
order by a.k
on conflict (event_id, official_id, role_code) where official_id is not null do nothing;

-- Олимпийские и Паралимпийские игры
insert into core.assignments (event_id, official_id, role_code, source_id, site_part)
select ev.id, f.id,
       case g.role when 'u' then 'Umpire' when 'r' then 'Referee' when 'd' then 'Deputy Referee' when 'a' then 'Assistant Referee'
                   when 'td' then 'Technical Delegate' when 'atd' then 'Assistant Technical Delegate'
                   when 'jc' then 'Jury Chair' when 'jd' then 'Jury Deputy Chair' when 'j' then 'Jury Member'
                   when 'rc' then 'Racket Control' when 'nto' then 'National Technical Official' end,
       gs.source_id, lower(g.part)
from t_games g
join core.events ev on ev.games_year = g.yr and ev.event_type = case g.part when 'OLY' then 'olympic' else 'paralympic' end
join t_games_src gs on gs.code = g.src
join core.officials f on
     (g.pkey ~ '^\d+$' and f.ittf_ump_id = lpad(g.pkey,5,'0'))
  or (g.pkey ~ '^r\d+$' and f.ittf_ref_id = lpad(substr(g.pkey,2),5,'0'))
  or (g.pkey like 'n:%' and f.id = (select m.official_id from t_x x join t_map m on m.part='x' and m.idx=x.k
                                   where x.sur || '|' || coalesce(x.first,'') = substr(g.pkey,3) order by x.k limit 1))
on conflict (event_id, official_id, role_code) where official_id is not null do nothing;

-- ---------------------------------------------------------------------
--  Итог загрузки
-- ---------------------------------------------------------------------

create table core.load_report (
  item      text primary key,
  expected  integer,
  loaded    integer,
  note      text
);
comment on table core.load_report is 'Отчёт о переносе из public.catalog 15.11.2026';
alter table core.load_report enable row level security;
revoke all on core.load_report from public, anon, authenticated;

insert into core.load_report values
  ('DATA.o -> officials',          (select count(*) from t_o),  (select count(*) from core.catalog_map where part='o'), null),
  ('EV.x -> officials',            (select count(*) from t_x),  (select count(*) from core.catalog_map where part='x'),
     'склеено с уже известными по номеру IU: ' || (select count(*) from t_x x join t_map m on m.part='x' and m.idx=x.k join t_map mo on mo.part='o' and mo.official_id=m.official_id)),
  ('EV.ir -> officials',           (select count(*) from t_ir), (select count(*) from core.catalog_map where part='ir'),
     'из них тот же человек, что в списке IU: ' || (select count(*) from t_map i join t_map o on o.part='o' and o.official_id=i.official_id where i.part='ir')),
  ('officials total',              null, (select count(*) from core.officials), null),
  ('EV.ev -> events',              (select count(*) from t_ev), (select count(*) from core.events where site_idx is not null), null),
  ('Games -> events',              (select count(distinct (part, yr)) from t_games), (select count(*) from core.events where games_year is not null), null),
  ('EV.src -> sources',            (select count(*) from t_src), (select count(*) from core.sources where site_idx is not null), null),
  ('EV.ua -> assignments',         (select count(*) from t_ua), (select count(*) from core.assignments where site_part='ua'), null),
  ('EV.ra -> assignments',         (select count(*) from t_ra), (select count(*) from core.assignments where site_part='ra'),
     'без профиля (только имя): ' || (select count(*) from core.assignments where site_part='ra' and official_id is null)),
  ('OLY entries -> assignments',   (select count(*) from t_games where part='OLY'),  (select count(*) from core.assignments where site_part='oly'), null),
  ('PARA entries -> assignments',  (select count(*) from t_games where part='PARA'), (select count(*) from core.assignments where site_part='para'), null),
  ('GANTT periods -> GB periods',  (select count(*) from t_gantt), (select count(*) from core.official_categories where cat_code='GB' and source_id=(select s_gb from t_s)), null),
  ('GBH.gev -> badge_list_changes',(select count(*) from t_gev), (select count(*) from core.badge_list_changes), null),
  ('BBQ -> BB dates',              (select count(*) from t_bbq),
     (select count(*) from core.official_categories where cat_code='BB' and source_id=(select s_bb from t_s)),
     'нет человека ни в одном разделе: ' || (select count(*) from t_bbq b where not exists (select 1 from core.officials f where f.ittf_ump_id=lpad(b.iu::text,5,'0')))),
  ('REF_IU -> officials with both numbers', (select count(*) from t_ref_iu),
     (select count(*) from t_ref_iu r join core.officials f on f.ittf_ref_id = lpad(r.ir::text,5,'0') and f.ittf_ump_id = lpad(r.iu::text,5,'0')), null),
  ('TRN -> appointments',          (select count(*) from t_trn where ev=1) + (select count(*) from t_trn where mt=1), (select count(*) from core.appointments), null),
  ('associations',                 (select count(*) from t_assoc), (select count(*) from core.associations where is_ittf_member),
     'не члены ITTF (встречаются в данных): ' || (select string_agg(ittf_code, ', ' order by ittf_code) from core.associations where not is_ittf_member));

drop table t_o, t_c, t_x, t_ir, t_ev, t_src, t_ua, t_ra, t_ref_iu, t_gantt, t_bbq, t_gev, t_games, t_oly_names,
           t_s, t_games_src, t_assoc, t_assoc_x, t_cont, t_trn, t_bbp, t_name_now, t_map, t_oa, t_srcmap;
