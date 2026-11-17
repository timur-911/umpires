-- =====================================================================
--  UMPIR.ES — до шага 3: списки Gold Badge, OLY_NAMES, ZHAO Ying (17.11.2026)
--  Решения владельца 17.11.2026 по сверке сборки (claude/core-step3-build.md).
--
--  1. Слой «списки Gold Badge»: 37 списков ITTF 08.2022 – 10.2026 (859 записей,
--     51 человек), разобраны и сверены 16.11.2026. Из них собираются GBH.gbp,
--     GANTT и GBH.gev. У источника:
--       doc_date    — дата публикации (метаданные PDF; совпадает с концами
--                     периодов в GANTT);
--       period_date — дата, на которую составлен список (из заголовка: первое
--                     число месяца, у списка 08.01.2024 — сама дата).
--     Запись — как в списке: написание, код ассоциации (у PETÖVARI в списке
--     12.2023 напечатано «HU»), «Qualified on» текстом и датой.
--  2. OLY_NAMES — написания и страны из олимпийских источников, дословно.
--  3. ZHAO Ying (IU 94107): один профиль, написание как в реестре ITTF —
--     «ZHAO Ying». «ZHAO Ying Ying» (ростер Asian Cup 2026) — вариант имени.
--     Второй профиль сайта (EV.x) убирается; назначения уже у одного человека.
-- =====================================================================

alter table core.sources add column period_date date;
comment on column core.sources.period_date is 'Дата, на которую составлен список (из заголовка). doc_date — дата публикации';

