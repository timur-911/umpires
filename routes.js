/* UMPIR.ES — маршруты сайта: разбор адреса, сборка адреса, мета-теги по маршруту.

   Один источник правды об адресах: им пользуется браузер (app.js) и генератор
   страниц (tools/build-site.js). В файле нет данных — он читается и в Node.

   Ключ маршрута — та же строка, что раньше стояла в хеше:
     "home" "gold" "countries" … | "u16367" "x172" "r37" "e42" | "cjapan"
   Адреса (решение владельца 23.11.2026 — раздел-родитель, сущность внутри):
     /                      главная
     /gold/ /countries/ …   разделы
     /umpires/16564-ali-aalmutairi/     судья с номером IU
     /umpires/arg-lionel-titicala/      судья без номера: по имени, при
                                        совпадении — с кодом ассоциации, дальше -2
     /referees/9165-abdallah-boudjahem/ рефери (номер IR)
     /countries/japan/                  ассоциация
     /wtt-youth-star-contender-podgorica-2026/   турнир (в корне, без раздела)
   Номер впереди делает адрес устойчивым: имя можно поправить, адрес не поедет.
   Разбор смотрит только на номер, поэтому /umpires/16564-что-угодно/ тоже
   откроет нужный профиль, а canonical приведёт к правильному написанию.

   LIVE — какие виды страниц уже разложены генератором. Вид, которого нет, живёт
   только по хешу: ссылка на несуществующую страницу увела бы посетителя на 404,
   а canonical на несуществующий адрес поисковик отбросит. Вид включается в LIVE
   тем же коммитом, которым генератор начинает его выпускать.

   Слаги и обратный разбор «слаг → ключ» требуют данных, поэтому их подставляет
   app.js двумя функциями (slugOf и keyOf). Без них остаётся разбор адресов с
   номером — этого довольно генератору, который пути берёт у самой страницы.
*/
(function(root){
"use strict";

var ORIGIN="https://umpir.es";
var BRAND="UMPIR.ES";

var BASE_TITLE="Table tennis umpires and referees | "+BRAND;
var BASE_DESC="A curated, community-powered database and professional network for table tennis match officials. Find any umpire or referee: level, status, tournaments and Olympic appearances.";

/* Разделы: ключ маршрута совпадает с сегментом пути. */
var SECTIONS=["umpires","blue","gold","white","updates","methodology","countries","referees","events","graph","olympics","inbox"];
/* Разделы, которых в поиске быть не должно: страница админа не выпускается
   генератором и остаётся доступной только по хешу. */
var NOINDEX=["inbox"];

/* Какие виды страниц генератор уже разложил. Правится вместе с генератором. */
var LIVE={section:true,country:true,person:true,event:true};

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
var COUNTRY_DESC="Table tennis umpires and referees representing %s: their badges, association and the tournaments they officiated.";
var COUNTRY_TITLE="Table tennis officials in %s";
/* Турнир — формат владельца (23.11.2026):
   20th Asian Games Nagoya 2026 — Umpires and Referees Selected | UMPIR.ES */
var EVENT_TITLE="%n — Umpires and Referees Selected | "+BRAND;
var EVENT_DESC="%s: the umpires and referees who officiated at this tournament.";
/* Профиль — формат владельца (23.11.2026):
   Ali AALMUTAIRI — Table Tennis Umpire | UMPIR.ES
   Profile of Ali AALMUTAIRI, table tennis umpire from Saudi Arabia.
   Qualifications and tournament history. */
var ROLE={umpire:"Table Tennis Umpire",referee:"Table Tennis Referee"};
var PERSON_TITLE="%n — %r | "+BRAND;
var PERSON_DESC="Profile of %n, %l from %c. Qualifications and tournament history.";
var PERSON_DESC_NOC="Profile of %n, %l. Qualifications and tournament history.";

/* Ключ страницы страны — "c" + название латиницей. Проверка раздела
   обязательна: иначе под это правило попадает сам раздел "countries". */
var isCountry=function(k){return /^c[a-z]+$/.test(k)&&SECTIONS.indexOf(k)<0;};
var isUmpire=function(k){return /^[ux]\d+$/.test(k);};
var isRef=function(k){return /^r\d+$/.test(k);};
var isPerson=function(k){return isUmpire(k)||isRef(k);};
var isEvent=function(k){return /^e\d+$/.test(k);};

/* Существует ли такой маршрут по форме записи. Есть ли за ним данные, решает
   уже app.js: сюда данные не передаются. */
function valid(k){
  if(!k||k==="home")return true;
  if(SECTIONS.indexOf(k)>=0)return true;
  if(/^[uxre]\d+$/.test(k))return true;
  return isCountry(k);
}

/* Вид маршрута: по нему решается, разложена ли такая страница. */
function kind(k){
  if(!k||k==="home")return "home";
  if(SECTIONS.indexOf(k)>=0)return "section";
  if(isCountry(k))return "country";
  if(isPerson(k))return "person";
  if(isEvent(k))return "event";
  return "home";
}

/* Есть ли у маршрута своя страница на хостинге. Главная есть всегда. */
function live(k){
  if(NOINDEX.indexOf(k)>=0)return false;
  var t=kind(k);
  return t==="home"?true:!!api.LIVE[t];
}

/* Ключ по сегменту адреса. Номер в начале решает всё; имя без номера
   разбирает app.js, у которого есть данные. */
function fromSeg(section,seg){
  var m=/^(\d+)(?:-|$)/.exec(seg);
  if(m)return (section==="referees"?"r":"u")+String(+m[1]);
  if(api.keyOf)return api.keyOf(section,seg)||"home";
  return "home";
}

/* Текущий маршрут: хеш, если он есть, иначе путь. Хеш главнее, потому что
   переход по хешевой ссылке со страницы /countries/japan/ должен работать. */
function parse(pathname,hash){
  var h=String(hash||"").replace(/^#/,"");
  if(h)return valid(h)?h:"home";
  var segs=String(pathname||"/").split("/").filter(function(s){return s;});
  if(!segs.length)return "home";
  if(segs.length===1){
    if(SECTIONS.indexOf(segs[0])>=0)return segs[0];
    /* Односегментный адрес, который не раздел, — турнир; разбирает его app.js,
       у которого есть данные. */
    if(api.keyOf){var ek=api.keyOf("root",segs[0]);if(ek)return ek;}
    return "home";
  }
  if(segs.length===2){
    if(segs[0]==="umpires"||segs[0]==="referees")return fromSeg(segs[0],segs[1]);
    if(segs[0]==="countries"&&/^[a-z-]+$/.test(segs[1])){
      if(api.keyOf){var ck=api.keyOf("countries",segs[1]);if(ck)return ck;}
      /* без данных (Node) и для адресов без дефисов ключ собирается напрямую */
      return "c"+segs[1].replace(/-/g,"");
    }
    /* прежние адреса этапа 1 — пусть продолжают открываться */
    if((segs[0]==="u"||segs[0]==="x"||segs[0]==="r"||segs[0]==="e")&&/^\d+$/.test(segs[1]))return segs[0]+String(+segs[1]);
    if(segs[0]==="c"&&/^[a-z]+$/.test(segs[1]))return "c"+segs[1];
  }
  return "home";
}

function path(k){
  if(!k||k==="home")return "/";
  if(SECTIONS.indexOf(k)>=0)return "/"+k+"/";
  if(isCountry(k))return "/countries/"+((api.slugOf&&api.slugOf(k))||k.slice(1))+"/";
  if(isPerson(k)){
    var slug=api.slugOf?api.slugOf(k):null;
    if(slug)return "/"+(isRef(k)?"referees":"umpires")+"/"+slug+"/";
    /* Без данных (Node) остаётся адрес с одним номером: у IU и IR он
       разбирается обратно в того же человека. У записи без номера ("x172")
       числится индекс в массиве, а не номер, — такой адрес открыл бы чужой
       профиль, поэтому его не существует. */
    return /^x/.test(k)?"/":"/"+(isRef(k)?"referees":"umpires")+"/"+k.replace(/^[ur]/,"")+"/";
  }
  if(isEvent(k)){
    var es=api.slugOf?api.slugOf(k):null;
    /* Турнир живёт в корне: /wtt-youth-star-contender-podgorica-2026/ (решение
       владельца 23.11.2026). Название турнира в данных уже содержит год, и
       совпадений среди них нет, поэтому слаг — просто название латиницей.
       Без данных (Node) остаётся прежний адрес с номером: он разбирается
       обратно в тот же ключ. */
    return es?"/"+es+"/":"/e/"+k.slice(1)+"/";
  }
  return "/";
}

function hash(k){return "#"+(k||"home");}

/* Вид ссылки в разметке: путь, когда страница разложена, иначе хеш. */
function link(k){return live(k)?path(k):hash(k);}

/* Адрес для canonical и og:url. Если страницы нет, единственный существующий
   адрес — корень сайта. */
function url(k){return ORIGIN+(live(k)?path(k):"/");}

/* Мета-теги маршрута.
   h1 — заголовок страницы (имя человека, название страны или турнира);
   country — название ассоциации для описания профиля;
   isReferee — роль в заголовке профиля;
   countryTitle — шаблон заголовка страницы страны, нужен только чтобы у
   куратора в RU-интерфейсе заголовок остался русским. */
function head(o){
  o=o||{};
  var k=valid(o.key)?(o.key||"home"):"home";
  var h1=String(o.h1||"").replace(/\s+/g," ").trim();
  var title=BASE_TITLE,desc=BASE_DESC;
  if(isPerson(k)&&h1){
    var role=o.isReferee?ROLE.referee:ROLE.umpire;
    var low=role.toLowerCase();
    title=PERSON_TITLE.replace("%n",h1).replace("%r",role);
    var c=String(o.country||"").trim();
    desc=(c?PERSON_DESC.replace("%c",c):PERSON_DESC_NOC).replace("%n",h1).replace("%l",low);
    return out(k,title,desc);
  }
  if(isEvent(k)&&h1)return out(k,EVENT_TITLE.replace("%n",h1),EVENT_DESC.replace("%s",h1));
  if(k!=="home"&&h1)title=(isCountry(k)?String(o.countryTitle||COUNTRY_TITLE).replace("%s",h1):h1)+" · "+BRAND;
  if(isCountry(k))desc=h1?COUNTRY_DESC.replace("%s",h1):BASE_DESC;
  else if(isEvent(k))desc=h1?EVENT_DESC.replace("%s",h1):BASE_DESC;
  else if(DESC[k])desc=DESC[k];
  return out(k,title,desc);
}
function out(k,title,desc){
  return {key:k,title:title,description:desc,canonical:url(k),url:url(k),
          robots:NOINDEX.indexOf(k)>=0?"noindex, nofollow":""};
}

var api={ORIGIN:ORIGIN,BRAND:BRAND,BASE_TITLE:BASE_TITLE,BASE_DESC:BASE_DESC,
         LIVE:LIVE,SECTIONS:SECTIONS,NOINDEX:NOINDEX,DESC:DESC,ROLE:ROLE,
         slugOf:null,keyOf:null,
         valid:valid,parse:parse,path:path,hash:hash,kind:kind,live:live,
         link:link,url:url,head:head};
root.ROUTES=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
