/* Ключи проекта Supabase. Это единственный файл, который нужно отредактировать.
   Оба значения публичные и рассчитаны на то, чтобы лежать в коде сайта;
   доступ к данным ограничивают политики RLS из supabase/migrations.

   Где взять: Supabase → ваш проект → Settings → API Keys
     url     — Project URL, вида https://abcdefghijkl.supabase.co
     anonKey — вкладка «Publishable and secret API keys» → Publishable key,
               вида sb_publishable_...
               Для старых проектов подойдёт и вкладка «Legacy API Keys» →
               anon public (длинная строка, начинается с eyJ). Supabase
               выводит anon из употребления к концу 2026 года, поэтому для
               нового проекта берите publishable.

   Пока поля пустые, сайт работает как статический справочник:
   вход, отправка заявок и «Заявки» выключены. */

window.SUPABASE_CONFIG = {
  url: "",
  anonKey: ""
};