-- 1 ------------------------------------------------------------------
create temp table t_gbl (n int, title text, doc_date date, period_date date, file text);
insert into t_gbl values
  (0, 'Gold Badge Umpires August 2022 — 06.08.2022', date '2022-08-06', date '2022-08-01', '2022__Gold_Badge_Umpires_August_2022.pdf'),
  (1, 'Gold Badge Umpires August 2022 — 21.08.2022', date '2022-08-21', date '2022-08-01', '2022__Gold_Badge_Umpires_August_2022_(1).pdf'),
  (2, 'Gold Badge Umpires October 2022 — 14.10.2022', date '2022-10-14', date '2022-10-01', '2022__Gold_Badge_Umpires_October_2022.pdf'),
  (3, 'Gold Badge Umpires November 2022 — 26.10.2022', date '2022-10-26', date '2022-11-01', '2022__Gold_Badge_Umpires_October_2022_(1).pdf'),
  (4, 'Gold Badge Umpires December 2022 — 04.12.2022', date '2022-12-04', date '2022-12-01', '2022__Gold_Badge_Umpires_December_2022.pdf'),
  (5, 'Gold Badge Umpires March 2023 — 11.03.2023', date '2023-03-11', date '2023-03-01', '2023__Gold_Badge_Umpires_March_2023.pdf'),
  (6, 'Gold Badge Umpires May 2023 — 30.04.2023', date '2023-04-30', date '2023-05-01', '2023__Gold_Badge_Umpires_April_2023.pdf'),
  (7, 'Gold Badge Umpires June 2023 — 07.06.2023', date '2023-06-07', date '2023-06-01', '2023__Gold_Badge_Umpires_June_2023.pdf'),
  (8, 'Gold Badge Umpires June 2023 — 23.06.2023', date '2023-06-23', date '2023-06-01', '2023__Gold_Badge_Umpires_June_2023_(1).pdf'),
  (9, 'Gold Badge Umpires September 2023 — 14.09.2023', date '2023-09-14', date '2023-09-01', '2023__Gold_Badge_Umpires_September_2023.pdf'),
  (10, 'Gold Badge Umpires December 2023 — 20.12.2023', date '2023-12-20', date '2023-12-01', '2023__Gold_Badge_Umpires_December_2023.pdf'),
  (11, 'Gold Badge Umpires January 2024 — 02.01.2024', date '2024-01-02', date '2024-01-01', '2024__Gold_Badge_Umpires_January_2024.pdf'),
  (12, 'Gold Badge Umpires January 2024 (08.01.2024) — 08.01.2024', date '2024-01-08', date '2024-01-08', '2024__Gold-Badge-Umpires-January-2024-1.pdf'),
  (13, 'Gold Badge Umpires March 2024 — 04.03.2024', date '2024-03-04', date '2024-03-01', '2024__Gold_Badge_Umpires_March_2024.pdf'),
  (14, 'Gold Badge Umpires April 2024 — 04.04.2024', date '2024-04-04', date '2024-04-01', '2024__Gold_Badge_Umpires_April_2024.pdf'),
  (15, 'Gold Badge Umpires May 2024 — 02.05.2024', date '2024-05-02', date '2024-05-01', '2024__Gold_Badge_Umpires_May_2024.pdf'),
  (16, 'Gold Badge Umpires July 2024 — 13.07.2024', date '2024-07-13', date '2024-07-01', '2024__Gold_Badge_Umpires_july_2024.pdf'),
  (17, 'Gold Badge Umpires August 2024 — 29.08.2024', date '2024-08-29', date '2024-08-01', '2024__Gold_Badge_Umpires_August_2024.pdf'),
  (18, 'Gold Badge Umpires October 2024 — 09.10.2024', date '2024-10-09', date '2024-10-01', '2024__Gold_Badge_Umpires_October_2024.pdf'),
  (19, 'Gold Badge Umpires November 2024 — 17.11.2024', date '2024-11-17', date '2024-11-01', '2024__Gold-Badge-Umpires-November-2024.pdf'),
  (20, 'Gold Badge Umpires December 2024 — 04.12.2024', date '2024-12-04', date '2024-12-01', '2024__Gold_Badge_Umpires_December_2024.pdf'),
  (21, 'Gold Badge Umpires December 2024 — 17.12.2024', date '2024-12-17', date '2024-12-01', '2024__Gold_Badge_Umpires_December_2024_(1).pdf'),
  (22, 'Gold Badge Umpires January 2025 — 06.01.2025', date '2025-01-06', date '2025-01-01', '2025__Gold-Badge-Umpires-January-2025.pdf'),
  (23, 'Gold Badge Umpires February 2025 — 17.02.2025', date '2025-02-17', date '2025-02-01', '2025__Gold_Badge_Umpires_February_2025.pdf'),
  (24, 'Gold Badge Umpires May 2025 — 07.05.2025', date '2025-05-07', date '2025-05-01', '2025__Gold_Badge_Umpires_May_2025.pdf'),
  (25, 'Gold Badge Umpires June 2025 — 20.06.2025', date '2025-06-20', date '2025-06-01', '2025__Gold_Badge_Umpires_June_2025.pdf'),
  (26, 'Gold Badge Umpires August 2025 — 14.08.2025', date '2025-08-14', date '2025-08-01', '2025__Gold_Badge_Umpires_August_2025.pdf'),
  (27, 'Gold Badge Umpires September 2025 — 01.09.2025', date '2025-09-01', date '2025-09-01', '2025__Gold-Badge-Umpires-September-2025.pdf'),
  (28, 'Gold Badge Umpires October 2025 — 09.10.2025', date '2025-10-09', date '2025-10-01', '2025__Gold_Badge_Umpires_October_2025.pdf'),
  (29, 'Gold Badge Umpires November 2025 — 04.11.2025', date '2025-11-04', date '2025-11-01', '2025__Gold_Badge_Umpires_November_2025.pdf'),
  (30, 'Gold Badge Umpires November 2025 — 11.11.2025', date '2025-11-11', date '2025-11-01', '2025__Gold-Badge-Umpires-November-2025-1.pdf'),
  (31, 'Gold Badge Umpires January 2026 — 04.01.2026', date '2026-01-04', date '2026-01-01', '2026__Gold_Badge_Umpires_January_2026.pdf'),
  (32, 'Gold Badge Umpires March 2026 — 25.03.2026', date '2026-03-25', date '2026-03-01', '2026__Gold-Badge-Umpires-March-2026.pdf'),
  (33, 'Gold Badge Umpires April 2026 — 06.04.2026', date '2026-04-06', date '2026-04-01', '2026__Gold-Badge-Umpires-April-2026.pdf'),
  (34, 'Gold Badge Umpires May 2026 — 15.05.2026', date '2026-05-15', date '2026-05-01', '2026__Gold_Badge_Umpires_May_2026.pdf'),
  (35, 'Gold Badge Umpires September 2026 — 06.09.2026', date '2026-09-06', date '2026-09-01', '2026__Gold-Badge-Umpires-September-2026.pdf'),
  (36, 'Gold Badge Umpires October 2026 — 20.10.2026', date '2026-10-20', date '2026-10-01', '2026__Gold_Badge_Umpires_October_2026.pdf');

