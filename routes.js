/* UMPIR.ES — маршруты сайта: разбор адреса, сборка адреса, мета-теги по маршруту.

   Один источник правды об адресах: им пользуется браузер (app.js) и, с этапа 1,
   генератор страниц. В файле нет ни DOM, ни данных — он читается и в Node.

   Ключ маршрута — та же строка, что раньше стояла в хеше:
     "home" "gold" "countries" … | "u16367" "x172" "r37" "e42" | "cjapan"
   Путь:
     "/"    "/gold/" "/countries/" | "/u/16367/" "/x/172/" "/r/37/" "/e/42/" | "/c/japan/"

   PATHS=false, пока сгенерированных страниц нет: на хостинге настоящие пути
   отдают 404, поэтому ссылки, canonical и og:url остаются хешевыми. Этап 1
   (страницы разложены в репозитории) переключает флаг в true — тогда адреса
   становятся путями, а старые хешевые ссылки (#u16367) подменяются на путь
   в адресной строке. Флаг можно переключить и из консоли: ROUTES.PATHS=true.

   Внимание на этап 1: ключи "x172" и "e42" — это НОМЕР ПО ПОРЯДКУ в массивах
   EV.x и EV.ev, а не устойчивый идентификатор. При следующей публикации
   справочника порядок может измениться, и такой адрес станет указывать на
   другого человека или турнир. Разбор и сборка здесь симметричны, поэтому
   сейчас это ничего не ломает, но индексируемые страницы профилей без номера
   IU и страницы турниров нельзя выпускать на таких адресах.
*/
(function(root){
"use strict";

var ORIGIN="https://umpir.es";
var BRAND="UMPIR.ES";

var BASE_TITLE="Table tennis umpires and referees | "+BRAND;
var BASE_DESC="A curated, community-powered database and professional network for table tennis match officials. Find any umpire or referee: level, status, tournaments and Olympic appearances.";

/* Разделы: ключ маршрута совпадает с сегментом пути. */
var SECTIONS=["umpires","blue","gold","white","updates","methodology","countries","referees","events","graph","olympics","inbox"];
/* Записи с номером: /u/16367/, /x/172/, /r/37/, /e/42/. */
var NUMERIC=["u","x","r","e"];
/* Разделы, которых в поиске быть не должно. */
var NOINDEX=["inbox"];

/* Описания разделов. Всегда по-английски: сайт для посетителя англоязычный,
   RU остаётся только в интерфейсе куратора. Без чисел — иначе описание
   устаревает при каждой публикации данных. */
var DESC={
  home:BASE_DESC,
  umpires:"Every international table tennis umpire in the database: search by name or IU number, filter by badge, continent and association.",
  gold:"Gold Badge table tennis umpires: who holds the highest ITTF badge, when each of them qualified and how long they have held it.",
  blue:"Blue Badge table tennis umpires: the ITTF list with qualification dates, associations and continents.",
  white:"White Badge table tennis umpires: international umpires who hold the entry-level ITTF badge.",
  updates:"Promotions and returns: every change of level we know of among international table tennis umpires.",
  methodology:"How this database is put together: where the data comes from, how dates are established and how precise each of them is.",
  countries:"Table tennis umpires and referees by country: how many officials each ITTF association has, in total and adjusted for its size and age.",
  referees:"International table tennis referees: search by name or IR number, filter by status, continent and association.",
  events:"Tournaments with known umpire and referee selections: who officiated where.",
  graph:"Umpires Network: who officiated alongside whom, and at which tournaments.",
  olympics:"Table tennis umpires and referees at the Olympic and Paralympic Games.",
  inbox:""
};
var PERSON_DESC="%s: badge, status, tournaments and Olympic appearances in the table tennis match officials database.";
var COUNTRY_DESC="Table tennis umpires and referees representing %s: their badges, association and the tournaments they officiated.";
var COUNTRY_TITLE="Table tennis officials in %s";
var EVENT_DESC="%s: the umpires and referees who officiated at this tournament.";

/* Ключ страницы страны — "c" + название латиницей. Проверка раздела обязательна:
   иначе под это правило попадает сам раздел "countries". */
var isCountry=function(k){return /^c[a-z]+$/.test(k)&&SECTIONS.indexOf(k)<0;};
var isPerson=function(k){return /^[uxr]\d+$/.test(k);};
var isEvent=function(k){return /^e\d+$/.test(k);};

/* Существует ли такой маршрут по форме записи. Есть ли за ним данные, решает
   уже app.js: сюда данные не передаются. */
function valid(k){
  if(!k||k==="home")return true;
  if(SECTIONS.indexOf(k)>=0)return true;
  if(/^[uxre]\d+$/.test(k))return true;
  return isCountry(k);
}

/* Текущий маршрут: хеш, если он есть, иначе путь. Хеш главнее, потому что
   переход по хешевой ссылке со страницы /u/16367/ должен работать. */
function parse(pathname,hash){
  var h=String(hash||"").replace(/^#/,"");
  if(h)return valid(h)?h:"home";
  var segs=String(pathname||"/").split("/").filter(function(s){return s;});
  if(!segs.length)return "home";
  if(segs.length===1&&SECTIONS.indexOf(segs[0])>=0)return segs[0];
  if(segs.length===2&&NUMERIC.indexOf(segs[0])>=0&&/^\d+$/.test(segs[1]))return segs[0]+String(+segs[1]);
  if(segs.length===2&&segs[0]==="c"&&/^[a-z]+$/.test(segs[1]))return "c"+segs[1];
  return "home";
}

function path(k){
  if(!k||k==="home")return "/";
  if(SECTIONS.indexOf(k)>=0)return "/"+k+"/";
  var m=/^([uxre])(\d+)$/.exec(k);
  if(m)return "/"+m[1]+"/"+m[2]+"/";
  if(isCountry(k))return "/c/"+k.slice(1)+"/";
  return "/";
}

function hash(k){return "#"+(k||"home");}

/* Вид ссылки в разметке: путь, когда страницы разложены, иначе хеш. */
function link(k){return api.PATHS?path(k):hash(k);}

/* Адрес страницы для canonical и og:url. Пока страниц нет, единственный
   существующий адрес — корень сайта, и указывать canonical на 404 нельзя. */
function url(k){return ORIGIN+(api.PATHS?path(k):"/");}

/* Мета-теги маршрута. h1 — заголовок страницы (для профилей, стран, турниров);
   countryTitle — шаблон заголовка страницы страны, нужен только чтобы у
   куратора в RU-интерфейсе заголовок остался русским. */
function head(o){
  o=o||{};
  var k=valid(o.key)?(o.key||"home"):"home";
  var h1=String(o.h1||"").replace(/\s+/g," ").trim();
  var title=BASE_TITLE,desc=BASE_DESC;
  if(k!=="home"&&h1)title=(isCountry(k)?String(o.countryTitle||COUNTRY_TITLE).replace("%s",h1):h1)+" · "+BRAND;
  if(isCountry(k))desc=h1?COUNTRY_DESC.replace("%s",h1):BASE_DESC;
  else if(isPerson(k))desc=h1?PERSON_DESC.replace("%s",h1):BASE_DESC;
  else if(isEvent(k))desc=h1?EVENT_DESC.replace("%s",h1):BASE_DESC;
  else if(DESC[k])desc=DESC[k];
  return {key:k,title:title,description:desc,canonical:url(k),url:url(k),
          robots:NOINDEX.indexOf(k)>=0?"noindex, nofollow":""};
}

var api={ORIGIN:ORIGIN,BRAND:BRAND,BASE_TITLE:BASE_TITLE,BASE_DESC:BASE_DESC,
         PATHS:false,SECTIONS:SECTIONS,NUMERIC:NUMERIC,NOINDEX:NOINDEX,
         valid:valid,parse:parse,path:path,hash:hash,link:link,url:url,head:head};
root.ROUTES=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
