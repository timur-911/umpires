-- UMPIR.ES — координаты городов турниров (26.11.2026, разрешение владельца).
-- Нужны для карты турниров на Tournaments и секции «турниры на карте» в профиле.
-- Источники: GeoNames (geonamescache/cities15000, reverse_geocoder/cities1000),
-- четыре города — Википедия, города площадок у 36 турниров, названных по стране
-- или региону, — официальные источники WTT/ITTF/федераций. Полный список с
-- источниками и решениями владельца — claude/tournament-cities.md.
-- assc_id у новых городов не заполняется: ISO-2 не отображается в коды ITTF
-- однозначно (у Великобритании три ассоциации), карте довольно country_code.

alter table core.cities
  add column if not exists country_code char(2),
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists coord_source text;

comment on column core.cities.country_code is 'Код страны ISO-3166-1 alpha-2 (не код ассоциации ITTF)';
comment on column core.cities.coord_source is 'Откуда взяты широта и долгота';

-- Лондон в таблице уже был (с привязкой к ENG) — дополняем, а не дублируем
update core.cities set country_code='GB', latitude=51.5085, longitude=-0.1257,
       coord_source='GeoNames cities15000'
where name_en='London' and country_code is null;

create unique index if not exists cities_name_country_uniq on core.cities (name_en, country_code);

create temp table _geo(site_idx int, city text, cc char(2), lat numeric, lon numeric);
create temp table _games(y int, city text, cc char(2), lat numeric, lon numeric);

