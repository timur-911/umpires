#!/usr/bin/env node
/* Генератор страниц UMPIR.ES.
 *
 * Зачем: у сайта один адрес на 2300 сущностей, и поисковику нечего класть
 * в индекс, кроме главной; боты превью (WhatsApp, Telegram, LinkedIn)
 * JavaScript не исполняют вовсе и показывают общее описание сайта вместо
 * имени судьи. Генератор раскладывает каждую сущность по своему адресу
 * с осмысленным HTML и своими мета-тегами.
 *
 * Как: страницы не описываются здесь заново, а СНИМАЮТСЯ с настоящего сайта.
 * Скрипт поднимает сайт на локальном сервере с замороженным справочником,
 * проходит браузером по маршрутам и сохраняет готовый HTML. Поэтому заголовок,
 * описание и текст статической страницы — ровно те, что видит посетитель,
 * и второго описания данных, которое разошлось бы с app.js, не существует.
 *
 * Что именно выпускать, решает ROUTES.LIVE в routes.js: виды страниц, которые
 * там включены, и генерируются. Тот же флаг заставляет сайт ссылаться путями,
 * поэтому включать вид и начинать его выпускать — одно и то же действие.
 *
 * Запуск в CI (данные из Supabase, ключи из config.js):
 *     node tools/build-site.js
 * Запуск локально, когда до Supabase нет сети:
 *     node tools/build-site.js --catalog=catalog_seed.sql
 * Куда положить результат (по умолчанию dist):
 *     node tools/build-site.js --out=dist
 */
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const ROUTES = require("../routes.js");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2).reduce((a, s) => {
  const m = /^--([a-z-]+)(?:=(.*))?$/.exec(s);
  if (!m) throw new Error("непонятный аргумент: " + s);
  a[m[1]] = m[2] === undefined ? true : m[2];
  return a;
}, {});
const OUT = path.join(ROOT, args.out || "dist");
const WORK = path.join(ROOT, ".build-work");

/* Файлы сайта, которые едут в артефакт как есть. */
const SITE_FILES = ["index.html", "app.js", "routes.js", "boot.js", "config.js",
  "map.json", "og.png", "favicon.ico", "favicon-32.png", "icon-192.png",
  "apple-touch-icon.png", "CNAME"];
const SITE_DIRS = ["vendor"];
/* Ключи справочника, без которых сайт не запускается (как в boot.js). */
const NEED = ["DATA", "EV", "OLY", "OLY_NAMES", "BBQ", "GBH", "GANTT", "PARA", "REF_IU"];

const log = (...a) => console.log(...a);

/* ---------- справочник ---------- */

function configFromRepo() {
  const s = fs.readFileSync(path.join(ROOT, "config.js"), "utf8");
  const url = /url:\s*"([^"]+)"/.exec(s);
  const key = /anonKey:\s*"([^"]+)"/.exec(s);
  if (!url || !key) throw new Error("в config.js не нашлись url и anonKey");
  return { url: url[1].replace(/\/+$/, ""), key: key[1] };
}

async function catalogFromSupabase() {
  const { url, key } = configFromRepo();
  const r = await fetch(url + "/rest/v1/catalog?select=key,data,updated_at", {
    headers: { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }
  });
  if (!r.ok) throw new Error("Supabase ответил " + r.status + " — справочник не получен, сборка остановлена");
  const rows = await r.json();
  const c = {};
  let upd = "";
  rows.forEach(row => { c[row.key] = row.data; if (row.updated_at > upd) upd = row.updated_at; });
  return { catalog: c, updated: upd };
}