-- записи: отрезки подряд идущих списков, где у человека все поля одинаковы
create temp table t_run (iu text, n_from int, n_to int, fam text, first text, sex text, assc text, cont text, qual text, note text);
insert into t_run values
  ('00021', 2, 27, 'BERGFELDT', 'Rebecca', 'F', 'SWE', 'EU', 'October 2022', 'ARE 2022'),
  ('02241', 27, 30, 'BERGER', 'Markus', 'M', 'AUT', 'EU', 'August 2025', 'ARE 2022'),
  ('02241', 31, 34, 'BERGER', 'Markus', 'M', 'AUT', 'EU', 'August 2025', 'ARE 2025'),
  ('02241', 35, 36, 'BERGER', 'Markus', 'M', 'AUT', 'EU', 'August 2025', 'ARE 2026, Conference 2026'),
  ('02253', 4, 27, 'BOGREN', 'Ingrid', 'F', 'SWE', 'EU', 'November 2022', 'ARE 2022'),
  ('02253', 28, 34, 'BOGREN', 'Ingrid', 'F', 'SWE', 'EU', 'November 2022', 'ARE 2025'),
  ('02253', 35, 36, 'BOGREN', 'Ingrid', 'F', 'SWE', 'EU', 'November 2022', 'ARE 2026, Conference 2026'),
  ('02661', 7, 10, 'MUGWANYA', 'Ronald', 'M', 'UGA', 'AF', 'June 2023', 'ARE 2022'),
  ('02661', 14, 30, 'MUGWANYA', 'Ronald', 'M', 'UGA', 'AF', 'April 2024', 'ARE 2022'),
  ('02661', 31, 34, 'MUGWANYA', 'Ronald', 'M', 'UGA', 'AF', 'April 2024', 'ARE 2025'),
  ('02661', 35, 36, 'MUGWANYA', 'Ronald', 'M', 'UGA', 'AF', 'April 2024', 'ARE 2026, Conference 2026'),
  ('04008', 4, 9, 'RAMOS', 'Rachel', 'F', 'PHI', 'AS', 'November 2022', 'ARE 2021'),
  ('04008', 10, 10, 'RAMOS', 'Rachel', 'F', 'PHI', 'AS', 'November 2022', 'ARE 2023'),
  ('04718', 10, 10, 'PETÖVARI', 'Attila', 'M', 'HU', 'EU', 'December 2023', 'ARE 2022'),
  ('06129', 6, 9, 'KOH', 'Jun-Li Christabel', 'F', 'SGP', 'AS', 'March 2023', 'ARE 2022'),
  ('06129', 10, 10, 'KOH', 'Jun-Li Christabel', 'F', 'SGP', 'AS', 'March 2023', 'ARE 2023'),
  ('06212', 10, 10, 'WOLLSCHLÄGER', 'Stefan', 'M', 'GER', 'EU', 'December 2023', 'ARE 2022'),
  ('06429', 8, 10, 'HAKIMARA', 'Marzieh', 'F', 'CAN', 'NA', 'June 2023', 'ARE 2023'),
  ('06429', 13, 17, 'HAKIMARA', 'Marzieh', 'F', 'CAN', 'NA', 'March 2024', 'ARE 2023'),
  ('06429', 26, 31, 'HAKIMARA', 'Marzieh', 'F', 'CAN', 'NA', 'August 2025', 'ARE 2023'),
  ('08022', 6, 10, 'COLLDEFORN', 'Jaume', 'M', 'ESP', 'EU', 'April 2023', 'ARE 2023'),
  ('08022', 12, 36, 'COLLDEFORN', 'Jaume', 'M', 'ESP', 'EU', 'April 2023', 'ARE 2023'),
  ('08104', 0, 0, 'MEHRA', 'Vipin', 'M', 'IND', 'AS', 'March 2022', ''),
  ('08104', 1, 21, 'MEHRA', 'Vipin', 'M', 'IND', 'AS', 'March 2022', 'ARE 2021'),
  ('08204', 10, 10, 'HRISTOV', 'Tsvetozar', 'M', 'BUL', 'EU', 'September 2023', 'ARE 2023'),
  ('08204', 20, 28, 'HRISTOV', 'Tsvetozar', 'M', 'BUL', 'EU', 'December 2024', 'ARE 2023'),
  ('08408', 24, 34, 'RAECKELBOOM', 'Claude', 'M', 'FRA', 'EU', 'April 2025', 'ARE 2025'),
  ('08408', 35, 36, 'RAECKELBOOM', 'Claude', 'M', 'FRA', 'EU', 'April 2025', 'ARE 2026, Conference 2026'),
  ('08532', 23, 30, 'KONNO', 'Kei', 'M', 'JPN', 'AS', 'February 2025', 'ARE 2022'),
  ('08532', 34, 36, 'KONNO', 'Kei', 'M', 'JPN', 'AS', 'May 2026', 'ARE 2025'),
  ('08809', 9, 10, 'LEE', 'Jeong-Geum', 'F', 'KOR', 'AS', 'August 2023', 'ARE 2022'),
  ('10010', 30, 33, 'KOLARIC', 'Bojana', 'F', 'CRO', 'EU', 'November 2025', 'ARE 2023'),
  ('10010', 34, 34, 'KOLARIC', 'Bojana', 'F', 'CRO', 'EU', 'November 2025', 'ARE 2026'),
  ('10010', 35, 36, 'KOLARIC', 'Bojana', 'F', 'CRO', 'EU', 'November 2025', 'ARE 2026, Conference 2026'),
  ('10042', 0, 0, 'SEMENOVA', 'Elena', 'F', 'RUS', 'EU', 'February 2022', ''),
  ('10042', 1, 9, 'SEMENOVA', 'Elena', 'F', 'RUS', 'EU', 'February 2022', 'ARE 2021'),
  ('10042', 10, 10, 'SEMENOVA', 'Elena', 'F', 'RUS', 'EU', 'February 2022', 'ARE 2023'),
  ('10055', 6, 32, 'MU', 'Chunlei', 'F', 'CHN', 'AS', 'April 2023', 'ARE 2023'),
  ('10055', 36, 36, 'MU', 'Chunlei', 'F', 'CHN', 'AS', 'October 2026', 'ARE 2026'),
  ('10116', 1, 30, 'GERSDORF', 'Anja', 'F', 'GER', 'EU', 'August 2022', 'ARE 2022'),
  ('10122', 27, 30, 'FOOTE', 'Ben', 'M', 'GGY', 'EU', 'August 2025', 'ARE 2023'),
  ('10122', 34, 36, 'FOOTE', 'Ben', 'M', 'GGY', 'EU', 'May 2026', 'ARE 2023'),
  ('10161', 14, 33, 'HENG', 'Yang Ling', 'F', 'SGP', 'AS', 'April 2024', 'ARE 2024'),
  ('10161', 34, 36, 'HENG', 'Yang Ling', 'F', 'SGP', 'AS', 'April 2024', 'ARE 2026'),
  ('10240', 5, 5, 'BECKMANN', 'Mark', 'M', 'DEN', 'EU', 'March 2023', 'ARE January 2023'),
  ('10240', 6, 30, 'BECKMANN', 'Mark', 'M', 'DEN', 'EU', 'March 2023', 'ARE 2023'),
  ('10240', 35, 36, 'BECKMANN', 'Mark', 'M', 'DEN', 'EU', 'August 2026', 'ARE 2026, Conference 2026'),
  ('10333', 21, 33, 'LEONG', 'Pei San Amanda', 'F', 'SGP', 'AS', 'December 2024', 'ARE 2024'),
  ('10333', 34, 36, 'LEONG', 'Pei San Amanda', 'F', 'SGP', 'AS', 'December 2024', 'ARE 2026'),
  ('10338', 23, 26, 'CHAY', 'Ying Sheue Winnie', 'F', 'SGP', 'AS', 'February 2025', 'ARE 2024'),
  ('10613', 6, 6, 'KIVIMÄKI', 'Jonas', 'M', 'FIN', 'EU', 'April 2023', 'ARE 2021'),
  ('10613', 7, 12, 'KIVIMÄKI', 'Joonas', 'M', 'FIN', 'EU', 'April 2023', 'ARE 2021'),
  ('12008', 0, 0, 'KLECKER', 'Roman', 'M', 'CZE', 'EU', 'August 2021', ''),
  ('12008', 1, 12, 'KLECKER', 'Roman', 'M', 'CZE', 'EU', 'August 2021', 'ARE 2021'),
  ('12008', 13, 34, 'KLECKER', 'Roman', 'M', 'CZE', 'EU', 'August 2021', 'ARE 2024'),
  ('12008', 35, 36, 'KLECKER', 'Roman', 'M', 'CZE', 'EU', 'August 2021', 'ARE 2026, Conference 2026'),
  ('12016', 1, 24, 'ZORN', 'Nico', 'M', 'GER', 'EU', 'August', 'ARE 2022'),
  ('12016', 25, 34, 'ZORN', 'Nico', 'M', 'GER', 'EU', 'August', 'ARE 2025'),
  ('12016', 35, 36, 'ZORN', 'Nico', 'M', 'GER', 'EU', 'August', 'ARE 2026, Conference 2026'),
  ('12022', 21, 30, 'MOHANA SASIDHARAN', 'Bindu', 'F', 'IND', 'AS', 'December 2024', 'ARE 2023'),
  ('12319', 16, 34, 'ARAUJO', 'Celeste', 'F', 'POR', 'EU', 'July 2024', 'ARE 2024'),
  ('12319', 35, 36, 'ARAUJO', 'Celeste', 'F', 'POR', 'EU', 'July 2024', 'ARE 2026, Conference 2026'),
  ('12324', 9, 10, 'MILINSKI', 'Maciej', 'M', 'POL', 'EU', 'August 2023', 'ARE 2023'),
  ('12507', 7, 23, 'DUCHATZ', 'Kerstin', 'F', 'GER', 'EU', 'June 2023', 'ARE 2022'),
  ('12507', 24, 34, 'DUCHATZ', 'Kerstin', 'F', 'GER', 'EU', 'June 2023', 'ARE 2025'),
  ('12507', 35, 36, 'DUCHATZ', 'Kerstin', 'F', 'GER', 'EU', 'June 2023', 'ARE 2026, Conference 2026'),
  ('12528', 14, 18, 'KOH', 'Shaun', 'M', 'SPG', 'AS', 'April 2024', 'ARE 2023'),
  ('12528', 19, 36, 'KOH', 'Shaun', 'M', 'SGP', 'AS', 'April 2024', 'ARE 2023'),
  ('12827', 1, 5, 'PIERRET', 'Pol', 'M', 'LUX', 'EU', 'August 2022', 'ARE 2020'),
  ('12827', 6, 23, 'PIERRET', 'Pol', 'M', 'LUX', 'EU', 'August 2022', 'ARE 2023'),
  ('12827', 24, 33, 'PIERRET', 'Pol', 'M', 'LUX', 'EU', 'August 2022', 'ARE 2025'),
  ('14004', 18, 36, 'LI', 'Lin', 'M', 'CHN', 'AS', 'October 2024', 'ARE 2023'),
  ('14101', 26, 33, 'TOURNEUR', 'Didier', 'M', 'BEL', 'EU', 'August 2025', 'ARE 2025'),
  ('14206', 1, 17, 'GEIGER', 'Christoph', 'M', 'GER', 'EU', 'August 2022', 'ARE 2021'),
  ('14206', 18, 34, 'GEIGER', 'Christoph', 'M', 'GER', 'EU', 'August 2022', 'ARE 2024'),
  ('14206', 35, 36, 'GEIGER', 'Christoph', 'M', 'GER', 'EU', 'August 2022', 'ARE 2026, Conference 2026'),
  ('14301', 6, 9, 'ZHU', 'Ling', 'F', 'CHN', 'AS', 'April 2023', 'ARE 2022'),
  ('14301', 10, 36, 'ZHU', 'Ling', 'F', 'CHN', 'AS', 'April 2023', 'ARE 2023'),
  ('14604', 9, 10, 'JIA', 'Na', 'F', 'CHN', 'AS', 'August 2023', 'ARE 2023'),
  ('14604', 12, 21, 'JIA', 'Na', 'F', 'CHN', 'AS', 'August 2023', 'ARE 2023'),
  ('14604', 27, 33, 'JIA', 'Na', 'F', 'CHN', 'AS', 'August 2025', 'ARE 2023'),
  ('14635', 7, 10, 'ZLEZARCZYK', 'Rafal', 'M', 'POL', 'EU', 'June 2023', 'ARE 2021'),
  ('14635', 14, 21, 'ZLEZARCZYK', 'Rafal', 'M', 'POL', 'EU', 'April 2024', 'ARE 2021'),
  ('16059', 24, 33, 'LU', 'Patricia', 'F', 'SGP', 'AS', 'April 2025', 'ARE 2024'),
  ('16059', 34, 36, 'LU', 'Patricia', 'F', 'SGP', 'AS', 'April 2025', 'ARE 2026'),
  ('16227', 17, 36, 'CALTABIANO', 'Antonio', 'M', 'ENG', 'EU', 'August 2024', 'ARE 2023'),
  ('16367', 3, 24, 'BEN ATTIA', 'Akrem', 'M', 'TUN', 'AF', 'October 2022', 'ARE 2022'),
  ('16367', 31, 36, 'BEN ATTIA', 'Akrem', 'M', 'TUN', 'AF', 'October 2022', 'ARE 2023'),
  ('16624', 24, 30, 'PARMENTELAT', 'Tamara', 'F', 'FRA', 'EU', 'April 2025', 'ARE 2022'),
  ('16624', 31, 34, 'PARMENTELAT', 'Tamara', 'F', 'FRA', 'EU', 'April 2025', 'ARE 2025'),
  ('16624', 35, 36, 'PARMENTELAT', 'Tamara', 'F', 'FRA', 'EU', 'April 2025', 'ARE 2026, Conference 2026'),
  ('18112', 19, 36, 'AHMED', 'Ehsan', 'F', 'EGY', 'AF', 'November 2024', 'ARE 2022'),
  ('18331', 35, 36, 'MAIZ CALLE', 'Patricia', 'F', 'SUI', 'EU', 'September 2026', 'ARE 2026, Conference 2026'),
  ('18847', 20, 34, 'STEFF', 'Mircea', 'M', 'ROU', 'EU', 'December 2024', 'ARE 2024'),
  ('18847', 35, 36, 'STEFF', 'Mircea', 'M', 'ROU', 'EU', 'December 2024', 'ARE 2026, Conference 2026'),
  ('86800', 5, 5, 'RASINEN', 'Asko', 'M', 'FIN', 'EU', 'March 2023', 'April 2022'),
  ('86800', 6, 9, 'RASINEN', 'Asko', 'M', 'FIN', 'EU', 'March 2023', 'ARE 2022'),
  ('90763', 7, 27, 'RUANGVIRIYACHAI', 'Pairuch', 'M', 'THA', 'AS', 'June 2023', 'ARE 2022'),
  ('90763', 28, 36, 'RUANGVIRIYACHAI', 'Pairuch', 'M', 'THA', 'AS', 'June 2023', 'ARE 2025'),
  ('96914', 7, 9, 'PARK', 'In Sook', 'F', 'KOR', 'AS', 'June 2023', 'ARE 2021'),
  ('98202', 6, 10, 'DZIOBA', 'Greg', 'M', 'CAN', 'NA', 'April 2023', 'ARE 2022'),
  ('98704', 0, 0, 'KOLLER', 'Werner', 'M', 'AUT', 'EU', 'July 2022', ''),
  ('98704', 1, 14, 'KOLLER', 'Werner', 'M', 'AUT', 'EU', 'July 2022', 'ARE 2022');

