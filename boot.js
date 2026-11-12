/* Загружает справочник из Supabase и только потом запускает app.js.
   Сами данные лежат в таблице public.catalog: по строке на блок
   (DATA — судьи и страны, EV — турниры, OLY/PARA — Игры, и так далее).
   Ключи берутся из config.js.

   Чтобы повторные заходы не ждали сеть, каталог кладётся в localStorage
   и страница рисуется из него сразу. Свежесть проверяется фоном, запросом
   на одни только отметки времени (пара сотен байт): если в базе что-то
   изменилось, подтягивается новая версия и остаётся в кэше — её увидят
   при следующем открытии страницы. */
(function () {
  var NEED = ["DATA", "EV", "OLY", "OLY_NAMES", "BBQ", "GBH", "GANTT", "PARA", "REF_IU"];
  var CACHE = "umpires.catalog.v1";
  var cfg = window.SUPABASE_CONFIG || {};
  var key = cfg.anonKey || cfg.key || "";
  var base = String(cfg.url || "").replace(/\/+$/, "");
  var started = false;

  function say(text) {
    var el = document.getElementById("bootmsg");
    if (el) el.textContent = text;
  }

  function get(url) {
    return fetch(base + url, {
      headers: { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }
    }).then(function (r) {
      if (!r.ok) throw new Error("catalog request failed: " + r.status);
      return r.json();
    });
  }

  function signature(rows) {
    return (rows || []).map(function (r) { return r.key + ":" + r.updated_at; }).sort().join("|");
  }

  function asCatalog(rows) {
    var c = {};
    (rows || []).forEach(function (row) { c[row.key] = row.data; });
    var missing = NEED.filter(function (k) { return !c[k]; });
    if (missing.length) throw new Error("missing in catalog: " + missing.join(", "));
    return c;
  }

  function start(catalog) {
    if (started) return;
    started = true;
    window.CATALOG = catalog;
    var s = document.createElement("script");
    s.src = "app.js";
    s.onerror = function () { say("Could not load app.js. Reload the page."); };
    document.body.appendChild(s);
  }

  function remember(catalog, sig) {
    try {
      localStorage.setItem(CACHE, JSON.stringify({ sig: sig, data: catalog }));
    } catch (e) { /* приватный режим или нет места — просто живём без кэша */ }
  }

  function cached() {
    try {
      var raw = localStorage.getItem(CACHE);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.data || !o.sig) return null;
      if (NEED.some(function (k) { return !o.data[k]; })) return null;
      return o;
    } catch (e) { return null; }
  }

  function loadFresh(onFail) {
    return get("/rest/v1/catalog?select=key,data,updated_at")
      .then(function (rows) {
        var catalog = asCatalog(rows);
        remember(catalog, signature(rows));
        start(catalog);
      })
      .catch(onFail);
  }

  if (!base || !key) {
    say("The site is not configured: config.js has no Supabase project URL or key.");
    return;
  }

  var hit = cached();
  if (hit) {
    start(hit.data);                                   // рисуем немедленно
    get("/rest/v1/catalog?select=key,updated_at")       // и проверяем свежесть фоном
      .then(function (rows) {
        if (signature(rows) !== hit.sig) {
          return get("/rest/v1/catalog?select=key,data,updated_at").then(function (full) {
            remember(asCatalog(full), signature(full));
          });
        }
      })
      .catch(function () { /* офлайн — кэша достаточно */ });
    return;
  }

  loadFresh(function (e) {
    say("Could not load the directory (" + e.message + "). Reload the page, or try again in a minute.");
  });
})();