/* Офлайн-источник: тот же дамп, из которого собирается локальный стенд. */
function catalogFromDump(file) {
  const sql = fs.readFileSync(path.resolve(ROOT, file), "utf8");
  const re = /\(\s*'([A-Z_]+)'\s*,\s*\$json\$([\s\S]*?)\$json\$/g;
  const c = {};
  let m;
  while ((m = re.exec(sql))) c[m[1]] = JSON.parse(m[2]);
  if (!Object.keys(c).length) throw new Error("в дампе не нашлось ни одного ключа справочника");
  return { catalog: c, updated: "" };
}

/* ---------- рабочая копия сайта с замороженным справочником ---------- */

const SHELL_LIVE = '<script src="/config.js"></script>\n' +
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js"></script>\n' +
  '<script src="/boot.js"></script>';
const SHELL_FROZEN = '<script src="/catalog.js"></script>\n<script src="/app.js"></script>';

function prepareWork(catalog, updated) {
  fs.rmSync(WORK, { recursive: true, force: true });
  fs.mkdirSync(WORK, { recursive: true });
  ["index.html", "app.js", "routes.js", "map.json"].forEach(f =>
    fs.copyFileSync(path.join(ROOT, f), path.join(WORK, f)));
  fs.cpSync(path.join(ROOT, "vendor"), path.join(WORK, "vendor"), { recursive: true });
  fs.writeFileSync(path.join(WORK, "catalog.js"),
    "window.CATALOG=" + JSON.stringify(catalog) + ";\nwindow.CATALOG_UPDATED=" + JSON.stringify(updated || "") + ";\n");
  const shell = fs.readFileSync(path.join(WORK, "index.html"), "utf8");
  if (shell.indexOf(SHELL_LIVE) < 0) throw new Error("в index.html не нашлись теги config.js/supabase/boot.js — оболочка изменилась, генератор надо поправить");
  fs.writeFileSync(path.join(WORK, "index.html"), shell.replace(SHELL_LIVE, SHELL_FROZEN));
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json" };

function serve(dir) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(dir, p);
    if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; res.end("not found"); return; }
    res.setHeader("Content-Type", MIME[path.extname(f)] || "application/octet-stream");
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(ok => srv.listen(0, "127.0.0.1", () => ok({ srv, port: srv.address().port })));
}

/* ---------- снимок страниц ---------- */

/* Снимок одной страницы, выполняется в браузере. Из живой страницы в
   статический снимок не едут диаграммы и карта: их рисуют d3 и Plot при
   загрузке, и в HTML это десятки килобайт мёртвой разметки. Текст, заголовки,
   ссылки и мета-теги остаются. */
function snapOne(k) {
  history.replaceState(null, "", ROUTES.live(k) ? ROUTES.path(k) : "/#" + k);
  route(false);
  document.querySelectorAll("svg").forEach(s => { if (s.outerHTML.length > 8000) s.textContent = ""; });
  document.querySelectorAll("canvas").forEach(c => c.remove());
  const res = document.getElementById("res"); if (res) { res.innerHTML = ""; res.hidden = true; }
  const mr = document.getElementById("modalRoot"); if (mr) mr.innerHTML = "";
  document.querySelectorAll("[aria-busy]").forEach(e => e.removeAttribute("aria-busy"));
  return "<!doctype html>" + document.documentElement.outerHTML;
}

/* Список маршрутов к выпуску спрашивается у самого сайта: второго описания
   данных, которое разошлось бы с app.js, не существует. */
function routeKeys() {
  const live = ROUTES.LIVE, out = ["home"];
  ROUTES.SECTIONS.forEach(k => { if (ROUTES.live(k)) out.push(k); });
  if (live.country) COUNTRIES.forEach(c => out.push(c.slug));
  if (live.event) EVENTS.forEach(e => out.push("e" + e.i));
  if (live.person) {
    OFF.forEach(o => out.push("u" + o.iu));
    EXTRA.forEach(x => out.push("x" + x.k));
    REFS.forEach(r => { if (!r.o) out.push("r" + r.ir); });
  }
  return out;
}

function jsonLd(key, title, desc, url) {
  const site = { "@context": "https://schema.org", "@type": "WebSite", name: ROUTES.BRAND, url: ROUTES.ORIGIN + "/" };
  if (key === "home") return site;
  const crumbs = [{ "@type": "ListItem", position: 1, name: "Home", item: ROUTES.ORIGIN + "/" }];
  crumbs.push({ "@type": "ListItem", position: 2, name: title, item: url });
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs };
}

function finishPage(html, key) {
  if (html.indexOf(SHELL_FROZEN) < 0) throw new Error("в снимке нет тегов замороженной оболочки: " + key);
  /* назад на живые данные: в артефакте страница должна подтягивать справочник из Supabase */
  html = html.replace(SHELL_FROZEN, SHELL_LIVE);
  const title = (/<title>([\s\S]*?)<\/title>/.exec(html) || [, ""])[1];
  const desc = (/<meta name="description" content="([^"]*)"/.exec(html) || [, ""])[1];
  const url = (/<link rel="canonical" href="([^"]*)"/.exec(html) || [, ""])[1];
  const ld = JSON.stringify(jsonLd(key, title.replace(/ · .*$/, ""), desc, url));
  return html.replace("</head>", '<script type="application/ld+json">' + ld + "</script></head>");
}