INSERT INTO _geo(site_idx,city,cc,lat,lon) VALUES
(0,'San Francisco','US',37.7749,-122.4194),
(1,'Vadodara','IN',22.2994,73.2081),
(2,'Doha','QA',25.2855,51.531),
(3,'Vadodara','IN',22.2994,73.2081),
(4,'Linz','AT',48.3064,14.2861),
(5,'Doha','QA',25.2855,51.531),
(6,'Manama','BH',26.2279,50.5857),
(7,'Muscat','OM',23.5841,58.4078),
(8,'Doha','QA',25.2855,51.531),
(9,'Doha','QA',25.2855,51.531),
(10,'Doha','QA',25.2855,51.531),
(11,'Lille','FR',50.6339,3.0551),
(12,'Nevşehir','TR',38.625,34.7122),
(13,'Nevşehir','TR',38.625,34.7122),
(14,'Tunis','TN',36.819,10.1658),
(15,'Tunis','TN',36.819,10.1658),
(16,'Chennai','IN',13.0878,80.2785),
(17,'Vila Real','PT',41.3001,-7.7432),
(18,'Gold Coast','AU',-28.0003,153.4309),
(19,'Singapore','SG',1.2897,103.8501),
(20,'Singapore','SG',1.2897,103.8501),
(21,'Düsseldorf','DE',51.2232,6.7793),
(22,'Buenos Aires','AR',-34.6131,-58.3772),
(23,'Wladyslawowo','PL',54.7909,18.4009),
(24,'Otočec','SI',45.836,15.2183),
(25,'Asunción','PY',-25.2865,-57.647),
(26,'Berlin','DE',52.5244,13.4105),
(27,'Havířov','CZ',49.7798,18.4369),
(28,'Chongqing','CN',29.5603,106.5577),
(29,'Wladyslawowo','PL',54.7909,18.4009),
(30,'Varaždin','HR',46.3044,16.3378),
(31,'Lignano Sabbiadoro','IT',45.6759,13.1173),
(32,'Houston','US',29.7633,-95.3633),
(33,'Radès','TN',36.7695,10.2747),
(34,'Castell-Platja d''Aro','ES',41.8175,3.0674),
(35,'Humacao','PR',18.1497,-65.8274),
(36,'Panagyurishte','BG',42.4952,24.1902),
(37,'Macau','MO',22.2006,113.5461),
(38,'Novi Sad','RS',45.2517,19.8369),
(39,'Riyadh','SA',24.6877,46.7219),
(40,'Yalova','TR',40.655,29.2769),
(41,'Taiyuan','CN',37.8694,112.5603),
(42,'Nevşehir','TR',38.625,34.7122),
(43,'Luxembourg','LU',49.6098,6.1327),
(44,'Havířov','CZ',49.7798,18.4369),
(45,'Metz','FR',49.1191,6.1727),
(46,'Santiago','CL',-33.4569,-70.6483),
(47,'Metz','FR',49.1191,6.1727),
(48,'Senec','SK',48.2195,17.4004),
(49,'São Paulo','BR',-23.5475,-46.6361),
(50,'Sarajevo','BA',43.8486,18.3564),
(51,'London','GB',51.5085,-0.1257),
(52,'Podgorica','ME',42.4412,19.2631),
(53,'Lasko','SI',46.1546,15.2355),
(54,'Castell-Platja d''Aro','ES',41.8175,3.0674),
(55,'Istanbul','TR',41.0138,28.9497),
(56,'Lasko','SI',46.1546,15.2355),
(57,'Tashkent','UZ',41.2647,69.2163),
(58,'Lagos','NG',6.4541,3.3947),
(59,'Mississauga','CA',43.5789,-79.6583),
(60,'Taipei','TW',25.0531,121.5264),
(61,'Bangkok','TH',13.754,100.5014),
(62,'Lagos','NG',6.4541,3.3947),
(63,'Hennebont','FR',47.8051,-3.2734),
(64,'Pristina','XK',42.6727,21.1669),
(65,'Burlingame','US',37.5841,-122.3661),
(66,'Bangkok','TH',13.754,100.5014),
(67,'Pristina','XK',42.6727,21.1669),
(68,'Sandefjord','NO',59.1312,10.2166),
(69,'Skopje','MK',41.9965,21.4314),
(70,'Helsingborg','SE',56.0467,12.6944),
(71,'Gangneung','KR',37.7527,128.8724),
(72,'São José','BR',-27.615,-48.6278),
(73,'Zagreb','HR',45.8144,15.978),
(74,'Buenos Aires','AR',-34.6131,-58.3772),
(75,'São José','BR',-27.615,-48.6278),
(76,'Ljubljana','SI',46.0511,14.5051),
(77,'Ostrava','CZ',49.8347,18.282),
(78,'Beijing','CN',39.9075,116.3972),
(79,'Caracas','VE',10.488,-66.8792),
(80,'Ontario','US',34.0633,-117.6509),
(81,'Istanbul','TR',41.0138,28.9497),
(82,'Hong Kong','HK',22.2783,114.1747),
(83,'Asunción','PY',-25.2865,-57.647),
(84,'Nakhon Ratchasima','TH',14.9707,102.102),
(85,'Buenos Aires','AR',-34.6131,-58.3772),
(86,'Ulan Bator','MN',47.9077,106.8832),
(87,'Nakhon Ratchasima','TH',14.9707,102.102),
(88,'Ulan Bator','MN',47.9077,106.8832),
(89,'Tashkent','UZ',41.2647,69.2163),
(90,'São José dos Campos','BR',-23.1794,-45.8869),
(91,'Burlingame','US',37.5841,-122.3661),
(92,'Tashkent','UZ',41.2647,69.2163),
(93,'Almaty','KZ',43.2525,76.9115),
(94,'Aktobe','KZ',50.2797,57.2072),
(95,'Vientiane','LA',17.9667,102.6),
(96,'Yokohama','JP',35.4333,139.65),
(97,'Vientiane','LA',17.9667,102.6),
(98,'Spokane','US',47.6597,-117.4291),
(99,'Spokane','US',47.6597,-117.4291),
(100,'Malmö','SE',55.6059,13.0007),
(101,'Spokane','US',47.6597,-117.4291),
(102,'Malmö','SE',55.6059,13.0007),
(103,'Berlin','DE',52.5244,13.4105),
(104,'Olomouc','CZ',49.5955,17.2518),
(105,'Otočec','SI',45.836,15.2183),
(106,'Varaždin','HR',46.3044,16.3378),
(107,'Taranto','IT',40.4644,17.247),
(108,'Lahti','FI',60.9827,25.6615),
(109,'Almaty','KZ',43.2525,76.9115),
(110,'Amman','JO',31.9552,35.945),
(111,'Cuenca','EC',-2.8953,-78.9963),
(112,'Puerto Princesa','PH',9.7392,118.7353),
(113,'Tunis','TN',36.819,10.1658),
(114,'Macau','MO',22.2006,113.5461),
(115,'Panagyurishte','BG',42.4952,24.1902),
(116,'Puerto Princesa','PH',9.7392,118.7353),
(117,'Bangkok','TH',13.754,100.5014),
(118,'Montigny-le-Bretonneux','FR',48.7664,2.0341),
(119,'Bangkok','TH',13.754,100.5014),
(120,'Gangneung','KR',37.7527,128.8724),
(121,'Astana','KZ',51.1801,71.446),
(122,'Gangneung','KR',37.7527,128.8724),
(123,'Spa','BE',50.4838,5.8667),
(124,'Montería','CO',8.7508,-75.8782),
(125,'Linz','AT',48.3064,14.2861),
(126,'Asunción','PY',-25.2865,-57.647),
(127,'Batumi','GE',41.6408,41.6306),
(128,'Beijing','CN',39.9075,116.3972),
(129,'Buenos Aires','AR',-34.6131,-58.3772),
(130,'Cairo','EG',30.0626,31.2497),
(131,'Murcia','ES',37.987,-1.13),
(132,'Houston','US',29.7633,-95.3633),
(133,'Lignano Sabbiadoro','IT',45.6759,13.1173),
(134,'Senec','SK',48.2195,17.4004),
(135,'Chennai','IN',13.0878,80.2785),
(136,'Montpellier','FR',43.6109,3.8763),
(137,'Chennai','IN',13.0878,80.2785),
(138,'Szombathely','HU',47.2309,16.6215),
(139,'Dakar','SN',14.6937,-17.4441),
(140,'Frankfurt am Main','DE',50.1155,8.6842),
(141,'Podgorica','ME',42.4412,19.2631),
(142,'Vila Nova de Gaia','PT',41.124,-8.6124),
(143,'Podgorica','ME',42.4412,19.2631),
(144,'Istanbul','TR',41.0138,28.9497),
(145,'Gaborone','BW',-24.6545,25.9086),
(146,'Pattaya','TH',12.9333,100.8833),
(147,'Ballarat','AU',-37.5662,143.8496),
(148,'Muscat','OM',23.5841,58.4078),
(149,'Istanbul','TR',41.0138,28.9497),
(150,'Düsseldorf','DE',51.2232,6.7793),
(151,'Gdańsk','PL',54.3523,18.6491),
(152,'Chengdu','CN',30.6667,104.0667),
(153,'Sejong','KR',36.4869,127.2822),
(154,'Hong Kong','HK',22.2783,114.1747),
(155,'Cluj-Napoca','RO',46.7667,23.6),
(156,'Antibes','FR',43.5813,7.1249),
(157,'Gondomar','PT',41.1445,-8.5322),
(158,'Ljubljana','SI',46.0511,14.5051),
(159,'Haikou','CN',20.0342,110.3465),
(160,'Nagoya','JP',35.1815,136.9064),
(161,'Nagoya','JP',35.1815,136.9064),
(162,'Tashkent','UZ',41.2647,69.2163);

