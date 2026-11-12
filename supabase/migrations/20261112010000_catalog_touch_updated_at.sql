-- UMPIR.ES — отметка времени у справочника.
-- boot.js держит каталог в localStorage и сверяет свежесть по updated_at.
-- Поле стояло только в default при вставке, поэтому правка данных обычным
-- update не меняла отметку, и браузеры с кэшем продолжали показывать старое.

create or replace function public.touch_updated_at() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists catalog_touch_updated_at on public.catalog;

create trigger catalog_touch_updated_at
  before update on public.catalog
  for each row execute function public.touch_updated_at();