async function snapshot(port) {
  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch (e) { throw new Error("нет playwright: npm i --no-save playwright && npx playwright install chromium"); }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  /* Фатально — только то, что ломает нашу страницу: исключение в JS и
     недоступный наш же файл. Чужие CDN (шрифты Google, флаги jsdelivr) к
     содержанию страницы отношения не имеют: сборка из-за них не падает,
     но в лог попадает, чтобы молчаливой деградации не было. */
  const problems = [], warnings = [];
  const origin = "http://127.0.0.1:" + port + "/";
  page.on("pageerror", e => problems.push("исключение в JS: " + e.message));
  page.on("requestfailed", r => {
    const u = r.url();
    (u.indexOf(origin) === 0 ? problems : warnings).push("не загрузилось: " + u + " (" + ((r.failure() || {}).errorText || "?") + ")");
  });
  page.on("console", m => { if (m.type() === "error") warnings.push("консоль: " + m.text()); });
  await page.goto("http://127.0.0.1:" + port + "/", { waitUntil: "networkidle" });
  await page.waitForFunction("typeof route === 'function' && typeof COUNTRIES !== 'undefined'", { timeout: 30000 });

  const keys = await page.evaluate(routeKeys);
  log("маршрутов к выпуску: " + keys.length);

  const pages = [];
  for (const key of keys) {
    const html = await page.evaluate(snapOne, key);
    pages.push({ key, path: ROUTES.path(key), html: finishPage(html, key) });
  }
  await browser.close();
  return { pages, problems, warnings };
}

/* ---------- запись артефакта ---------- */

function writeSite(pages, updated) {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  SITE_FILES.forEach(f => {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, f));
    else log("нет файла " + f + " — пропущен");
  });
  SITE_DIRS.forEach(d => fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true }));
  pages.forEach(p => {
    const dir = path.join(OUT, p.path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), p.html);
  });
  const day = (updated || new Date().toISOString()).slice(0, 10);
  const urls = pages.map(p => "  <url><loc>" + ROUTES.ORIGIN + p.path + "</loc><lastmod>" + day + "</lastmod></url>").join("\n");
  fs.writeFileSync(path.join(OUT, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n");
  fs.writeFileSync(path.join(OUT, "robots.txt"),
    "User-agent: *\nAllow: /\n\nSitemap: " + ROUTES.ORIGIN + "/sitemap.xml\n");
}

/* ---------- сборка ---------- */

(async () => {
  const live = Object.keys(ROUTES.LIVE).filter(k => ROUTES.LIVE[k]);
  log("виды страниц к выпуску (ROUTES.LIVE): " + (live.join(", ") || "только главная"));

  const { catalog, updated } = args.catalog ? catalogFromDump(args.catalog) : await catalogFromSupabase();
  const missing = NEED.filter(k => !catalog[k]);
  if (missing.length) throw new Error("в справочнике нет ключей: " + missing.join(", "));
  log("справочник: " + Object.keys(catalog).length + " ключей" + (updated ? ", последняя правка " + updated : ""));

  prepareWork(catalog, updated);
  const { srv, port } = await serve(WORK);
  let out;
  try { out = await snapshot(port); } finally { srv.close(); }

  if (out.warnings.length) {
    const w = [...new Set(out.warnings)].slice(0, 5);
    log("при снятии страниц (не критично, чужие ресурсы):\n  " + w.join("\n  "));
  }
  if (out.problems.length) {
    const first = [...new Set(out.problems)].slice(0, 5);
    throw new Error("страницы снимались с ошибками, артефакт не собран:\n  " + first.join("\n  "));
  }
  writeSite(out.pages, updated);
  fs.rmSync(WORK, { recursive: true, force: true });

  const bytes = out.pages.reduce((n, p) => n + Buffer.byteLength(p.html), 0);
  log("собрано страниц: " + out.pages.length + ", их HTML: " + Math.round(bytes / 1024) + " КБ");
  if (/content="noindex/.test(out.pages[0].html))
    log("ВНИМАНИЕ: в оболочке стоит noindex — страницы собраны, но в индекс не попадут, пока его не снять в index.html");
})().catch(e => { console.error("СБОРКА НЕ УДАЛАСЬ: " + e.message); if (e.stack) console.error(e.stack); process.exit(1); });