INSERT INTO _games(y,city,cc,lat,lon) VALUES
(2000,'Sydney','AU',-33.8678,151.2073),
(2004,'Athens','GR',37.9838,23.7278),
(2008,'Beijing','CN',39.9075,116.3972),
(2012,'London','GB',51.5085,-0.1257),
(2016,'Rio de Janeiro','BR',-22.9064,-43.1822),
(2020,'Tokyo','JP',35.6895,139.6917),
(2024,'Paris','FR',48.8534,2.3488);

insert into core.cities (name_en, country_code, latitude, longitude, coord_source)
select distinct on (city, cc) city, cc, lat, lon,
       'GeoNames / официальные источники, см. claude/tournament-cities.md'
from (select city, cc, lat, lon from _geo union all select city, cc, lat, lon from _games) u
on conflict (name_en, country_code) do nothing;

update core.events e set city_id = c.id, updated_at = now()
from _geo m join core.cities c on c.name_en = m.city and c.country_code = m.cc
where e.site_idx = m.site_idx;

update core.events e set city_id = c.id, updated_at = now()
from _games g join core.cities c on c.name_en = g.city and c.country_code = g.cc
where e.games_year = g.y and e.site_idx is null;

do $$
declare n int;
begin
  select count(*) into n from core.events where site_idx is not null and city_id is null;
  if n > 0 then raise exception 'у % турниров сайта нет города', n; end if;
  select count(*) into n from core.events where site_idx is null and city_id is null;
  if n > 0 then raise exception 'у % Игр нет города', n; end if;
  select count(*) into n from core.cities where latitude is null or longitude is null;
  if n > 0 then raise exception 'у % городов нет координат', n; end if;
end $$;

drop table _geo;
drop table _games;
