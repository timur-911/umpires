/* Загружает справочник из Supabase и только потом запускает app.js.
   Сами данные лежат в таблице public.catalog: по строке на блок
   (DATA — судьи и страны, EV — турниры, OLY/PARA — Игры, и так далее).
   Ключи берутся из config.js. */
(function () {
  var NEED = ["DATA", "EV", "OLY", "OLY_NAMES", "BBQ", "GBH", "GANTT", "PARA", "REF_IU"];
  var cfg = window.SUPABASE_CONFIG || {};
  var key = cfg.anonKey || cfg.key || "";

  function say(text) {
    var el = document.getElementById("bootmsg");
    if (el) el.textContent = text;
  }

  if (!cfg.url || !key) {
    say("The site is not configured: config.js has no Supabase project URL or key.");
    return;
  }

  fetch(String(cfg.url).replace(/\/+$/, "") + "/rest/v1/catalog?select=key,data", {
    headers: { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }
  })
    .then(function (r) {
      if (!r.ok) throw new Error("catalog request failed: " + r.status);
      return r.json();
    })
    .then(function (rows) {
      var c = {};
      (rows || []).forEach(function (row) { c[row.key] = row.data; });
      var missing = NEED.filter(function (k) { return !c[k]; });
      if (missing.length) throw new Error("missing in catalog: " + missing.join(", "));
      window.CATALOG = c;
      var s = document.createElement("script");
      s.src = "app.js";
      s.onerror = function () { say("Could not load app.js. Reload the page."); };
      document.body.appendChild(s);
    })
    .catch(function (e) {
      say("Could not load the directory (" + e.message + "). Reload the page, or try again in a minute.");
    });
})();
