-- =====================================================================
--  UMPIR.ES — нормализованная база (схема core), шаг 1 из 3
--  15.11.2026 (применено в Supabase 14.11.2026, версия 20261114183809)
--
--  Порт claude/Umpires_v2.sql (MySQL) на PostgreSQL / Supabase, подогнанный
--  под данные, которые сейчас живут в public.catalog.
--
--  Схема core НЕ входит в список схем, открытых через API Supabase
--  (по умолчанию открыты public и graphql_public), и права у ролей anon и
--  authenticated на неё отозваны. Сайт продолжает читать public.catalog и
--  ничего не замечает. RLS всё равно включён на всех таблицах: если схему
--  когда-нибудь откроют, без явных политик никто ничего не прочитает.
--
--  Отличия от Umpires_v2.sql:
--   * MySQL -> PostgreSQL: identity вместо AUTO_INCREMENT, check вместо ENUM,
--     timestamptz, триггер updated_at;
--   * пересечение периодов категорий в одной линии запрещено ограничением
--     EXCLUDE (btree_gist), а не триггерами;
--   * у дат есть точность (day / month / year): списки ITTF дают месяц,
--     номер IU — только год;
--   * официальное лицо без профиля (только имя в назначении) допускается:
--     так сейчас хранятся 2 записи сайта;
--   * catalog_map — связь записей с позициями в массивах public.catalog,
--     нужна для шага 3 (сборка catalog из таблиц).
-- =====================================================================

create extension if not exists btree_gist with schema extensions;

create schema if not exists core;
comment on schema core is 'UMPIR.ES: нормализованная база. Не открыта через API; сайт пока читает public.catalog.';

revoke all on schema core from public, anon, authenticated;

-- общий триггер updated_at
create or replace function core.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

-- ---------------------------------------------------------------------
--  Источники
-- ---------------------------------------------------------------------

create table core.sources (
  id           integer generated always as identity primary key,
  source_type  text not null check (source_type in
                 ('ittf_list','ittf_register','selection','ettu_letter','attu_letter','attu_form',
                  'schedule','results_book','olympedia','news','curator','self_report','other')),
  list_kind    text check (list_kind in ('active_iu','iu_register','ir_list','bb_list','gb_list','trainers_evaluators')),
  publisher    text,
  title        text not null,
  url          text,
  doc_date     date,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint sources_list_kind_chk check (list_kind is null or source_type in ('ittf_list','ittf_register'))
);
comment on table core.sources is 'Откуда взята каждая запись: списки ITTF, выгрузки назначений, письма ETTU/ATTU, расписания, данные куратора';

-- ---------------------------------------------------------------------
--  Континенты, организации, ассоциации, города, площадки
-- ---------------------------------------------------------------------

create table core.continents (
  code     char(2) primary key check (code in ('AF','AM','AS','EU','OC')),
  name_en  text not null unique,
  name_ru  text not null
);

create table core.organizations (
  id              integer generated always as identity primary key,
  abbrv           text not null unique,
  name            text not null unique,
  org_type        text not null check (org_type in ('world','continental','multisport','other')),
  parent_id       integer references core.organizations(id),
  continent_code  char(2) references core.continents(code),
  website         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint organizations_parent_chk check (parent_id is null or parent_id <> id)
);