create temp table t_gbe as
select r.iu, n, r.fam, r.first, r.assc,
       jsonb_strip_nulls(jsonb_build_object(
         'qualified', r.qual,
         'qualified_on', case when r.qual = 'August' then '2022-08-01' else to_char(to_date('01 ' || r.qual, 'DD Month YYYY'), 'YYYY-MM-DD') end,
         'qualified_note', case when r.qual = 'August' then 'год не указан; август 2022 — решение куратора 16.11.2026' end,
         'sex', r.sex, 'cont', r.cont, 'note', nullif(r.note, ''))) extra
from t_run r, generate_series(r.n_from, r.n_to) n;

insert into core.sources (source_type, list_kind, publisher, title, doc_date, period_date, notes)
select 'ittf_list', 'gb_list', 'ITTF URC', title, doc_date, period_date, 'Файл: ' || file
from t_gbl order by doc_date;

insert into core.ittf_list_entries (source_id, official_id, listed_family, listed_first, listed_assc, listed_cat, listed_extra)
select s.id, f.id, e.fam, e.first, e.assc, 'GB', e.extra
from t_gbe e join t_gbl l on l.n = e.n
join core.sources s on s.title = l.title and s.list_kind = 'gb_list'
join core.officials f on f.ittf_ump_id = e.iu;

do $$ declare n int; begin
  select count(*) into n from core.ittf_list_entries le join core.sources s on s.id = le.source_id
  where s.list_kind = 'gb_list' and s.period_date is not null;
  if n <> 859 then raise exception 'списки Gold Badge: ожидалось 859 записей, получено %', n; end if;
end $$;

-- 2 ------------------------------------------------------------------
insert into core.sources (source_type, publisher, title, notes)
values ('curator', 'UMPIR.ES curator', 'Spellings and associations in Olympic sources',
        'Написание имени и страна так, как в олимпийских источниках (бывший ключ OLY_NAMES). Добавлено 17.11.2026');

insert into core.ittf_list_entries (source_id, official_id, listed_family, listed_first, listed_assc, listed_extra)
select (select id from core.sources where title = 'Spellings and associations in Olympic sources'),
       f.id, t.v->>0, t.v->>1, nullif(t.v->>2, ''), jsonb_build_object('cname', t.v->>3)
from jsonb_each((select data from public.catalog where key = 'OLY_NAMES')) t(k, v)
join core.officials f on f.ittf_ump_id = lpad(t.k, 5, '0');

do $$ declare n int; begin
  select count(*) into n from core.ittf_list_entries le join core.sources s on s.id = le.source_id
  where s.title = 'Spellings and associations in Olympic sources';
  if n <> 107 then raise exception 'OLY_NAMES: ожидалось 107, получено %', n; end if;