create table core.associations (
  id              integer generated always as identity primary key,
  ittf_code       char(3) not null unique check (ittf_code ~ '^[A-Z]{3}$'),
  name_en         text not null,
  name_ru         text,
  continent_code  char(2) references core.continents(code),
  cont_body_id    integer references core.organizations(id),
  is_ittf_member  boolean not null default true,
  is_neutral      boolean not null default false,
  site_idx        integer unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on column core.associations.site_idx is 'Позиция в списке COUNTRIES сайта (DATA.c, затем ASSOC_X в app.js); нужна для сборки catalog';

create table core.cities (
  id        integer generated always as identity primary key,
  name_en   text not null,
  name_ru   text,
  assc_id   integer references core.associations(id),
  unique (name_en, assc_id)
);

create table core.venues (
  id          integer generated always as identity primary key,
  name        text not null,
  short_code  text unique,
  city_id     integer references core.cities(id),
  address     text,
  latitude    numeric(9,6) check (latitude between -90 and 90),
  longitude   numeric(9,6) check (longitude between -180 and 180),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on column core.venues.short_code is 'Код площадки из данных сайта: wem, cb';

-- ---------------------------------------------------------------------
--  Турниры
-- ---------------------------------------------------------------------

create table core.events (
  id              integer generated always as identity primary key,
  name            text not null,
  event_type      text not null check (event_type in ('wtt','youth','ittf','para','cont','other','olympic','paralympic')),
  organizer_id    integer references core.organizations(id),
  region_code     char(2) references core.continents(code),
  date_start      date not null,
  date_end        date not null,
  city_id         integer references core.cities(id),
  games_year      smallint,
  source_id       integer references core.sources(id),
  site_idx        integer unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint events_dates_chk check (date_end >= date_start),
  constraint events_cont_chk  check (event_type <> 'cont' or (organizer_id is not null and region_code is not null)),
  constraint events_games_chk check ((event_type in ('olympic','paralympic')) = (games_year is not null))
);
comment on column core.events.site_idx is 'Позиция в EV.ev (NULL у Олимпийских и Паралимпийских игр — они на сайте в отдельных разделах)';
create unique index events_games_uq on core.events (event_type, games_year) where games_year is not null;

create table core.event_venues (
  event_id  integer not null references core.events(id) on delete cascade,
  venue_id  integer not null references core.venues(id),
  primary key (event_id, venue_id)
);

-- ---------------------------------------------------------------------
--  Официальные лица
-- ---------------------------------------------------------------------

create table core.officials (
  id            integer generated always as identity primary key,
  ittf_ump_id   char(5) unique check (ittf_ump_id ~ '^[0-9]{5}$'),
  ittf_ref_id   char(5) unique check (ittf_ref_id ~ '^[0-9]{5}$'),
  iu_exam_year  smallint generated always as (
                  case when ittf_ump_id is null then null
                       when left(ittf_ump_id,2)::int < 70 then 2000 + left(ittf_ump_id,2)::int
                       else 1900 + left(ittf_ump_id,2)::int end) stored,
  ir_year       smallint generated always as (
                  case when ittf_ref_id is null then null
                       when left(ittf_ref_id,2)::int < 70 then 2000 + left(ittf_ref_id,2)::int
                       else 1900 + left(ittf_ref_id,2)::int end) stored,
  family_name   text not null,
  first_name    text not null default '',
  gender        char(1) check (gender in ('M','F')),
  source_id     integer references core.sources(id),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table core.officials is 'Люди: судьи, рефери, официальные лица. Номера IU/IR — всегда 5 цифр с ведущими нулями';
create index officials_name_idx on core.officials (lower(family_name), lower(first_name));

create table core.official_associations (
  id           integer generated always as identity primary key,
  official_id  integer not null references core.officials(id) on delete cascade,
  assc_id      integer not null references core.associations(id),
  date_from    date,
  date_to      date,
  listed_as    text,
  source_id    integer references core.sources(id),
  created_at   timestamptz not null default now(),
  constraint official_assc_dates_chk check (date_to is null or date_from is null or date_to >= date_from)
);
comment on column core.official_associations.listed_as is 'Как ассоциация названа в источнике, если иначе (напр. Great Britain)';
create unique index official_assc_current_uq on core.official_associations (official_id) where date_to is null;

create table core.name_aliases (
  id           integer generated always as identity primary key,
  official_id  integer not null references core.officials(id) on delete cascade,
  family_name  text not null,
  first_name   text not null default '',
  alias_kind   text not null default 'variant' check (alias_kind in ('variant','former','list_spelling')),
  source_id    integer references core.sources(id),
  created_at   timestamptz not null default now(),
  unique (official_id, family_name, first_name)
);
create index name_aliases_name_idx on core.name_aliases (lower(family_name), lower(first_name));

create table core.official_accounts (
  official_id  integer primary key references core.officials(id) on delete cascade,
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  claimed_at   timestamptz not null default now(),
  verified_at  timestamptz,
  verified_by  uuid references auth.users(id)
);
comment on table core.official_accounts is 'Привязка профиля к учётной записи сайта («Это я!»), подтверждает куратор';

create table core.official_private (
  official_id          integer primary key references core.officials(id) on delete cascade,
  dob                  date,
  phone                text unique,
  email                text unique,
  wa_account           text,
  shirt_size           text,
  height_cm            numeric(4,1) check (height_cm between 100 and 250),
  weight_kg            numeric(4,1) check (weight_kg between 30 and 250),
  consent_at           timestamptz not null,
  consent_version      text,
  consent_withdrawn_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table core.official_private is 'Личные данные — только с согласием самого человека; данные из анкет сюда не пишутся';

create table core.sanctions (
  id            integer generated always as identity primary key,
  official_id   integer not null references core.officials(id) on delete cascade,
  sanction_type text not null check (sanction_type in ('disqualification','suspension')),
  date_from     date not null,
  date_to       date,
  reason        text not null,
  source_id     integer references core.sources(id),
  created_at    timestamptz not null default now(),
  constraint sanctions_dates_chk check (date_to is null or date_to >= date_from)
);

-- ---------------------------------------------------------------------
--  Категории и их история
-- ---------------------------------------------------------------------

create table core.categories (
  code        text primary key,
  name        text not null,
  line        text not null check (line in ('ump','ref')),
  level_order smallint not null,
  unique (code, line),
  unique (line, level_order)
);

create table core.official_categories (
  id              integer generated always as identity primary key,
  official_id     integer not null references core.officials(id) on delete cascade,
  cat_code        text not null,
  line            text not null,
  date_from       date,
  date_to         date,
  from_precision  text check (from_precision in ('day','month','year')),
  to_precision    text check (to_precision in ('day','month','year')),
  source_id       integer references core.sources(id),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  foreign key (cat_code, line) references core.categories(code, line),
  constraint official_cat_dates_chk check (date_to is null or date_from is null or date_to >= date_from),
  constraint official_cat_prec_chk  check ((date_from is null) = (from_precision is null) and (date_to is null) = (to_precision is null)),
  constraint official_cat_no_overlap exclude using gist (
    official_id with =,
    line with =,
    daterange(coalesce(date_from, '-infinity'::date), coalesce(date_to, 'infinity'::date), '[)') with &&
  )
);
comment on table core.official_categories is 'История категорий. date_from NULL — дата неизвестна; date_to NULL — действует сейчас. В одной линии (судья / рефери) периоды не пересекаются';

create table core.candidacies (
  id           integer generated always as identity primary key,
  official_id  integer not null references core.officials(id) on delete cascade,
  target_cat   text not null references core.categories(code),
  since        date,
  outcome      text check (outcome in ('qualified','reverted','withdrawn')),
  closed_on    date,
  source_id    integer references core.sources(id),
  created_at   timestamptz not null default now(),
  unique (official_id, target_cat, since)
);
comment on table core.candidacies is 'Процесс получения категории: BB in progress, IR Advanced (C)';

create table core.badge_list_changes (
  id           integer generated always as identity primary key,
  list_month   date not null check (extract(day from list_month) = 1),
  official_id  integer not null references core.officials(id) on delete cascade,
  change_kind  text not null check (change_kind in ('gn','gr','br')),
  source_id    integer references core.sources(id),
  unique (list_month, official_id, change_kind)
);
comment on table core.badge_list_changes is 'Лента изменений списков Gold Badge: gn — новый GB, gr — вернулся в GB, br — вернулся в BB';

create table core.appointments (
  id           integer generated always as identity primary key,
  official_id  integer not null references core.officials(id) on delete cascade,
  appt_type    text not null check (appt_type in ('Evaluator','Mentor','Trainer','Other')),
  scope        text,
  date_from    date,
  date_to      date,
  source_id    integer references core.sources(id),
  created_at   timestamptz not null default now(),
  unique (official_id, appt_type, scope)
);

-- ---------------------------------------------------------------------
--  Списки ITTF, экзамены, оценки
-- ---------------------------------------------------------------------

create table core.ittf_list_entries (
  id             integer generated always as identity primary key,
  source_id      integer not null references core.sources(id),
  official_id    integer not null references core.officials(id) on delete cascade,
  listed_family  text,
  listed_first   text,
  listed_assc    char(3),
  listed_cat     text references core.categories(code),
  listed_status  text,
  listed_extra   jsonb,
  unique (source_id, official_id)
);
comment on column core.ittf_list_entries.listed_status is 'Активный список IU: active / inactive; список IR: A, AR, ARC, I';

create table core.exams (
  id           integer generated always as identity primary key,
  official_id  integer not null references core.officials(id) on delete cascade,
  exam_type    text not null check (exam_type in ('IU','ARE','IR','AUT','BB_interview','NU','conference','other')),
  exam_date    date,
  exam_year    smallint not null,
  score        numeric(5,2),
  passed       boolean,
  language     text,
  source_id    integer references core.sources(id),
  created_at   timestamptz not null default now(),
  constraint exams_year_chk  check (exam_date is null or extract(year from exam_date) = exam_year),
  constraint exams_score_chk check (score is null
      or (exam_type = 'IU' and score between 0 and 50)
      or (exam_type in ('ARE','IR') and score between 0 and 60)
      or (exam_type not in ('IU','ARE','IR') and score >= 0))
);
create unique index exams_year_uq on core.exams (official_id, exam_type, exam_year) where exam_date is null;

create table core.evaluations (
  id            integer generated always as identity primary key,
  official_id   integer not null references core.officials(id) on delete cascade,
  event_id      integer references core.events(id),
  eval_date     date not null,
  eval_kind     text not null check (eval_kind in ('evaluation','performance_assessment')),
  result        text check (result in ('ME','NE','DNM')),
  points        numeric(5,1),
  evaluator_id  integer references core.officials(id),
  source_id     integer references core.sources(id),
  notes         text,
  created_at    timestamptz not null default now(),
  constraint evaluations_kind_chk check (
      (eval_kind = 'evaluation' and result is not null and points is null)
   or (eval_kind = 'performance_assessment' and result is null and points between 0 and 100)),
  constraint evaluations_self_chk check (evaluator_id is null or evaluator_id <> official_id)
);

-- ---------------------------------------------------------------------
--  Назначения на турниры
-- ---------------------------------------------------------------------

create table core.event_roles (
  code           text primary key,
  short_name     text,
  role_group     text not null check (role_group in ('umpire','referee','official')),
  display_order  smallint not null unique
);
comment on column core.event_roles.role_group is 'umpire и referee считаются судейскими ролями (Топ-10); official — официальные лица турнира';

create table core.assignments (
  id               integer generated always as identity primary key,
  event_id         integer not null references core.events(id),
  official_id      integer references core.officials(id),
  unlinked_name    text,
  role_code        text not null references core.event_roles(code),
  duty             text,
  badge_at_event   text check (badge_at_event in ('WB','BB','GB','BBP','NU','EV','UNK')),
  status           text not null default 'assigned' check (status in ('assigned','worked','withdrawn','replaced')),
  replaced_by_id   integer references core.assignments(id),
  date_from        date,
  date_to          date,
  venue_note       text,
  source_id        integer not null references core.sources(id),
  status_source_id integer references core.sources(id),
  site_part        text check (site_part in ('ua','ra','oly','para')),
  site_idx         integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint assignments_who_chk      check ((official_id is null) <> (unlinked_name is null)),
  constraint assignments_dates_chk    check (date_to is null or date_from is null or date_to >= date_from),
  constraint assignments_replaced_chk check (replaced_by_id is null or status = 'replaced'),
  constraint assignments_site_uq      unique (site_part, site_idx)
);
comment on column core.assignments.duty is 'Особая обязанность судьи, напр. TTR Match Official, Racket Tester';
comment on column core.assignments.badge_at_event is 'Категория на момент назначения: из документа или из списков; UNK — не указана, BBP — BB in progress';
comment on column core.assignments.venue_note is 'Площадка из данных сайта: wem, cb, wem+cb';
create unique index assignments_person_uq on core.assignments (event_id, official_id, role_code) where official_id is not null;
create index assignments_official_idx on core.assignments (official_id);

create table core.event_reviews (
  id                    integer generated always as identity primary key,
  official_id           integer not null references core.officials(id) on delete cascade,
  event_id              integer not null references core.events(id),
  event_score           smallint check (event_score between 1 and 5),
  hotel_score           smallint check (hotel_score between 1 and 5),
  transport_score       smallint check (transport_score between 1 and 5),
  weather_score         smallint check (weather_score between 1 and 5),
  food_score            smallint check (food_score between 1 and 5),
  transport_expenses    text check (transport_expenses in ('own','loc_full','loc_part','ittf_wtt_full','ittf_wtt_part','assc_full','assc_part','sponsor_full','sponsor_part')),
  transport_cost_usd    numeric(10,2),
  route_description     text,
  review_text           text,
  is_public             boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (official_id, event_id),
  constraint event_reviews_cost_chk check (transport_cost_usd is null or (transport_cost_usd > 0 and transport_expenses is not null))
);

-- ---------------------------------------------------------------------
--  Форма и экипировка
-- ---------------------------------------------------------------------

create table core.brands       (id integer generated always as identity primary key, name text not null unique);
create table core.gear_items   (id integer generated always as identity primary key, kind text not null check (kind in ('uniform','equipment')), name text not null, unique (kind, name));
create table core.official_gear (
  id           integer generated always as identity primary key,
  official_id  integer not null references core.officials(id) on delete cascade,
  item_id      integer not null references core.gear_items(id),
  brand_id     integer references core.brands(id),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  Связь с public.catalog (для шага 3)
-- ---------------------------------------------------------------------

create table core.catalog_map (
  part         text not null check (part in ('o','x','ir')),
  idx          integer not null,
  official_id  integer not null references core.officials(id),
  extra        jsonb,
  primary key (part, idx)
);
comment on table core.catalog_map is 'Какая запись DATA.o / EV.x / EV.ir соответствует какому человеку. extra — поля сайта без места в модели (флаги архивных профилей и т.п.)';

-- ---------------------------------------------------------------------
--  updated_at
-- ---------------------------------------------------------------------

do $$
declare t text;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           join pg_attribute a on a.attrelid = c.oid and a.attname = 'updated_at'
           where n.nspname = 'core' and c.relkind = 'r'
  loop
    execute format('create trigger %I before update on core.%I for each row execute function core.touch_updated_at()', t || '_touch', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
--  Справочные данные, которые не зависят от catalog
-- ---------------------------------------------------------------------

insert into core.continents (code, name_en, name_ru) values
  ('AF','Africa','Африка'), ('AM','Americas','Америка'), ('AS','Asia','Азия'),
  ('EU','Europe','Европа'), ('OC','Oceania','Океания');

insert into core.organizations (abbrv, name, org_type, website) values
  ('ITTF', 'International Table Tennis Federation', 'world', 'https://www.ittf.com'),
  ('IOC',  'International Olympic Committee', 'multisport', 'https://www.olympics.com/ioc'),
  ('IPC',  'International Paralympic Committee', 'multisport', 'https://www.paralympic.org');
insert into core.organizations (abbrv, name, org_type, parent_id, continent_code)
select v.abbrv, v.name, v.org_type, (select id from core.organizations where abbrv = 'ITTF'), v.cc
from (values
  ('WTT',   'World Table Tennis',             'world',       null),
  ('ATTU',  'Asian Table Tennis Union',       'continental', 'AS'),
  ('ETTU',  'European Table Tennis Union',    'continental', 'EU'),
  ('ATTF',  'Africa Table Tennis Federation', 'continental', 'AF'),
  ('ITTFO', 'ITTF-Oceania',                   'continental', 'OC'),
  ('ITTFA', 'ITTF Americas',                  'continental', 'AM')
) v(abbrv, name, org_type, cc);
insert into core.organizations (abbrv, name, org_type, continent_code) values
  ('OCA', 'Olympic Council of Asia', 'multisport', 'AS');

insert into core.categories (code, name, line, level_order) values
  ('BU',  'Basic Umpire',                     'ump', 1),
  ('NU',  'National Umpire',                  'ump', 2),
  ('WB',  'International Umpire White Badge', 'ump', 3),
  ('BB',  'International Umpire Blue Badge',  'ump', 4),
  ('GB',  'International Umpire Gold Badge',  'ump', 5),
  ('BR',  'Basic Referee',                    'ref', 1),
  ('NR',  'National Referee',                 'ref', 2),
  ('IR',  'International Referee',            'ref', 3),
  ('IRA', 'International Referee Advanced',   'ref', 4);

-- роли: порядок как на сайте (ROLES в app.js), затем судья и роли Игр
insert into core.event_roles (code, short_name, role_group, display_order) values
  ('Technical Delegate',             'TD',            'official', 1),
  ('Assistant Technical Delegate',   'Asst. TD',      'official', 2),
  ('Competition Manager',            'CM',            'official', 3),
  ('Assistant Competition Manager',  'Asst. CM',      'official', 4),
  ('Jury Member',                    'Jury',          'official', 5),
  ('Technical Officials Supervisor', 'TO Supervisor', 'official', 6),
  ('Referee',                        null,            'referee',  7),
  ('Deputy Referee',                 null,            'referee',  8),
  ('Assistant Referee',              null,            'referee',  9),
  ('Referee Team',                   null,            'referee',  10),
  ('Racket Tester',                  'RCC',           'official', 11),
  ('TTR Match Official',             'TTR',           'official', 12),
  ('Umpire',                         null,            'umpire',   20),
  ('Jury Chair',                     'Jury Chair',    'official', 30),
  ('Jury Deputy Chair',              'Jury Dep.',     'official', 31),
  ('Racket Control',                 'RC',            'official', 32),
  ('National Technical Official',    'NTO',           'official', 33);

insert into core.brands (name) values
  ('Butterfly'), ('Li-Ning'), ('Donic'), ('Mizuno'), ('Anta'), ('Andro'), ('Joola'), ('Xiom'),
  ('Victas'), ('TSP'), ('Yasaka'), ('Stag'), ('Stiga'), ('Tibhar'), ('DHS'), ('Double Fish'),
  ('Onwin'), ('Loki'), ('Sanwei'), ('Nittaku'), ('Prasidha'), ('Pandani');
insert into core.gear_items (kind, name)
select 'uniform', x from unnest(array['Shirt','Trousers','Shoes','Polo shirt','Jacket','Tie','Socks']) x
union all
select 'equipment', x from unnest(array['Table','Ball','Racket','Rubber','Net gauge','Tension gauge','Toss coin',
  'Cloth','Cards','Folder','Stopwatch','Umpire''s chair','AU''s table','Umpire''s touchpad','AU''s touchpad',
  'Towel basket','Score board','Flooring','Time-out device','Match conduct app','Referee''s app',
  'Competition Manager''s app','Event Supervisor''s app']) x;

-- ---------------------------------------------------------------------
--  Представления
-- ---------------------------------------------------------------------

create view core.v_current_categories with (security_invoker = true) as
select oc.official_id, oc.line, oc.cat_code, oc.date_from, oc.from_precision
from core.official_categories oc
where oc.date_to is null;

-- Статус IU по правилам claude/iu-status-rules.md (п. 2.1 Umpire Career Development).
-- Метки сайта: act = IU, new = IU (новый), inact = IU (неакт.), nu = NU.
create view core.v_iu_status with (security_invoker = true) as
select o.id as official_id, o.ittf_ump_id, o.iu_exam_year,
  case
    when o.ittf_ump_id is null then 'nu'
    when exists (select 1 from core.ittf_list_entries le join core.sources s on s.id = le.source_id
                 where le.official_id = o.id and s.list_kind = 'active_iu'
                   and extract(year from s.doc_date) = extract(year from current_date))
      then 'act'
    when exists (select 1 from core.assignments a
                 join core.events e on e.id = a.event_id
                 join core.event_roles r on r.code = a.role_code
                 where a.official_id = o.id and r.role_group = 'umpire'
                   and a.status in ('assigned','worked')
                   and e.event_type not in ('olympic','paralympic')
                   and e.date_start <= current_date
                   and extract(year from e.date_start) = extract(year from current_date))
      then 'act'
    when o.iu_exam_year >= extract(year from current_date) - 2 then 'new'
    else 'inact'
  end as iu_status
from core.officials o;

-- ---------------------------------------------------------------------
--  Доступ: RLS включён везде, политик нет — через API ничего не видно.
-- ---------------------------------------------------------------------

do $$
declare t text;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'core' and c.relkind = 'r'
  loop
    execute format('alter table core.%I enable row level security', t);
  end loop;
end $$;

revoke all on all tables    in schema core from public, anon, authenticated;
revoke all on all sequences in schema core from public, anon, authenticated;
revoke all on all functions in schema core from public, anon, authenticated;
alter default privileges in schema core revoke all on tables    from public, anon, authenticated;
alter default privileges in schema core revoke all on sequences from public, anon, authenticated;
alter default privileges in schema core revoke all on functions from public, anon, authenticated;