end $$;

-- 3 ------------------------------------------------------------------
do $$
declare v_id int; v_x int;
begin
  select id into v_id from core.officials where ittf_ump_id = '94107';
  if (select count(*) from core.catalog_map where part = 'x' and official_id = v_id) <> 2 then
    raise exception 'ZHAO 94107: ожидалось два профиля в EV.x';
  end if;
  -- оставить олимпийский профиль (как в реестре ITTF), убрать профиль из ростера
  select min(idx) into v_x from core.catalog_map where part = 'x' and official_id = v_id;
  delete from core.catalog_map where part = 'x' and idx = v_x and official_id = v_id;
  delete from core.name_aliases where official_id = v_id and alias_kind = 'variant' and family_name = 'ZHAO' and first_name = 'Ying';
  update core.officials set first_name = 'Ying',
         notes = concat_ws('; ', notes, 'Написание как в реестре ITTF (решение владельца 17.11.2026); «Ying Ying» — ростер Asian Cup 2026')
  where id = v_id and family_name = 'ZHAO' and first_name = 'Ying Ying';
  insert into core.name_aliases (official_id, family_name, first_name, alias_kind)
  values (v_id, 'ZHAO', 'Ying Ying', 'variant');
end $$;

drop table t_gbl, t_gbe, t_run;
