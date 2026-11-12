/* The directory itself lives in Supabase, in the table `catalog`.
   boot.js fetches it before this file runs and leaves it on window.CATALOG.
   Shapes are unchanged, so everything below reads them as before. */
const CATALOG=window.CATALOG||{};
const DATA=CATALOG.DATA;
const EV=CATALOG.EV;
const OLY=CATALOG.OLY;
const OLY_NAMES=CATALOG.OLY_NAMES;
const BBQ=CATALOG.BBQ;
const GBH=CATALOG.GBH;
const GANTT=CATALOG.GANTT;
const PARA=CATALOG.PARA;
const REF_IU=CATALOG.REF_IU;
let MAP=null, mapReq=null;
const MAP_T={ru:{err:"Не удалось загрузить карту. Обновите страницу."},en:{err:"The map could not be loaded. Reload the page."}};
function ensureMap(){
  if(MAP) return Promise.resolve(MAP);
  if(!mapReq) mapReq=fetch("map.json").then(r=>{if(!r.ok)throw new Error("map "+r.status);return r.json();}).then(m=>{
    m.shapes.forEach(sh=>{if(!sh.ci.length&&MAP_ASSOC[sh.n]){const c=CBYCODE.get(MAP_ASSOC[sh.n]);if(c)sh.ci=[c.i];}});
    MAP=m;return m;
  }).catch(e=>{mapReq=null;throw e;});
  return mapReq;
}
const TRN = [[2661, 0, 0, 1], [16367, 22253, 0, 1], [0, 12202, 1, 0], [0, 2107, 1, 1], [0, 12201, 0, 1], [0, 99086, 1, 1], [0, 99084, 1, 0], [0, 13211, 1, 1], [0, 96050, 1, 0], [0, 96049, 1, 1], [0, 6156, 1, 0], [6129, 16222, 1, 1], [4009, 23257, 1, 1], [0, 1105, 0, 1], [0, 3128, 1, 0], [88221, 1093, 1, 0], [0, 5152, 0, 1], [605, 0, 1, 0], [0, 12195, 0, 1], [8311, 0, 1, 0], [0, 15217, 0, 1], [0, 1099, 0, 1], [0, 3135, 0, 1], [10042, 0, 1, 1], [0, 11192, 1, 0], [0, 17236, 0, 1], [0, 22245, 1, 1], [0, 9161, 0, 1], [92803, 0, 1, 0], [0, 9160, 1, 0], [10106, 0, 1, 0], [0, 96045, 0, 1]]; /* [iu, ir, evaluator, mentor] from the URC Trainers & Evaluators Register 01.10.2025 */
/* Olympic Games (source b = official results books / reports: Sydney 2000 (medal-match umpires only), Athens 2004, Beijing 2008, London 2012, Tokyo 2020 — Competition Officials, curator 24.10.2026; role rc = Racket Control, nto = National Technical Official; people without a known IU number are kept only in the curator's dataset). Source p = Paris 2024 OG ITOs list, curator 19.10.2026: TD, Jury, Referee team; jury without IU not shown — LEON Carlos POR TD, ELDAWLATLY EGY, EL-SALHY EGY, VILA DOM, SALEH QAT, AHLERT GER, MOORE AUS): key = IU number (referees: via REF_IU; "r"+IR only if no IU is known) → [[year, role u/r/d/a, source o=Olympedia c=curator s=self]] */
/* notes added by the site curator: break reasons etc. */
const NOTES = {16367:{ru:"Перерыв в списках Gold Badge с июня по ноябрь 2025 был согласован с ITTF, после него судья вернулся к работе на площадке. Рефери (IR) — без перерыва с момента получения категории.",en:"The break from the Gold Badge lists from June to November 2025 was agreed with the ITTF; after it he returned to umpiring at the table. As a referee (IR) he has served continuously since qualifying."}};

/* ---------- i18n ---------- */
const I18N = {
ru:{
 nav_umpires:"Все судьи",nav_ump_menu:"Судьи",dd_gold:"Судьи Gold Badge",dd_blue:"Судьи Blue Badge",dd_white:"Судьи White Badge",list_w:"Судьи White Badge",list_w_sub:"Все международные судьи: White Badge — базовый уровень IU, поэтому в списке есть и обладатели Blue и Gold Badge. Активные и неактивные.",th_status:"Статус",st_active:"Активен",st_inactive:"Неактивен",dd_all:"Все судьи →",nav_countries:"Страны",nav_events:"Турниры",nav_graph:"Граф",gr_title:"Граф связей",gr_sub:(u,x,e,l)=>`${u} ${graphState.whoAll?plural(u,"официальное лицо","официальных лица","официальных лиц"):graphState.whoSel==="ref"?"рефери":plural(u,"судья","судьи","судей")} (из них ${x} без известного номера ${graphState.whoAll?"IU / IR":graphState.whoSel==="ref"?"IR / IU":"IU"}), ${e} ${plural(e,"турнир","турнира","турниров")}. Линия — двое работали на одном турнире, толщина — на скольких (${l} ${plural(l,"пара","пары","пар")}).`,gr_search:"Имя, номер IU или номер IR",gr_all:"Все связи",gr_multi:"2+ общих турнира",gr_reset:"Сбросить всё",gr_leg_u:"судья",gr_leg_u0:"номер IU неизвестен",gr_noiu:"NU",gr_leg_w:"общих турниров",gr_hint:"Наведите на точку — имя; нажмите — коллеги и общие турниры. Колёсико или щипок — масштаб.",gr_pick:"Выберите судью на графе или найдите судью либо турнир через поиск.",gr_ev_n:n=>`${n} ${plural(n,"судья","судьи","судей")}`,gr_u_n:n=>`${n} ${plural(n,"турнир","турнира","турниров")}`,gr_col_n:n=>`${n} ${plural(n,"коллега","коллеги","коллег")}`,gr_strong:n=>`из них ${n} — 2+ общих турнира`,gr_strong_h:"Коллеги с 2+ общими турнирами",gr_shared:n=>`${n} ${plural(n,"общий турнир","общих турнира","общих турниров")}`,gr_open:"Открыть страницу",gr_none:"Ничего не найдено",claim:"Это я!",
 foot1:"Независимый кураторский проект. Не связан с ITTF.",foot2:"Данные: List of Active International Umpires 01.01.2026 · Blue Badge Umpires 01.10.2026 · Gold Badge Umpires 09.2026 · International Referees 01.01.2026 · назначения WTT/ITTF на 19.10.2026",
 eyebrow:"🏓 Кураторская база судей и рефери",h1:"<span class=\"h1l\">Найдите себя.</span> <span class=\"h1l\"><span class=\"sr\">Познакомьтесь с судьями, рефери и коллегами.</span><span aria-hidden=\"true\">Познакомьтесь с <span class=\"rot\" data-w=\"судьями.|рефери.|коллегами.\">судьями.</span></span></span> <span class=\"h1l\">Делитесь опытом.</span>",
 lead:"Судьи, рефери и другие официальные лица турниров по настольному теннису. <button type=\"button\" class=\"dl\" data-find>Найдите</button> или <button type=\"button\" class=\"dl\" data-add>добавьте</button> себя или своих коллег.",
 search_ph:"Имя, номер IU или ассоциация",search_aria:"Поиск судьи",example:"Например:",nothing:"Никого не нашли.",add_umpire:"Добавить судью",assoc_lbl:"Ассоц.",
 map_eyebrow:"Судьи и рефери по всему миру",map_note:"Только международные судьи и международные рефери",map_h:n=>`Карта официальных лиц`,map_who:"Кого показать",who_ump:"Судьи",who_ref:"Рефери",legend_r:"Международных рефери в стране:",no_refs:"Нет международных рефери",tab_world:"Весь мир",tab_europe:"Европа",
 zoom_in:"Приблизить",zoom_out:"Отдалить",zoom_reset:"Показать весь мир",map_hint:"Масштаб: кнопки, щипок или Ctrl + колесо. Перетаскивайте, чтобы двигать карту.",
 map_aria:"Карта: страны, где есть международные судьи",legend:"Международных судей в стране:",none:"нет",small:"маленькая территория",
 no_umpires:"Нет международных судей",c_none:"У ассоциации пока нет активных международных судей.",c_nobody:n=>`Мы пока не знаем ни одного официального лица ассоциации ${n}`,level:"Уровень",inactive:"неакт.",lv_tbd:"Уровень будет определён позже. Это официальное лицо работало на Олимпийских или Паралимпийских играх, но пока нет подтверждения, является ли оно международным судьёй. Уровень появится после подтверждения статуса.",c_add:"Добавить официальное лицо",c_upload:"Загрузить список",c_up_title:"Загрузить список официальных лиц",c_up_sub:"Подойдёт любой список международных или национальных судей, рефери и других официальных лиц этой ассоциации. Куратор проверит файл и добавит людей в базу.",c_ph:"Например: год списка, национальные категории",c_kinds:["Список национальных судей","Список рефери","Другой список официальных лиц"],c_none_o:" Ниже — рефери и другие официальные лица этой ассоциации, которые есть на сайте.",ref_only:n=>`0 активных судей, ${fmt(n)} рефери`,tap_again:"Нажмите ещё раз, чтобы открыть",click_open:"Нажмите, чтобы открыть",
 total_line:(n,r,c)=>`<b>${fmt(n)}</b> ${plural(n,"судья","судьи","судей")} и <b>${r}</b> рефери из <b>${c}</b> ассоциаций`,
 nav_refs:"Рефери",g_title:"Gold Badge во времени",g_sub:"Периоды, когда судья был в списках Gold Badge. Цвет — пол, пунктир — сегодня. При сортировке по общему сроку диаграмма превращается в рейтинг. Нажмите на полосу, чтобы открыть профиль.",g_status:"Статус",g_active:"Действующие",g_expired:"Бывшие",g_all:"Все",g_f:"Женщины",g_m:"Мужчины",g_sort:"Сортировка",g_ctry:"Страна",g_ctry_all:"Все страны",g_ctry_ph:"Все страны",g_s_start:"по дате получения",g_s_year:"по году IU",g_s_dur:"по общему сроку в GB",g_from:"С",g_to:"По",g_now:"по настоящее время",g_total:"Всего в Gold Badge",g_days:"дн.",g_arch:"Период добавлен по архиву списков ITTF (точность — месяц)",g_noload:"Не удалось загрузить библиотеку для диаграммы.",g_years:"Шкала — годы в Gold Badge (сумма всех периодов)",g_y_short:"г.",g_periods:n=>`${n} ${plural(n,"период","периода","периодов")}`,g_active_now:"сейчас Gold Badge",g_former:"сейчас не в списке Gold Badge",g_note:"Данные: таблица списков Gold Badge владельца сайта — 41 список с августа 2021 по октябрь 2026 (обновлено 20.10.2026). Начало периода — дата квалификации из списка, конец — дата выхода первого списка без судьи.",all_cont:"Все континенты",cont_l:"Континент",conts:{AF:"Африка",AM:"Америка",AS:"Азия",EU:"Европа",OC:"Океания"},top_t:"Топ-10 активных судей",role_l:"Роль",both_roles:"Обе роли",metric_l:"Показатель",m_days:"Дни",m_cnt:"Количество",tab_days:"Дни на турнирах",d_short:" дн.",top_sub_days:y=>`Дни ${y} года на турнирах в выбранной роли, включая предстоящие назначения. В «Обе роли» день, когда человек был и судьёй, и рефери, считается один раз.`,clash:n=>`Совпадает по датам с «${n}» — в подсчётах не учитывается`,overlap_rule:"Если назначения пересекаются по датам, учитываем один турнир: тот, что начинается раньше; при одинаковом начале — более короткий; затем — более высокого уровня. Турниры подряд в одном городе, совпадающие только днём смены, учитываются оба.",top_sub:"Число турниров в выбранной роли по назначениям 2026 года.",sort:"Сортировка",sort_cnt:"Турниры",az:"А–Я",za:"Я–А",ret_gb:f=>f?"Вернулась к Gold Badge":"Вернулся к Gold Badge",ret_bb:f=>f?"Вернулась к Blue Badge":"Вернулся к Blue Badge",gb_hist:"Gold Badge в списках ITTF",present:"сейчас",feed_note:"Возвращения определены по архиву списков Gold Badge с августа 2022 и Blue Badge с января 2024.",ir_status:"Статус",th_ref:"Рефери",also_umpire:"Категория судьи",refs_sub:(n,l)=>`Список ITTF International Referees на 1 января 2026: ${n} рефери, ${l} из них также в списке международных судей. Число турниров — по назначениям 2026 года.`,src_ir:"List of ITTF International Referees 01.01.2026",src_trn:"URC Trainers & Evaluators Register 01.10.2025",src_trn:"URC Trainers & Evaluators Register 01.10.2025",
 missing:"Судьи нет в базе?",add:"Добавить",women:"женщин среди BB и GB",assoc_gb:"ассоциаций с Gold Badge",
 news:"Новое в списках ITTF",new_gb:"Новый Gold Badge",new_bb:"Новый Blue Badge",
 upcoming:"Ближайшие турниры",all_events:"Все турниры →",most:"Больше всего судей",all_countries:"Все страны →",
 by_country:"Судьи по странам",assoc_n:n=>`${n} ассоциаций`,
 list_all:"Все судьи",list_all_sub:"Международные судьи (активные и неактивные), национальные судьи и официальные лица Игр, которых мы знаем. Активные IU — по списку ITTF на 1 января 2026, с актуальными Blue и Gold Badge.",
 list_bb_sub:"Список Blue Badge Umpires на 1 октября 2026.",list_gb_sub:"Высшая категория ITTF. Список Gold Badge Umpires, октябрь 2026.",
 filter_aria:"Фильтр по имени",all_cat:"Все категории",all_assoc:"Все ассоциации",cat:"Категория",assoc:"Ассоциация",
 n_umpires:n=>`${fmt(n)} ${plural(n,"судья","судьи","судей")}`,th_umpire:"Судья",th_bb:"Blue Badge с",th_gb:"Gold Badge с",more:n=>`Показать ещё ${n}`,
 countries_sub:(n,a)=>`${n} ассоциаций — членов ITTF, в ${a} из них есть хотя бы один активный международный судья.`,
 intl_umpires:"международных судей",country_sys:"Судейство в стране",no_desc:"Описания пока нет",
 no_desc_t:"Здесь куратор страны расскажет, как получают национальные категории, какие есть экзамены, как отбирают судей на турниры и есть ли финансирование.",
 nat:"Национальные судьи",nat_empty:"Список не загружен",nat_empty_t:"Куратор сможет загрузить судей национальных категорий файлом CSV или Excel.",
 country_events:"Судьи страны на турнирах",
 ev_title:"Турниры",ev_sub:(n)=>`${n} турниров WTT, ITTF, континентальных федераций и мультиспортивных игр с опубликованными назначениями судей.`,
 period_up:"Предстоящие",period_past:"Прошедшие",period_all:"Все",ev_search:"Название или город",
 type_all:"Все",type_wtt:"WTT",type_youth:"WTT Youth",type_para:"Para",type_ittf:"ITTF",type_cont:"Континентальные",cont_ev_t:(f,r)=>`Континентальный турнир ${f} (${r}): участвуют только ассоциации этого континента`,ev_src_local:"Источник: письма о назначении судейских бригад (см. сноски в списке судей). Категория судьи — как в документе о назначении; если её там нет — по текущим спискам ITTF, а если человека нет и в списках — «категория не указана». Даты рядом с именем — если человек работает не все дни турнира.",type_other:"Другие",
 n_ump:n=>`${n} ${plural(n,"судья","судьи","судей")}`,refs_off:"Рефери и другие официальные лица",n_off_l:n=>plural(n,"офиц. лицо","офиц. лица","офиц. лиц"),n_ref:n=>`${n} ${plural(n,"рефери","рефери","рефери")}`,
 ev_none:"Под эти фильтры турниров нет.",now:"идёт сейчас",
 referees:"Рефери",umpires:"Судьи",countries_n:n=>`${n} ${plural(n,"страна","страны","стран")}`,days:n=>`${n} ${plural(n,"день","дня","дней")}`,
 ev_src:"Источник: назначения судей, опубликованные ITTF / WTT (выгрузка парсера 19.10.2026). Категория указана на момент назначения.",
 crumbs_events:"Турниры",not_listed:"нет в списках ITTF",
 career:"Карьерная лестница",nat_umpire:"Национальный судья",nat_umpire_s:"Категория присваивается национальной ассоциацией",
 iu_wb:"International Umpire · White Badge",since:d=>`с ${d}`,no_date:"дата в списке ITTF не указана",next:"Следующая ступень",top:"Высшая категория ITTF",
 bb_req:["Активный International Umpire не менее 2 лет и не менее 2 международных турниров за 2 года","Курс Advanced Umpires Training и экзамен ARE на английском","Интервью на английском","4 оценки «Meets Expectations» от 2+ эвалюаторов на 2+ турнирах"],
 gb_req:["Blue Badge не менее 2 лет","ARE на английском за последние 3 года","Не менее 3 Performance Assessments со средним баллом от 85% за 2 года"],
 tournaments:"Турниры",t_none:"Назначений пока нет",t_none_t:"В выгрузке назначений этого судьи нет. Судья сможет сам добавить неучтённые турниры.",
 as_umpire:"судья",upcoming_s:"Предстоящие",past_s:"Прошедшие",t_count:(n,y)=>`${n} ${plural(n,"турнир","турнира","турниров")} в ${y}`,
 often:"Чаще всего на одних турнирах",often_sub:n=>`${n} ${plural(n,"коллега","коллеги","коллег")} по турнирам 2026 года — судьи и рефери`,co_with:n=>`Общие турниры с ${n}`,per_src:s=>`по данным ${s}`,ius_act:"IU",ius_new:"IU, новый",ius_inact:"IU, неакт.",ius_nu:"NU",iu_doc:"ITTF URC — Umpire Career Development (15.01.2026)",iut_act_list:"Активный международный судья (ITTF Umpire Level 3): есть в списке ITTF «List of Active International Umpires» на 01.01.2026. Активен, кто отработал хотя бы 1 международный турнир за 2 предыдущих календарных года — п. 2.1 «ITTF Umpires Level 3 (IUs) “active”».",iut_act_worked:"Активный международный судья: в списке активных на 01.01.2026 его нет, но в 2026 году он работал на турнире. По п. 2.1 судья снова становится активным, отработав турнир («An umpire will be “active” again by working…»).",iut_new:"Новый международный судья: сдал экзамен IU в 2024 году (номер 24…), турниров ещё не было. Такие судьи активны в базе ITTF и могут подавать заявки на турниры до 31.12.2026, а в список активных попадают после первого турнира — п. 2.1.",iut_inact_og:"Архивный международный судья: участвовал в Олимпийских играх как официальное лицо ITTF или национальный технический персонал; в загруженных реестрах IU (2022, 2025, 2026) не найден, номер IU неизвестен. Решение куратора 25.10.2026.",iut_inact:"Неактивный международный судья: есть в реестре IU, но нет в списке активных на 01.01.2026, и турниров в 2026 году мы не видим. Может работать только на WTT Youth Contender или местным судьёй на турнирах ниже WTT Contender. С 01.01.2027 неактивный больше 4 лет должен пересдать экзамен (2026 — переходный год) — п. 2.1.",iut_nu:"National Umpire (ITTF Umpire Level 2, п. 1.2): нет ни в реестре IU ITTF на 01.11.2022, ни в списках активных IU 2025 и 2026 годов. Результаты экзамена IU 2026 года ещё не учтены.",extra_note_iu:"Этого судьи нет в списке активных IU на 01.01.2026; номер IU найден в реестре ITTF (01.11.2022) или в списке активных 2025 года. Профиль собран по назначениям на турниры; категория указана как в назначении.",loc_unknown:"Местные судьи для этого турнира пока не известны.",loc_types:"PDF, CSV, TXT, JPG или PNG, до 20 МБ. Excel и Word сохраните как PDF.",st_saving:"Сохраняю…",st_saved:"Сохранено. Заявка ушла куратору на проверку — её статус будет виден на этой странице.",st_nostore:"Чтобы отправить заявку, войдите по ссылке на email — кнопка «Войти» наверху страницы.",st_badtype:f=>`Файл «${f}» в неподдерживаемом формате: сохраните его как PDF.`,st_noright:"Нет прав на отправку. Попросите куратора дать вам доступ «Участник» (Contributor).",st_noassets:"Не удалось загрузить файл в хранилище. Попробуйте ещё раз или отправьте заявку без файла.",st_fail:"Не удалось сохранить. Попробуйте ещё раз.",st_users:"Добавлено пользователями",st_users_note:"Подтверждено куратором UMPIR.ES по заявкам с сайта.",st_mine:"Ваши заявки по этому турниру",st_pending:"на проверке",st_accepted:"принята",st_rejected:"отклонена",st_inbox:"Заявки",st_inbox_sub:"Заявки пользователей: «Это я!», «Добавить судью», «Я работал на этом турнире» и загруженные списки местных судей. Принятые «Я работал» сразу появляются на странице турнира; всё остальное вносится в справочник вручную.",st_pending_p:"На проверке",st_accepted_p:"Принятые",st_rejected_p:"Отклонённые",st_all_p:"Все",st_refresh:"Обновить",st_from:"Отправил",st_someone:"пользователь",st_dates:"Даты",st_who:"Кто (как указано)",st_accept_was:"Принять и показать на турнире",st_accept_loc:"Отметить как обработанную",st_reject:"Отклонить",st_reopen:"Вернуть на проверку",st_empty:"Здесь пока пусто.",st_loading:"Загрузка…",st_noadmin:"Эта страница доступна только кураторам (редакторам).",loc_upload:"Загрузить список местных судей",loc_was:"Я работал на этом турнире",loc_up_sub:"Подойдёт расписание судей, письмо о назначении или любой список судей этого турнира. Куратор проверит файл и добавит судей в базу.",loc_was_sub:"Укажите, кем и в какие дни вы работали. Куратор проверит и добавит вас к турниру.",loc_file:"Файл",loc_kind:"Что это за документ",loc_kinds:["Расписание судей","Письмо о назначении","Другой список судей"],loc_role:"Должность на турнире",loc_from:"С",loc_to:"По",loc_comment:"Комментарий",loc_ph_up:"Например: расписание финального дня; кто работал не все дни",loc_ph_was:"Например: работал только в квалификации",loc_privacy:"Из документов берутся только имена, номера IU, должности, ассоциации и даты. Паспортные данные, даты рождения и контакты не публикуются.",loc_check:"Участие подтверждает куратор — по документу или по словам коллег с этого турнира.",as_umpire_cap:"Судья",not_final:"не до конца",src_local:"Местный источник",src_rest:"Остальные — по назначениям ITTF/WTT.",venue:{"wem":"OVO Arena Wembley","cb":"Copper Box Arena","wem+cb":"OVO Arena Wembley и Copper Box Arena","nofinal":"нет в расписании последнего дня; точный последний день неизвестен","known":"по расписаниям известны только эти дни"},often_t:n=>`${n} ${plural(n,"общий турнир","общих турнира","общих турниров")}`,
 about:"О судье",sex:"Пол",female:"женский",male:"мужской",city:"Город",player:"Опыт игрока",uniform:"Униформа",match:"Запомнившийся матч",
 not_set:"не указан",not_set_f:"не указана",prof_empty:"Профиль не заполнен",prof_empty_t:"Если это вы, нажмите «Это я!» — после подтверждения сможете добавить фото, турниры и рассказ о себе.",
 colleagues:c=>`Коллеги: ${c}`,colleagues_n:n=>`${n} ${plural(n,"международный судья","международных судьи","международных судей")}`,all_n:n=>`Все ${n} →`,
 sources:"Источники",src_active:"List of Active International Umpires 01.01.2026",src_bb:"Blue Badge Umpires 01.10.2026",src_gb:"Gold Badge Umpires, октябрь 2026",src_ev:"назначения ITTF/WTT",proto:"Независимый кураторский проект.",
 extra_note:"Этого судьи нет в списках ITTF, которые мы загрузили. Профиль собран по назначениям на турниры; категория указана как в назначении.",
 claim_sub:"Заявку подтвердит куратор вашей страны или коллега из вашей ассоциации. После этого вы сможете заполнить профиль.",
 add_sub:"Предложите судью, которого нет в списках ITTF. Запись появится после проверки куратором страны.",
 your_profile:"Ваш профиль",ph_profile:"Фамилия или IU номер",name_l:"Фамилия и имя",cat_l:"Категория",nat_cat:"Национальная категория",
 email:"Email для связи",close:"Закрыть",send:"Отправить",sent:"Это прототип: заявка никуда не отправляется. На сайте она уйдёт куратору на проверку.",
 sex_aria:"Пол",yr_missing:" (год не указан)",
 months:["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"],
 months_nom:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],
 months_gen:["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],
 months_full:["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"],
 lv:{WB:"White Badge",BB:"Blue Badge",GB:"Gold Badge",BBP:"BB in progress",NU:"National Umpire",EV:"Evaluator",IR:"International Referee",IRA:"IR Advanced",UNK:"Категория не указана",prog:"в процессе"}
},
en:{
 nav_umpires:"All umpires",nav_ump_menu:"Umpires",dd_gold:"Gold Badge umpires",dd_blue:"Blue Badge umpires",dd_white:"White Badge umpires",list_w:"White Badge umpires",list_w_sub:"All International Umpires: White Badge is the base IU level, so Blue and Gold Badge holders are on this list too. Active and inactive.",th_status:"Status",st_active:"Active",st_inactive:"Inactive",dd_all:"All umpires →",nav_countries:"Countries",nav_events:"Tournaments",nav_graph:"Graph",gr_title:"Connections graph",gr_sub:(u,x,e,l)=>`${u} ${graphState.whoAll?"tournament officials":graphState.whoSel==="ref"?"referees":"umpires"} (${x} without a known ${graphState.whoAll?"IU / IR":graphState.whoSel==="ref"?"IR / IU":"IU"} number), ${e} tournaments. A line means two of them worked at the same tournament; its width shows how many (${l} pairs).`,gr_search:"Name, IU number or IR number",gr_all:"All links",gr_multi:"2+ shared tournaments",gr_reset:"Reset all",gr_leg_u:"umpire",gr_leg_u0:"IU number unknown",gr_noiu:"NU",gr_leg_w:"shared tournaments",gr_hint:"Hover a dot for the name; click for colleagues and shared tournaments. Scroll or pinch to zoom.",gr_pick:"Pick an umpire on the graph, or find an umpire or a tournament via search.",gr_ev_n:n=>`${n} ${n===1?"umpire":"umpires"}`,gr_u_n:n=>`${n} ${n===1?"tournament":"tournaments"}`,gr_col_n:n=>`${n} ${n===1?"colleague":"colleagues"}`,gr_strong:n=>`${n} with 2+ shared tournaments`,gr_strong_h:"Colleagues with 2+ shared tournaments",gr_shared:n=>`${n} shared ${n===1?"tournament":"tournaments"}`,gr_open:"Open page",gr_none:"Nothing found",claim:"That's me!",
 foot1:"Curated independent project. Not affiliated with the ITTF.",foot2:"Data: List of Active International Umpires 01.01.2026 · Blue Badge Umpires 01.10.2026 · Gold Badge Umpires 09.2026 · International Referees 01.01.2026 · WTT/ITTF selections as of 19.10.2026",
 eyebrow:"🏓 Curated match officials database",h1:"<span class=\"h1l\">Look yourself up.</span> <span class=\"h1l\"><span class=\"sr\">Meet fellow umpires, referees and officials.</span><span aria-hidden=\"true\">Meet fellow <span class=\"rot\" data-w=\"umpires.|referees.|officials.\">umpires.</span></span></span> <span class=\"h1l\">Share your experience.</span>",
 lead:"Table tennis umpires, referees and other tournament officials. <button type=\"button\" class=\"dl\" data-find>Find</button> or <button type=\"button\" class=\"dl\" data-add>add</button> yourself, or your colleagues.",
 search_ph:"Name, IU number or association",search_aria:"Search umpires",example:"Try:",nothing:"No one found.",add_umpire:"Add an umpire",assoc_lbl:"Assoc.",
 map_eyebrow:"Umpires and referees worldwide",map_note:"International Umpires and International Referees only",map_h:n=>`Map of match officials`,map_who:"Show",who_ump:"Umpires",who_ref:"Referees",legend_r:"International referees per country:",no_refs:"No international referees",tab_world:"World",tab_europe:"Europe",
 zoom_in:"Zoom in",zoom_out:"Zoom out",zoom_reset:"Show the whole world",map_hint:"Zoom with the buttons, a pinch or Ctrl + scroll. Drag to move the map.",
 map_aria:"Map: countries with international umpires",legend:"International umpires per country:",none:"none",small:"small territory",
 no_umpires:"No international umpires",c_none:"This association has no active international umpires yet.",c_nobody:n=>`We don’t know any match officials from ${n} yet`,level:"Level",inactive:"inactive",lv_tbd:"Level to be determined. This official worked at the Olympic or Paralympic Games, but we have no evidence yet that they are or are not an International Umpire. The level will be set once the status is confirmed.",c_add:"Add a match official",c_upload:"Upload a list",c_up_title:"Upload a list of match officials",c_up_sub:"Any list of international or national umpires, referees or other match officials from this association will do. The curator will check the file and add them to the database.",c_ph:"E.g. year of the list, national badge levels",c_kinds:["National umpires list","Referees list","Other list of match officials"],c_none_o:" Below are the referees and other officials from this association we know of.",ref_only:n=>`0 active umpires, ${fmt(n)} ${n===1?"referee":"referees"}`,tap_again:"Tap again to open",click_open:"Click to open",
 total_line:(n,r,c)=>`<b>${fmt(n)}</b> umpires and <b>${r}</b> referees from <b>${c}</b> associations`,
 nav_refs:"Referees",g_title:"Gold Badge over time",g_sub:"Periods each umpire spent on the Gold Badge list. Colour shows sex, the dashed line is today. Sorting by total time turns the chart into a ranking. Click a bar to open the profile.",g_status:"Status",g_active:"Current",g_expired:"Former",g_all:"All",g_f:"Women",g_m:"Men",g_sort:"Sort",g_ctry:"Country",g_ctry_all:"All countries",g_ctry_ph:"All countries",g_s_start:"by date awarded",g_s_year:"by IU year",g_s_dur:"by total time as GB",g_from:"From",g_to:"To",g_now:"to present",g_total:"Total as Gold Badge",g_days:"days",g_arch:"Period added from the ITTF list archive (month precision)",g_noload:"The chart library could not be loaded.",g_years:"Scale: years as Gold Badge (all periods combined)",g_y_short:"yrs",g_periods:n=>`${n} periods`,g_active_now:"currently Gold Badge",g_former:"not on the Gold Badge list now",g_note:"Data: the site owner's table of Gold Badge lists — 41 lists from August 2021 to October 2026 (updated 20.10.2026). A period starts at the qualification date in the list and ends on the date of the first list without the umpire.",all_cont:"All continents",cont_l:"Continent",conts:{AF:"Africa",AM:"Americas",AS:"Asia",EU:"Europe",OC:"Oceania"},top_t:"Top 10 most active officials",role_l:"Role",both_roles:"Both roles",metric_l:"Measure",m_days:"Days",m_cnt:"Count",tab_days:"Days at events",d_short:" d",top_sub_days:y=>`Days of ${y} at tournaments in the selected role, including upcoming selections. In “Both roles” a day counts once even if the person had both roles.`,clash:n=>`Overlaps with “${n}” — not counted`,overlap_rule:"When selections overlap, one event counts: the one that starts first; with the same start, the shorter one; then the higher-level one. Back-to-back events in the same city that share only the changeover day both count.",top_sub:"Number of events in the selected role, 2026 selections.",sort:"Sort",sort_cnt:"Tournaments",az:"A–Z",za:"Z–A",ret_gb:f=>"Back to Gold Badge",ret_bb:f=>"Back to Blue Badge",gb_hist:"Gold Badge in the ITTF lists",present:"present",feed_note:"Returns are detected from the archive of Gold Badge lists since August 2022 and Blue Badge lists since January 2024.",ir_status:"Status",th_ref:"Referee",also_umpire:"Umpire badge",refs_sub:(n,l)=>`ITTF International Referees list as of 1 January 2026: ${n} referees, ${l} of them also on the international umpires list. Tournament counts come from 2026 selections.`,src_ir:"List of ITTF International Referees 01.01.2026",src_trn:"URC Trainers & Evaluators Register 01.10.2025",src_trn:"URC Trainers & Evaluators Register 01.10.2025",
 missing:"Umpire not listed?",add:"Add",women:"women among BB and GB",assoc_gb:"associations with a Gold Badge",
 news:"New in the ITTF lists",new_gb:"New Gold Badge",new_bb:"New Blue Badge",
 upcoming:"Upcoming tournaments",all_events:"All tournaments →",most:"Most umpires",all_countries:"All countries →",
 by_country:"Umpires by country",assoc_n:n=>`${n} associations`,
 list_all:"All umpires",list_all_sub:"International umpires (active and inactive), national umpires and Games officials we know of. Active IU: ITTF list of 1 January 2026, with current Blue and Gold Badges.",
 list_bb_sub:"Blue Badge Umpires list as of 1 October 2026.",list_gb_sub:"The highest ITTF level. Gold Badge Umpires list, October 2026.",
 filter_aria:"Filter by name",all_cat:"All badges",all_assoc:"All associations",cat:"Badge",assoc:"Association",
 n_umpires:n=>`${fmt(n)} ${n===1?"umpire":"umpires"}`,th_umpire:"Umpire",th_bb:"Blue Badge since",th_gb:"Gold Badge since",more:n=>`Show ${n} more`,
 countries_sub:(n,a)=>`${n} ITTF member associations, ${a} of them with at least one active international umpire.`,
 intl_umpires:"international umpires",country_sys:"Umpiring in this country",no_desc:"No description yet",
 no_desc_t:"The country curator will explain how national badges are earned, which exams exist, how umpires are selected for events and whether travel is funded.",
 nat:"National umpires",nat_empty:"List not uploaded",nat_empty_t:"The curator will be able to upload national umpires as a CSV or Excel file.",
 country_events:"This country's umpires at tournaments",
 ev_title:"Tournaments",ev_sub:(n)=>`${n} WTT, ITTF, continental and multi-sport events with published umpire selections.`,
 period_up:"Upcoming",period_past:"Past",period_all:"All",ev_search:"Name or city",
 type_all:"All",type_wtt:"WTT",type_youth:"WTT Youth",type_para:"Para",type_ittf:"ITTF",type_cont:"Continental",cont_ev_t:(f,r)=>`Continental event, ${f} (${r}): open to that continent's associations only`,ev_src_local:"Source: officials' selection letters (see the footnotes in the umpire list). Badges are as given in the selection document; otherwise from the current ITTF lists, or \u201cnot stated\u201d for people not in the lists. Dates next to a name: that person works only part of the event.",type_other:"Other",
 n_ump:n=>`${n} ${n===1?"umpire":"umpires"}`,refs_off:"Referees & other officials",n_off_l:n=>n===1?"official":"officials",n_ref:n=>`${n} ${n===1?"referee":"referees"}`,
 ev_none:"No tournaments match these filters.",now:"in progress",
 referees:"Referees",umpires:"Umpires",countries_n:n=>`${n} ${n===1?"country":"countries"}`,days:n=>`${n} ${n===1?"day":"days"}`,
 ev_src:"Source: umpire selections published by the ITTF / WTT (parser export of 19.10.2026). Badges are as of the selection.",
 crumbs_events:"Tournaments",not_listed:"not in the ITTF lists",
 career:"Career ladder",nat_umpire:"National umpire",nat_umpire_s:"Awarded by the national association",
 iu_wb:"International Umpire · White Badge",since:d=>`since ${d}`,no_date:"date not given in the ITTF list",next:"Next step",top:"The highest ITTF level",
 bb_req:["Active International Umpire for at least 2 years, with at least 2 international events in the past 2 years","Advanced Umpires Training course and the ARE in English","Interview in English","4 “Meets Expectations” evaluations from 2+ evaluators at 2+ events"],
 gb_req:["Blue Badge for at least 2 years","ARE in English within the last 3 years","At least 3 Performance Assessments averaging 85% or more over 2 years"],
 tournaments:"Tournaments",t_none:"No selections yet",t_none_t:"This umpire is not in the selections export. Umpires will be able to add missing events themselves.",
 as_umpire:"umpire",upcoming_s:"Upcoming",past_s:"Past",t_count:(n,y)=>`${n} ${n===1?"tournament":"tournaments"} in ${y}`,
 often:"Most often at the same events",often_sub:n=>`${n} ${n===1?"colleague":"colleagues"} at 2026 events — umpires and referees`,often_t:n=>`${n} shared ${n===1?"event":"events"}`,co_with:n=>`Shared events with ${n}`,per_src:s=>`per ${s}`,ius_act:"IU",ius_new:"IU, new",ius_inact:"IU, inactive",ius_nu:"NU",iu_doc:"ITTF URC — Umpire Career Development (15 Jan 2026)",iut_act_list:"Active International Umpire (ITTF Umpire Level 3): listed in the ITTF “List of Active International Umpires” of 1 Jan 2026. An IU is active after officiating at least 1 international tournament in the previous 2 calendar years — §2.1 “ITTF Umpires Level 3 (IUs) ‘active’”.",iut_act_worked:"Active International Umpire: not in the active list of 1 Jan 2026, but worked at a tournament in 2026. Under §2.1 an umpire becomes active again by working at an event.",iut_new:"New International Umpire: passed the IU exam in 2024 (number 24…), no tournament yet. Such umpires are active in the ITTF database and may apply for events until 31 Dec 2026; they appear in the active list after their first event — §2.1.",iut_inact_og:"Archived International Umpire: an ITTF official or national technical official at the Olympic Games; not found in the loaded IU registers (2022, 2025, 2026), IU number unknown. Curator decision, 25 Oct 2026.",iut_inact:"Inactive International Umpire: in the IU register but not in the active list of 1 Jan 2026, and we see no tournament in 2026. May only be nominated for WTT Youth Contender events or as a local umpire below WTT Contender level. From 1 Jan 2027 an umpire inactive for more than 4 years must pass the exam again (2026 is a transition year) — §2.1.",iut_nu:"National Umpire (ITTF Umpire Level 2, §1.2): not in the ITTF IU register of 1 Nov 2022 nor in the 2025 and 2026 active IU lists. Results of the 2026 IU exam are not reflected yet.",extra_note_iu:"This umpire is not in the active IU list of 1 Jan 2026; the IU number was found in the ITTF register (1 Nov 2022) or the 2025 active list. The profile is built from tournament selections; the badge is as given in the selection.",loc_unknown:"Local umpires for this tournament are not known yet.",loc_types:"PDF, CSV, TXT, JPG or PNG, up to 20 MB. Save Excel and Word files as PDF.",st_saving:"Saving…",st_saved:"Saved. The request went to the curator for review — its status will show on this page.",st_nostore:"To send a submission, sign in with an email link — the “Sign in” button at the top of the page.",st_badtype:f=>`“${f}” is in an unsupported format: save it as PDF.`,st_noright:"You can’t submit yet. Ask the curator for Contributor access.",st_noassets:"The file could not be uploaded to storage. Try again, or send the submission without it.",st_fail:"Couldn’t save. Please try again.",st_users:"Added by users",st_users_note:"Confirmed by the UMPIR.ES curator from requests on the site.",st_mine:"Your requests for this tournament",st_pending:"under review",st_accepted:"accepted",st_rejected:"rejected",st_inbox:"Requests",st_inbox_sub:"User requests: “That’s me!”, “Add an umpire”, “I worked at this tournament” and uploaded lists of local umpires. Accepted “I worked here” entries appear on the tournament page right away; everything else is entered into the directory by hand.",st_pending_p:"Under review",st_accepted_p:"Accepted",st_rejected_p:"Rejected",st_all_p:"All",st_refresh:"Refresh",st_from:"Sent by",st_someone:"a user",st_dates:"Dates",st_who:"Who (as entered)",st_accept_was:"Accept and show on the tournament",st_accept_loc:"Mark as processed",st_reject:"Reject",st_reopen:"Return to review",st_empty:"Nothing here yet.",st_loading:"Loading…",st_noadmin:"This page is for curators (editors) only.",loc_upload:"Upload a list of local umpires",loc_was:"I worked at this tournament",loc_up_sub:"An umpire schedule, a selection letter or any list of umpires at this tournament will do. The curator will check the file and add the umpires to the database.",loc_was_sub:"Tell us your role and the days you worked. The curator will check and add you to the tournament.",loc_file:"File",loc_kind:"What kind of document",loc_kinds:["Umpire schedule","Selection letter","Other list of umpires"],loc_role:"Role at the tournament",loc_from:"From",loc_to:"To",loc_comment:"Comment",loc_ph_up:"E.g. final-day schedule; who did not work every day",loc_ph_was:"E.g. worked in the qualification only",loc_privacy:"Only names, IU numbers, roles, associations and dates are taken from documents. Passport data, dates of birth and contacts are never published.",loc_check:"The curator confirms participation — from a document or from colleagues at this tournament.",as_umpire_cap:"Umpire",not_final:"left early",src_local:"Local source",src_rest:"Everyone else: ITTF/WTT selections.",venue:{"wem":"OVO Arena Wembley","cb":"Copper Box Arena","wem+cb":"OVO Arena Wembley & Copper Box Arena","nofinal":"not on the final-day schedule; exact last day unknown","known":"only these days are known from the schedules"},
 about:"About",sex:"Sex",female:"female",male:"male",city:"City",player:"Playing experience",uniform:"Uniform",match:"Most memorable match",
 not_set:"not given",not_set_f:"not given",prof_empty:"Profile not filled in",prof_empty_t:"If this is you, press “That's me!” — once confirmed you can add a photo, tournaments and your story.",
 colleagues:c=>`Colleagues: ${c}`,colleagues_n:n=>`${n} international ${n===1?"umpire":"umpires"}`,all_n:n=>`All ${n} →`,
 sources:"Sources",src_active:"List of Active International Umpires 01.01.2026",src_bb:"Blue Badge Umpires 01.10.2026",src_gb:"Gold Badge Umpires, October 2026",src_ev:"ITTF/WTT selections",proto:"Curated independent project.",
 extra_note:"This umpire is not in the ITTF lists we loaded. The profile is built from tournament selections; the badge is as given in the selection.",
 claim_sub:"Your country curator or a colleague from your association will confirm the request. Then you can fill in your profile.",
 add_sub:"Suggest an umpire who is not in the ITTF lists. The entry appears after the country curator checks it.",
 your_profile:"Your profile",ph_profile:"Surname or IU number",name_l:"Surname and first name",cat_l:"Badge",nat_cat:"National badge",
 email:"Contact email",close:"Close",send:"Send",sent:"This is a prototype: nothing is sent. On the live site the request goes to the curator.",
 sex_aria:"Sex",yr_missing:" (year not given)",
 months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
 months_full:["January","February","March","April","May","June","July","August","September","October","November","December"],
 lv:{WB:"White Badge",BB:"Blue Badge",GB:"Gold Badge",BBP:"BB in progress",NU:"National Umpire",EV:"Evaluator",IR:"International Referee",IRA:"IR Advanced",UNK:"Badge not stated",prog:"in progress"}
}};
let LANG="en"; try{const s=localStorage.getItem("umpires_lang");if(s==="en"||s==="ru")LANG=s;}catch(_){}
const T=()=>I18N[LANG];
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m==1&&h!=11?a:(m>=2&&m<=4&&(h<10||h>=20)?b:c)};
const fmt = n=>n.toLocaleString(LANG==="ru"?"ru-RU":"en-GB");

/* ---------- data ---------- */
/* ITTF member associations with no active international umpire (directory.ittf.com, 227 members); pages exist for all (curator 30.10.2026) */
const ASSOC_X = [["Afghanistan", "AFG"], ["American Samoa", "ASA"], ["Andorra", "AND"], ["Angola", "ANG"], ["Anguilla", "AIA"], ["Antigua and Barbuda", "ANT"], ["Armenia", "ARM"], ["Aruba", "ARU"], ["Bahamas", "BAH"], ["Bangladesh", "BAN"], ["Belize", "BIZ"], ["Bermuda", "BER"], ["Bhutan", "BHU"], ["Bonaire", "BES"], ["British Virgin Islands", "IVB"], ["Burkina Faso", "BUR"], ["Burundi", "BDI"], ["Cambodia", "CAM"], ["Cape Verde", "CPV"], ["Cayman Islands", "CAY"], ["Central Africa", "CAF"], ["Chad", "CHA"], ["Comoros", "COM"], ["Congo Brazzaville", "CGO"], ["Congo Democratic", "COD"], ["Cook Islands", "COK"], ["Dominica W.I.", "DMA"], ["East Timor", "TLS"], ["Equatorial Guinea", "GEQ"], ["Eritrea", "ERI"], ["Eswatini", "SWZ"], ["Ethiopia", "ETH"], ["Falkland Islands", "FLK"], ["Faroe Islands", "FRO"], ["Fiji", "FIJ"], ["Gabon", "GAB"], ["Gambia", "GAM"], ["Gibraltar", "GIB"], ["Greenland", "GRL"], ["Grenada", "GRN"], ["Guam", "GUM"], ["Guinea", "GUI"], ["Guinea-Bissau", "GBS"], ["Guyana", "GUY"], ["Haiti", "HAI"], ["Ireland", "IRL"], ["Isle of Man", "IMN"], ["Jersey", "JEY"], ["Kenya", "KEN"], ["Kiribati", "KIR"], ["Kyrgyzstan", "KGZ"], ["Laos", "LAO"], ["Liberia", "LBR"], ["Liechtenstein", "LIE"], ["Malawi", "MAW"], ["Mali", "MLI"], ["Malta", "MLT"], ["Marshall Islands", "MHL"], ["Mauritania", "MTN"], ["Mauritius", "MRI"], ["Micronesia", "FSM"], ["Moldova", "MDA"], ["Monaco", "MON"], ["Mozambique", "MOZ"], ["Namibia", "NAM"], ["Nauru", "NRU"], ["Niger", "NIG"], ["Niue", "NIU"], ["Norfolk Island", "NFK"], ["Northern Mariana Islands", "MNP"], ["Palau", "PLW"], ["Papua New Guinea", "PNG"], ["Rwanda", "RWA"], ["Saint Kitts and Nevis", "SKN"], ["Samoa", "SAM"], ["San Marino", "SMR"], ["Sao Tome and Principe", "STP"], ["Seychelles", "SEY"], ["Sierra Leone", "SLE"], ["Solomon Islands", "SOL"], ["Somalia", "SOM"], ["South Sudan", "SSD"], ["Sri Lanka", "SRI"], ["St. Lucia", "LCA"], ["St. Maarten", "MAF"], ["St. Vincent", "VIN"], ["Sudan", "SUD"], ["Suriname", "SUR"], ["Tahiti", "PYF"], ["Tajikistan", "TJK"], ["Tanzania", "TAN"], ["Togo", "TOG"], ["Tokelau", "TKL"], ["Tonga", "TGA"], ["Turkmenistan", "TKM"], ["Tuvalu", "TUV"], ["US Virgin Islands", "ISV"], ["Uruguay", "URU"], ["Uzbekistan", "UZB"], ["Vanuatu", "VAN"], ["Vietnam", "VIE"], ["Wallis and Futuna", "WLF"], ["Zimbabwe", "ZIM"]];
const MAP_ASSOC = {"Afghanistan": "AFG", "Anguilla": "AIA", "Andorra": "AND", "Angola": "ANG", "Antigua and Barb.": "ANT", "Armenia": "ARM", "Aruba": "ARU", "American Samoa": "ASA", "Bahamas": "BAH", "Bangladesh": "BAN", "Burundi": "BDI", "Bermuda": "BER", "Bhutan": "BHU", "Belize": "BIZ", "Burkina Faso": "BUR", "Central African Rep.": "CAF", "Cambodia": "CAM", "Cayman Is.": "CAY", "Congo": "CGO", "Chad": "CHA", "Dem. Rep. Congo": "COD", "Cook Is.": "COK", "Comoros": "COM", "Cabo Verde": "CPV", "Dominica": "DMA", "Eritrea": "ERI", "Ethiopia": "ETH", "Fiji": "FIJ", "Falkland Is.": "FLK", "Faeroe Is.": "FRO", "Micronesia": "FSM", "Gabon": "GAB", "Gambia": "GAM", "Guinea-Bissau": "GBS", "Eq. Guinea": "GEQ", "Greenland": "GRL", "Grenada": "GRN", "Guinea": "GUI", "Guam": "GUM", "Guyana": "GUY", "Haiti": "HAI", "Isle of Man": "IMN", "Ireland": "IRL", "U.S. Virgin Is.": "ISV", "British Virgin Is.": "IVB", "Jersey": "JEY", "Kenya": "KEN", "Kyrgyzstan": "KGZ", "Kiribati": "KIR", "Laos": "LAO", "Liberia": "LBR", "Saint Lucia": "LCA", "Liechtenstein": "LIE", "St-Martin": "MAF", "Malawi": "MAW", "Moldova": "MDA", "Marshall Is.": "MHL", "Mali": "MLI", "Malta": "MLT", "N. Mariana Is.": "MNP", "Monaco": "MON", "Mozambique": "MOZ", "Mauritius": "MRI", "Mauritania": "MTN", "Namibia": "NAM", "Norfolk Island": "NFK", "Niger": "NIG", "Niue": "NIU", "Nauru": "NRU", "Palau": "PLW", "Papua New Guinea": "PNG", "Fr. Polynesia": "PYF", "Rwanda": "RWA", "Samoa": "SAM", "Seychelles": "SEY", "St. Kitts and Nevis": "SKN", "Sierra Leone": "SLE", "San Marino": "SMR", "Solomon Is.": "SOL", "Somalia": "SOM", "Sri Lanka": "SRI", "S. Sudan": "SSD", "São Tomé and Principe": "STP", "Sudan": "SUD", "Suriname": "SUR", "eSwatini": "SWZ", "Tanzania": "TAN", "Tonga": "TGA", "Tajikistan": "TJK", "Turkmenistan": "TKM", "Timor-Leste": "TLS", "Togo": "TOG", "Uruguay": "URU", "Uzbekistan": "UZB", "Vanuatu": "VAN", "Vietnam": "VIE", "St. Vin. and Gren.": "VIN", "Wallis and Futuna Is.": "WLF", "Zimbabwe": "ZIM", "Northern Ireland": "IRL", "Sint Maarten": "MAF"}; /* map shape name -> code */
const COUNTRIES = DATA.c.concat(ASSOC_X).map(([name,code],i)=>({i,name,code:code||"",slug:"c"+name.toLowerCase().replace(/[^a-z]/g,""),list:[]}));
const CBYCODE = new Map(COUNTRIES.map(c=>[c.code,c]));
const byName=(a,b)=>a.name.localeCompare(b.name);
const OFF = DATA.o.map((a,k)=>({k,iu:a[0],sur:a[1],first:a[2],c:COUNTRIES[a[3]],lvl:a[4],sex:a[5],bb:a[6],gb:a[7],are:a[8],act:a[9],asg:[]}));
/* current name differs from the ITTF list (curator, 19.10.2026) */
const NAME_NOW={14809:["VASINOVA","Karina"]};
OFF.forEach(o=>{const n=NAME_NOW[o.iu];if(n){o.aka=o.sur+" "+o.first;o.sur=n[0];o.first=n[1];}});
const BYIU = new Map(OFF.map(o=>[o.iu,o]));
OFF.forEach(o=>o.c.list.push(o));
const EXTRA = EV.x.map((a,k)=>({k,x:true,sur:a[0],first:a[1],cname:a[2],c:a[3]>=0?COUNTRIES[a[3]]:(CBYCODE.get(a[5])||null),csv:a[4],code:a[5]||"",iuX:a[6]||0,arch:a[7]===1||a[7]===3,ogp:a[7]===2,ogo:false,asg:[]})); /* a[7]===3 = Games official (jury, TD, NTO) without IU evidence: was TBA (25.10.2026); since 01.11.2026 an archived IU, level WB (curator: any non-umpire officiating role at an international event implies at least IU) */ /* arch = archived IU without a known number (Olympic officials 2000–2020, curator 25.10.2026) */
/* Roles at an event. Referee roles count as refereeing; the others are event officials (shown, not counted in the referee top-10). */
const ROLES=[["Technical Delegate","TD"],["Assistant Technical Delegate","Asst. TD"],["Competition Manager","CM"],["Assistant Competition Manager","Asst. CM"],["Jury Member","Jury"],["Technical Officials Supervisor","TO Supervisor"],["Referee",""],["Deputy Referee",""],["Assistant Referee",""],["Referee Team",""],["Racket Tester","RCC"],["TTR Match Official","TTR"]]; /* Racket Tester, TTR Match Official: Mixed Team World Cup 2026 roster (curator 27.10.2026) */
const ROLE_IX=new Map(ROLES.map((r,i)=>[r[0],i]));
const REF_ROLES=new Set(["Referee","Deputy Referee","Assistant Referee","Referee Team"]);
const isRefRole=r=>REF_ROLES.has(r);
const roleShort=r=>{const x=ROLES[ROLE_IX.get(r)];return x&&x[1]?`<abbr title="${r}">${x[1]}</abbr>`:esc(r);};
/* IU status (owner's rules, Oct 2026; may change from 2027):
   IU          — in the ITTF active list 01.01.2026, or worked at a tournament in 2026 that has started
   IU, new     — passed the IU exam in 2024 (number 24…) and no tournament yet
   IU, inact.  — in the IU register (01.11.2022) or the 2025 active list, not active
   NU          — in none of the registers (the 2026 exam is not reflected yet)
   Only people with a profile (2026 list or seen at a tournament) get a status. */
const IU_DOC="https://www.ittf.com/committees/umpires-referees/documents";
function iuStatus(p){
  if(p.ogo) return null;
  if(p.isRef) return p.iuR?{k:String(p.iuR).padStart(5,"0").startsWith("24")?"new":"inact",iu:p.iuR}:null;
  if(!p.x) return {k:"act",why:"list",iu:p.iu};
  if(!p.iuX) return p.arch?{k:"inact",why:"og"}:{k:"nu"};
  if(p.asg.some(a=>a.role==="umpire"&&a.e.s<=TODAY)) return {k:"act",why:"worked",iu:p.iuX};
  return {k:String(p.iuX).padStart(5,"0").startsWith("24")?"new":"inact",iu:p.iuX};
}
function iuChip(p,withNum=true){
  const s=iuStatus(p); if(!s) return "";
  const t=T(); const lab=t["ius_"+s.k]; const tip=t["iut_"+s.k+(s.why?"_"+s.why:"")];
  return `<span class="idn"><span class="iust" tabindex="0">${lab}<span class="iutip" role="tooltip">${tip} <a href="${IU_DOC}" target="_blank" rel="noopener">${t.iu_doc}</a></span></span>${withNum&&s.iu?` <span class="num">${String(s.iu).padStart(5,"0")}</span>`:""}</span>`;
}
const roleName=r=>r==="umpire"?T().as_umpire_cap:r;
const nRef=e=>e.ref.filter(r=>isRefRole(r.role)).length, nOff=e=>e.ref.length-nRef(e);
const SRC = EV.src||[];
const srcLink=(k,label)=>SRC[k][2]?`<a href="${SRC[k][2]}" target="_blank" rel="noopener">${label}</a>`:label; /* letters/forms with no public URL are named, not linked */ /* [publisher, title, url] — local sources */
const EVENTS = EV.ev.map((a,i)=>({i,name:a[0],s:a[1],e:a[2],type:a[3],fed:a[4]||"",region:a[5]||"",ump:[],ref:[]})); /* type "cont" = continental event (fed: ETTU…, region: EU…), not open to all associations */
/* IU numbers of referees who are not in the 2026 active IU list (matched by name + association with the IU register 2022 / list 2025, 19.10.2026) */
/* Paralympic Games (Rio 2016 + Paris 2024 ITO lists; Rio PG not linked: CHEE Christina MAS Asst TD, GHEORGHE USA, STEVENSON AUS jury; RAGAB ElSaied EGY = ATTA Assayed Ragab 04106, WIEKART-JAGER Ina NED = 88007 — confirmed by the curator 19.10.2026): same key as OLY → [[year, role u/r/d/td/jc/jd/j, source p = Paris 2024 ITOs list (PDF from the curator, 19.10.2026)]]. Not matched to an IU: WU Sheng-kuang TPE (Jury Deputy Chair), KAJEE Hajera RSA, CALLE Paul ECU, SANDLEY Sarah AUS (Jury), */
/* Blue Badge qualification dates (earliest «Qualified on») from the Blue Badge lists 01.01.2024 – 01.10.2026 in Umpires_Lists (curator 28.10.2026); used where the current list gives no date, e.g. umpires now on the Gold Badge list */
/* BB date shown: the current list's date, else the earliest BB-list date — but only if it precedes the first Gold Badge period (a later one is a return from GB, not the qualification) */
const bbDate=(o,iu)=>{const g=GBH.gbp[iu], ok=d=>!!d&&!(o.lvl===2&&g&&g.length&&d.slice(0,7)>=g[0][0])&&!(o.lvl!==2&&!o.bb&&g&&g.length&&d.slice(0,7)>=g[0][0]);return ok(o.bb)?o.bb:ok(BBQ[iu])?BBQ[iu]:"";};
const REFS = (EV.ir||[]).map((a,k)=>{const o=a[7]>=0?OFF[a[7]]:null;const r={k,ir:a[0],iuR:REF_IU[a[0]]||0,sur:a[1].toUpperCase(),first:a[2],c:a[3]>=0?COUNTRIES[a[3]]:(CBYCODE.get(a[4])||null),code:a[4],sex:a[6],o,st:a[8]||"A",asg:[],isRef:true};if(o){o.irNo=a[0];o.irSt=r.st;}return r;});
TRN.forEach(([iu,ir,ev,mt])=>{const r=ir?REFS.find(x=>x.ir===ir):null;const p=(iu&&BYIU.get(iu))||(r&&(r.o||r));if(!p)return;p.evl=p.evl||!!ev;p.mnt=p.mnt||!!mt;});
const roleChips=p=>(p.evl?`<span class="badge bt">Evaluator</span>`:"")+(p.mnt?`<span class="badge bt">Mentor</span>`:"");
const CONT = {"AFG": "AS", "AIA": "AM", "ALB": "EU", "ALG": "AF", "AND": "EU", "ANG": "AF", "ANT": "AM", "ARG": "AM", "ARM": "EU", "ARU": "AM", "ASA": "OC", "AUS": "OC", "AUT": "EU", "AZE": "EU", "BAH": "AM", "BAN": "AS", "BAR": "AM", "BDI": "AF", "BEL": "EU", "BEN": "AF", "BER": "AM", "BES": "AM", "BHU": "AS", "BIH": "EU", "BIZ": "AM", "BLR": "EU", "BOL": "AM", "BOT": "AF", "BRA": "AM", "BRN": "AS", "BRU": "AS", "BUL": "EU", "BUR": "AF", "CAF": "AF", "CAM": "AS", "CAN": "AM", "CAY": "AM", "CGO": "AF", "CHA": "AF", "CHI": "AM", "CHN": "AS", "CIV": "AF", "CMR": "AF", "COD": "AF", "COK": "OC", "COL": "AM", "COM": "AF", "CPV": "AF", "CRC": "AM", "CRO": "EU", "CUB": "AM", "CUW": "AM", "CYP": "EU", "CZE": "EU", "DEN": "EU", "DJI": "AF", "DMA": "AM", "DOM": "AM", "ECU": "AM", "EGY": "AF", "ENG": "EU", "ERI": "AF", "ESA": "AM", "ESP": "EU", "EST": "EU", "ETH": "AF", "FIJ": "OC", "FIN": "EU", "FLK": "AM", "FRA": "EU", "FRO": "EU", "FSM": "OC", "GAB": "AF", "GAM": "AF", "GBS": "AF", "GEO": "EU", "GEQ": "AF", "GER": "EU", "GGY": "EU", "GHA": "AF", "GIB": "EU", "GRE": "EU", "GRL": "EU", "GRN": "AM", "GUA": "AM", "GUI": "AF", "GUM": "OC", "GUY": "AM", "HAI": "AM", "HKG": "AS", "HON": "AM", "HUN": "EU", "IMN": "EU", "INA": "AS", "IND": "AS", "IRI": "AS", "IRL": "EU", "IRQ": "AS", "ISL": "EU", "ISR": "EU", "ISV": "AM", "ITA": "EU", "IVB": "AM", "JAM": "AM", "JEY": "EU", "JOR": "AS", "JPN": "AS", "KAZ": "AS", "KEN": "AF", "KGZ": "AS", "KIR": "OC", "KOR": "AS", "KOS": "EU", "KSA": "AS", "KUW": "AS", "LAO": "AS", "LAT": "EU", "LBA": "AF", "LBN": "AS", "LBR": "AF", "LCA": "AM", "LES": "AF", "LIE": "EU", "LTU": "EU", "LUX": "EU", "MAC": "AS", "MAD": "AF", "MAF": "AM", "MAR": "AF", "MAS": "AS", "MAW": "AF", "MDA": "EU", "MDV": "AS", "MEX": "AM", "MGL": "AS", "MHL": "OC", "MKD": "EU", "MLI": "AF", "MLT": "EU", "MNE": "EU", "MNP": "OC", "MON": "EU", "MOZ": "AF", "MRI": "AF", "MTN": "AF", "MYA": "AS", "NAM": "AF", "NCA": "AM", "NCL": "OC", "NED": "EU", "NEP": "AS", "NFK": "OC", "NGR": "AF", "NIG": "AF", "NIU": "OC", "NOR": "EU", "NRU": "OC", "NZL": "OC", "OMA": "AS", "PAK": "AS", "PAN": "AM", "PAR": "AM", "PER": "AM", "PHI": "AS", "PLE": "AS", "PLW": "OC", "PNG": "OC", "POL": "EU", "POR": "EU", "PRK": "AS", "PUR": "AM", "PYF": "OC", "QAT": "AS", "ROU": "EU", "RSA": "AF", "RUS": "EU", "RWA": "AF", "SAM": "OC", "SCO": "EU", "SEN": "AF", "SEY": "AF", "SGP": "AS", "SKN": "AM", "SLE": "AF", "SLO": "EU", "SMR": "EU", "SOL": "OC", "SOM": "AF", "SRB": "EU", "SRI": "AS", "SSD": "AF", "STP": "AF", "SUD": "AF", "SUI": "EU", "SUR": "AM", "SVK": "EU", "SWE": "EU", "SWZ": "AF", "SYR": "AS", "TAN": "AF", "TGA": "OC", "THA": "AS", "TJK": "AS", "TKL": "OC", "TKM": "AS", "TLS": "AS", "TOG": "AF", "TPE": "AS", "TTO": "AM", "TUN": "AF", "TUR": "EU", "TUV": "OC", "UAE": "AS", "UGA": "AF", "UKR": "EU", "URU": "AM", "USA": "AM", "UZB": "AS", "VAN": "OC", "VEN": "AM", "VIE": "AS", "VIN": "AM", "WAL": "EU", "WLF": "OC", "YEM": "AS", "ZAM": "AF", "ZIM": "AF"}; /* by ITTF code, from directory.ittf.com (227 member associations) */
const contOf = p=>{const k=p.c?p.c.code:(p.code||({Uzbekistan:"UZB"})[p.cname]||"");return CONT[k]||({NIR:"EU"})[k]||"";};
const contChip = k=>k?`<abbr class="cont" title="${T().conts[k]}">${k}</abbr>`:"";
const XNAME = {URU:"Uruguay"};
const ASSOC_N = new Set(COUNTRIES.filter(c=>c.list.length).map(c=>c.code).concat(REFS.map(r=>r.code))).size;
const ACTIVE_C = COUNTRIES.filter(c=>c.list.length);
const refsOf = c=>REFS.filter(r=>r.c===c&&!r.o);
const person = r=>r>=0?OFF[r]:EXTRA[-1-r];
EV.ua.forEach(([ei,r,lv,src,note,ds,de,urole])=>{const p=person(r),e=EVENTS[ei];src=src==null?null:src;e.ump.push({p,lv,src,note,ds,de,urole:urole||null});p.asg.push({e,role:"umpire",urole:urole||null,lv,src,note,ds,de});}); /* urole: a special umpire role shown in the Umpires list, e.g. TTR Match Official (curator 29.10.2026) */
EV.ra.forEach(([ei,r,role,src,note,ds,de])=>{const e=EVENTS[ei];src=src==null?null:src;const p=typeof r==="number"?(r>=0?(REFS[r].o||REFS[r]):OFF[-1-r]):(typeof r==="string"&&/^x\d+$/.test(r)?EXTRA[+r.slice(1)]:null);e.ref.push({p,name:p?null:r,role,src,ds,de});if(p)p.asg.push({e,role,lv:null,src,note,ds,de});});
/* a person's working days at an event: their own dates if the selection gives them, else the event dates */
const EV_BY_DATE=EVENTS.slice().sort((a,b)=>a.s.localeCompare(b.s)||a.e.localeCompare(b.e));
const rngOf=(p,e)=>{let s=null,x=null;p.asg.forEach(a=>{if(a.e!==e)return;const as=a.ds||e.s,ae=a.de||e.e;if(!s||as<s)s=as;if(!x||ae>x)x=ae;});return [s||e.s,x||e.e];};
const TODAY = new Date().toISOString().slice(0,10);
const LVLKEY=["WB","BB","GB"];
const GBM = {January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12};
const $ = s=>document.querySelector(s);
const esc = s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fullName = o=>(o.first?o.first+" ":"")+o.sur;
const href = p=>p.isRef?`#r${p.ir}`:p.x?`#x${p.k}`:`#u${p.iu}`;
const fmtDate = d=>{ if(!d) return ""; const [y,m,dd]=d.split("-"); return `${+dd} ${T().months[m-1]} ${y}`; };
const fmtRange = (s,e)=>{const [y1,m1,d1]=s.split("-"),[y2,m2,d2]=e.split("-");const M=T().months;if(s===e)return `${+d1} ${M[m1-1]} ${y1}`;
  if(y1===y2&&m1===m2) return `${+d1}–${+d2} ${M[m1-1]} ${y1}`; if(y1===y2) return `${+d1} ${M[m1-1]} – ${+d2} ${M[m2-1]} ${y1}`; return `${fmtDate(s)} – ${fmtDate(e)}`;};
const gbKey = s=>{ const p=s.split(" "); return (+p[1]||0)*100+(GBM[p[0]]||0); };
const fmtGbSince = s=>{ const p=s.split(" "); return (T().months_gen||T().months_full)[(GBM[p[0]]||1)-1]+(p[1]?" "+p[1]:T().yr_missing); };
const fmtGb = s=>{ const p=s.split(" "); return T().months_full[(GBM[p[0]]||1)-1]+(p[1]?" "+p[1]:T().yr_missing); };
const badge = l=>`<span class="badge b${l}">${T().lv[LVLKEY[l]]}</span>`;
const irBadge = st=>{const t=T();const adv=(st||"A").startsWith("AR"),prog=(st||"").endsWith("C");return `<span class="badge bi"${prog?' style="border-style:dashed"':""} title="${adv?t.lv.IRA:t.lv.IR}${prog?" · "+t.lv.prog:""}">${adv?(prog?"IR A(C)":"IR A"):"IR"}</span>`;};
const csvBadge = lv=>{const cls={WB:"b0",BB:"b1",GB:"b2",BBP:"bp",NU:"bx",EV:"bx",UNK:"bx"}[lv]||"bx";return `<span class="badge ${cls}">${T().lv[lv]||lv}</span>`;};
const evStatus = e=>e.e<TODAY?"past":e.s>TODAY?"up":"now";
const evName = e=>e.name.replace(/\b(\w)(\w*)/g,(m,a,b)=>a+b.toLowerCase()).replace(/\bWtt\b/g,"WTT").replace(/\bIttf\b/g,"ITTF").replace(/\bFisu\b/g,"FISU").replace(/\b(Ettu|Attu)\b/g,m=>m.toUpperCase()).replace(/\bIi\b/g,"II").replace(/\bIii\b/g,"III").replace(/'S\b/g,"'s");
const typeChip = e=>e.type==="cont"?`<span class="evtype t-cont" title="${T().cont_ev_t(e.fed,T().conts[e.region]||e.region)}">${e.fed||T().type_cont} · ${e.region}</span>`:`<span class="evtype t-${e.type}">${T()["type_"+e.type]}</span>`;

const counts = [0,0,0]; OFF.forEach(o=>counts[o.lvl]++);
const total = OFF.length;
const assocWithGB = new Set(OFF.filter(o=>o.lvl==2).map(o=>o.c.i)).size;
const topBadge = OFF.filter(o=>o.lvl>0);
const women = topBadge.filter(o=>o.sex==="F").length;
const PEOPLE = OFF.concat(EXTRA.filter(x=>x.asg.length||x.arch||x.ogp||x.ogo),REFS.filter(r=>!r.o));

function searchOff(q,limit=8){
  q=q.trim().toLowerCase(); if(!q) return [];
  const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
  const nq=norm(q);
  if(/^\d+$/.test(q)) return OFF.filter(o=>String(o.iu).startsWith(String(+q))).slice(0,limit);
  const hits=[];
  for(const o of PEOPLE){ const a=norm(o.sur+" "+o.first+(o.aka?" "+o.aka:"")), b=norm(o.first+" "+o.sur);
    if(a.startsWith(nq)||b.startsWith(nq)) hits.unshift(o); else if(a.includes(nq)) hits.push(o);
    if(hits.length>200) break; }
  return hits.slice(0,limit);
}

/* ---------- map ---------- */
const BUCKETS_U=[[1,4],[5,14],[15,39],[40,Infinity]], BUCKETS_R=[[1,1],[2,2],[3,5],[6,Infinity]];
const mapView={k:1,tx:0,ty:0,tab:"world",who:"ump"}; /* who: "ump" | "ref" (curator 30.10.2026: default Umpires) */
const curBuckets=()=>mapView.who==="ref"?BUCKETS_R:BUCKETS_U;
const bucket=n=>n?curBuckets().findIndex(([a,b])=>n>=a&&n<=b)+1:0;
let REFN=null; const refN=c=>{if(!REFN){REFN=new Map();REFS.forEach(r=>{if(r.c)REFN.set(r.c,(REFN.get(r.c)||0)+1);});}return REFN.get(c)||0;};
const cCount=c=>mapView.who==="ref"?refN(c):c.list.length;
const shapeCount=s=>s.ci.reduce((t,i)=>t+cCount(COUNTRIES[i]),0);
function mapSvg(){
  const t=T();
  if(!MAP){
    ensureMap().then(()=>route(true)).catch(()=>{const el=$("#maploading");if(el)el.textContent=(MAP_T[LANG]||MAP_T.en).err;});
    return `<div class="map" style="min-height:260px;display:grid;place-items:center"><span class="muted" id="maploading">${t.st_loading}</span></div>`;
  }
  return `<div class="mapbar">
      <div class="tabs" role="tablist" aria-label="Map">
        <button type="button" role="tab" data-view="world" aria-selected="${mapView.tab==="world"}">${t.tab_world}</button>
        <button type="button" role="tab" data-view="europe" aria-selected="${mapView.tab==="europe"}">${t.tab_europe}</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-left:auto"><div class="tabs" role="tablist" aria-label="${t.map_who}">
        <button type="button" role="tab" data-who="ump" aria-selected="${mapView.who==="ump"}">${t.who_ump}</button>
        <button type="button" role="tab" data-who="ref" aria-selected="${mapView.who==="ref"}">${t.who_ref}</button>
      </div>
      <div class="zoom"><button type="button" data-z="in" aria-label="${t.zoom_in}">+</button><button type="button" data-z="out" aria-label="${t.zoom_out}">−</button><button type="button" data-z="reset" aria-label="${t.zoom_reset}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></div></div>
    </div>
    <div class="map" id="map"><svg id="msvg" viewBox="0 0 ${MAP.w} ${MAP.h}" role="img" aria-label="${t.map_aria}">
      <g id="mg">${MAP.shapes.map((s,i)=>`<path d="${s.d}" data-s="${i}" class="ct q${bucket(shapeCount(s))}"/>`).join("")}
      ${MAP.dots.map(d=>{const s=MAP.shapes.findIndex(x=>x.ci.join()===d.ci.join());return `<circle cx="${d.x}" cy="${d.y}" r="3" data-s="${s}" class="ct dt q${bucket(shapeCount(MAP.shapes[s]))}"/>`}).join("")}</g>
    </svg><div class="tip" id="tip" hidden></div></div><div class="mapfoot"><span class="mapnote">${t.map_note}</span><span class="maphint">${t.map_hint}</span></div>`;
}
function mapLegend(){
  const t=T();
  return `<div class="maplegend" id="mleg"><span>${mapView.who==="ref"?t.legend_r:t.legend}</span>${curBuckets().map(([a,b],i)=>`<span class="lg"><i class="sw q${i+1}"></i>${b===Infinity?a+"+":a===b?a:a+"–"+b}</span>`).join("")}<span class="lg"><i class="sw q0"></i>${t.none}</span><span class="lg"><i class="sw q2 round"></i>${t.small}</span></div>`;
}
function wireMap(){
  const m=$("#map"); if(!m) return;
  const svg=$("#msvg"), g=$("#mg"), tip=$("#tip");
  const W=MAP.w,H=MAP.h, KMAX=14;
  const clamp=()=>{mapView.k=Math.min(KMAX,Math.max(1,mapView.k));mapView.tx=Math.min(0,Math.max(W-W*mapView.k,mapView.tx));mapView.ty=Math.min(0,Math.max(H-H*mapView.k,mapView.ty));};
  const apply=()=>{clamp();g.setAttribute("transform",`translate(${mapView.tx} ${mapView.ty}) scale(${mapView.k})`);
    g.querySelectorAll("circle.dt").forEach(c=>c.setAttribute("r",(3.2/Math.sqrt(mapView.k)).toFixed(2)));
    svg.style.touchAction=mapView.k>1.01?"none":"pan-y";
    document.querySelectorAll(".mapbar [data-view]").forEach(b=>b.setAttribute("aria-selected",b.dataset.view===mapView.tab));};
  const target=v=>{if(v==="europe"){const [x0,y0,x1,y1]=MAP.europe;const k=Math.min(W/(x1-x0),H/(y1-y0));return {k,tx:-x0*k+(W-(x1-x0)*k)/2,ty:-y0*k+(H-(y1-y0)*k)/2};}return {k:1,tx:0,ty:0};};
  let anim=0;
  const animateTo=t=>{cancelAnimationFrame(anim);const s={...mapView},t0=performance.now(),dur=matchMedia("(prefers-reduced-motion: reduce)").matches?0:380;
    const step=now=>{const p=dur?Math.min(1,(now-t0)/dur):1,e=1-Math.pow(1-p,3);
      const k=s.k*Math.pow(t.k/s.k,e);const f=(k-s.k)/((t.k-s.k)||1);
      mapView.k=k;mapView.tx=s.tx+(t.tx-s.tx)*(Math.abs(t.k-s.k)>1e-6?f:e);mapView.ty=s.ty+(t.ty-s.ty)*(Math.abs(t.k-s.k)>1e-6?f:e);apply();if(p<1)anim=requestAnimationFrame(step);};
    anim=requestAnimationFrame(step);};
  const toSvg=(cx,cy)=>{const r=svg.getBoundingClientRect();return [(cx-r.left)*W/r.width,(cy-r.top)*H/r.height];};
  const zoomAt=(px,py,f)=>{const k0=mapView.k,k1=Math.min(KMAX,Math.max(1,k0*f));mapView.tx=px-(px-mapView.tx)*(k1/k0);mapView.ty=py-(py-mapView.ty)*(k1/k0);mapView.k=k1;apply();};
  document.querySelectorAll(".mapbar [data-view]").forEach(b=>b.onclick=()=>{mapView.tab=b.dataset.view;animateTo(target(b.dataset.view));});
  document.querySelectorAll(".mapbar [data-who]").forEach(b=>b.onclick=()=>{mapView.who=b.dataset.who;
    document.querySelectorAll(".mapbar [data-who]").forEach(x=>x.setAttribute("aria-selected",x.dataset.who===mapView.who));
    g.querySelectorAll("[data-s]").forEach(el=>{const s=MAP.shapes[+el.dataset.s];if(!s)return;el.setAttribute("class",el.getAttribute("class").replace(/\bq\d\b/,"q"+bucket(shapeCount(s))));});
    hideTip();});
  document.querySelectorAll(".mapbar [data-z]").forEach(b=>b.onclick=()=>{const z=b.dataset.z;
    if(z==="reset"){mapView.tab="world";animateTo(target("world"));return;}
    const f=z==="in"?1.6:1/1.6,k1=Math.min(KMAX,Math.max(1,mapView.k*f)),cx=W/2,cy=H/2;
    animateTo({k:k1,tx:cx-(cx-mapView.tx)*(k1/mapView.k),ty:cy-(cy-mapView.ty)*(k1/mapView.k)});});
  svg.addEventListener("wheel",e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();hideTip();const [px,py]=toSvg(e.clientX,e.clientY);zoomAt(px,py,Math.exp(-e.deltaY*0.012));},{passive:false});
  let gs=1; svg.addEventListener("gesturestart",e=>{e.preventDefault();gs=1;});
  svg.addEventListener("gesturechange",e=>{e.preventDefault();const [px,py]=toSvg(e.clientX,e.clientY);zoomAt(px,py,e.scale/gs);gs=e.scale;});
  const pts=new Map(); let moved=0, pinch=null, downTarget=null;
  svg.addEventListener("pointerdown",e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;downTarget=e.target.closest("[data-s]");
    if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)};}
    if(e.pointerType!=="mouse"||mapView.k>1) try{svg.setPointerCapture(e.pointerId);}catch(_){}});
  svg.addEventListener("pointermove",e=>{const p=pts.get(e.pointerId);
    if(!p){if(e.pointerType==="mouse")hover(e);return;}
    const dx=e.clientX-p.x,dy=e.clientY-p.y;moved+=Math.abs(dx)+Math.abs(dy);p.x=e.clientX;p.y=e.clientY;
    if(pts.size===2&&pinch){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const [px,py]=toSvg((a.x+b.x)/2,(a.y+b.y)/2);zoomAt(px,py,d/pinch.d);pinch.d=d;hideTip();return;}
    if(pts.size===1&&mapView.k>1.01&&moved>4){const r=svg.getBoundingClientRect();mapView.tx+=dx*W/r.width;mapView.ty+=dy*H/r.height;apply();hideTip();svg.classList.add("drag");}
    else if(e.pointerType==="mouse")hover(e);});
  const best=s=>s.ci.slice().sort((a,b)=>cCount(COUNTRIES[b])-cCount(COUNTRIES[a]))[0];
  const up=e=>{const had=pts.delete(e.pointerId);if(pts.size<2)pinch=null;svg.classList.remove("drag");
    if(!had||moved>6||e.type==="pointercancel")return;
    const el=downTarget; if(!el){hideTip();return;}
    const s=MAP.shapes[+el.dataset.s];
    if(e.pointerType==="mouse"){if(s.ci.length)location.hash=COUNTRIES[best(s)].slug;return;}
    if(tip.dataset.s===el.dataset.s&&!tip.hidden&&s.ci.length){location.hash=COUNTRIES[best(s)].slug;return;}
    showTip(el,e.clientX,e.clientY,true);};
  svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
  svg.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"&&!pts.size)hideTip();});
  function hover(e){const el=e.target.closest("[data-s]");if(!el){hideTip();return;}showTip(el,e.clientX,e.clientY,false);}
  function showTip(el,cx,cy,touch){const t=T();const s=MAP.shapes[+el.dataset.s];
    g.querySelectorAll(".on").forEach(x=>x.classList.remove("on"));g.querySelectorAll(`[data-s="${el.dataset.s}"]`).forEach(x=>x.classList.add("on"));
    if(!s.ci.length){tip.innerHTML=`<div class="tn">${esc(s.n)}</div><div class="tt">${mapView.who==="ref"?t.no_refs:t.no_umpires}</div>`;}
    else{
      tip.innerHTML=s.ci.slice().sort((a,b)=>cCount(COUNTRIES[b])-cCount(COUNTRIES[a])).map(i=>{const c=COUNTRIES[i];const n=[0,0,0];c.list.forEach(o=>n[o.lvl]++);
        if(mapView.who==="ref"){const nr=refN(c);return `<div class="tblock"><div class="tn">${esc(c.name)} <span class="code">${c.code}</span></div><div class="tt">${nr?t.n_ref(nr):t.no_refs}</div></div>`;}
        if(!c.list.length){const nr=refsOf(c).length;return `<div class="tblock"><div class="tn">${esc(c.name)} <span class="code">${c.code}</span></div><div class="tt">${nr?t.ref_only(nr):t.no_umpires}</div></div>`;}
        return `<div class="tblock"><div class="tn">${esc(c.name)} <span class="code">${c.code}</span></div><div class="tt">${t.n_umpires(c.list.length)}</div>${[2,1,0].map(l=>`<div class="tr"><span class="badge b${l}">${LVLKEY[l]}</span><span class="num">${n[l]}</span></div>`).join("")}</div>`}).join("")
        +`<div class="tgo">${touch?t.tap_again:t.click_open}</div>`;}
    tip.dataset.s=el.dataset.s;tip.hidden=false;
    const r=m.getBoundingClientRect();const tw=tip.offsetWidth,th=tip.offsetHeight;
    let x=cx-r.left+14,y=cy-r.top+14; if(x+tw>r.width-4)x=cx-r.left-tw-14; if(x<4)x=4; if(y+th>r.height-4)y=Math.max(4,cy-r.top-th-14);
    tip.style.left=x+"px";tip.style.top=y+"px";}
  function hideTip(){tip.hidden=true;tip.dataset.s="";g.querySelectorAll(".on").forEach(x=>x.classList.remove("on"));}
  apply();
}

/* ---------- Gold Badge Gantt (ported from the owner's Observable notebook) ---------- */
const ganttState={status:"all",sex:["F","M"],sort:"start",ctry:""};
/* countries that have (or had) a Gold Badge umpire, for the country filter */
function ganttCountries(){const n=new Map();GANTT.forEach(([iu,,,,,,c])=>{if(!n.has(c))n.set(c,new Set());n.get(c).add(iu);});
  return [...n].map(([code,s])=>({code,name:(COUNTRIES.find(x=>x.code===code)||{}).name||code,n:s.size})).sort((a,b)=>a.name.localeCompare(b.name));}
function ganttCard(){
  const t=T(), s=ganttState;
  return `<section class="card gantt" id="ganttCard">
    <div class="section-head" style="margin:0"><div><h2>${t.g_title}</h2><p class="muted" style="font-size:13px;margin:6px 0 0">${t.g_sub}</p></div></div>
    <div class="gctl">
      <div class="tabs" role="tablist" aria-label="${t.g_status}">${["active","expired","all"].map(k=>`<button type="button" role="tab" data-gst="${k}" aria-selected="${s.status===k}">${t["g_"+k]}</button>`).join("")}</div>
      <div class="chips" role="group" aria-label="${t.sex}">${["F","M"].map(k=>`<button type="button" data-gsex="${k}" aria-pressed="${s.sex.includes(k)}"><i class="gdot g${k}"></i>${k==="F"?t.g_f:t.g_m}</button>`).join("")}</div>
      <div class="gcbox"><input id="gctry" type="search" role="combobox" aria-expanded="false" aria-controls="gctryList" aria-autocomplete="list" autocomplete="off" placeholder="${t.g_ctry_ph}" aria-label="${t.g_ctry}" value="${s.ctry?esc((ganttCountries().find(c=>c.code===s.ctry)||{}).name||s.ctry):""}"><button type="button" class="gcbtn" id="gctryBtn" tabindex="-1" aria-label="${t.g_ctry_all}">▾</button><div class="gres" id="gctryList" role="listbox" hidden></div></div>
      <label class="gsort">${t.g_sort} <select id="gsort">${["start","dur"].map(k=>`<option value="${k}"${s.sort===k?" selected":""}>${t["g_s_"+k]}</option>`).join("")}</select></label>
    </div>
    <div id="ganttPlot" class="gplot"></div>
    <p class="muted" style="font-size:12px;margin:10px 0 0">${t.g_note}</p>
  </section>`;
}
function renderGantt(){
  const box=$("#ganttPlot"); if(!box) return;
  const t=T();
  if(!window.Plot||!window.d3){box.innerHTML=`<div class="empty">${t.g_noload}</div>`;return;}
  const today=new Date(TODAY+"T00:00:00Z"), parse=d=>new Date(d+"T00:00:00Z");
  const all=GANTT.map(([iu,sex,name,s,e,y,c,src])=>({iu,sex,name,c,y,src,start:parse(s),end:e?parse(e):today,ongoing:!e}));
  const by=d3.group(all,d=>d.iu);
  const person=new Map([...by].map(([iu,ps])=>[iu,{active:ps.some(p=>p.ongoing),first:d3.min(ps,p=>p.start),days:d3.sum(ps,p=>Math.round((p.end-p.start)/864e5)),y:ps[0].y}]));
  const S=ganttState;
  let rows=all.filter(d=>(!S.ctry||d.c===S.ctry)&&S.sex.includes(d.sex)&&(S.status==="all"||(S.status==="active")===person.get(d.iu).active));
  const order=[...new Set(rows.map(d=>d.iu))].sort((a,b)=>{const A=person.get(a),B=person.get(b);
    return S.sort==="year"?A.y-B.y||A.first-B.first:S.sort==="dur"?B.days-A.days||A.first-B.first:A.first-B.first||A.y-B.y;});
  const nameOf=new Map(rows.map(d=>[d.iu,d.name]));
  const domain=order.map(iu=>nameOf.get(iu));
  if(!rows.length){box.innerHTML=`<div class="empty">${t.ev_none}</div>`;return;}
  const cs=getComputedStyle(document.documentElement), col=v=>cs.getPropertyValue(v).trim();
  const labels=order.map(iu=>{const ps=rows.filter(d=>d.iu===iu);return {name:nameOf.get(iu),x:d3.min(ps,p=>p.start),c:ps[0].c};});
  const fmtM=d=>`${T().months_full[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  if(S.sort==="dur"){ /* total time as GB → ranked horizontal bars, longest first */
    const W=Math.max(260,box.clientWidth), narrow=W<560;
    const bars=order.map(iu=>{const p=person.get(iu),r=rows.find(d=>d.iu===iu);const ps=rows.filter(d=>d.iu===iu);
      return {iu,name:r.name,c:r.c,sex:r.sex,days:d3.sum(ps,q=>Math.round((q.end-q.start)/864e5)),active:p.active,n:ps.length};}).sort((a,b)=>b.days-a.days);
    const yrs=d=>(d/365.25);
    const ym=days=>{const m=Math.round(days/30.4375),y=Math.floor(m/12),mo=m%12;return LANG==="ru"?[y?`${y} ${plural(y,"год","года","лет")}`:"",mo?`${mo} мес`:""].filter(Boolean).join(" ")||"0 мес":[y?`${y} ${y===1?"yr":"yrs"}`:"",mo?`${mo} mo`:""].filter(Boolean).join(" ")||"0 mo";};
    const fmtY=v=>v.toLocaleString(LANG==="ru"?"ru-RU":"en-GB",{minimumFractionDigits:1,maximumFractionDigits:1});
    const fig=Plot.plot({
      width:W,height:bars.length*24+40,marginTop:28,marginRight:narrow?80:96,marginLeft:narrow?118:200,
      style:{fontFamily:"var(--f-body)",fontSize:"12px",color:col("--muted"),background:"transparent"},
      x:{axis:"top",grid:true,label:null,domain:[0,Math.ceil(yrs(bars[0].days))],ticks:d3.range(0,Math.ceil(yrs(bars[0].days))+1),tickFormat:d=>String(d)},
      y:{domain:bars.map(d=>d.name),label:null,tickSize:0,tickFormat:n=>narrow&&n.length>14?n.slice(0,13)+"…":n},
      color:{domain:["F","M"],range:[col("--g-f"),col("--g-m")]},
      marks:[
        Plot.barX(bars,{y:"name",x:d=>yrs(d.days),fill:"sex",rx:3,insetTop:4,insetBottom:4,fillOpacity:d=>d.active?1:0.55}),
        Plot.text(bars,{y:"name",x:d=>yrs(d.days),text:d=>ym(d.days),textAnchor:"start",dx:5,fill:col("--ink"),fontSize:11.5}),
        Plot.ruleX([0],{stroke:col("--line")}),
        Plot.tip(bars,Plot.pointerY({y:"name",x:d=>yrs(d.days),fill:col("--surface"),stroke:col("--line"),
          title:d=>`${d.name} · ${d.c}\n${t.g_total}: ${ym(d.days)} (${d.days} ${t.g_days})\n${d.n>1?t.g_periods(d.n)+"\n":""}${d.active?t.g_active_now:t.g_former}`}))
      ]
    });
    fig.addEventListener("click",()=>{const d=fig.value;if(d&&BYIU.get(d.iu))location.hash="u"+d.iu;});
    fig.style.cursor="pointer";
    const cap=document.createElement("p");cap.className="gcap";cap.innerHTML=`${t.g_years} · <i class="gsw"></i>${t.g_active_now} · <i class="gsw gsw-o"></i>${t.g_former}`;
    box.replaceChildren(cap,fig); box.classList.remove("gfade"); void box.offsetWidth; box.classList.add("gfade");
    return;
  }
  const W=Math.max(260,box.clientWidth);
  const x0=d3.utcMonth.offset(d3.min(all,d=>d.start),-1), x1=d3.utcMonth.offset(today,2);
  const px=d=>8+(d-x0)/(x1-x0)*(W-20);
  /* a label that would run past the right edge is right-aligned to today instead */
  const fitsEnd=d=>px(d.x)+(d.name.length+5)*6.6>W-8;
  const fig=Plot.plot({
    width:W, height:domain.length*34+40, marginLeft:8, marginRight:12, marginTop:30,
    style:{fontFamily:"var(--f-body)",fontSize:"12px",color:col("--muted"),background:"transparent"},
    x:{type:"utc",axis:"top",grid:true,label:null,domain:[x0,x1],tickFormat:d=>d.getUTCMonth()===0?String(d.getUTCFullYear()):""},
    y:{domain,axis:null,paddingInner:0.1},
    color:{domain:["F","M"],range:[col("--g-f"),col("--g-m")]},
    marks:[
      Plot.ruleX([today],{stroke:col("--ink"),strokeDasharray:"3,3",strokeOpacity:0.6}),
      Plot.barX(rows,{y:"name",x1:"start",x2:"end",fill:"sex",rx:3,insetTop:17,insetBottom:4,fillOpacity:d=>person.get(d.iu).active?1:0.55}),
      Plot.text(labels.filter(d=>!fitsEnd(d)),{y:"name",x:"x",text:d=>`${d.name}  ${d.c}`,textAnchor:"start",dy:-6,fill:col("--ink"),fontSize:12}),
      Plot.text(labels.filter(fitsEnd),{y:"name",x:()=>today,text:d=>`${d.name}  ${d.c}`,textAnchor:"end",dx:-4,dy:-6,fill:col("--ink"),fontSize:12}),
      Plot.tip(rows,Plot.pointerY({y:"name",x1:"start",x2:"end",fill:col("--surface"),stroke:col("--line"),
        title:d=>{const p=person.get(d.iu);return `${d.name} · ${d.c}\nIU ${String(d.iu).padStart(5,"0")} · ${d.sex==="F"?t.female:t.male}\n\n${t.g_from}: ${fmtM(d.start)}\n${d.ongoing?t.g_now:`${t.g_to}: ${fmtM(d.end)}`}\n${t.g_total}: ${p.days} ${t.g_days}${d.src!=="obs"?`\n\n${t.g_arch}`:""}`;}}))
    ]
  });
  fig.addEventListener("click",()=>{const d=fig.value;if(d&&BYIU.get(d.iu))location.hash="u"+d.iu;});
  fig.style.cursor="pointer";
  const cap=document.createElement("p");cap.className="gcap";cap.innerHTML=`<i class="gsw"></i>${t.g_active_now} · <i class="gsw gsw-o"></i>${t.g_former}`;
  box.replaceChildren(cap,fig); box.classList.remove("gfade"); void box.offsetWidth; box.classList.add("gfade");
}
function wireGanttCountry(){
  const inp=$("#gctry"),lst=$("#gctryList"),btn=$("#gctryBtn"),wrap=inp.parentElement,S=ganttState,t=T();
  const norm=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const all=ganttCountries(); let items=[],hi=-1;
  const nameOf=c=>(all.find(x=>x.code===c)||{}).name||"";
  const draw=q=>{const v=norm(q.trim());
    items=[{code:"",name:t.g_ctry_all,n:new Set(GANTT.map(r=>r[0])).size},...all.filter(c=>!v||norm(c.name).includes(v)||norm(c.code).includes(v))];
    if(v)items=items.slice(1);
    hi=items.findIndex(c=>c.code===S.ctry&&!v);
    lst.innerHTML=items.length?items.map((c,i)=>`<button type="button" role="option" data-i="${i}" aria-selected="${c.code===S.ctry}" class="${i===hi?"on":""}"><span>${esc(c.name)}${c.code?` <span class="m">${c.code}</span>`:""}</span><span class="m">${c.n}</span></button>`).join(""):`<div class="m" style="padding:8px 12px">${t.ev_none}</div>`;
    lst.hidden=false;inp.setAttribute("aria-expanded","true");};
  const close=()=>{lst.hidden=true;inp.setAttribute("aria-expanded","false");inp.value=S.ctry?nameOf(S.ctry):"";};
  const pick=c=>{S.ctry=c.code;close();renderGantt();};
  const mark=()=>lst.querySelectorAll("button").forEach((b,i)=>{b.classList.toggle("on",i===hi);if(i===hi)b.scrollIntoView({block:"nearest"});});
  inp.onfocus=()=>{inp.select();draw("");};
  inp.onclick=()=>{if(lst.hidden)draw("");};
  inp.oninput=()=>{if(!inp.value&&S.ctry){S.ctry="";renderGantt();}draw(inp.value);};
  btn.onmousedown=e=>e.preventDefault();
  btn.onclick=()=>{if(lst.hidden){inp.focus();draw("");}else close();};
  lst.onmousedown=e=>e.preventDefault();
  lst.onclick=e=>{const b=e.target.closest("[data-i]");if(b)pick(items[+b.dataset.i]);};
  inp.onkeydown=e=>{
    if(e.key==="ArrowDown"){e.preventDefault();if(lst.hidden)draw("");hi=Math.min(items.length-1,hi+1);mark();}
    else if(e.key==="ArrowUp"){e.preventDefault();hi=Math.max(0,hi-1);mark();}
    else if(e.key==="Enter"){e.preventDefault();const c=items[hi>=0?hi:0];if(c&&!lst.hidden)pick(c);}
    else if(e.key==="Escape"){close();}
  };
  inp.onblur=()=>setTimeout(close,0);
  wrap.onkeydown=null;
}
function wireGantt(){
  if(!$("#ganttCard")) return;
  document.querySelectorAll("[data-gst]").forEach(b=>b.onclick=()=>{ganttState.status=b.dataset.gst;document.querySelectorAll("[data-gst]").forEach(x=>x.setAttribute("aria-selected",x===b));renderGantt();});
  document.querySelectorAll("[data-gsex]").forEach(b=>b.onclick=()=>{const k=b.dataset.gsex,S=ganttState;S.sex=S.sex.includes(k)?S.sex.filter(x=>x!==k):[...S.sex,k];if(!S.sex.length)S.sex=["F","M"];document.querySelectorAll("[data-gsex]").forEach(x=>x.setAttribute("aria-pressed",S.sex.includes(x.dataset.gsex)));renderGantt();});
  $("#gsort").onchange=e=>{ganttState.sort=e.target.value;renderGantt();};
  wireGanttCountry();
  renderGantt();
}
let _gRz; window.addEventListener("resize",()=>{clearTimeout(_gRz);_gRz=setTimeout(renderGantt,150);});
if(window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",()=>renderGantt());

/* ---------- views ---------- */
const searchBox=()=>{const t=T();return `<div class="search" role="search">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  <input id="q" type="search" autocomplete="off" placeholder="${t.search_ph}" aria-label="${t.search_aria}">
  <div class="results" id="res" hidden></div></div>
  <div class="hint">${t.example} <button type="button" data-q="KHOJAYEV">Khojayev</button>, <button type="button" data-q="MAIZ">Maiz Calle</button>, <button type="button" data-q="14301">14301</button></div>`;};
const miniEvents = list=>`<div class="mini">${list.map(e=>`<a href="#e${e.i}"><span class="d">${evStatus(e)==="now"?'<span class="live"></span>':""}${fmtRange(e.s,e.e)}</span><span><span class="n">${esc(evName(e))}</span><span class="s">${T().n_ump(e.ump.length)}${nRef(e)?" · "+T().n_ref(nRef(e)):""}</span></span></a>`).join("")}</div>`;

function viewHome(){
  const t=T();
  const lbl=(kind,o)=>kind==="gn"?t.new_gb:kind==="gr"?t.ret_gb(o.sex==="F"):kind==="br"?t.ret_bb(o.sex==="F"):t.new_bb;
  const listEv = GBH.gev.map(([m,iu,kind])=>({m,o:BYIU.get(iu),kind})).filter(x=>x.o);
  const brSet = new Set(listEv.filter(x=>x.kind==="br").map(x=>x.o.iu));
  const newBB = OFF.filter(o=>o.bb && o.bb>="2026-06-01" && !brSet.has(o.iu)).sort((a,b)=>b.bb.localeCompare(a.bb));
  const who = o=>`<a href="#u${o.iu}">${esc(fullName(o))}</a> <span class="code">${o.c.code}</span>`;
  const feed = [
    ...listEv.map(x=>{const [y,m]=x.m.split("-");return {k:(+y*100+ +m)*100+15,d:`${(t.months_nom||t.months)[m-1]} ${y}`,cls:x.kind,html:`${lbl(x.kind,x.o)} — ${who(x.o)}`}}),
    ...newBB.map(o=>{const [y,m,d]=o.bb.split("-");return {k:(+y*100+ +m)*100+ +d,d:fmtDate(o.bb),cls:GBH.gbp[o.iu]?"br":"bn",html:`${GBH.gbp[o.iu]?t.ret_bb(o.sex==="F"):t.new_bb} — ${who(o)}`}})
  ].sort((a,b)=>b.k-a.k);
  const upcoming = EV_BY_DATE.filter(e=>e.e>=TODAY).slice(0,8);
  return `
  <section class="hero">
    <div class="card">
      <div class="eyebrow">${t.eyebrow}</div>
      <div class="heroh"><h1 style="margin-top:10px">${t.h1}</h1></div>
      <p class="lead">${t.lead}</p>
      ${searchBox()}
    </div>
    <div class="card mapcard">
      <div><div class="eyebrow">${t.map_eyebrow}</div><h3 style="margin-top:8px">${t.map_h(ASSOC_N)}</h3></div>
      ${mapSvg()}

    </div>
  </section>

  <div class="statline">
    <span>${t.total_line(umpPool().length,REFS.length,ASSOC_N)}</span>
    <span class="muted">${t.missing} <button class="btn" type="button" id="addBtn" style="padding:5px 12px">${t.add}</button></span>
  </div>
  <div class="facts">
    <div class="fact"><div class="v">${fmt(counts[0])}</div><div class="k">White Badge (IU)</div></div>
    <div class="fact"><div class="v" style="color:var(--bb)">${fmt(counts[1])}</div><div class="k">Blue Badge</div></div>
    <div class="fact"><div class="v" style="color:var(--gb)">${fmt(counts[2])}</div><div class="k">Gold Badge</div></div>
    <div class="fact"><div class="v">${Math.round(women/topBadge.length*100)}%</div><div class="k">${t.women}</div></div>
    <div class="fact"><div class="v">${assocWithGB}</div><div class="k">${t.assoc_gb}</div></div>
  </div>

  <section class="section two top-news">
    <div>
      <div class="section-head"><h2>${t.top_t}</h2><div id="topSort"></div></div>
      <div id="topCtl"></div><div id="topOut"></div><p class="muted" style="font-size:12px;margin:10px 0 0">${t.overlap_rule}</p>
    </div>
    <div>
      <div class="section-head"><h2>${t.news}</h2></div>
      <ul class="feed" id="feed">${feed.map((f,i)=>`<li${i>=10?' class="xtra" hidden':""}><span class="d">${f.d}</span><span><i class="fdot f-${f.cls}"></i>${f.html}</span></li>`).join("")}</ul>${feed.length>10?`<button class="btn" type="button" id="feedMore" style="margin-top:10px">${t.more(feed.length-10)}</button>`:""}<p class="muted" style="font-size:12px;margin:10px 0 0">${t.feed_note}</p>
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>${t.upcoming}</h2><a href="#events" class="muted">${t.all_events}</a></div>
    <div class="evlist">${upcoming.map(evRow).join("")}</div>
  </section>

  <section class="section">
    <div class="section-head"><h2>${t.by_country}</h2><span class="muted">${t.assoc_n(COUNTRIES.length)}</span></div>
    ${azBlock()}
  </section>`;
}
function mostBlock(){
  const t=T();
  const top = COUNTRIES.slice().sort((a,b)=>b.list.length-a.list.length).slice(0,12);
  const tmax = top[0].list.length;
  const bar = c=>{const n=[0,0,0];c.list.forEach(o=>n[o.lvl]++);return `<div class="r"><a href="#${c.slug}">${esc(c.name)}</a><div class="t" style="width:${c.list.length/tmax*100}%">${[2,1,0].map(l=>n[l]?`<span class="s${l}" style="width:${n[l]/c.list.length*100}%" title="${t.lv[LVLKEY[l]]}: ${n[l]}"></span>`:"").join("")}</div><span class="n num">${c.list.length}</span></div>`};
  return `<section class="section" style="margin-top:8px"><div class="section-head"><h2>${t.most}</h2></div>
    <div class="bars">${top.map(bar).join("")}</div>
    <div class="legend"><span><i class="s0"></i>White Badge</span><span><i class="s1"></i>Blue Badge</span><span><i class="s2"></i>Gold Badge</span></div></section>`;
}
const evRow = e=>{const t=T();return `<a class="evrow" href="#e${e.i}"><span class="dt">${evStatus(e)==="now"?'<span class="live"></span>':""}${fmtRange(e.s,e.e)}</span><span class="nm">${esc(evName(e))} ${typeChip(e)}<small>${evStatus(e)==="now"?t.now+" · ":""}${t.countries_n(new Set(e.ump.map(u=>u.p.c?u.p.c.i:u.p.cname)).size)}</small></span><span class="cnt">${t.n_ump(e.ump.length)}${nRef(e)?"<br>"+t.n_ref(nRef(e)):""}</span></a>`;};
const topState={sort:"cnt",dir:-1,role:"ump",metric:"cnt"};
const YEAR=TODAY.slice(0,4);
/* distinct calendar days inside the year covered by a person's events (any role); overlapping events are not double-counted */
/* Continental events (owner's rule): continental championships incl. youth/U21, Europe Top 16 and European Games = WTT Smash level (7); other continental events = WTT Feeder (4).
   Asian analogues (confirmed by the owner): ITTF-ATTU Asian Cup, Asian Games and Asian Para Games = 7. */
/* Event level, low → high: Veterans 1 · ITTF Para 2 · WTT Youth 3 · WTT Feeder 4 · WTT Contender 5 · WTT Star Contender 6 · WTT Champions / Smash 7 · ITTF World Championships (incl. Para, Youth) 8.
   Not on the owner's scale, placed by analogy: multi-sport games 5, ITTF World Cup and Youth Olympic Games 7, Olympic Games 9. Unknown 0. */
function evRank(e){const n=e.name.toUpperCase();
  if(e.type==="cont")return /CHAMPIONSHIP|TOP 16|ASIAN CUP|GAMES/.test(n)?7:4;
  if(/MASTERS|VETERAN/.test(n))return 1;
  if(/WORLD/.test(n)&&/CHAMPIONSHIP/.test(n))return 8;
  if(/OLYMPIC/.test(n)&&!/YOUTH/.test(n))return 9;
  if(/YOUTH OLYMPIC/.test(n))return 7;
  if(/PARA/.test(n))return 2;
  if(/WTT/.test(n)&&/YOUTH/.test(n))return 3;
  if(/FEEDER/.test(n))return 4;
  if(/STAR CONTENDER/.test(n))return 6;
  if(/CONTENDER/.test(n))return 5;
  if(/CHAMPIONS|SMASH|WTT FINALS/.test(n))return 7; /* WTT Finals = WTT Champions/Smash level (owner, 19.10.2026) */
  if(/WORLD CUP/.test(n))return 7;
  if(/GAMES/.test(n))return 5;
  return 0;}
/* place = the event name minus series words and the year, e.g. "ITTF WORLD PARA CHALLENGER SPOKANE 2026" → "SPOKANE" */
const SERIES_WORDS=new Set("WTT ITTF WORLD PARA YOUTH STAR CONTENDER FEEDER CHALLENGER ELITE FUTURE CHAMPIONS SMASH CHAMPIONSHIPS CHAMPIONSHIP TEAM TABLE TENNIS FINALS MASTERS MEN'S WOMEN'S & MIXED CUP II III IV GAMES OLYMPIC UNIVERSITY FISU REGION DE ETTU EUROPEAN EUROPE U21 INDIVIDUAL TOP 10 ATTU ASIAN 20TH 5TH".split(" "));
const evPlace=e=>e.name.toUpperCase().replace(/-/g," ").split(/\s+/).filter(w=>w&&!/^\d{4}$/.test(w)&&!SERIES_WORDS.has(w)).join(" ");
const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length];};
const samePlace=(a,b)=>{const x=evPlace(a),y=evPlace(b);return !!x&&!!y&&(x===y||(Math.min(x.length,y.length)>=7&&lev(x,y)<=2));};
/* back-to-back events at the same place that share only the changeover day both count */
const backToBack=(a,b)=>((a.e===b.s&&a.s<b.s)||(b.e===a.s&&b.s<a.s))&&samePlace(a,b);
const evDays=e=>Math.round((Date.parse(e.e)-Date.parse(e.s))/864e5)+1;
/* When selections overlap, count one: earliest start, then fewer days, then the higher level. */
function attended(p){
  if(p._att) return p._att;
  const evs=[...new Set(p.asg.map(a=>a.e))].sort((a,b)=>a.s.localeCompare(b.s)||evDays(a)-evDays(b)||evRank(b)-evRank(a));
  const keep=[], clash=new Map(); const R=new Map(evs.map(e=>[e,rngOf(p,e)]));
  for(const e of evs){const [es,ee]=R.get(e);const c=keep.find(k=>{const [ks,ke]=R.get(k);return !(ee<ks||es>ke)&&!backToBack(e,k);}); if(c) clash.set(e,c); else keep.push(e);}
  return p._att={set:new Set(keep),clash};
}
function daysOf(evs,y,p){const days=new Set();const lo=Date.parse(y+"-01-01"),hi=Date.parse(y+"-12-31");
  evs.forEach(e=>{const [s,x]=p?rngOf(p,e):[e.s,e.e];for(let d=Math.max(Date.parse(s),lo);d<=Math.min(Date.parse(x),hi);d+=864e5)days.add(d);});return days.size;}
function daysIn(p,y){const days=new Set();const lo=Date.parse(y+"-01-01"),hi=Date.parse(y+"-12-31");
  attended(p).set.forEach(e=>{const [s,x]=rngOf(p,e);for(let d=Math.max(Date.parse(s),lo);d<=Math.min(Date.parse(x),hi);d+=864e5)days.add(d);});return days.size;}
function renderTop(){
  const t=T(); const out=$("#topOut"); if(!out) return;
  const S=topState, seg=(attr,val,cur,label)=>`<button type="button" role="tab" data-${attr}="${val}" aria-selected="${cur===val}">${label}</button>`;
  $("#topCtl").innerHTML=`<div class="topctl"><div class="tabs" role="tablist" aria-label="${t.role_l}">${seg("trole","ump",S.role,t.umpires)}${seg("trole","ref",S.role,t.referees)}${seg("trole","both",S.role,t.both_roles)}</div>
    <div class="tabs" role="tablist" aria-label="${t.metric_l}">${seg("tmet","days",S.metric,t.m_days)}${seg("tmet","cnt",S.metric,t.m_cnt)}</div></div>
    <p class="muted" style="font-size:13px;margin:8px 0 0">${S.metric==="days"?t.top_sub_days(YEAR):t.top_sub}</p>`;
  $("#topSort").innerHTML=`<div class="chips" role="group" aria-label="${t.sort}"><button type="button" data-tsort="cnt" aria-pressed="${S.sort==="cnt"}">${S.metric==="days"?t.m_days:t.m_cnt}${S.sort==="cnt"?(S.dir<0?" ↓":" ↑"):""}</button><button type="button" data-tsort="name" aria-pressed="${S.sort==="name"}">${S.sort==="name"&&S.dir<0?t.za:t.az}</button></div>`;
  document.querySelectorAll("[data-trole]").forEach(b=>b.onclick=()=>{S.role=b.dataset.trole;renderTop();});
  document.querySelectorAll("[data-tmet]").forEach(b=>b.onclick=()=>{S.metric=b.dataset.tmet;renderTop();});
  document.querySelectorAll("[data-tsort]").forEach(b=>b.onclick=()=>{const k=b.dataset.tsort;if(S.sort===k)S.dir*=-1;else{S.sort=k;S.dir=k==="cnt"?-1:1;}renderTop();});
  const people=OFF.concat(EXTRA,REFS.filter(r=>!r.o)).map(p=>{const evs=new Set(p.asg.filter(a=>attended(p).set.has(a.e)&&(topState.role==="both"?(a.role==="umpire"||isRefRole(a.role)):(topState.role==="ump"?a.role==="umpire":isRefRole(a.role)))).map(a=>a.e));return {p,n:topState.metric==="days"?daysOf(evs,YEAR,p):evs.size};}).filter(x=>x.n>0);
  people.sort((a,b)=>b.n-a.n||a.p.sur.localeCompare(b.p.sur));
  people.forEach((x,i)=>x.rank=i===0||people[i-1].n!==x.n?i+1:people[i-1].rank);
  const top=people.slice(0,10);
  const s=topState;
  const rows=top.slice().sort(s.sort==="cnt"?(a,b)=>s.dir*(a.n-b.n)||a.p.sur.localeCompare(b.p.sur):(a,b)=>s.dir*(a.p.sur+" "+a.p.first).localeCompare(b.p.sur+" "+b.p.first));
  const bdg=p=>s.role==="both"?(p.isRef?irBadge(p.st):p.x?csvBadge(p.csv):badge(p.lvl)+(p.irNo?irBadge(p.irSt):"")):s.role==="ref"?(p.isRef?irBadge(p.st):p.irNo?irBadge(p.irSt):""):(p.x?csvBadge(p.csv):badge(p.lvl));
  out.innerHTML=`<div class="toplist">${rows.map(x=>`<a href="${href(x.p)}"><span class="rk num">${x.rank}</span><span class="nm">${esc(fullName(x.p))} <span class="code">${x.p.c?x.p.c.code:(x.p.code||"")}</span></span><span class="bd">${bdg(x.p)}</span><span class="ct num">${x.n}${s.metric==="days"?`<small>${t.d_short}</small>`:""}</span></a>`).join("")}</div>
`;
}
function azBlock(){
  const g={}; COUNTRIES.slice().sort(byName).forEach(c=>{(g[c.name[0]]=g[c.name[0]]||[]).push(c)});
  return `<div class="az">${Object.keys(g).sort().map(L=>`<div class="L"><h4>${L}</h4>${g[L].map(c=>`<a href="#${c.slug}"${c.list.length?"":` class="z"`}><span>${esc(c.name)}</span><span class="num">${c.list.length}</span></a>`).join("")}</div>`).join("")}</div>`;
}

const listState={q:"",lvl:"all",c:"all",cont:"all",shown:100};
/* pool of all umpires for "All umpires" and "White Badge umpires" (curator 01.11.2026): active IU lists + IU seen elsewhere + NU + Games officials (TBD) */
const xDup=x=>!!(x.iuX&&(BYIU.has(x.iuX)||EXTRA.some(y=>y!==x&&y.iuX===x.iuX&&(y.asg.length>x.asg.length||y.asg.length===x.asg.length&&y.k<x.k))));
const xIsOff=x=>x.asg.length&&!x.asg.some(a=>a.role==="umpire");
const umpLevel=o=>{if(!o.x)return LVLKEY[o.lvl];const s=iuStatus(o);if(!s)return "TBD";if(s.k==="nu")return "NU";return o.csv==="GB"||o.csv==="BB"?o.csv:"WB";};
let UMP_POOL=null;
const umpPool=()=>UMP_POOL||(UMP_POOL=OFF.map(o=>({o,l:LVLKEY[o.lvl],st:"A",iu:o.iu,c:o.c}))
  .concat(EXTRA.filter(x=>!xDup(x)&&!xIsOff(x)).map(x=>{const s=iuStatus(x);return {o:x,l:umpLevel(x),st:!s||s.k==="nu"?"":s.k==="inact"?"I":"A",iu:x.iuX||0,c:x.c};}))
  .sort((a,b)=>a.o.sur.localeCompare(b.o.sur)||(a.o.first||"").localeCompare(b.o.first||"")));
/* Blue Badge in progress (ITTF selection export 10.11.2026; curator 11.11.2026): level stays WB until the person is on a BB list */
const BBP_IU=new Set([16318,22526]); /* 22526 OGURA Chifumi (JPN): = CHIFUMI Ogura (SGP) in the IU list, merged by the curator 11.11.2026 */
const isBBP=o=>!!o&&(o.x?o.csv==="BBP":BBP_IU.has(o.iu));
const bbpMark=o=>isBBP(o)?` <span class="badge bp" title="${T().lv.BBP}">BBP</span>`:"";
const LV_FILTER={"2":"GB","1":"BB","0":"WB","nu":"NU","tbd":"TBD"};
function lvChipG(l){const t=T();return l==="TBD"?`<span class="iust ftip" tabindex="0" data-tip="${esc(t.lv_tbd)}">TBD</span>`:l?`<span class="badge ${{GB:"b2",BB:"b1",WB:"b0"}[l]||"bx"}" title="${t.lv[l]}">${l}</span>`:"—";}
function viewList(preset){
  const t=T();
  if(preset!==undefined&&preset!==listState.preset){listState.lvl=preset==="w"?"all":preset;listState.shown=100;listState.preset=preset;listState.c="all";listState.q="";}
  const P=listState.preset, pool=P==="all"||P==="w";
  const title = P==="1"?"Blue Badge":P==="2"?"Gold Badge":P==="w"?t.list_w:t.list_all;
  const sub = P==="2"?t.list_gb_sub:P==="1"?t.list_bb_sub:P==="w"?t.list_w_sub:t.list_all_sub;
  return `<h1>${title}</h1><p class="muted" style="margin:8px 0 0">${sub}</p>
  ${listState.preset==="2"?ganttCard():""}
  <div class="controls">
    <input id="lq" type="search" placeholder="${t.search_ph}" value="${esc(listState.q)}" aria-label="${t.filter_aria}">
    <select id="llvl" aria-label="${t.cat}"><option value="all">${t.all_cat}</option>${pool?`<option value="2">Gold Badge</option><option value="1">Blue Badge</option><option value="0">White Badge</option>${P==="all"?`<option value="nu">National Umpire</option><option value="tbd">TBD</option>`:""}`:`<option value="0">White Badge</option><option value="1">Blue Badge</option><option value="2">Gold Badge</option>`}</select>
    <select id="lcont" aria-label="${t.cont_l}"><option value="all">${t.all_cont}</option>${["AF","AM","AS","EU","OC"].map(k=>`<option value="${k}">${t.conts[k]} (${k})</option>`).join("")}</select>
    <select id="lc" aria-label="${t.assoc}">${countryOpts()}</select>
  </div>
  <div id="listOut"></div>`;
}
function countryOpts(){const t=T();const P=listState.preset;const base=P==="all"||P==="w"?COUNTRIES.filter(c=>umpPool().some(r=>r.c===c&&(P==="all"||r.l==="GB"||r.l==="BB"||r.l==="WB"))).sort(byName):ACTIVE_C;return `<option value="all">${t.all_assoc}</option>${base.filter(c=>listState.cont==="all"||CONT[c.code]===listState.cont).map(c=>`<option value="${c.i}">${esc(c.name)}</option>`).join("")}`;}
function renderListRows(){
  const t=T(); const s=listState; const q=s.q.trim().toLowerCase();
  const nz=x=>x.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
  if(s.preset==="all"||s.preset==="w"){const W=s.preset==="w";
    let rows=umpPool().filter(r=>(!W||r.l==="GB"||r.l==="BB"||r.l==="WB")&&(s.lvl==="all"||r.l===LV_FILTER[s.lvl])&&(s.c==="all"||(r.c&&r.c.i==+s.c))&&(s.cont==="all"||contOf(r.o)===s.cont));
    if(q) rows=/^\d+$/.test(q)?rows.filter(r=>r.iu&&String(r.iu).startsWith(String(+q))):rows.filter(r=>nz(r.o.sur+" "+(r.o.first||"")+" "+(r.o.first||"")+" "+r.o.sur+" "+(r.o.aka||"")).includes(nz(q)));
    const showGb=false, showBb=false; /* curator 01.11.2026: no badge-date columns in All umpires / White Badge lists */
    const assoc=r=>r.c?`${esc(r.c.name)} <span class="code">${r.c.code}</span> ${contChip(contOf(r.o))}`:`${esc(r.o.cname||"")} <span class="code">${r.o.code||""}</span>`;
    $("#listOut").innerHTML=`<div class="muted" style="font-size:13px;margin-bottom:8px">${t.n_umpires(rows.length)}</div>
  <div class="tbl"><table><thead><tr><th>IU</th><th>${t.th_umpire}</th><th>${t.assoc}</th><th>${t.level}</th>${W?`<th>${t.th_status}</th>`:""}${showBb?`<th>${t.th_bb}</th>`:""}${showGb?`<th>${t.th_gb}</th>`:""}</tr></thead><tbody>
  ${rows.slice(0,s.shown).map(r=>{const o=r.o,ina=r.st==="I";return `<tr data-go="${href(o).slice(1)}"${!W&&ina?' class="ina"':""}><td class="num">${r.iu?String(r.iu).padStart(5,"0"):"—"}</td><td><a href="${href(o)}">${esc(o.sur)}</a> ${esc(o.first||"")}</td><td>${assoc(r)}</td><td>${lvChipG(r.l)}${bbpMark(o)}${!W&&ina?` <span class="inam">${t.inactive}</span>`:""}</td>${W?`<td>${ina?`<span class="muted">${t.st_inactive}</span>`:t.st_active}</td>`:""}${showBb?`<td class="num">${o.x?"":bbDate(o,o.iu)?fmtDate(bbDate(o,o.iu)):o.lvl==2?"—":""}</td>`:""}${showGb?`<td>${!o.x&&o.gb?fmtGb(o.gb):""}</td>`:""}</tr>`;}).join("")}
  </tbody></table></div>
  ${rows.length>s.shown?`<div class="more"><button class="btn" id="moreBtn" type="button">${t.more(Math.min(100,rows.length-s.shown))}</button></div>`:""}`;
    const mb=$("#moreBtn"); if(mb) mb.onclick=()=>{s.shown+=100;renderListRows();};
    return;}
  let rows=OFF.filter(o=>(s.lvl==="all"||o.lvl==+s.lvl)&&(s.c==="all"||o.c.i==+s.c)&&(s.cont==="all"||contOf(o)===s.cont));
  if(q) rows = /^\d+$/.test(q)?rows.filter(o=>String(o.iu).startsWith(String(+q))):rows.filter(o=>nz(o.sur+" "+o.first+" "+o.first+" "+o.sur+" "+(o.aka||"")).includes(nz(q)));
  if(s.lvl==="2") rows.sort((a,b)=>gbKey(a.gb)-gbKey(b.gb));
  const showGb = s.lvl!=="0" && s.lvl!=="1", showBb = s.lvl!=="0";
  $("#listOut").innerHTML = `<div class="muted" style="font-size:13px;margin-bottom:8px">${t.n_umpires(rows.length)}</div>
  <div class="tbl"><table><thead><tr><th>IU</th><th>${t.th_umpire}</th><th>${t.assoc}</th><th>${t.cat}</th>${showBb?`<th>${t.th_bb}</th>`:""}${showGb?`<th>${t.th_gb}</th>`:""}</tr></thead><tbody>
  ${rows.map(o=>`<tr data-go="u${o.iu}"><td class="num">${String(o.iu).padStart(5,"0")}</td><td><a href="#u${o.iu}">${esc(o.sur)}</a> ${esc(o.first)}</td><td>${esc(o.c.name)} <span class="code">${o.c.code}</span> ${contChip(contOf(o))}</td><td>${badge(o.lvl)}</td>${showBb?`<td class="num">${bbDate(o,o.iu)?fmtDate(bbDate(o,o.iu)):o.lvl==2?"—":""}</td>`:""}${showGb?`<td>${o.gb?fmtGb(o.gb):""}</td>`:""}</tr>`).join("")}
  </tbody></table></div>
  ${rows.length>s.shown?`<div class="more"><button class="btn" id="moreBtn" type="button">${t.more(Math.min(100,rows.length-s.shown))}</button></div>`:""}`;
  const mb=$("#moreBtn"); if(mb) mb.onclick=()=>{s.shown+=100;renderListRows();};
}

function viewCountries(){
  return `<h1>${T().nav_countries}</h1><p class="muted" style="margin:8px 0 22px">${T().countries_sub(COUNTRIES.length,ACTIVE_C.length)}</p>${mostBlock()}<section class="section"><div class="section-head"><h2>${T().by_country}</h2></div>${azBlock()}</section>`;
}
function viewCountry(c){
  const t=T(); const n=[0,0,0]; c.list.forEach(o=>n[o.lvl]++);
  /* one table of all umpires of the association: active IU (ITTF lists) + IU seen elsewhere (active / new / inactive) + NU (curator 30.10.2026) */
  const xs=EXTRA.filter(x=>x.c===c&&!(x.iuX&&(BYIU.has(x.iuX)||EXTRA.some(y=>y!==x&&y.iuX===x.iuX&&(y.asg.length>x.asg.length||y.asg.length===x.asg.length&&y.k<x.k))))), isOff=x=>x.asg.length&&!x.asg.some(a=>a.role==="umpire");
  const lvlOf=o=>{if(!o.x)return LVLKEY[o.lvl];const s=iuStatus(o);if(!s)return "TBD";if(s.k==="nu")return "NU";return o.csv==="GB"||o.csv==="BB"?o.csv:"WB";};
  const LR={GB:3,BB:2,WB:1,NU:0,TBD:-1,"":-1};
  const rows=c.list.concat(xs.filter(x=>!isOff(x))).map(o=>({o,l:lvlOf(o),ina:!!o.x&&(iuStatus(o)||{}).k==="inact"}))
    .sort((a,b)=>LR[b.l]-LR[a.l]||a.ina-b.ina||a.o.sur.localeCompare(b.o.sur));
  const lvChip=l=>l==="TBD"?`<span class="iust ftip" tabindex="0" data-tip="${esc(t.lv_tbd)}">TBD</span>`:l?`<span class="badge ${{GB:"b2",BB:"b1",WB:"b0"}[l]||"bx"}" title="${T().lv[l]}">${l}</span>`:"—";
  const others=REFS.filter(r=>r.c===c).concat(xs.filter(isOff)).sort((a,b)=>a.sur.localeCompare(b.sur));
  const oHref=o=>o.isRef&&o.o?href(o.o):href(o);
  const othersTbl=others.length?`<div class="tbl"><table><thead><tr><th>IU / IR</th><th>${t.refs_off}</th><th>${t.level}</th><th>${t.tournaments}</th></tr></thead><tbody>
      ${others.map(o=>`<tr data-go="${oHref(o).slice(1)}"><td class="num">${o.isRef?"IR "+String(o.ir).padStart(5,"0"):o.iuX?String(o.iuX).padStart(5,"0"):"—"}</td><td><a href="${oHref(o)}">${esc(o.sur)}</a> ${esc(o.first)}</td><td>${o.isRef?irBadge(o.st):csvBadge(o.csv)}</td><td class="num">${o.asg.length||""}</td></tr>`).join("")}
    </tbody></table></div>`:"";
  const evs=[...new Set(c.list.concat(EXTRA.filter(x=>x.c===c),c.list.length?[]:others.filter(o=>o.isRef)).flatMap(o=>o.asg.map(a=>a.e)))].sort((a,b)=>b.s.localeCompare(a.s));
  return `<div class="crumbs"><a href="#countries">${t.nav_countries}</a> / ${esc(c.name)}</div>
  <div style="display:flex;gap:14px;align-items:baseline;flex-wrap:wrap"><h1>${esc(c.name)}</h1><span class="code" style="font-size:16px">${c.code}</span>${contChip(CONT[c.code])}</div>
  <div class="facts" style="grid-template-columns:repeat(4,minmax(0,1fr))">
    <div class="fact"><div class="v">${c.list.length}</div><div class="k">${t.intl_umpires}</div></div>
    <div class="fact"><div class="v">${n[0]}</div><div class="k">White Badge</div></div>
    <div class="fact"><div class="v" style="color:var(--bb)">${n[1]}</div><div class="k">Blue Badge</div></div>
    <div class="fact"><div class="v" style="color:var(--gb)">${n[2]}</div><div class="k">Gold Badge</div></div>
  </div>
  <div class="pgrid">
    <div class="stack">${rows.length?`<div class="tbl"><table><thead><tr><th>IU</th><th>${t.th_umpire}</th><th>${t.level}</th><th>${t.tournaments}</th></tr></thead><tbody>
      ${rows.map(({o,l,ina})=>{const n=o.x?o.iuX:o.iu;return `<tr data-go="${href(o).slice(1)}"${ina?' class="ina"':""}><td class="num">${n?String(n).padStart(5,"0"):"—"}</td><td><a href="${href(o)}">${esc(o.sur)}</a> ${esc(o.first)}</td><td>${lvChip(l)}${bbpMark(o)}${ina?` <span class="inam">${t.inactive}</span>`:""}</td><td class="num">${o.asg.length||""}</td></tr>`;}).join("")}
    </tbody></table></div>`:others.length?"":`<div class="card"><div class="empty"><b>${t.c_nobody(c.name)}</b></div><div class="acts" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px"><button type="button" class="btn primary" data-add="${c.code}">${t.c_add}</button><button type="button" class="btn" data-cup="${c.code}">${t.c_upload}</button></div></div>`}
    ${othersTbl}</div>
    <div class="stack">
      <div class="card"><h3>${t.country_events}</h3><p class="muted" style="font-size:13px;margin:6px 0 10px">${t.ev_title}: ${evs.length}</p>${evs.length?miniEvents(evs.slice(0,10)):`<div class="empty"><b>${t.t_none}</b></div>`}</div>
      <div class="card"><h3>${t.country_sys}</h3>
        <div class="empty" style="margin-top:14px"><b>${t.no_desc}</b>${t.no_desc_t}</div>
      </div>
      <div class="card"><h3>${t.nat}</h3>
        <div class="empty" style="margin-top:14px"><b>${t.nat_empty}</b>${t.nat_empty_t}</div>
      </div>
    </div>
  </div>`;
}

/* ---------- Connections graph: umpire ↔ umpire (everyone selected as umpire; those without a known IU number are drawn hollow). A link = worked at the same tournament; width = how many. ---------- */
const graphState={min:1,sel:null,year:TODAY.slice(0,4),view:"net",hebEv:null,hebAll:false,hebGroup:false,hebFocus:null,whoSel:"ump",whoAll:false}; /* year: "all" or "YYYY" (2026+) */
const graphYears=()=>[...new Set(EV_BY_DATE.filter(e=>e.ump.length).map(e=>e.s.slice(0,4)))].filter(y=>y>="2026").sort();
const iuOf=p=>p.x?(p.iuX||0):(p.isRef?0:p.iu);
const iu5=n=>String(n).padStart(5,"0");
/* network-view person line (curator 27.10.2026): «Murat ASKAROV · NU · KAZ», East Asian order «LIN Li · 10753 · CHN»; number = IU, or IR for a referee-only node, else NU */
const netName=n=>{const p=n.p,g=graphNum(n),cc=hebCode(p)||hebCountry(p),sur=String(p.sur||"").toUpperCase(),f=(p.first||"").trim();
  const nm=!f?sur:["CHN","TPE","HKG","MAC","KOR","PRK"].includes(cc)?`${sur} ${f}`:`${f} ${sur}`;
  return [nm,g?iu5(g):"NU",cc].filter(Boolean).join(" · ");};
const iuLbl=n=>{const g=graphNum(n);return g&&g!==n.iu?"IR "+iu5(g):n.iu?"IU "+iu5(n.iu):T().gr_noiu;}; /* NU instead of «no IU»; a referee-only node shows its IR (curator 27.10.2026) */
/* number shown for a graph node (curator 27.10.2026): someone who appears only in referee / official roles shows the IR number, an umpire shows the IU */
/* referees-only selection (curator 27.10.2026): «Enable local links» is hidden and unticked; «Group by continent» stays */
const hebRefOnly=()=>graphState.whoSel==="ref"&&!graphState.whoAll;
const hebGrp=()=>graphState.hebGroup, hebLocal=()=>graphState.hebAll&&!hebRefOnly();
const graphNum=n=>{const p=n.p;return !n.ump&&(p.isRef||p.irNo)?(p.isRef?p.ir:p.irNo):iuOf(p);};
function graphData(){
  const byP=new Map(), nodes=[], pair=new Map();
  const Y=graphState.year;
  EV_BY_DATE.filter(e=>Y==="all"||e.s.slice(0,4)===Y).forEach(e=>{
    /* who (curator 27.10.2026): radio Umpires | Referees (Referee, Deputy, Assistant); checkbox All tournament officials (every known role) overrides both */
    const GS=graphState, wU=GS.whoSel==="ump"||GS.whoAll, wR=GS.whoSel==="ref"||GS.whoAll;
    const ps=[...new Set((wU?e.ump.map(u=>u.p):[]).concat(e.ref.filter(r=>r.p&&(GS.whoAll||(wR&&isRefRole(r.role)))).map(r=>r.p)))], asU=new Set(wU?e.ump.map(u=>u.p):[]);
    ps.forEach(p=>{if(!byP.has(p)){const n={id:"p"+nodes.length,p,iu:iuOf(p),evs:[]};byP.set(p,n);nodes.push(n);}byP.get(p).evs.push(e);if(asU.has(p))byP.get(p).ump=true;});
    const ns=ps.map(p=>byP.get(p));
    for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){const a=ns[i],b=ns[j],k=a.id<b.id?a.id+"|"+b.id:b.id+"|"+a.id;let l=pair.get(k);if(!l){l={source:a,target:b,evs:[]};pair.set(k,l);}l.evs.push(e);}
  });
  return {nodes,links:[...pair.values()]};
}
function viewGraph(){
  const t=T(), G=graphData(), evN=new Set(G.nodes.flatMap(n=>n.evs)).size, noIU=G.nodes.filter(n=>!graphNum(n)).length;
  const ru=LANG==="ru", circ=graphState.view==="circle";
  const tabs=`<div class="tabs" role="tablist" aria-label="${ru?"Вид":"View"}"><button type="button" role="tab" data-gv="net" aria-selected="${!circ}">${ru?"Сеть":"Network"}</button><button type="button" role="tab" data-gv="circle" aria-selected="${circ}">${ru?"Круг":"Circle"}</button></div>`;
  const GS0=graphState, opt=(type,id,name,val,on,dis,l)=>`<label style="display:inline-flex;gap:6px;align-items:center;cursor:${dis?"default":"pointer"};${dis?"opacity:.55;":""}"><input type="${type}" id="${id}"${name?` name="${name}" value="${val}"`:""} style="flex:none;width:auto;margin:0"${on?" checked":""}${dis?" disabled":""}> ${l}</label>`;
  const who=`<div role="group" aria-label="${ru?"Кого показывать":"Who to show"}" style="display:inline-flex;gap:14px;align-items:center;font-size:14px;white-space:nowrap">${opt("radio","gwU","gwho","ump",GS0.whoSel==="ump",GS0.whoAll,ru?"Судьи":"Umpires")}${opt("radio","gwR","gwho","ref",GS0.whoSel==="ref",GS0.whoAll,ru?"Рефери":"Referees")}${opt("checkbox","gwA","","",GS0.whoAll,false,ru?"Все официальные лица турнира":"All tournament officials")}</div>`;
  const ysel=`<select id="gyear" aria-label="${ru?"Год":"Year"}" style="font:inherit;font-size:14px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink)">${[...new Set([...graphYears(),graphState.year].filter(y=>y!=="all"))].sort().map(y=>`<option value="${y}"${y===graphState.year?" selected":""}>${y}</option>`).join("")}<option value="all"${graphState.year==="all"?" selected":""}>${ru?"Все годы":"All years"}</option></select>`;
  if(circ) return `<h1>${t.gr_title}</h1><p class="muted" style="margin:8px 0 0">${ru?`${G.nodes.length} ${graphState.whoAll?plural(G.nodes.length,"официальное лицо","официальных лица","официальных лиц"):graphState.whoSel==="ref"?"рефери":plural(G.nodes.length,"судья","судьи","судей")} на окружности${hebGrp()?": внешнее кольцо — континенты, внутреннее — страны, внутри каждого уровня по алфавиту по часовой стрелке.":" по алфавиту фамилий по часовой стрелке."} Линия — двое работали вместе хотя бы на одном турнире; толщина линии одинаковая. По умолчанию показаны только международные связи.`:`${G.nodes.length} ${graphState.whoAll?"tournament officials":graphState.whoSel==="ref"?"referees":"umpires"} on a circle${hebGrp()?": the outer ring shows continents, the inner ring countries, each level in alphabetical order clockwise.":", in alphabetical order of surnames clockwise."} A line means two umpires worked together at least once; all lines have the same width. International links only by default.`}</p>
  <div class="controls" style="align-items:center;margin-top:16px">${tabs}${ysel}${who}<div style="margin-left:auto;display:inline-flex;gap:14px;align-items:center;flex-wrap:wrap"><label style="display:inline-flex;gap:8px;align-items:center;font-size:14px;cursor:pointer;white-space:nowrap"><input type="checkbox" id="hebGroup" style="flex:none;width:auto;margin:0"${graphState.hebGroup?" checked":""}> ${ru?"Группировать по континентам":"Group by continent"}</label><label style="display:inline-flex;gap:8px;align-items:center;font-size:14px;cursor:pointer;white-space:nowrap"${hebRefOnly()?" hidden":""}><input type="checkbox" id="hebAll" style="flex:none;width:auto;margin:0"${graphState.hebAll?" checked":""}> ${ru?"Включить связи внутри стран":"Enable local links"}</label></div></div>${viewHEBControls(G)}
  <div class="card" style="padding:12px"><div id="hebbox" style="width:100%;max-width:1100px;margin:0 auto"></div></div>
  <p class="muted" style="font-size:13px;margin-top:10px">${ru?"Наведите на точку — подсветятся связи судьи; клик по точке открывает профиль. "+(hebGrp()?"Клик по стране или континенту на кольце показывает связи всех их судей.":"Связи страны или континента можно выбрать в полях ниже. Масштаб — кнопки + и − справа вверху, Ctrl/⌘ + колесо мыши или щипок; круг можно перетаскивать.")+" Выберите турнир, чтобы увидеть, кто с кем на нём работал.":"Hover a dot to highlight that umpire's links; clicking a dot opens the profile. "+(hebGrp()?"Click a country or continent on the ring to see the links of all its umpires.":"Pick a country or continent in the fields below to see their links. Zoom with the + and − buttons at the top right, Ctrl/⌘ + mouse wheel or a pinch; drag to move around.")+" Pick a tournament to see who worked with whom."}</p>
  <div class="card gside" id="hebinfo" style="font-size:14px"></div>`;
  return `<h1>${t.gr_title}</h1><p class="muted" style="margin:8px 0 0">${t.gr_sub(G.nodes.length,noIU,evN,G.links.length)}</p>
  <div class="controls" style="align-items:center;margin-top:16px">${tabs}
    <div style="position:relative;flex:1;min-width:220px;max-width:420px"><input id="gq" type="search" placeholder="${t.gr_search}" aria-label="${t.gr_search}" autocomplete="off" style="width:100%"><div class="gres" id="gres" hidden></div></div>
    ${ysel}${who}
    <button class="btn" type="button" id="greset">${t.gr_reset}</button>
  </div>
  <div class="controls" style="align-items:center;margin-top:0">${(()=>{const evs=hebEvents(G),cur=graphState.sel&&graphState.sel.kind==="e"?graphState.sel.ref:null;
    return `<input id="gev" type="search" list="gevl" autocomplete="off" placeholder="${ru?`Турнир: название, город или страна (${evs.length})`:`Tournament: name, city or country (${evs.length})`}" value="${cur?esc(hebEvLabel(cur)):""}" style="flex:1;min-width:200px">
    <datalist id="gevl">${evs.map(e=>`<option value="${esc(hebEvLabel(e))}"></option>`).join("")}</datalist>
    <button class="btn" type="button" id="gevprev" aria-label="${ru?"Предыдущий турнир":"Previous tournament"}">←</button><button class="btn" type="button" id="gevnext" aria-label="${ru?"Следующий турнир":"Next tournament"}">→</button>`;})()}</div>
  <div class="controls" style="align-items:center;margin-top:-6px"><label style="display:inline-flex;gap:8px;align-items:center;font-size:14px;cursor:pointer;white-space:nowrap"><input type="checkbox" id="gmin2" style="flex:none;width:auto;margin:0"${graphState.min===2?" checked":""}> ${ru?"Показывать только 2+ общих турнира":"Show only 2+ shared tournaments"}</label></div>
  <div class="gwrap" id="gwrap"><canvas id="gcv" aria-label="${t.gr_title}" role="img"></canvas><div class="gtip" id="gtip" hidden></div></div>
  <div class="gleg"><span><i class="um"></i>${t.gr_leg_u}</span><span><i class="um0"></i>${t.gr_leg_u0}</span><span><i class="w1"></i>1</span><span><i class="w2"></i>2</span><span><i class="w3"></i>3+ ${t.gr_leg_w}</span><span>${t.gr_hint}</span></div>
  <div class="card gside" id="gside"><p class="muted" style="margin:0">${t.gr_pick}</p></div>`;
}
/* ---------- graph, second view: hierarchical edge bundling (continent → country → umpire on a circle) ---------- */
/* host country of an event, guessed from the city / country word in its name (for the tournament search) */
const EV_HOST=[["ALMATY|ASTANA|AKTOBE","Kazakhstan","Казахстан"],["ASUNCION","Paraguay","Парагвай"],["BALLARAT|GOLD COAST","Australia","Австралия"],["BANGKOK|NAKHON RATCHASIMA","Thailand","Таиланд"],["BATUMI","Georgia","Грузия"],["BEIJING|HAIKOU|CHONGQING|TAIYUAN|CHINA SMASH|MIXED TEAM WORLD CUP","China","Китай"],["BERLIN|DUSSELDORF|CHAMPIONS GERMANY","Germany","Германия"],["BUENOS AIRES","Argentina","Аргентина"],["CAIRO","Egypt","Египет"],["CAPPADOCIA|CAPADOCCIA|ISTANBUL|YALOVA","Turkey","Турция"],["CARACAS","Venezuela","Венесуэла"],["CHENNAI|VADODARA","India","Индия"],["CLUJ","Romania","Румыния"],["COSTA BRAVA|MURCIA|PLATJA","Spain","Испания"],["CUENCA","Ecuador","Эквадор"],["DAKAR","Senegal","Сенегал"],["DOHA","Qatar","Катар"],["GABORONE","Botswana","Ботсвана"],["GANGNEUNG|FISU","Republic of Korea","Республика Корея"],["GDANSK|WLADYSLAWOWO","Poland","Польша"],["GONDOMAR|VILA NOVA DE GAIA|VILA REAL","Portugal","Португалия"],["HAVIROV|OLOMOUC|OSTRAVA","Czech Republic","Чехия"],["HELSINGBORG","Sweden","Швеция"],["HENNEBONT|LILLE|METZ|MONTPELLIER|YVELINES|ANTIBES","France","Франция"],["HONG KONG|HONG-KONG","Hong Kong, China","Гонконг"],["HOUSTON|SAN FRANCISCO|SPOKANE|UNITED STATES","United States of America","США"],["HUMACAO","Puerto Rico","Пуэрто-Рико"],["LAGOS","Nigeria","Нигерия"],["LAHTI","Finland","Финляндия"],["LASKO|OTOCEC|LJUBLJANA","Slovenia","Словения"],["LIGNANO|MEDITERRANEAN","Italy","Италия"],["LINZ","Austria","Австрия"],["LONDON","England","Англия"],["LUXEMBURG","Luxembourg","Люксембург"],["MACAO","Macau, China","Макао"],["MANAMA","Bahrain","Бахрейн"],["MISSISSAUGA","Canada","Канада"],["MONTERIA","Colombia","Колумбия"],["MUSCAT","Oman","Оман"],["NAGOYA|YOKOHAMA","Japan","Япония"],["NOVI SAD","Serbia","Сербия"],["PANAGYURISHTE","Bulgaria","Болгария"],["PODGORICA","Montenegro","Черногория"],["PRISHTINA|PRISTINA","Kosovo","Косово"],["PUERTO PRINCESA","Philippines","Филиппины"],["RIYADH","Saudi Arabia","Саудовская Аравия"],["SAN JOSE","Costa Rica","Коста-Рика"],["SANDEFJORD","Norway","Норвегия"],["SANTIAGO","Chile","Чили"],["SAO PAULO|BRAZIL","Brazil","Бразилия"],["SENEC","Slovakia","Словакия"],["SERAJEVO|SARAJEVO","Bosnia & Herzegovina","Босния и Герцеговина"],["SINGAPORE","Singapore","Сингапур"],["SKOPJE","North Macedonia","Северная Македония"],["SPA ","Belgium","Бельгия"],["SZOMBATHELY","Hungary","Венгрия"],["TAIPEI","Chinese Taipei","Китайский Тайбэй"],["TASHKENT","Uzbekistan","Узбекистан"],["TUNIS|TUNISIA","Tunisia","Тунис"],["ULAANBAATAR","Mongolia","Монголия"],["VARAZDIN|ZAGREB","Croatia","Хорватия"],["VIETANANE|VIETNANE|VIENTIANE","Laos","Лаос"],["AMMAN","Jordan","Иордания"]].map(([re,en,ru])=>[new RegExp("\\b("+re+")","i"),en,ru]);
const evHost=e=>{const h=EV_HOST.find(([re])=>re.test(e.name+" "));return h?[h[1],h[2]]:null;};
function hebEvents(G){return [...new Set(G.nodes.flatMap(n=>n.evs))].sort((a,b)=>a.s.localeCompare(b.s)||a.e.localeCompare(b.e));}
/* AIN (neutral) umpires in 2026 are Russian (curator 26.10.2026): grouped under Russia in the circle view */
const hebCountry=p=>{const c=p.c?p.c.name:(p.cname||p.code||"—");return (p.code==="AIN"||/\bAIN\b/.test(c))?"Russia":c;};
const hebCode=p=>(p.c&&p.c.code)||p.code||({Uzbekistan:"UZB"})[hebCountry(p)]||"";
const hebCont=p=>contOf(p)||(hebCountry(p)==="Russia"?"EU":"")||"—";
const hebEvLabel=e=>{const h=evHost(e);return `${fmtRange(e.s,e.e)} — ${evName(e)}${h?` · ${LANG==="ru"?h[1]+" ("+h[0]+")":h[0]}`:""}`;};
const hebPLabel=p=>{const num=iuOf(p)||(p.isRef?p.ir:p.irNo)||0;return `${p.sur} ${p.first||""}`.trim()+(num?` · ${String(num).padStart(5,"0")}`:"")+` · ${hebCountry(p)}`;}; /* IU, or IR for a referee without IU */
/* circle-view label (curator 26.10.2026): surname in Title case; in a double/triple surname every part after the first is cut to its initial with a dot, keeping the separator ("Abdel-M.", "Ben A."); then the IU number, "Kim 02961" */
const hebShort=p=>{const cap=w=>w.toLowerCase().replace(/(^|['’])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase());
  const parts=String(p.sur||"").trim().split(/([\s-]+)/).filter(x=>x!=="");
  const full=String(p.sur||"").trim(), f0=parts[0]||"";
  /* longer than 12 characters (curator 26.10.2026): if the 12th character falls inside the first part, cut there with a dot;
     if it is the last letter of the first part or the space/hyphen after it, keep the first part alone, without a dot ("KALLAGHATTA-RAJANDRA" → "Kallaghatta") */
  const s=full.length>12&&f0.length>12?cap(f0).slice(0,12)+".":full.length>12&&f0.length>=11?cap(f0):
    parts.map((w,i)=>/^[\s-]+$/.test(w)?(w.includes("-")?"-":" "):i===0?cap(w):cap(w).charAt(0)+".").join("");
  const iu=iuOf(p);return iu?`${s} · ${String(iu).padStart(5,"0")}`:s;};
/* label parts (curator 26.10.2026): surname · IU, plus the country code in the alphabetical (ungrouped) circle; joined with an interpunct */
const hebParts=(p,withCode,num)=>{const iu=num!==undefined?num:iuOf(p);return [hebShort({sur:p.sur}),iu?String(iu).padStart(5,"0"):"",withCode?hebCode(p):""].filter(Boolean);};
/* country field (curator 26.10.2026): a combobox; the list shows the name on the left and the code at the far right, the field finds by name or code */
const hebCodeOf=(G,c)=>{const n=G.nodes.find(x=>hebCountry(x.p)===c);return n?hebCode(n.p):"";};
function viewHEBControls(G){
  const ru=LANG==="ru", evs=hebEvents(G), S=graphState, T0=T();
  const conts=[...new Set(G.nodes.map(n=>hebCont(n.p)))].filter(k=>k!=="—").sort((a,b)=>(T0.conts[a]||a).localeCompare(T0.conts[b]||b));
  const countries=[...new Set(G.nodes.map(n=>hebCountry(n.p)))].sort();
  const inp=(id,ph,list,val)=>`<input id="${id}" type="search" list="${list}" placeholder="${ph}" autocomplete="off" value="${esc(val||"")}" style="flex:1;min-width:200px">`;
  const f=S.hebFocus;
  return `<div class="controls" style="align-items:center;margin:0 0 10px">
    ${inp("hebev",ru?`Турнир: название, город или страна (${evs.length})`:`Tournament: name, city or country (${evs.length})`,"hebevl",S.hebEv!=null&&EVENTS[S.hebEv]?hebEvLabel(EVENTS[S.hebEv]):"")}
    <datalist id="hebevl">${evs.map(e=>`<option value="${esc(hebEvLabel(e))}"></option>`).join("")}</datalist>
    <button class="btn" type="button" id="hebprev" aria-label="${ru?"Предыдущий турнир":"Previous tournament"}">←</button><button class="btn" type="button" id="hebnext" aria-label="${ru?"Следующий турнир":"Next tournament"}">→</button>
  </div>
  <div class="controls" style="align-items:center;margin:0 0 14px">
    ${inp("hebp",ru?"Имя, номер IU или номер IR":"Name, IU number or IR number","hebpl",f&&f.kind==="p"?hebPLabel(f.ref):"")}
    <datalist id="hebpl">${G.nodes.slice().sort((a,b)=>a.p.sur.localeCompare(b.p.sur)).map(n=>`<option value="${esc(hebPLabel(n.p))}"></option>`).join("")}</datalist>
    <div class="hcbox"><input id="hebc" type="search" role="combobox" aria-expanded="false" aria-controls="hebcList" autocomplete="off" placeholder="${ru?"Страна или код страны":"Country or country code"}" value="${f&&f.kind==="c"?esc(f.ref):""}"><span id="hebcCode" class="hcode">${f&&f.kind==="c"?esc(hebCodeOf(G,f.ref)):""}</span><div class="gres" id="hebcList" role="listbox" hidden></div></div>
    <select id="hebk" aria-label="${ru?"Континент":"Continent"}" style="font:inherit;font-size:14px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink)"><option value="">${ru?"Все континенты":"All continents"}</option>${conts.map(k=>`<option value="${k}"${f&&f.kind==="k"&&f.ref===k?" selected":""}>${esc(T0.conts[k]||k)}</option>`).join("")}</select>
    <button class="btn" type="button" id="hebclr">${ru?"Сбросить всё":"Reset all"}</button>
  </div>`;
}
function wireHEB(){
  const box=$("#hebbox"); if(!box||typeof d3==="undefined") return;
  const ru=LANG==="ru", G=graphData(), S=graphState, T0=T();
  const intl=l=>hebCountry(l.source.p)!==hebCountry(l.target.p);
  const links=hebLocal()?G.links:G.links.filter(intl);
  /* hierarchy: continent → country → umpire, each level alphabetical */
  const byK=d3group(G.nodes,n=>hebCont(n.p));
  const bySur=(a,b)=>a.p.sur.localeCompare(b.p.sur)||(a.p.first||"").localeCompare(b.p.first||"");
  const data=!hebGrp()?{name:"",children:G.nodes.slice().sort(bySur).map(n=>({name:fullName(n.p),n}))}:{name:"",children:[...byK].sort((a,b)=>(T0.conts[a[0]]||"~").localeCompare(T0.conts[b[0]]||"~")).map(([k,ns])=>({name:T0.conts[k]||"—",k,children:[...d3group(ns,n=>hebCountry(n.p))].sort((a,b)=>a[0].localeCompare(b[0])).map(([c,cs])=>({name:c,code:hebCode(cs[0].p),children:cs.slice().sort((a,b)=>a.p.sur.localeCompare(b.p.sur)||(a.p.first||"").localeCompare(b.p.first||"")).map(n=>({name:fullName(n.p),n}))}))}))};
  const W0=Math.max(320,Math.min(1100,box.clientWidth)), small=W0<600, grp=hebGrp();
  /* flat view (curator 26.10.2026): every surname is shown at once, one 8px line per umpire → the label ring is as large as the umpire count needs,
     the drawing is zoomable (buttons, drag, Ctrl/⌘ + wheel, pinch); the grouped view keeps its size */
  const nLeaf=G.nodes.length, LRflat=Math.max(W0/2-172+30,nLeaf*9.2/(2*Math.PI));
  const R=grp?W0/2-(small?80:142):LRflat-30; /* grouped: a little more margin since labels carry the country code too */
  let W=grp?W0:2*(LRflat+150); /* flat: refined below, once the longest label is measured */
  const root=d3.cluster().size([2*Math.PI,R]).separation((a,b)=>a.parent===b.parent?1:a.parent.parent===b.parent.parent?3:8)(d3.hierarchy(data));
  if(!grp) root.leaves().forEach((l,i,a)=>{l.x=2*Math.PI*i/a.length;l.y=R;}); /* flat: evenly spaced, bundled through the centre */
  const leafOf=new Map(root.leaves().map(l=>[l.data.n,l]));
  const line=d3.lineRadial().curve(d3.curveBundle.beta(0.85)).radius(d=>d.y).angle(d=>d.x);
  box.style.position="relative";
  const svg=d3.select(box).html("").append("svg").attr("id","heb").attr("width","100%").attr("role","img").attr("aria-label",ru?"Кольцевая диаграмма связей судей":"Circular diagram of umpire links");
  if(!grp){ /* flat (curator 26.10.2026): the circle is sized so that even the longest enlarged label (≈9.5px, semibold) stays inside the box */
    const bw=Math.max(320,box.clientWidth||W0), tmp=svg.append("text").style("font","600 8px var(--f-body)");
    let mx=0; G.nodes.forEach(n=>{tmp.text(hebParts(n.p,true,graphNum(n)).join(" · "));mx=Math.max(mx,tmp.node().getComputedTextLength());}); tmp.remove();
    const den=bw/2-10-4-mx*9.5/8, u=den>40?(R+10)/den:(R+10)/40;
    W=Math.max(2*(R+10+mx+12),u*bw);}
  svg.attr("viewBox",[-W/2,-W/2,W,W]).classed("flat",!grp);
  const Z=svg.append("g").attr("class","hz");
  const paths=Z.append("g").selectAll("path").data(links).join("path").attr("class","l").attr("d",l=>line(leafOf.get(l.source).path(leafOf.get(l.target))));
  /* links can be hovered (curator 26.10.2026): an invisible wider copy of every line makes it catchable; while a country / continent / umpire / tournament is selected only its highlighted lines react */
  const hits=Z.append("g").attr("class","hhit").selectAll("path").data(links).join("path").attr("d",(l,i)=>paths.nodes()[i].getAttribute("d"));
  const deg=x=>x*180/Math.PI-90;
  const ring=(node,r0,r1,cls,label,title,click)=>{const ls=node.leaves(),a0=ls[0].x-0.004,a1=ls[ls.length-1].x+0.004,m=(a0+a1)/2;
    const g=Z.append("g").attr("class","hring "+cls).style("cursor","pointer").on("click",click);
    g.append("path").attr("class","arc").attr("d",d3.arc()({innerRadius:r0,outerRadius:r1,startAngle:a0,endAngle:a1})).append("title").text(title);
    if(label) g.append("text").attr("transform",`rotate(${deg(m)}) translate(${r1+4},0)${m>=Math.PI?" rotate(180)":""}`).attr("text-anchor",m<Math.PI?"start":"end").attr("dy","0.32em").text(label).append("title").text(title);
    return g;};
  const cR0=R+5,cR1=R+8,kR0=R+(small?40:70),kR1=kR0+5;
  const cRings=[],kRings=[];
  if(grp) root.children.forEach(k=>{
    k.children.forEach(c=>{const n=c.leaves().length;cRings.push([c.data.name,ring(c,cR0,cR1,"hcty",(n>=3||W>=900)?(c.data.code||c.data.name):"",`${c.data.name}: ${n}`,()=>setFocus({kind:"c",ref:c.data.name}))]);});
    kRings.push([k.data.k,ring(k,kR0,kR1,"hcont",k.data.name,`${k.data.name}: ${k.leaves().length}`,()=>setFocus({kind:"k",ref:k.data.k}))]);
  });
  const dots=Z.append("g").selectAll("circle").data(root.leaves()).join("circle").attr("class","hd").attr("r",small?1.6:2.1)
    .attr("cx",d=>d.y*Math.cos(d.x-Math.PI/2)).attr("cy",d=>d.y*Math.sin(d.x-Math.PI/2));
  dots.append("title").text(d=>hebTip(d.data.n.p,graphNum(d.data.n)));
  const tipEl=d3.select(box).append("div").attr("class","gtip hltip").style("display","none");
  function hebTip(p,num){const iu=num!==undefined?num:iuOf(p),cc=hebCode(p),sur=String(p.sur||"").toUpperCase(),f=(p.first||"").trim();
    const east=["CHN","TPE","HKG","MAC","KOR","PRK"].includes(cc), tail=[iu?String(iu).padStart(5,"0"):"",cc||hebCountry(p)].filter(Boolean);
    const line=g=>[!g?sur:east?`${sur} ${g}`:`${g} ${sur}`,...tail].join(" · ");
    /* one line only (curator 26.10.2026): a long line gets the given name cut to its first letter with a dot, "Manjunath" → "M." */
    const full=line(f); return full.length>36&&f?line(f.charAt(0).toUpperCase()+"."):full;} /* "Timur KHOJAYEV · 20724 · KAZ", East Asian order "LIN Li · 14863 · CHN" (curator 26.10.2026) */
  const lblG=Z.append("g").attr("class","hlbl");
  /* flat view: all labels always on, at their own angle; hovering a label turns it orange and highlights that umpire's links */
  const allG=Z.append("g").attr("class","hall");
  const allT=grp?null:allG.selectAll("text").data(root.leaves()).join("text")
    .attr("transform",d=>`rotate(${deg(d.x)}) translate(${R+10},0)${d.x>=Math.PI?" rotate(180)":""}`).attr("text-anchor",d=>d.x<Math.PI?"start":"end").attr("dy","0.32em")
    .text(d=>{const a=hebParts(d.data.n.p,true,graphNum(d.data.n));return (d.x>=Math.PI?a.reverse():a).join(" · ");});
  /* labels fan out (curator 26.10.2026): dots and links stay put; each label gets its own angle with a minimum gap,
     clusters of overlapping labels are centred on their dots, and a thin leader joins the dot to its label */
  const LR=R+(small?16:30), GAP0=9.8/LR, PT=(r,a)=>[r*Math.cos(a-Math.PI/2),r*Math.sin(a-Math.PI/2)];
  function spread(ls,GAP){
    const it=ls.map(d=>({d,x:d.x})).sort((a,b)=>a.x-b.x);
    let cl=it.map(o=>({items:[o],c:o.x}));
    const lo=c=>c.c-(c.items.length-1)*GAP/2, hi=c=>c.c+(c.items.length-1)*GAP/2;
    for(let moved=true,k=0;moved&&k<200;k++){moved=false;
      for(let i=1;i<cl.length;i++) if(lo(cl[i])-hi(cl[i-1])<GAP){
        const m={items:cl[i-1].items.concat(cl[i].items)}; m.c=d3.mean(m.items,o=>o.x);
        cl.splice(i-1,2,m); moved=true; break;}}
    cl.forEach(c=>c.items.forEach((o,j)=>o.a=lo(c)+j*GAP));
    return it;}
  function drawLabels(ls,cls){
    const it=spread(ls,GAP0);
    lblG.selectAll("path").data(it).join("path").attr("d",o=>{const a=PT(R+3,o.d.x),b=PT(R+(small?6:10),o.d.x),c=PT(LR-3,o.a);return `M${a}L${b}L${c}`;});
    lblG.selectAll("text").data(it).join("text").attr("transform",o=>`rotate(${deg(o.a)}) translate(${LR},0)${o.a>=Math.PI?" rotate(180)":""}`).attr("text-anchor",o=>o.a<Math.PI?"start":"end").attr("dy","0.32em").attr("class",cls||null).text(o=>{const a=hebParts(o.d.data.n.p,true,graphNum(o.d.data.n));return (o.a>=Math.PI?a.reverse():a).join(" · ");});} /* left half reads inward, so the IU goes first to stay on the outer side */
  const info=$("#hebinfo"), evs=hebEvents(G);
  const curEv=()=>S.hebEv!=null&&EVENTS[S.hebEv]&&evs.includes(EVENTS[S.hebEv])?EVENTS[S.hebEv]:null;
  const setOf=f=>!f?null:f.kind==="p"?new Set(G.nodes.filter(n=>n.p===f.ref)):new Set(G.nodes.filter(n=>f.kind==="c"?hebCountry(n.p)===f.ref:hebCont(n.p)===f.ref));
  let curK=1, lastH;
  /* flat view: the hovered umpire and the linked ones get a readable copy (≈9.5px on screen at any zoom), fanned out with leaders where they would collide;
     the small originals of those umpires are hidden meanwhile (the hovered one stays under the pointer, invisible, so the hover holds) */
  function drawBig(items){
    lblG.html(""); if(!items.length) return;
    const sc=(box.clientWidth/W)*curK, fsz=Math.max(8,9.5/sc), Rb=R+10+6/sc, gap=fsz*1.18/Rb;
    const kind=new Map(items.map(([n,c])=>[n,c]));
    const it=spread(items.map(([n])=>leafOf.get(n)),gap);
    lblG.selectAll("path").data(it).join("path").attr("d",o=>{const a=PT(R+2,o.d.x),b=PT(R+2+4/sc,o.d.x),c=PT(Rb-2/sc,o.a);return `M${a}L${b}L${c}`;}).style("stroke-width",0.6/sc);
    lblG.selectAll("text").data(it).join("text").attr("class",o=>"big "+(kind.get(o.d.data.n)||"")).style("font-size",fsz+"px")
      .attr("transform",o=>`rotate(${deg(o.a)}) translate(${Rb},0)${o.a>=Math.PI?" rotate(180)":""}`).attr("text-anchor",o=>o.a<Math.PI?"start":"end").attr("dy","0.32em")
      .text(o=>{const a=hebParts(o.d.data.n.p,true,graphNum(o.d.data.n));return (o.a>=Math.PI?a.reverse():a).join(" · ");});}
  function showTip(ev,l){const ru2=ru,e2=l.evs.slice().sort((a,b)=>b.s.localeCompare(a.s));
    tipEl.style("display",null).html(`<b>${esc(hebTip(l.source.p,graphNum(l.source)))}<br>${esc(hebTip(l.target.p,graphNum(l.target)))}</b><div style="margin-top:4px">${e2.length===1?(ru2?"Общий турнир":"Shared tournament"):(ru2?"Общие турниры":"Shared tournaments")}:</div>${e2.map(x=>`<div>${esc(evName(x))}</div>`).join("")}`);
    const [x,y]=d3.pointer(ev,box); tipEl.style("left",x+"px").style("top",y+"px");}
  function render(hover){
    lastH=hover; svg.classed("hv",!!hover&&(hover.kind==="p"||hover.kind==="l"));
    if(hover&&hover.kind==="l"){const l=hover.ref, ends=n=>n===l.source||n===l.target;svg.classed("focus",true);
      paths.classed("on",x=>x===l); paths.filter(".on").raise();
      dots.classed("on",d=>ends(d.data.n));
      if(allT){allT.classed("on",d=>ends(d.data.n)).classed("hov",false);drawBig([[l.source,"rcv"],[l.target,"rcv"]]);}
      else{lblG.html("");svg.classed("lbl",true);drawLabels([leafOf.get(l.source),leafOf.get(l.target)],"rcv");}
      return;}
    const e=curEv(), f=hover||S.hebFocus, fs=setOf(f);
    const evSet=e?new Set(G.nodes.filter(n=>n.evs.includes(e))):null;
    const act=l=>(!e||l.evs.includes(e))&&(!fs||fs.has(l.source)||fs.has(l.target));
    const any=!!(e||fs);
    svg.classed("focus",any);
    paths.classed("on",l=>any&&act(l)); paths.filter(".on").raise();
    hits.classed("dis",l=>any&&!act(l));
    const on=new Set(); if(any) paths.filter(".on").each(l=>{on.add(l.source);on.add(l.target);});
    if(fs) fs.forEach(n=>{if(!e||evSet.has(n))on.add(n);}); else if(evSet) evSet.forEach(n=>on.add(n));
    dots.classed("on",d=>on.has(d.data.n));
    cRings.forEach(([c,g])=>g.classed("sel",!!f&&f.kind==="c"&&f.ref===c)); kRings.forEach(([k,g])=>g.classed("sel",!!f&&f.kind==="k"&&f.ref===k));
    lblG.html("");
    if(allT){const hv=n=>!!hover&&hover.kind==="p"&&n.p===hover.ref;
      allT.classed("on",d=>on.has(d.data.n)).classed("hov",d=>hv(d.data.n));
      if(any&&on.size<=150) drawBig([...on].map(n=>[n,hv(n)?"hov":""]));}
    const lab=[...on], showL=grp&&any&&lab.length<=70; svg.classed("lbl",showL); if(showL) drawLabels(lab.map(n=>leafOf.get(n)));
    const nAct=any?paths.filter(".on").size():links.length;
    const parts=[];
    if(e) parts.push(`<b><a href="#e${e.i}">${esc(evName(e))}</a></b> · <span class="num">${esc(fmtRange(e.s,e.e))}</span>${evHost(e)?" · "+esc(ru?evHost(e)[1]:evHost(e)[0]):""} · ${evSet.size} ${ru?plural(evSet.size,"судья","судьи","судей"):"umpires"}`);
    if(f) parts.push(`<b>${f.kind==="p"?`<a href="${href(f.ref)}">${esc(fullName(f.ref))}</a> · ${esc(hebCountry(f.ref))}`:f.kind==="c"?esc(f.ref):esc(T0.conts[f.ref]||f.ref)}</b>${f.kind!=="p"?` · ${fs.size} ${ru?plural(fs.size,"судья","судьи","судей"):"umpires"}`:""}`);
    let html=parts.join("<br>")+(any?`<div class="muted" style="margin-top:4px">${ru?"Активных связей":"Active links"}: ${nAct}${hebLocal()?"":ru?" (только международные)":" (international only)"}</div>`:"");
    if(any&&(e||f.kind==="p")){const list=[...on].sort((a,b)=>a.p.sur.localeCompare(b.p.sur));if(list.length&&list.length<=80)html+=`<div style="margin-top:8px;font-size:13px">${list.map(n=>`<a href="${href(n.p)}">${esc(fullName(n.p))}</a>`).join(" · ")}</div>`;}
    if(info) info.innerHTML=html;
    updClr();
  }
  /* «Reset all» is disabled until something is set in the filters (curator 26.10.2026) */
  function updClr(){const x=$("#hebclr");if(!x)return;const val=id=>{const el=$(id);return !!(el&&el.value&&el.value.trim());};
    x.disabled=!(S.hebFocus||S.hebEv!=null||S.whoSel!=="ump"||S.whoAll||val("#hebev")||val("#hebp")||val("#hebc")||val("#hebk"));}
  function setFocus(f){S.hebFocus=f;const P=$("#hebp"),C=$("#hebc"),K=$("#hebk");
    if(P)P.value=f&&f.kind==="p"?hebPLabel(f.ref):""; if(C)C.value=f&&f.kind==="c"?f.ref:""; {const cc=$("#hebcCode");if(cc)cc.textContent=f&&f.kind==="c"?hebCodeOf(G,f.ref):"";} if(K)K.value=f&&f.kind==="k"?f.ref:"";render();}
  const setEv=e=>{S.hebEv=e?e.i:null;const I=$("#hebev");if(I)I.value=e?hebEvLabel(e):"";render();};
  dots.on("mouseenter",(ev,d)=>render({kind:"p",ref:d.data.n.p})).on("mouseleave",()=>render()).on("click",(ev,d)=>{location.hash=href(d.data.n.p);});
  hits.on("mouseenter",(ev,l)=>{render({kind:"l",ref:l});showTip(ev,l);}).on("mousemove",(ev,l)=>showTip(ev,l)).on("mouseleave",()=>{tipEl.style("display","none");render();});
  if(allT) allT.on("mouseenter",(ev,d)=>render({kind:"p",ref:d.data.n.p})).on("mouseleave",()=>render()).on("click",(ev,d)=>{location.hash=href(d.data.n.p);});
  if(!grp){ /* zoom for the large flat circle: starts fitted to the box */
    const zb=d3.zoom().scaleExtent([1,8]).translateExtent([[-W/2,-W/2],[W/2,W/2]])
      .filter(ev=>ev.type==="wheel"?(ev.ctrlKey||ev.metaKey):!ev.button)
      .on("zoom",ev=>{Z.attr("transform",ev.transform);if(ev.transform.k!==curK){curK=ev.transform.k;render(lastH);}});
    svg.call(zb).on("dblclick.zoom",null);
    const zc=d3.select(box).append("div").attr("class","zoom").style("position","absolute").style("top","8px").style("right","8px").style("background","var(--surface)");
    [["+",ru?"Приблизить":"Zoom in",()=>svg.transition().duration(250).call(zb.scaleBy,1.6)],
     ["−",ru?"Отдалить":"Zoom out",()=>svg.transition().duration(250).call(zb.scaleBy,1/1.6)],
     ["⟲",ru?"Весь круг":"Whole circle",()=>svg.transition().duration(250).call(zb.transform,d3.zoomIdentity)]]
      .forEach(([s,l,f])=>zc.append("button").attr("type","button").attr("aria-label",l).attr("title",l).text(s).on("click",f));
  }
  const I=$("#hebev"); if(I){I.oninput=()=>{const e=evs.find(x=>hebEvLabel(x)===I.value);if(e)setEv(e);else if(!I.value.trim())setEv(null);};}
  const step=d=>{const e=curEv();const idx=e?evs.indexOf(e):-1;let j=idx<0?(d>0?0:evs.length-1):idx+d;setEv(j<0||j>=evs.length?null:evs[j]);};
  const pv=$("#hebprev"),nx=$("#hebnext"); if(pv)pv.onclick=()=>step(-1); if(nx)nx.onclick=()=>step(1);
  const P=$("#hebp"); if(P)P.oninput=()=>{const q=P.value.trim();if(!q){if(S.hebFocus&&S.hebFocus.kind==="p")setFocus(null);return;}
    const n=G.nodes.find(x=>hebPLabel(x.p)===P.value)||(/^\d{3,5}$/.test(q)?(G.nodes.find(x=>iuOf(x.p)===+q)||G.nodes.find(x=>(x.p.isRef?x.p.ir:x.p.irNo)===+q)):null);if(n)setFocus({kind:"p",ref:n.p});};
  const C=$("#hebc"), CL=$("#hebcList");
  if(C&&CL){const ctys=[...new Set(G.nodes.map(x=>hebCountry(x.p)))].sort().map(c=>({c,k:hebCodeOf(G,c),n:G.nodes.filter(x=>hebCountry(x.p)===c).length}));
    let items=[],hi=-1;
    const nz=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    const draw=q=>{const v=nz(q.trim());items=ctys.filter(o=>!v||nz(o.c).includes(v)||nz(o.k).startsWith(v));
      hi=items.length?0:-1;
      CL.innerHTML=items.length?items.map((o,i)=>`<button type="button" role="option" data-i="${i}" class="${i===hi?"on":""}"><span>${esc(o.c)}</span><span class="m">${esc(o.k)}</span></button>`).join(""):`<div class="m" style="padding:8px 12px">${ru?"Нет совпадений":"No matches"}</div>`;
      CL.hidden=false;C.setAttribute("aria-expanded","true");};
    const close=()=>{CL.hidden=true;C.setAttribute("aria-expanded","false");const f=S.hebFocus;C.value=f&&f.kind==="c"?f.ref:"";$("#hebcCode").textContent=f&&f.kind==="c"?hebCodeOf(G,f.ref):"";updClr();};
    const pick=o=>{setFocus({kind:"c",ref:o.c});close();};
    const mark=()=>CL.querySelectorAll("button").forEach((b,i)=>{b.classList.toggle("on",i===hi);if(i===hi)b.scrollIntoView({block:"nearest"});});
    C.onfocus=()=>{C.select();draw("");};
    C.onclick=()=>{if(CL.hidden)draw("");};
    C.oninput=()=>{$("#hebcCode").textContent="";if(!C.value.trim()&&S.hebFocus&&S.hebFocus.kind==="c")setFocus(null);draw(C.value);};
    CL.onmousedown=e=>e.preventDefault();
    CL.onclick=e=>{const b=e.target.closest("[data-i]");if(b)pick(items[+b.dataset.i]);};
    C.onkeydown=e=>{if(e.key==="ArrowDown"){e.preventDefault();if(CL.hidden)draw(C.value);hi=Math.min(items.length-1,hi+1);mark();}
      else if(e.key==="ArrowUp"){e.preventDefault();hi=Math.max(0,hi-1);mark();}
      else if(e.key==="Enter"){e.preventDefault();if(items[hi])pick(items[hi]);}
      else if(e.key==="Escape"){close();C.blur();}};
    C.onblur=()=>setTimeout(close,0);}
  const K=$("#hebk"); if(K)K.onchange=()=>setFocus(K.value?{kind:"k",ref:K.value}:null);
  const A=$("#hebAll"); if(A)A.onchange=()=>{S.hebAll=A.checked;route(true);};
  const Gp=$("#hebGroup"); if(Gp)Gp.onchange=()=>{S.hebGroup=Gp.checked;route(true);};
  const X=$("#hebclr"); if(X)X.onclick=()=>{S.hebEv=null;if(I)I.value="";if(S.whoSel!=="ump"||S.whoAll){S.whoSel="ump";S.whoAll=false;S.hebFocus=null;route(true);return;}setFocus(null);}; /* Reset all also returns to Umpires */
  [I,P,C,K].forEach(el=>{if(el)el.addEventListener("input",updClr);});
  updClr();
  /* grouped view (curator 26.10.2026): a click on empty space, inside or outside the diagram, drops any pinned selection (umpire, country, continent, tournament) */
  if(window._hebDocClick) document.removeEventListener("click",window._hebDocClick);
  window._hebDocClick=ev=>{if(!hebGrp()||S.view!=="circle"||!document.body.contains(box))return;
    if(ev.target.closest("input,select,button,a,label,textarea,.controls,.hring,.hd,.hhit,.hltip,#hebinfo,.bar,.modal,.scrim"))return;
    if(S.hebFocus||S.hebEv!=null){S.hebEv=null;if(I)I.value="";setFocus(null);}};
  document.addEventListener("click",window._hebDocClick);
  if(S.hebFocus&&S.hebFocus.kind==="p"&&!G.nodes.some(n=>n.p===S.hebFocus.ref))S.hebFocus=null;
  render();
}

function d3group(arr,f){const m=new Map();arr.forEach(x=>{const k=f(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x);});return m;}
let GRAPH=null;
function wireGraph(){
  /* tear down the previous instance completely: its listeners, zoom, observer and frame loop would otherwise keep drawing an old state onto the same canvas */
  if(GRAPH){GRAPH.sim.stop();GRAPH.ac.abort();GRAPH.ro.disconnect();cancelAnimationFrame(GRAPH.raf());GRAPH.sel.interrupt().on(".zoom",null);GRAPH=null;}
  const gy=$("#gyear"); if(gy) gy.onchange=()=>{graphState.year=gy.value;graphState.sel=null;graphState.hebEv=null;if(graphState.hebFocus&&graphState.hebFocus.kind==="p")graphState.hebFocus=null;route(true);};
  {const GS=graphState, A=$("#gwA");
    const apply=()=>{GS.sel=null;if(GS.hebFocus&&GS.hebFocus.kind==="p")GS.hebFocus=null;if(hebRefOnly())GS.hebAll=false;route(true);}; /* «Enable local links» is unticked when it disappears (curator 27.10.2026) */
    document.querySelectorAll('input[name="gwho"]').forEach(r=>r.onchange=()=>{if(r.checked){GS.whoSel=r.value;apply();}});
    if(A)A.onchange=()=>{GS.whoAll=A.checked;apply();};}
  document.querySelectorAll("[data-gv]").forEach(b=>b.onclick=()=>{if(graphState.view===b.dataset.gv)return;graphState.view=b.dataset.gv;route(true);});
  if(graphState.view==="circle"){wireHEB();return;}
  const cv=$("#gcv"); if(!cv||typeof d3==="undefined") return;
  const ac=new AbortController(), sig={signal:ac.signal};
  let raf=0; const req=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw();});};
  const t=T(), S=graphState, tip=$("#gtip");
  const full=graphData();
  const links=full.links.filter(l=>l.evs.length>=S.min);
  const nodes=S.min>1?[...new Set(links.flatMap(l=>[l.source,l.target]))]:full.nodes;
  const nb=new Map(nodes.map(n=>[n,new Map()]));links.forEach(l=>{nb.get(l.source).set(l.target,l);nb.get(l.target).set(l.source,l);});
  /* all colleagues, whatever the filter — counts always show the full picture */
  const allN=new Map(full.nodes.map(n=>[n,0]));full.links.forEach(l=>{allN.set(l.source,allN.get(l.source)+1);allN.set(l.target,allN.get(l.target)+1);});
  const colTxt=n=>t.gr_col_n(allN.get(n))+(S.min>1?` · ${t.gr_strong(nb.get(n).size)}`:"");
  const css=getComputedStyle(document.documentElement), C=k=>css.getPropertyValue(k).trim();
  const col={u:C("--brand-ink"),edge:C("--muted"),ink:C("--ink"),bg:C("--surface"),sel:C("--gb")};
  const dpr=window.devicePixelRatio||1; let W=0,H=0;
  const ctx=cv.getContext("2d");
  const size=()=>{W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;};
  size();
  const rBase=n=>2.2+Math.sqrt(nb.get(n).size)*0.45;
  const rOf=n=>rBase(n)/Math.pow(Math.max(1,tr.k),0.75); /* dots stay readable when zoomed in */
  const wPx=w=>w>=3?3.2:w===2?1.8:0.7;
  const sim=d3.forceSimulation(nodes)
    .force("link",d3.forceLink(links).distance(l=>l.evs.length>1?16:34).strength(l=>Math.min(1,0.05+0.25*(l.evs.length-1)+1/Math.min(nb.get(l.source).size,nb.get(l.target).size)*0.6)))
    .force("charge",d3.forceManyBody().strength(-22).distanceMax(240))
    .force("collide",d3.forceCollide(n=>rBase(n)+1))
    .force("x",d3.forceX(0).strength(0.04)).force("y",d3.forceY(0).strength(0.04))
    .alphaDecay(0.035);
  let tr=d3.zoomIdentity.translate(W/2,H/2).scale(0.6);
  let hover=null, focus=null; /* focus: {kind:"u",n} or {kind:"e",e,set} */
  const restore=()=>{if(!S.sel)return null;if(S.sel.kind==="u"){const n=nodes.find(x=>x.p===S.sel.ref);return n?{kind:"u",n}:null;}return evFocus(S.sel.ref);};
  function evFocus(e){const set=new Set(nodes.filter(n=>n.evs.includes(e)));return set.size?{kind:"e",e,set}:null;}
  focus=restore();
  const inFocus=n=>!focus||(focus.kind==="u"?(n===focus.n||nb.get(focus.n).has(n)):focus.set.has(n));
  const edgeOn=l=>!focus||(focus.kind==="u"?(l.source===focus.n||l.target===focus.n):(l.evs.includes(focus.e)&&focus.set.has(l.source)&&focus.set.has(l.target)));
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    ctx.translate(tr.x,tr.y);ctx.scale(tr.k,tr.k);
    // edges, grouped by width
    [1,2,3].forEach(w=>{
      ctx.lineWidth=wPx(w)/tr.k;ctx.strokeStyle=col.edge;
      ctx.globalAlpha=focus?0.06:(w===1?0.18:w===2?0.55:0.85);ctx.beginPath();
      links.forEach(l=>{const lw=Math.min(3,l.evs.length);if(lw!==w||(focus&&edgeOn(l)))return;ctx.moveTo(l.source.x,l.source.y);ctx.lineTo(l.target.x,l.target.y);});ctx.stroke();
      if(focus){ctx.globalAlpha=0.9;ctx.strokeStyle=col.ink;ctx.beginPath();links.forEach(l=>{if(Math.min(3,l.evs.length)!==w||!edgeOn(l))return;ctx.moveTo(l.source.x,l.source.y);ctx.lineTo(l.target.x,l.target.y);});ctx.stroke();}
    });
    nodes.forEach(n=>{const on=inFocus(n);ctx.globalAlpha=on?1:0.15;ctx.beginPath();ctx.arc(n.x,n.y,rOf(n),0,7);if(n.iu){ctx.fillStyle=col.u;ctx.fill();}else{ctx.fillStyle=col.bg;ctx.fill();ctx.lineWidth=1.4/tr.k;ctx.strokeStyle=col.u;ctx.stroke();}
      if((focus&&focus.kind==="u"&&n===focus.n)||n===hover){ctx.globalAlpha=1;ctx.lineWidth=2/tr.k;ctx.strokeStyle=col.sel;ctx.beginPath();ctx.arc(n.x,n.y,rOf(n)+2.5/tr.k,0,7);ctx.stroke();}});
    ctx.globalAlpha=1;ctx.textBaseline="middle";
    const lab=(n,txt,bold)=>{ctx.font=`${bold?700:600} ${(bold?13:11)/tr.k}px ${C("--f-body")}`;const x=n.x+rOf(n)+3/tr.k;ctx.lineWidth=3/tr.k;ctx.strokeStyle=col.bg;ctx.strokeText(txt,x,n.y);ctx.fillStyle=col.ink;ctx.fillText(txt,x,n.y);};
    const nm=n=>n.iu?`${iu5(n.iu)} ${n.p.sur}`:n.p.sur;
    if(focus){const list=focus.kind==="u"?[...nb.get(focus.n).keys()]:[...focus.set];if(list.length<=60||tr.k>=1.6)list.forEach(n=>lab(n,nm(n)));if(focus.kind==="u")lab(focus.n,nm(focus.n),true);}
    else if(tr.k>=2.4){nodes.forEach(n=>lab(n,nm(n)));}
  }
  let userMoved=false, fitted=false;
  const sel=d3.select(cv);
  const zoom=d3.zoom().scaleExtent([0.15,8]).on("zoom",ev=>{tr=ev.transform;if(ev.sourceEvent)userMoved=true;tip.hidden=true;req();}).on("start",()=>cv.classList.add("drag")).on("end",()=>cv.classList.remove("drag"));
  sel.call(zoom).call(zoom.transform,tr);
  const fitTo=(arr,dur)=>{if(!arr.length)return;const xs=arr.map(n=>n.x),ys=arr.map(n=>n.y);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const k=Math.min(3.2,0.86*Math.min(W/((x1-x0)||60),H/((y1-y0)||60)));const T0=d3.zoomIdentity.translate(W/2-k*(x0+x1)/2,H/2-k*(y0+y1)/2).scale(k);
    dur?sel.transition().duration(dur).call(zoom.transform,T0):sel.call(zoom.transform,T0);};
  const focusNodes=()=>!focus?nodes:focus.kind==="u"?[focus.n,...nb.get(focus.n).keys()]:[...focus.set];
  sim.on("tick",()=>{req();if(!fitted&&!userMoved&&sim.alpha()<0.08){fitted=true;fitTo(focusNodes(),600);}});
  const pick=ev=>{const [mx,my]=d3.pointer(ev,cv);const x=(mx-tr.x)/tr.k,y=(my-tr.y)/tr.k;let best=null,bd=Infinity;nodes.forEach(n=>{const d=Math.hypot(n.x-x,n.y-y);if(d<rOf(n)+6/tr.k&&d<bd){bd=d;best=n;}});return {n:best,mx,my};};
  const tipHtml=n=>{let s=`<b>${esc(netName(n))}</b><br>${t.gr_u_n(n.evs.length)} · ${colTxt(n)}`;
    if(focus&&focus.kind==="u"&&n!==focus.n&&nb.get(focus.n).has(n)){const l=nb.get(focus.n).get(n);s+=`<br>${t.gr_shared(l.evs.length)}: ${l.evs.map(e=>esc(evName(e))).join("; ")}`;}return s;};
  cv.addEventListener("pointermove",ev=>{const {n,mx,my}=pick(ev);if(n!==hover){hover=n;req();}
    if(n){tip.innerHTML=tipHtml(n);tip.hidden=false;tip.style.left=Math.min(Math.max(mx,140),W-140)+"px";tip.style.top=my+"px";}else tip.hidden=true;},sig);
  cv.addEventListener("pointerleave",()=>{hover=null;tip.hidden=true;req();},sig);
  const setFocus=f=>{focus=f;S.sel=!f?null:f.kind==="u"?{kind:"u",ref:f.n.p}:{kind:"e",ref:f.e};const ge=$("#gev");if(ge)ge.value=f&&f.kind==="e"?hebEvLabel(f.e):"";side();req();};
  cv.addEventListener("click",ev=>{const {n}=pick(ev);setFocus(n&&!(focus&&focus.kind==="u"&&focus.n===n)?{kind:"u",n}:null);},sig);
  function side(){
    const box=$("#gside");if(!box)return;
    if(!focus){box.innerHTML=`<p class="muted" style="margin:0">${t.gr_pick}</p>`;return;}
    if(focus.kind==="u"){const n=focus.n;const list=[...nb.get(n).entries()].sort((a,b)=>b[1].evs.length-a[1].evs.length||a[0].p.sur.localeCompare(b[0].p.sur));
      box.innerHTML=`<h3 style="margin:0">${esc(netName(n))}</h3>
      <p class="muted" style="font-size:13px;margin:4px 0 0">${t.gr_u_n(n.evs.length)} · ${colTxt(n)} · <a href="${href(n.p)}">${t.gr_open}</a></p>
      <p style="font-size:13px;margin:8px 0 0">${n.evs.slice().sort((a,b)=>b.s.localeCompare(a.s)).map(e=>`<a href="#e${e.i}">${esc(evName(e))}</a>`).join(" · ")}</p>
      ${S.min>1?`<h4 class="eyebrow" style="margin:14px 0 0">${t.gr_strong_h}</h4>`:""}<div class="gl">${list.map(([m,l])=>`<a href="#" data-gn="${m.id}"><span><span class="n">${esc(netName(m))}</span><span class="s">${l.evs.map(e=>esc(evName(e))).join(" · ")}</span></span><span class="w">${l.evs.length}</span></a>`).join("")}</div>`;}
    else{const list=[...focus.set].sort((a,b)=>a.p.sur.localeCompare(b.p.sur));
      box.innerHTML=`<h3 style="margin:0">${esc(evName(focus.e))}</h3><p class="muted" style="font-size:13px;margin:4px 0 0">${fmtRange(focus.e.s,focus.e.e)} · ${t.gr_ev_n(list.length)} · <a href="#e${focus.e.i}">${t.gr_open}</a></p>
      <div class="gl">${list.map(m=>`<a href="#" data-gn="${m.id}"><span class="n">${esc(netName(m))}</span></a>`).join("")}</div>`;}
    box.querySelectorAll("[data-gn]").forEach(a=>a.onclick=e=>{e.preventDefault();const m=nodes.find(x=>x.id===a.dataset.gn);setFocus({kind:"u",n:m});fitTo(focusNodes(),500);});
  }
  // search (curator 27.10.2026): name, IU or IR — people only; tournaments have their own field below
  const q=$("#gq"),res=$("#gres");let hits=[],hi=-1;
  const norm=s=>s.normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase();
  const evAll=[...new Set(nodes.flatMap(n=>n.evs))];
  const go=h=>{res.hidden=true;q.value="";setFocus({kind:"u",n:h.n});fitTo(focusNodes(),500);};
  const numS=n=>[n.iu,graphNum(n),n.p.isRef?n.p.ir:n.p.irNo].filter(Boolean).map(x=>iu5(x)).join(" ");
  q.oninput=()=>{const v=norm(q.value.trim());hi=-1;if(!v){res.hidden=true;return;}
    hits=nodes.filter(n=>numS(n).includes(v)||norm(fullName(n.p)).includes(v)||norm(n.p.sur+" "+n.p.first).includes(v)).slice(0,10).map(n=>({n}));
    res.hidden=false;res.innerHTML=hits.length?hits.map((h,i)=>`<button type="button" data-i="${i}"><span>${esc(netName(h.n))}</span></button>`).join(""):`<div class="muted" style="padding:10px 12px;font-size:14px">${t.gr_none}</div>`;
    res.querySelectorAll("button").forEach(b=>b.onclick=()=>go(hits[+b.dataset.i]));};
  q.onkeydown=e=>{const bs=[...res.querySelectorAll("button")];if(e.key==="Escape"){res.hidden=true;return;}if(!bs.length)return;
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();hi=(hi+(e.key==="ArrowDown"?1:-1)+bs.length)%bs.length;bs.forEach((b,i)=>b.classList.toggle("on",i===hi));}
    else if(e.key==="Enter"){e.preventDefault();go(hits[Math.max(hi,0)]);}};
  const m2=$("#gmin2"); if(m2) m2.onchange=()=>{S.min=m2.checked?2:1;wireGraph();};
  {const ge=$("#gev"), evS=hebEvents(full).filter(e=>evAll.includes(e));
    const setE=e=>{if(!e){if(focus&&focus.kind==="e")setFocus(null);return;}const f=evFocus(e);if(f){setFocus(f);fitTo(focusNodes(),500);}};
    if(ge) ge.oninput=()=>{const e=evS.find(x=>hebEvLabel(x)===ge.value);if(e)setE(e);else if(!ge.value.trim())setE(null);};
    const step=d=>{const cur=focus&&focus.kind==="e"?focus.e:null;const i=cur?evS.indexOf(cur):-1;const j=i<0?(d>0?0:evS.length-1):i+d;setE(j<0||j>=evS.length?null:evS[j]);};
    const pv=$("#gevprev"),nx=$("#gevnext"); if(pv)pv.onclick=()=>step(-1); if(nx)nx.onclick=()=>step(1);}
  $("#greset").onclick=()=>{if(graphState.whoSel!=="ump"||graphState.whoAll){graphState.whoSel="ump";graphState.whoAll=false;graphState.sel=null;route(true);return;}setFocus(null);fitTo(nodes,400);}; /* Reset all also returns to Umpires (curator 27.10.2026) */
  const ro=new ResizeObserver(()=>{if(!document.body.contains(cv)){ro.disconnect();return;}const w=cv.clientWidth,h=cv.clientHeight;if(w===W&&h===H)return;size();req();});ro.observe(cv);
  side();
  GRAPH={sim,ac,ro,sel,raf:()=>raf};
}

/* ---------- Curator inbox (editors only) ---------- */
const inboxState={show:"pending"};
let INBOX=[]; let inboxSub=null;
function viewInbox(){
  const t=T();
  if(!CAP.ready) return `<h1>${t.st_inbox}</h1><p class="muted">${t.st_loading}</p>`;
  if(!CAP.admin||!CAP.db) return `<h1>${t.st_inbox}</h1><div class="empty" style="margin-top:16px">${t.st_noadmin}</div>`;
  const list=INBOX.filter(x=>inboxState.show==="all"||x.status===inboxState.show).sort((a,b)=>b.at-a.at);
  const cnt=k=>INBOX.filter(x=>x.status===k).length;
  return `<h1>${t.st_inbox}</h1><p class="muted" style="margin:8px 0 0">${t.st_inbox_sub}</p>
  <div class="controls" style="margin-top:16px"><div class="chips">${["pending","accepted","rejected","all"].map(k=>`<button type="button" data-ibx="${k}" aria-pressed="${inboxState.show===k}">${t["st_"+k+"_p"]}${k==="all"?"":` · ${cnt(k)}`}</button>`).join("")}</div>
  <button class="btn" type="button" id="ibxRefresh">${t.st_refresh}</button></div>
  <div class="stack" style="margin-top:16px">${list.length?list.map(x=>{const e=EVENTS.find(v=>v.name===x.ev);const ok=!!e;
    const isP=x.kind==="claim"||x.kind==="add";
    const po=x.iu?BYIU.get(+x.iu):null;
    return `<div class="card ibx"><div class="ibh"><span class="badge bx">${x.kind==="claim"?t.claim:x.kind==="add"?t.add_umpire:x.kind==="loc"?(x.cc?t.c_up_title:t.loc_upload):t.loc_was}</span><span class="stt s-${x.status}">${t["st_"+x.status]}</span><span class="muted" style="font-size:12px;margin-left:auto">${new Date(x.at).toLocaleString(LANG==="ru"?"ru-RU":"en-GB")}</span></div>
    <h3 style="margin:10px 0 0">${isP?(po?`<a href="#u${po.iu}">${esc(fullName(po))}</a> <span class="code">IU ${String(po.iu).padStart(5,"0")}</span>`:esc(x.who||"—")):x.cc&&CBYCODE.get(x.cc)?`<a href="#${CBYCODE.get(x.cc).slug}">${esc(x.ev)}</a> <span class="code">${x.cc}</span>`:ok?`<a href="#e${e.i}">${esc(evName(e))}</a>`:esc(x.ev)}</h3>
    <dl class="kv" style="margin-top:8px">
      <dt>${t.st_from}</dt><dd data-prof="${esc(x.by)}">${t.st_someone}</dd>
      ${x.kind==="claim"?`<dt>${t.your_profile}</dt><dd>${esc(x.who||"")}</dd>`
      :x.kind==="add"?`<dt>${t.name_l}</dt><dd>${esc(x.who||"")}</dd><dt>${t.assoc}</dt><dd>${esc(x.cname||x.ccode||"")}</dd><dt>${t.cat_l}</dt><dd>${esc(x.cat||"")}</dd>`
      :x.kind==="was"?`<dt>${t.st_who}</dt><dd>${esc(x.who)}</dd><dt>${t.loc_role}</dt><dd>${esc(roleName(x.role))}</dd><dt>${t.st_dates}</dt><dd>${x.ds&&x.de?fmtRange(x.ds,x.de):"—"}</dd>`
      :`<dt>${t.loc_kind}</dt><dd>${esc(x.docType||"")}</dd><dt>${t.loc_file}</dt><dd>${(x.files||[]).map(f=>`<a href="${esc(f.url||"/_blob/"+f.id)}" target="_blank" rel="noopener">${esc(f.name)}</a>`).join("<br>")||"—"}</dd>`}
      ${x.note?`<dt>${t.loc_comment}</dt><dd>${esc(x.note)}</dd>`:""}
      ${x.email?`<dt>${t.email}</dt><dd>${esc(x.email)}</dd>`:""}
    </dl>
    ${x.status==="pending"?`<div class="row" style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn primary" type="button" data-acc="${x.path}">${x.kind==="was"?t.st_accept_was:t.st_accept_loc}</button><button class="btn" type="button" data-rej="${x.path}">${t.st_reject}</button></div>`:
      x.status!=="pending"?`<div style="margin-top:12px"><button class="btn" type="button" data-reopen="${x.path}">${t.st_reopen}</button></div>`:""}
  </div>`;}).join(""):`<div class="empty">${t.st_empty}</div>`}</div>`;
}
async function loadInbox(){
  if(!CAP.db||!CAP.admin) return;
  const markers=await CAP.db.collection("inbox").get();
  const all=[];
  for(const m of markers.docs){const s=await CAP.db.collection("inbox/"+m.id+"/items").get();s.docs.forEach(d=>all.push({id:d.id,path:"inbox/"+m.id+"/items/"+d.id,...d.data()}));}
  INBOX=all;
}
async function wireInbox(){
  if(!/^#inbox$/.test(location.hash)) return;
  if(CAP.admin&&CAP.db&&!inboxSub){inboxSub=CAP.db.collection("inbox").onSnapshot(async()=>{await loadInbox();route(true);},()=>{});}
  document.querySelectorAll("[data-ibx]").forEach(b=>b.onclick=()=>{inboxState.show=b.dataset.ibx;route(true);});
  const rf=$("#ibxRefresh");if(rf)rf.onclick=async()=>{await loadInbox();route(true);};
  const set=async(path,patch)=>{await CAP.db.doc(path).update({...patch,reviewedAt:Date.now(),reviewer:CAP.uid});await loadInbox();route(true);};
  document.querySelectorAll("[data-acc]").forEach(b=>b.onclick=async()=>{b.disabled=true;const x=INBOX.find(y=>y.path===b.dataset.acc);if(!x)return;
    try{if(x.kind==="was")await CAP.db.collection("approved").add({kind:"was",ei:x.ei,ev:x.ev,who:x.who,role:x.role,ds:x.ds,de:x.de,from:x.path,at:Date.now()});
      await set(x.path,{status:"accepted"});}catch(_){b.disabled=false;alert(T().st_fail);}});
  document.querySelectorAll("[data-rej]").forEach(b=>b.onclick=async()=>{b.disabled=true;try{await set(b.dataset.rej,{status:"rejected"});}catch(_){b.disabled=false;}});
  document.querySelectorAll("[data-reopen]").forEach(b=>b.onclick=async()=>{b.disabled=true;const x=INBOX.find(y=>y.path===b.dataset.reopen);
    try{const ap=APPROVED.filter(a=>a.from===x.path);for(const a of ap)await CAP.db.doc("approved/"+a.id).delete();await set(x.path,{status:"pending"});}catch(_){b.disabled=false;}});
  const ids=[...new Set([...document.querySelectorAll("[data-prof]")].map(d=>d.dataset.prof).filter(Boolean))];
  if(ids.length&&CAP.user&&CAP.user.profiles){try{const ps=await CAP.user.profiles(ids);document.querySelectorAll("[data-prof]").forEach(d=>{const p=ps[d.dataset.prof];if(p&&p.name)d.textContent=p.name;});}catch(_){}}
}

const evState={period:"up",type:"all",q:""};
function viewEvents(){
  const t=T();
  return `<h1>${t.ev_title}</h1><p class="muted" style="margin:8px 0 0">${t.ev_sub(EVENTS.length)}</p>
  <div class="controls" style="align-items:center">
    <div class="tabs" role="tablist">${["up","past","all"].map(p=>`<button type="button" role="tab" data-period="${p}" aria-selected="${evState.period===p}">${t["period_"+p]}</button>`).join("")}</div>
    <div class="chips">${["all","wtt","youth","para","ittf","cont","other"].map(k=>`<button type="button" data-etype="${k}" aria-pressed="${evState.type===k}">${t["type_"+k]}</button>`).join("")}</div>
    <input id="eq" type="search" placeholder="${t.ev_search}" value="${esc(evState.q)}" aria-label="${t.ev_search}">
  </div>
  <div id="evOut"></div>`;
}
function renderEvents(){
  const t=T(); const s=evState; const q=s.q.trim().toLowerCase();
  let list=EV_BY_DATE.filter(e=>(s.type==="all"||e.type===s.type)&&(s.period==="all"||(s.period==="up"?e.e>=TODAY:e.e<TODAY))&&(!q||e.name.toLowerCase().includes(q)));
  if(s.period==="past") list=list.slice().reverse();
  const groups=[]; let cur=null;
  list.forEach(e=>{const k=e.s.slice(0,7);if(!cur||cur.k!==k){cur={k,items:[]};groups.push(cur);}cur.items.push(e);});
  $("#evOut").innerHTML = list.length?groups.map(g=>{const [y,m]=g.k.split("-");return `<div class="month">${t.months_full[m-1]} ${y}</div><div class="evlist">${g.items.map(e=>`<a class="evrow" href="#e${e.i}"><span class="dt">${evStatus(e)==="now"?'<span class="live"></span>':""}${fmtRange(e.s,e.e)}</span><span class="nm">${esc(evName(e))} ${typeChip(e)}<small>${evStatus(e)==="now"?t.now+" · ":""}${t.countries_n(new Set(e.ump.map(u=>u.p.c?u.p.c.i:u.p.cname)).size)}</small></span><span class="cnt">${t.n_ump(e.ump.length)}${nRef(e)?"<br>"+t.n_ref(nRef(e)):""}</span></a>`).join("")}</div>`}).join(""):`<div class="empty" style="margin-top:20px">${t.ev_none}</div>`;
}
function viewEvent(e){
  const t=T();
  const order=["GB","BB","BBP","WB","NU","EV","UNK"];
  const urk=u=>({"TTR Match Official":1,"Racket Tester":2})[u.urole]||0; /* within each badge group: umpires, then TTR, then RCC (curator 29.10.2026) */
  const groups=order.map(lv=>({lv,items:e.ump.filter(u=>u.lv===lv).sort((a,b)=>urk(a)-urk(b)||a.p.sur.localeCompare(b.p.sur))})).filter(g=>g.items.length);
  const ctry=new Set(e.ump.map(u=>u.p.c?u.p.c.i:u.p.cname));
  const days=Math.round((Date.parse(e.e)-Date.parse(e.s))/864e5)+1;
  const evSrc=[...new Set(e.ump.concat(e.ref).filter(u=>u.src!=null).map(u=>u.src))];
  const own=u=>u.note==="nofinal"?` <span class="own" style="font-family:inherit;font-size:12px;font-style:italic" title="${t.venue.nofinal}">${t.not_final}</span>`:u.de&&(u.ds!==e.s||u.de!==e.e)?` <span class="own"${u.note==="known"?` title="${t.venue.known}"`:""}>${fmtRange(u.ds,u.de)}${u.note==="known"?"*":""}</span>`:"";
  const fnOf=u=>u.src!=null?evSrc.indexOf(u.src)+1:0;
  const allLocal=e.ump.concat(e.ref).length>0&&e.ump.concat(e.ref).every(u=>u.src!=null);
  const sup=fn=>fn?`<sup class="fn" title="${esc(SRC[evSrc[fn-1]][0])}">${fn}</sup>`:"";
  const pRow=(p,right,fn,extra="",mid)=>p?`<a class="p${mid!==undefined?" p3":""}" href="${href(p)}"><span>${esc(fullName(p))}${sup(fn)}${extra}</span>${mid!==undefined?`<span class="urole">${mid}</span>`:""}<span class="r">${right}</span></a>`:"";
  const hasUR=e.ump.some(u=>u.urole); /* role column only when some umpire has a special role */
  return `<div class="crumbs"><a href="#events">${t.crumbs_events}</a> / ${esc(evName(e))}</div>
  <div class="card">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${typeChip(e)}${evStatus(e)==="now"?`<span class="muted" style="font-size:13px"><span class="live"></span>${t.now}</span>`:""}</div>
    <h1 style="margin-top:10px">${esc(evName(e))}</h1>
    <div class="statrow"><div><b>${fmtRange(e.s,e.e)}</b>${t.days(days)}</div><div><b>${e.ump.length}</b>${t.umpires.toLowerCase()}</div><div><b>${nRef(e)}</b>${t.referees.toLowerCase()}</div>${nOff(e)?`<div><b>${nOff(e)}</b>${t.n_off_l(nOff(e))}</div>`:""}<div><b>${ctry.size}</b>${t.countries_n(ctry.size).replace(/^\d+\s/,"")}</div></div>
  </div>
  <div class="pgrid">
    <div class="card roster"><h3>${t.umpires}</h3>
      ${groups.length?groups.map(g=>`<div class="rgroup"><h4>${csvBadge(g.lv)}<span class="muted">${g.items.length}</span></h4><div class="plist">${g.items.map(u=>pRow(u.p,`${u.p.c?esc(u.p.c.name):esc(u.p.cname)} <span class="code">${u.p.c?u.p.c.code:(u.p.code||"")}</span>`,fnOf(u),own(u),hasUR?(u.urole?roleShort(u.urole):""):undefined)).join("")}</div></div>`).join(""):`<div class="empty">${t.t_none}</div>`}
      ${(()=>{const ap=APPROVED.filter(x=>evMatch(x,e)&&x.kind==="was");return ap.length?`<div class="rgroup"><h4><span class="badge bx">${t.st_users}</span><span class="muted">${ap.length}</span></h4><div class="plist">${ap.map(x=>`<div class="p"><span>${esc(x.who)} <span class="own">${x.ds&&x.de&&(x.ds!==e.s||x.de!==e.e)?fmtRange(x.ds,x.de):""}</span></span><span class="r">${esc(roleName(x.role))}</span></div>`).join("")}</div><p class="muted" style="font-size:12px;margin:6px 0 0">${t.st_users_note}</p></div>`:"";})()}
      ${(()=>{const my=MINE.filter(x=>evMatch(x,e));return my.length?`<div class="mysubs"><b>${t.st_mine}</b>${my.sort((a,b)=>b.at-a.at).map(x=>`<div>${x.kind==="loc"?t.loc_upload+(x.files&&x.files.length?" · "+x.files.map(f=>esc(f.name)).join(", "):""):t.loc_was+" · "+esc(x.who)} — <span class="stt s-${x.status}">${t["st_"+x.status]}</span></div>`).join("")}</div>`:"";})()}
      ${e.ump.some(u=>u.src!=null)||APPROVED.some(x=>evMatch(x,e)&&x.kind==="loc")?"":`<div class="locnote"><p>${t.loc_unknown}</p><div class="acts"><button type="button" class="btn" data-evact="loc" data-ei="${e.i}">${t.loc_upload}</button><button type="button" class="btn" data-evact="was" data-ei="${e.i}">${t.loc_was}</button></div></div>`}
      ${evSrc.length?`<div class="srcnote">${evSrc.map((k,i)=>`<div><sup class="fn">${i+1}</sup> ${t.src_local}: ${srcLink(k,`${esc(SRC[k][0])} — ${esc(SRC[k][1])}`)}</div>`).join("")}${allLocal?"":`<div class="muted">${t.src_rest}</div>`}</div>`:""}
    </div>
    <div class="stack">
      <div class="card"><h3>${nOff(e)?t.refs_off:t.referees}</h3>
        ${e.ref.length?`<div class="plist" style="margin-top:10px">${e.ref.slice().sort((a,b)=>(ROLE_IX.get(a.role)??99)-(ROLE_IX.get(b.role)??99)).map(r=>r.p?pRow(r.p,roleShort(r.role),fnOf(r),own(r)):`<div class="p"><span>${esc(r.name)}${sup(fnOf(r))}${own(r)}</span><span class="r">${roleShort(r.role)}</span></div>`).join("")}</div>`:`<div class="empty" style="margin-top:12px">—</div>`}
      </div>
      <div class="note">${allLocal?t.ev_src_local:t.ev_src}</div>
    </div>
  </div>`;
}

let CO_EV=[];
function closeCoPop(focusBtn){const p=document.querySelector(".copop");if(!p)return;const b=p.parentNode.querySelector(".cobtn");p.remove();if(b){b.setAttribute("aria-expanded","false");if(focusBtn)b.focus();}}
function wireCoPop(){
  const list=$("#coList"); if(!list) return;
  list.addEventListener("click",e=>{
    const b=e.target.closest(".cobtn"); if(!b) return;
    const open=b.getAttribute("aria-expanded")==="true"; closeCoPop();
    if(open) return;
    const t=T(), evs=CO_EV[+b.dataset.co]||[], row=b.parentNode;
    const p=document.createElement("div"); p.className="copop"; p.setAttribute("role","menu");
    p.innerHTML=`<h5>${t.co_with(esc(row.querySelector("a").textContent))}</h5>`+evs.map(ev=>`<a role="menuitem" href="#e${ev.i}"><span class="n">${esc(evName(ev))}</span><span class="d">${fmtRange(ev.s,ev.e)}</span></a>`).join("");
    row.appendChild(p); b.setAttribute("aria-expanded","true");
    let r=p.getBoundingClientRect(); if(r.left<8){p.style.right=(r.left-8)+"px";r=p.getBoundingClientRect();} if(r.bottom>innerHeight-8&&r.height<row.getBoundingClientRect().top-8){p.style.top="auto";p.style.bottom="calc(100% + 4px)";}
    const f=p.querySelector("a"); if(f&&e.detail===0) f.focus();
  });
}
document.addEventListener("click",e=>{if(!e.target.closest(".copop,.cobtn"))closeCoPop();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.querySelector(".copop"))closeCoPop(true);});
window.addEventListener("hashchange",()=>closeCoPop());
function olyYears(o){const ks=[o.isRef?o.iuR:o.x?o.iuX:o.iu,o.isRef&&o.o?o.o.iu:0].filter(Boolean).map(String);const ir=o.isRef?o.ir:o.irNo;if(ir)ks.push("r"+ir);if(o.x)ks.push("n:"+o.sur+"|"+o.first);
  const pick=M=>{for(const k of ks)if(M[k])return M[k];return [];};
  const y=[...pick(OLY).map(x=>[x[0],x[1],x[2],"og"]),...pick(PARA).map(x=>[x[0],x[1],x[2],"pg"])];return y.length?y:null;}
const GAMES_ROLE=ru=>({u:ru?"судья (Umpire)":"umpire",r:"Referee",d:"Deputy Referee",a:"Assistant Referee",td:"Technical Delegate",atd:"Assistant Technical Delegate",jc:"Jury Chair",jd:"Jury Deputy Chair",j:"Jury Member",rc:"Racket Control",nto:ru?"национальный технический персонал (NTO)":"National Technical Official (NTO)"});
const GAMES_SRC=ru=>({o:"Olympedia",c:ru?"куратор UMPIR.ES":"UMPIR.ES curator",s:ru?"данные судьи":"self-reported",p:ru?"список ITO ITTF (PDF, куратор UMPIR.ES)":"ITTF ITOs list (PDF, UMPIR.ES curator)",b:ru?"официальная книга результатов Игр (куратор UMPIR.ES)":"official Games results book (UMPIR.ES curator)"});
const GAMES_N=(g,ru)=>g==="pg"?(ru?"Паралимпийские игры":"Paralympic Games"):(ru?"Олимпийские игры":"Olympic Games");
function olyChip(o){const y=olyYears(o);if(!y)return "";const ru=LANG==="ru";const g={};y.forEach(([yr,r,,gm])=>(g[gm+"|"+r]=g[gm+"|"+r]||[]).push(yr));
  const src=[...new Set(y.map(x=>x[2]))].map(k=>GAMES_SRC(ru)[k]).join(", ");
  return Object.entries(g).map(([k,ys])=>{const [gm,r]=k.split("|");return `<span class="badge bi" title="${ru?"Источник":"Source"}: ${src}">${GAMES_N(gm,ru)}: ${GAMES_ROLE(ru)[r]} (${ys.sort().join(", ")})</span>`;}).join("");}
function viewProfile(o){
  const t=T();
  const ini=(o.first?o.first[0]:"")+o.sur[0];
  const c=o.c;
  const same=c?(o.x?c.list:c.list.filter(x=>x!==o)).slice().sort((a,b)=>b.lvl-a.lvl||a.sur.localeCompare(b.sur)):[];
  const step=(cls,dot,ti,s,extra="")=>`<li class="${cls}"><span class="dot ${dot}">${cls.includes("done")||cls.includes("cur")?"✓":""}</span><div><div class="t">${ti}</div><div class="s">${s}</div>${extra}</div></li>`;
  const req=a=>`<ul class="req">${a.map(x=>`<li>${x}</li>`).join("")}</ul>`;
  const iuN=o.isRef?(o.iuR||0):o.x?(o.iuX||0):o.iu;
  const yOf=n=>{const y=+String(n).padStart(5,"0").slice(0,2);return y<70?2000+y:1900+y;};
  const gbh=iuN?GBH.gbp[iuN]:null;
  const lvl=(o.x||o.isRef)?-1:o.lvl;
  const lv2=lvl>=0?lvl:gbh?2:(o.x?({WB:0,BB:1,GB:2})[o.csv]??-1:-1);
  const pastL=lvl<0; /* level known only from history / assignment, not from the current lists */
  const hist=gbh;
  const fm=k=>{const [y,m]=k.split("-");return `${(t.months_nom||t.months)[m-1]} ${y}`;};
  const histHtml=(hist&&(hist.length>1||hist[hist.length-1][1])?`<div class="s" style="margin-top:4px">${t.gb_hist}: ${hist.map(([a,b])=>b===a?fm(a):`${fm(a)} – ${b?fm(b):t.present}`).join(" · ")}</div>`:"")+(NOTES[iuN]?`<div class="note" style="margin-top:8px">${NOTES[iuN][LANG]}</div>`:"");
  const irN=o.isRef?o.ir:(o.irNo||0);
  const ru=LANG==="ru";
  const nodata=ru?"нет данных в загруженных списках":"not in the loaded lists";
  const sinceY=y=>ru?`с ${y} г.`:`since ${y}`;
  const og=olyYears(o)||[];
  const ogRole=r=>GAMES_ROLE(ru)[r];
  const ogSrc=k=>GAMES_SRC(ru)[k];
  const curK=irN?"ir":lv2;
  const ogSteps=og.slice().sort((a,b)=>a[0]-b[0]||(a[3]<b[3]?-1:1)).map(([y,r,k,gm])=>step("done og","",`${GAMES_N(gm,ru)} ${y}`,`${ogRole(r)} · ${ru?"источник":"source"}: ${ogSrc(k)}`));
  const ladder = !iuN?ogSteps.join(""):[
    step("done","",t.nat_umpire,t.nat_umpire_s),
    step(curK===0&&!pastL?"cur":"done",curK===0&&!pastL?"l0":"",lv2===0||lv2<0?(lv2<0?"International Umpire":t.iu_wb):"International Umpire",`IU <span class="num">${String(iuN).padStart(5,"0")}</span> · ${sinceY(yOf(iuN))}`),
    (o.ogp||o.arch)&&lv2<1?"":lv2>=1?step(curK===1&&!pastL?"cur":"done",curK===1&&!pastL?"l1":"","Blue Badge",bbDate(o,iuN)?t.since(fmtDate(bbDate(o,iuN))):t.no_date):step("next","","Blue Badge",lv2<0||pastL?nodata:t.next,lv2<0||pastL?"":req(t.bb_req)),
    (o.ogp||o.arch)&&lv2<2?"":lv2==2?step(curK===2&&!pastL?"cur":"done",curK===2&&!pastL?"l2":"","Gold Badge",pastL?(ru?"по истории списков Gold Badge":"from Gold Badge list history"):`${t.since(fmtGbSince(o.gb))}${o.are?` · ${esc(o.are)}`:""}`,histHtml):step("next","","Gold Badge",lv2<0||pastL?nodata:lv2==1?t.next:t.top,histHtml+(lv2==1&&!pastL?req(t.gb_req):"")),
    irN?step("cur","lr","International Referee",`IR <span class="num">${String(irN).padStart(5,"0")}</span> · ${sinceY(yOf(irN))}`):"",
    ...og.slice().sort((a,b)=>a[0]-b[0]||(a[3]<b[3]?-1:1)).map(([y,r,k,gm])=>step("done og","",`${GAMES_N(gm,ru)} ${y}`,`${ogRole(r)} · ${ru?"источник":"source"}: ${ogSrc(k)}`))
  ].join("");
  const asg=o.asg.slice().sort((a,b)=>b.e.s.localeCompare(a.e.s));
  const up=asg.filter(a=>a.e.e>=TODAY).reverse(), past=asg.filter(a=>a.e.e<TODAY);
  const asgRow=a=>`<a href="#e${a.e.i}"><span class="d">${evStatus(a.e)==="now"?'<span class="live"></span>':""}${a.note==="nofinal"?fmtRange(a.e.s,a.e.e):fmtRange(a.ds||a.e.s,a.de||a.e.e)}</span><span><span class="n">${esc(evName(a.e))}</span><span class="s">${a.role==="umpire"?`${a.urole||t.as_umpire} · ${t.lv[a.lv]||a.lv}`:a.role}${a.note?` · ${t.venue[a.note]||esc(a.note)}`:""}${a.src!=null?` · <span class="srcmark">${t.per_src(esc(SRC[a.src][0]))}</span>`:""}</span>${attended(o).clash.has(a.e)?`<span class="s clash">${t.clash(esc(evName(attended(o).clash.get(a.e))))}</span>`:""}</span></a>`;
  const co=new Map(); const addCo=(p,e)=>{if(!p||p===o)return;if(!co.has(p))co.set(p,new Set());co.get(p).add(e);};
  o.asg.forEach(a=>{a.e.ump.forEach(u=>addCo(u.p,a.e));a.e.ref.forEach(r=>addCo(r.p,a.e));});
  const coTop=[...co.entries()].map(([p,s])=>[p,s.size,[...s].sort((a,b)=>b.s.localeCompare(a.s)||b.e.localeCompare(a.e))]).sort((a,b)=>b[1]-a[1]||a[0].sur.localeCompare(b[0].sur));
  CO_EV=coTop.map(x=>x[2]);
  const yr=TODAY.slice(0,4); const nYr=o.asg.filter(a=>a.e.s.startsWith(yr)).length;
  const headBadge=(o.isRef?irBadge(o.st):o.x?(o.csv?csvBadge(o.csv):(o.arch||o.ogp||o.ogo)&&!iuStatus(o)?`<span class="badge bx">TBA</span>`:""):badge(o.lvl)+bbpMark(o)+(o.irNo?irBadge(o.irSt):""))+roleChips(o);
  const num=(k,n)=>`<span class="idn">${k} <span class="num">${String(n).padStart(5,"0")}</span></span>`;
  const ids=o.isRef?`<span class="idn">${num("IR",o.ir)}${o.iuR?` · ${iuChip(o)}`:""}</span>`:`<span class="idn">${iuChip(o)}${o.irNo?` · ${num("IR",o.irNo)}`:""}</span>`;
  const meta=`${ids}${headBadge}${o.x&&!o.iuX&&!o.ogo?`<span>${t.not_listed}</span>`:""}${o.aka?`<span>${LANG==="ru"?"в списках ITTF":"in ITTF lists"}: ${esc(o.aka)}</span>`:""}<span class="ctry">${c?`<a href="#${c.slug}">${esc(c.name)}</a><span class="code">${c.code}</span>`:`<span>${esc(o.cname||XNAME[o.code]||"")}</span><span class="code">${o.code||""}</span>`}${contChip(contOf(o))}</span>`;
  const src=[o.act?t.src_active:"",lvl==1?t.src_bb:"",lvl==2?t.src_gb:"",o.asg.some(a=>a.src==null)?t.src_ev:"",...[...new Set(o.asg.filter(a=>a.src!=null).map(a=>a.src))].map(k=>srcLink(k,`${esc(SRC[k][0])}: ${esc(SRC[k][1])}`)),(o.isRef||o.irNo)?t.src_ir:"",(o.evl||o.mnt)?t.src_trn:"",olyYears(o)?[olyYears(o).some(x=>x[2]==="o")?`<a href="https://www.olympedia.org" target="_blank" rel="noopener">Olympedia</a>${LANG==="ru"?" (Олимпийские игры)":" (Olympic Games)"}`:"",olyYears(o).some(x=>x[2]==="c")?(LANG==="ru"?"куратор UMPIR.ES (Олимпийские игры)":"UMPIR.ES curator (Olympic Games)"):"",olyYears(o).some(x=>x[2]==="b")?(LANG==="ru"?`официальные книги результатов ОИ (${[...new Set(olyYears(o).filter(x=>x[2]==="b").map(x=>({2000:"Сидней 2000",2004:"Афины 2004",2008:"Пекин 2008",2012:"Лондон 2012",2020:"Токио 2020"})[x[0]]))].join(", ")}), предоставленные куратором UMPIR.ES`:`official Olympic results books (${[...new Set(olyYears(o).filter(x=>x[2]==="b").map(x=>({2000:"Sydney 2000",2004:"Athens 2004",2008:"Beijing 2008",2012:"London 2012",2020:"Tokyo 2020"})[x[0]]))].join(", ")}) provided by the UMPIR.ES curator`):"",olyYears(o).some(x=>x[2]==="p")?(LANG==="ru"?"списки ITO ITTF (Rio 2016, Paris 2024), предоставленные куратором UMPIR.ES":"ITTF ITOs lists (Rio 2016, Paris 2024) provided by the UMPIR.ES curator"):""].filter(Boolean).join("; "):""].filter(Boolean).join("; ");
  return `<div class="crumbs"><a href="${o.isRef?"#referees":"#umpires"}">${o.isRef?t.nav_refs:t.nav_umpires}</a>${c?` / <a href="#${c.slug}">${esc(c.name)}</a>`:""}</div>
  <div class="card"><div class="phead">
    <div class="avatar l${lvl<0?0:lvl}" aria-hidden="true">${esc(ini)}</div>
    <div style="min-width:0">
      <h1>${esc(o.first)} ${esc(o.sur)}</h1>
      <div class="meta">${meta}</div>
    </div>
    <div class="act"><button class="btn primary" type="button" data-claim="${(o.x||o.isRef)?"":o.iu}">${t.claim}</button></div>
  </div>${o.x?`<div class="note">${o.ogo?(LANG==="ru"?"Официальное лицо Олимпийских игр по официальной книге результатов (жюри, технический делегат или национальный технический персонал). В загруженных реестрах IU не найден; категория пока неизвестна (TBA).":"Olympic Games official from the official results book (jury, technical delegate or national technical official). Not found in the loaded IU registers; category to be announced (TBA)."):o.ogp?(LANG==="ru"?"Профиль создан по данным об участии в Олимпийских или Паралимпийских играх. В списке активных IU на 01.01.2026 этого судьи нет; номер IU найден в реестре ITTF (01.11.2022) или в списке активных 2025 года. В карьерной лестнице — только то, что известно точно.":"Profile created from Olympic or Paralympic Games data. This umpire is not in the active IU list of 1 Jan 2026; the IU number was found in the ITTF register (1 Nov 2022) or the 2025 active list. The career ladder shows only what is known for certain."):o.arch?(LANG==="ru"?"Официальное лицо Олимпийских игр по официальной книге результатов. В загруженных реестрах ITTF номер IU не найден; в базе — как архивный IU (решение куратора 25.10.2026).":"Olympic Games official, from the official results book. No IU number found in the loaded ITTF registers; kept as an archived IU (curator decision, 25 Oct 2026)."):o.iuX?t.extra_note_iu:t.extra_note}</div>`:""}</div>
  <div class="pgrid">
    <div class="stack">
      <div class="card"><h3>${t.tournaments}</h3>
        ${asg.length?`<p class="muted" style="font-size:13px;margin:6px 0 4px">${t.t_count(nYr,yr)}</p>
          ${up.length?`<div class="rgroup"><h4 class="eyebrow">${t.upcoming_s}</h4><div class="mini">${up.map(asgRow).join("")}</div></div>`:""}
          ${past.length?`<div class="rgroup"><h4 class="eyebrow">${t.past_s}</h4><div class="mini">${past.map(asgRow).join("")}</div></div>`:""}`
        :`<div class="empty" style="margin-top:14px"><b>${t.t_none}</b>${t.t_none_t}</div>`}
      </div>
      ${ladder?`<div class="card"><h3>${t.career}</h3><ol class="ladder">${ladder}</ol></div>`:""}
      <div class="card"><h3>${t.about}</h3>
        <dl class="kv"><dt>${t.sex}</dt><dd>${o.sex==="F"?t.female:o.sex==="M"?t.male:"—"}</dd><dt>${t.city}</dt><dd class="muted">${t.not_set}</dd><dt>${t.player}</dt><dd class="muted">${t.not_set}</dd><dt>${t.uniform}</dt><dd class="muted">${t.not_set_f}</dd><dt>${t.match}</dt><dd class="muted">${t.not_set}</dd></dl>
        <div class="empty" style="margin-top:16px"><b>${t.prof_empty}</b>${t.prof_empty_t}</div>
      </div>
    </div>
    <div class="stack">
      ${coTop.length?`<div class="card"><h3>${t.often}</h3><p class="muted" style="font-size:13px;margin:6px 0 10px">${t.often_sub(coTop.length)}</p><div class="colleagues" id="coList">${coTop.map(([p,n],i)=>`<div class="corow"${i>=10?" hidden":""}><a href="${href(p)}">${esc(fullName(p))}</a><button type="button" class="cobtn" data-co="${i}" aria-haspopup="true" aria-expanded="false">${t.often_t(n)}</button></div>`).join("")}</div>${coTop.length>10?`<button class="btn" type="button" id="coMore" style="margin-top:10px">${t.more(coTop.length-10)}</button>`:""}</div>`:""}
      ${c?`<div class="card"><h3>${t.colleagues(esc(c.name))}</h3><p class="muted" style="font-size:13px;margin:6px 0 10px">${t.colleagues_n(same.length)}</p>
        <div class="colleagues">${same.slice(0,14).map(x=>`<a href="#u${x.iu}"><span>${esc(x.first)} ${esc(x.sur)}</span>${x.lvl?badge(x.lvl):""}</a>`).join("")}</div>
        ${same.length>14?`<a href="#${c.slug}" class="muted" style="display:block;margin-top:10px;font-size:14px">${t.all_n(same.length)}</a>`:""}
      </div>`:""}
    </div>
  </div>
  <div class="src">${t.sources}: ${src}. ${t.proto}</div>`;
}

function viewReferees(){
  const t=T(); const rows=REFS.slice().sort((a,b)=>a.sur.localeCompare(b.sur));
  return `<h1>${t.nav_refs}</h1><p class="muted" style="margin:8px 0 18px">${t.refs_sub(REFS.length,REFS.filter(r=>r.o).length)}</p>
  <div class="tbl"><table><thead><tr><th>IR</th><th>${t.th_ref}</th><th>${t.ir_status}</th><th>${t.assoc}</th><th>${t.also_umpire}</th><th>${t.tournaments}</th></tr></thead><tbody>
  ${rows.map(r=>{const p=r.o||r;const n=p.asg.filter(a=>isRefRole(a.role)).length;return `<tr data-go="${href(p).slice(1)}"><td class="num">${String(r.ir).padStart(5,"0")}</td><td><a href="${href(p)}">${esc(r.sur)}</a> ${esc(r.first)}</td><td>${irBadge(r.st)} ${roleChips(r.o||r)}</td><td>${r.c?esc(r.c.name):"Uruguay"} <span class="code">${r.code}</span> ${contChip(contOf(r))}</td><td>${r.o?badge(r.o.lvl):""}</td><td class="num">${n||""}</td></tr>`}).join("")}
  </tbody></table></div>`;
}

/* names for Olympic/Paralympic keys that have no profile (from the IU register 2022 / list 2025) */
/* ---------- Olympics: officials at the Olympic and Paralympic Games ---------- */
function olyProf(k){
  if(k.startsWith("n:")) return EXTRA.find(x=>"n:"+x.sur+"|"+x.first===k)||null;
  const fromRef=r=>r?(r.o||r):null;
  if(k[0]==="r") return fromRef(REFS.find(x=>"r"+x.ir===k));
  const n=+k; return BYIU.get(n)||EXTRA.find(x=>x.iuX===n)||fromRef(REFS.find(x=>x.iuR===n||(x.o&&x.o.iu===n)))||null;
}
let OLY_ROWS=null;
function olyRows(){
  if(OLY_ROWS) return OLY_ROWS;
  const seen=new Set(), rows=[];
  for(const k of new Set(Object.keys(OLY).concat(Object.keys(PARA)))){
    const p=olyProf(k);
    if(p){ if(seen.has(p)) continue; seen.add(p);
      const part=olyYears(p)||[]; if(!part.length) continue;
      rows.push({sur:p.sur,first:p.first||"",code:(p.c&&p.c.code)||p.code||"",cname:p.c?p.c.name:(p.cname||""),go:href(p),iu:p.isRef?(p.iuR||0):p.x?(p.iuX||0):p.iu,part});
    } else { const nm=OLY_NAMES[k]||[k,"",""];
      const part=[...(OLY[k]||[]).map(x=>[x[0],x[1],x[2],"og"]),...(PARA[k]||[]).map(x=>[x[0],x[1],x[2],"pg"])];
      rows.push({sur:nm[0],first:nm[1],code:nm[2],cname:(COUNTRIES.find(c=>c.code&&c.code===nm[2])||{}).name||nm[3]||"",go:null,iu:/^\d+$/.test(k)?+k:0,part});
    }
  }
  rows.forEach(r=>{r.part.sort((a,b)=>a[0]-b[0]||(a[3]<b[3]?-1:1));r.n=new Set(r.part.map(x=>x[3]+x[0])).size;r.key=(r.sur+" "+r.first+" "+r.first+" "+r.sur+" "+(r.iu?String(r.iu).padStart(5,"0"):"")).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();});
  return OLY_ROWS=rows;
}
const OLY_STATE={q:"",g:"",r:"",sort:"name"};
const OLY_ROLE_ORDER=["u","r","d","a","td","atd","jc","jd","j","rc","nto"];
function viewOlympics(){
  const ru=LANG==="ru", rows=olyRows(), R=GAMES_ROLE(ru);
  const games=new Map(), roles=new Map();
  rows.forEach(p=>p.part.forEach(([y,r,,gm])=>{const g=gm+"|"+y;games.set(g,(games.get(g)||0)+1);roles.set(r,(roles.get(r)||0)+1);}));
  const gl=(g)=>{const [gm,y]=g.split("|");return `${gm==="pg"?(ru?"Паралимпийские игры":"Paralympic Games"):(ru?"Олимпийские игры":"Olympic Games")} ${y}`;};
  const gKeys=[...games.keys()].sort((a,b)=>a.split("|")[0]<b.split("|")[0]?-1:a.split("|")[0]>b.split("|")[0]?1:b.split("|")[1]-a.split("|")[1]);
  const opt=(v,l,cur)=>`<option value="${v}"${v===cur?" selected":""}>${l}</option>`;
  return `<h1>${ru?"Олимпиады":"Olympics"}</h1>
  <p class="muted" style="margin:8px 0 6px;max-width:72ch">${ru?`Официальные лица ITTF и национальный технический персонал на Олимпийских и Паралимпийских играх: судьи, рефери, жюри, технические делегаты. ${rows.length} человек.`:`ITTF officials and national technical officials at the Olympic and Paralympic Games: umpires, referees, jury, technical delegates. ${rows.length} people.`}</p>
  <p class="muted" style="font-size:13px;margin:0 0 4px">${ru?"Источники: официальные книги результатов ОИ 2000–2020, Olympedia, списки ITO ITTF (Rio 2016, Paris 2024), данные куратора.":"Sources: official Olympic results books 2000–2020, Olympedia, ITTF ITOs lists (Rio 2016, Paris 2024), curator data."}</p>
  <div class="controls">
    <input id="olyQ" type="search" placeholder="${ru?"Фамилия, имя или номер IU":"Surname, first name or IU number"}" aria-label="${ru?"Поиск по имени":"Search by name"}" value="${esc(OLY_STATE.q)}">
    <select id="olyG" aria-label="${ru?"Игры":"Games"}">${opt("",ru?"Все Игры":"All Games",OLY_STATE.g)}<optgroup label="${ru?"Олимпийские игры":"Olympic Games"}">${gKeys.filter(g=>g[0]==="o").map(g=>opt(g,`${g.split("|")[1]} (${games.get(g)})`,OLY_STATE.g)).join("")}</optgroup><optgroup label="${ru?"Паралимпийские игры":"Paralympic Games"}">${gKeys.filter(g=>g[0]==="p").map(g=>opt(g,`${g.split("|")[1]} (${games.get(g)})`,OLY_STATE.g)).join("")}</optgroup></select>
    <select id="olyR" aria-label="${ru?"Роль":"Role"}">${opt("",ru?"Все роли":"All roles",OLY_STATE.r)}${OLY_ROLE_ORDER.filter(r=>roles.has(r)).map(r=>opt(r,`${R[r]} (${roles.get(r)})`,OLY_STATE.r)).join("")}</select>
    <select id="olyS" aria-label="${ru?"Сортировка":"Sort"}">${opt("name",ru?"По фамилии":"By surname",OLY_STATE.sort)}${opt("games",ru?"Больше всего Игр":"Most Games",OLY_STATE.sort)}${opt("first",ru?"По году первых Игр":"By first Games",OLY_STATE.sort)}</select>
  </div>
  <p class="muted" id="olyN" style="font-size:13px;margin:0 0 10px"></p>
  <div class="tbl"><table><thead><tr><th>${ru?"Официальное лицо":"Official"}</th><th>${ru?"Ассоциация":"Association"}</th><th>${ru?"Игры и роль":"Games and role"}</th></tr></thead><tbody id="olyRows"></tbody></table></div>
  <p class="muted" style="font-size:12px;margin-top:12px">${ru?"Имя без ссылки — профиля на сайте пока нет (нет в списках ITTF 2026 и в списке IR). Затемнённые записи не подходят под выбранный фильтр.":"A name without a link has no profile yet (not in the 2026 ITTF lists or the IR list). Dimmed entries do not match the current filter."}</p>`;
}
function renderOlyRows(){
  const ru=LANG==="ru", R=GAMES_ROLE(ru), S=OLY_STATE;
  const q=S.q.trim().normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
  const match=x=>(!S.g||x[3]+"|"+x[0]===S.g)&&(!S.r||x[1]===S.r);
  let rows=olyRows().filter(p=>(!q||q.split(/\s+/).every(w=>p.key.includes(w)))&&p.part.some(match));
  rows.sort(S.sort==="games"?(a,b)=>b.n-a.n||a.sur.localeCompare(b.sur):S.sort==="first"?(a,b)=>a.part[0][0]-b.part[0][0]||a.sur.localeCompare(b.sur):(a,b)=>a.sur.localeCompare(b.sur)||a.first.localeCompare(b.first));
  const parts=rows.reduce((s,p)=>s+p.part.filter(match).length,0);
  $("#olyN").textContent=ru?`Найдено: ${rows.length} ${plural(rows.length,"человек","человека","человек")}, ${parts} ${plural(parts,"участие","участия","участий")}`:`Found: ${rows.length} ${rows.length===1?"person":"people"}, ${parts} ${parts===1?"appointment":"appointments"}`;
  const chip=x=>{const on=match(x);return `<span class="ogc${on?"":" off"}" title="${esc(GAMES_SRC(ru)[x[2]]||"")}"><b>${x[3]==="pg"?(ru?"ПИ":"PG"):(ru?"ОИ":"OG")} ${x[0]}</b> ${esc(R[x[1]]||x[1])}</span>`;};
  $("#olyRows").innerHTML=rows.length?rows.map(p=>`<tr${p.go?` data-go="${p.go.slice(1)}"`:` class="nolink"`}><td>${p.go?`<a href="${p.go}">${esc(p.sur)}</a>`:`<span>${esc(p.sur)}</span>`} ${esc(p.first)}${p.iu?` <span class="num muted" style="font-size:12px">${String(p.iu).padStart(5,"0")}</span>`:""}</td><td>${p.cname?esc(p.cname)+" ":""}${p.code?`<span class="code">${esc(p.code)}</span>`:""}</td><td class="ogcell">${p.part.map(chip).join("")}</td></tr>`).join(""):`<tr class="nolink"><td colspan="3" class="muted">${ru?"Под эти фильтры никого нет.":"Nobody matches these filters."}</td></tr>`;
}
function wireOly(){
  if(!$("#olyRows")) return;
  const S=OLY_STATE;
  $("#olyQ").addEventListener("input",e=>{S.q=e.target.value;renderOlyRows();});
  [["#olyG","g"],["#olyR","r"],["#olyS","sort"]].forEach(([id,k])=>$(id).addEventListener("change",e=>{S[k]=e.target.value;renderOlyRows();}));
  renderOlyRows();
}

/* ---------- modal ---------- */
function openModal(kind,iu,cc){
  const t=T(); const o=iu?BYIU.get(+iu):null; const isClaim=kind==="claim";
  $("#modalRoot").innerHTML=`<div class="scrim" id="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
    <h2 id="mt">${isClaim?t.claim:t.add_umpire}</h2>
    <p class="muted" style="margin:8px 0 0;font-size:14px">${isClaim?t.claim_sub:t.add_sub}</p>
    <form id="mf">
      ${isClaim?`<label for="m_iu">${t.your_profile}</label><input id="m_iu" value="${o?esc(fullName(o))+" · IU "+String(o.iu).padStart(5,"0"):""}" placeholder="${t.ph_profile}" required>`:`<label for="m_name">${t.name_l}</label><input id="m_name" required><label for="m_c">${t.assoc}</label><select id="m_c">${COUNTRIES.slice().sort(byName).map(c=>`<option${cc&&c.code===cc?" selected":""}>${esc(c.name)}</option>`).join("")}</select><label for="m_cat">${t.cat_l}</label><select id="m_cat"><option>${t.nat_cat}</option><option>National Umpire (NU)</option><option>International Umpire</option></select>`}
      <label for="m_mail">${t.email}</label><input id="m_mail" type="email" required placeholder="name@example.com">
      <div id="mok"></div>
      <div class="row"><button class="btn" type="button" id="mclose">${t.close}</button><button class="btn primary" type="submit">${t.send}</button></div>
    </form></div></div>`;
  $("#mclose").onclick=closeModal;
  $("#scrim").onclick=e=>{if(e.target.id==="scrim")closeModal();};
  $("#mf").onsubmit=async e=>{
    e.preventDefault();
    const btn=$("#mf").querySelector('button[type="submit"]');
    btn.disabled=true;
    $("#mok").innerHTML=`<div class="ok">${t.st_saving}</div>`;
    const sub=isClaim
      ? {kind:"claim",iu:o?o.iu:null,who:$("#m_iu").value.trim(),email:$("#m_mail").value.trim()}
      : (()=>{const cn=$("#m_c").value,c=COUNTRIES.find(x=>x.name===cn);
          return {kind:"add",who:$("#m_name").value.trim(),cname:cn,ccode:c?c.code:"",cat:$("#m_cat").value,email:$("#m_mail").value.trim()};})();
    try{
      await saveSubmission(sub,[]);
      $("#mok").innerHTML=`<div class="ok">${subT().ok}</div>`;
      btn.remove();
    }catch(err){
      btn.disabled=false;
      if(err&&err.code==="no_store"&&typeof SB!=="undefined"&&SB){
        $("#mok").innerHTML=`<div class="ok">${t.st_nostore}<div style="margin-top:10px"><button class="btn" type="button" id="mSignin">${authT().in}</button></div></div>`;
        $("#mSignin").onclick=()=>openAuthModal();
      }else $("#mok").innerHTML=`<div class="ok">${subErr(t,err)}</div>`;
    }
  };
}
const SUB_T={ru:{ok:"Отправлено куратору на проверку. Он свяжется с вами по указанному адресу, если понадобятся уточнения."},
             en:{ok:"Sent to the curator for review. They will write to the address you gave if anything needs clarifying."}};
const subT=()=>SUB_T[LANG]||SUB_T.en;
/* ---------- Contributions store (Supabase) ----------
   submissions            one row per submission: uid (author), status, at, data (jsonb)
   approved               accepted "I worked here" entries, readable by everyone
   editors                uids allowed to review submissions (the curators)
   profiles               uid -> display name
   storage bucket uploads private files attached to submissions
   The shim below keeps the small document API the rest of the page already uses,
   so views and handlers stay unchanged. Keys live in config.js. */
const CAP={db:null,user:null,assets:null,uid:null,admin:false,ready:false};
let APPROVED=[], MINE=[];
let SB=null;
const SBCFG=window.SUPABASE_CONFIG||{};
const BUCKET="uploads";
const liveRoute=()=>{const h=(location.hash||"").slice(1);return /^e\d+$/.test(h)||h==="inbox";};
const refresh=()=>{if(liveRoute())route(true);};

const toDoc=r=>Object.assign({},r.data||{},{id:r.id,status:r.status,at:Number(r.at)||0,by:r.uid,reviewedAt:r.reviewed_at?Number(r.reviewed_at):undefined,reviewer:r.reviewer||undefined});
const toAppr=r=>Object.assign({},r.data||{},{id:r.id,at:Number(r.at)||0,from:r.from_path||undefined});
const asSnap=list=>({docs:list.map(x=>({id:x.id,data(){const c=Object.assign({},x);delete c.id;return c;}}))});
const dbFail=e=>({code:/row-level|permission|denied|42501/i.test(String((e&&(e.code||e.message))||""))?"invalid_argument":"fail"});
const idSnap=ids=>({docs:ids.map(id=>({id,data:()=>({})}))});

/* initial load + realtime; returns an unsubscribe function */
function supaLive(key,table,load){
  let stop=false;
  const run=()=>{if(!stop)Promise.resolve(load()).catch(()=>{});};
  run();
  const ch=SB.channel("rt-"+key).on("postgres_changes",{event:"*",schema:"public",table},run).subscribe();
  return ()=>{stop=true;try{SB.removeChannel(ch);}catch(_){}};
}

function supaDb(){
  const mine=async uid=>{const {data,error}=await SB.from("submissions").select("*").eq("uid",uid).order("at",{ascending:false});if(error)throw error;return (data||[]).map(toDoc);};
  const all=async()=>{const {data,error}=await SB.from("approved").select("*");if(error)throw error;return (data||[]).map(toAppr);};
  const uids=async()=>{const {data,error}=await SB.from("submissions").select("uid");if(error)throw error;return [...new Set((data||[]).map(r=>r.uid))];};
  return {
    collection(path){
      if(path==="approved") return {
        async get(){return asSnap(await all());},
        async add(doc){const {error}=await SB.from("approved").insert({at:doc.at||Date.now(),from_path:doc.from||null,data:doc});if(error)throw dbFail(error);},
        onSnapshot(cb,err){return supaLive("approved","approved",async()=>{try{cb(asSnap(await all()));}catch(e){if(err)err(e);}});}
      };
      if(path==="inbox") return {
        async get(){return idSnap(await uids());},
        onSnapshot(cb,err){return supaLive("inbox","submissions",async()=>{try{cb(idSnap(await uids()));}catch(e){if(err)err(e);}});}
      };
      const mi=/^inbox\/([^/]+)\/items$/.exec(path);
      if(mi){const uid=mi[1];return {
        async get(){return asSnap(await mine(uid));},
        async add(doc){const {error}=await SB.from("submissions").insert({uid,status:doc.status||"pending",at:doc.at||Date.now(),data:doc});if(error)throw dbFail(error);},
        onSnapshot(cb,err){return supaLive("items-"+uid,"submissions",async()=>{try{cb(asSnap(await mine(uid)));}catch(e){if(err)err(e);}});}
      };}
      return {async get(){return asSnap([]);},async add(){throw {code:"fail"};},onSnapshot(){return ()=>{};}};
    },
    doc(path){
      const md=/^inbox\/[^/]+\/items\/([^/]+)$/.exec(path);
      const ma=/^approved\/([^/]+)$/.exec(path);
      return {
        async set(){/* submitter markers are derived from submissions */},
        async update(patch){
          if(!md) return;
          const row={}, rest={};
          for(const k in patch){
            if(k==="status") row.status=patch[k];
            else if(k==="reviewedAt") row.reviewed_at=patch[k];
            else if(k==="reviewer") row.reviewer=patch[k]||null;
            else rest[k]=patch[k];
          }
          if(Object.keys(rest).length){const {data}=await SB.from("submissions").select("data").eq("id",md[1]).single();row.data=Object.assign({},(data&&data.data)||{},rest);}
          const {error}=await SB.from("submissions").update(row).eq("id",md[1]);if(error)throw dbFail(error);
        },
        async delete(){if(!ma)return;const {error}=await SB.from("approved").delete().eq("id",ma[1]);if(error)throw dbFail(error);}
      };
    }
  };
}

function supaUser(){
  return {
    async id(){const {data}=await SB.auth.getUser();return data&&data.user?data.user.id:null;},
    async canEdit(){const {data}=await SB.auth.getUser();const u=data&&data.user;if(!u)return false;const r=await SB.from("editors").select("uid").eq("uid",u.id).maybeSingle();return !!(r&&r.data);},
    async profiles(ids){const out={};if(!ids||!ids.length)return out;const {data}=await SB.from("profiles").select("uid,name").in("uid",ids);(data||[]).forEach(p=>{out[p.uid]={name:p.name};});return out;}
  };
}

function supaAssets(){
  return {async upload(file,opt){
    const type=(opt&&opt.type)||file.type;
    const safe=(file.name||"file").replace(/[^\w.\-]+/g,"_").slice(-80);
    const path=(CAP.uid||"anon")+"/"+Date.now()+"-"+safe;
    const {error}=await SB.storage.from(BUCKET).upload(path,file,{contentType:type,upsert:false});
    if(error) throw {code:"no_assets"};
    let url="";
    try{const sg=await SB.storage.from(BUCKET).createSignedUrl(path,60*60*24*365);if(sg&&sg.data)url=sg.data.signedUrl;}catch(_){}
    return {id:path,url,contentType:type,sizeBytes:file.size};
  }};
}

/* ---------- sign in (magic link) ---------- */
const AUTH_T={
  ru:{in:"Войти",out:"Выйти",title:"Вход для судей",sub:"Введите email — пришлём ссылку для входа. Пароль не нужен.",send:"Прислать ссылку",sent:"Письмо отправлено. Откройте ссылку из письма на этом же устройстве.",fail:"Не удалось отправить письмо. Проверьте адрес и попробуйте ещё раз."},
  en:{in:"Sign in",out:"Sign out",title:"Sign in",sub:"Enter your email and we’ll send you a sign-in link. No password needed.",send:"Send the link",sent:"Email sent. Open the link from the message on this device.",fail:"Could not send the email. Check the address and try again."}
};
const authT=()=>AUTH_T[LANG]||AUTH_T.en;
function authBtn(){
  const b=document.getElementById("authBtn");if(!b)return;
  if(!SB){b.hidden=true;return;}
  b.hidden=false;
  b.textContent=CAP.uid?authT().out:authT().in;
  b.onclick=async()=>{if(CAP.uid){b.disabled=true;try{await SB.auth.signOut();}catch(_){}b.disabled=false;}else openAuthModal();};
}
function openAuthModal(){
  const a=authT(), t=T();
  $("#modalRoot").innerHTML=`<div class="scrim" id="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="amt">
    <h2 id="amt">${a.title}</h2>
    <p class="muted" style="margin:8px 0 0;font-size:14px">${a.sub}</p>
    <form id="af">
      <label for="a_mail">${t.email}</label><input id="a_mail" type="email" required placeholder="name@example.com" autocomplete="email">
      <div id="aok"></div>
      <div class="row"><button class="btn" type="button" id="aclose">${t.close}</button><button class="btn primary" type="submit" id="asend">${a.send}</button></div>
    </form></div></div>`;
  $("#aclose").onclick=closeModal;
  $("#scrim").onclick=e=>{if(e.target.id==="scrim")closeModal();};
  $("#af").onsubmit=async e=>{
    e.preventDefault();
    const btn=$("#asend");btn.disabled=true;
    try{
      const {error}=await SB.auth.signInWithOtp({email:$("#a_mail").value.trim(),options:{emailRedirectTo:location.origin+location.pathname}});
      if(error)throw error;
      $("#aok").innerHTML=`<div class="ok">${a.sent}</div>`;
    }catch(_){btn.disabled=false;$("#aok").innerHTML=`<div class="ok">${a.fail}</div>`;}
  };
}
if(typeof chrome==="function"){const chrome0=chrome;chrome=function(r){chrome0(r);try{authBtn();}catch(_){}};}

/* ---------- boot ---------- */
let apSub=null, mineSub=null;
function wireStreams(){
  if(!CAP.db) return;
  if(!apSub) apSub=CAP.db.collection("approved").onSnapshot(s=>{APPROVED=s.docs.map(d=>({id:d.id,...d.data()}));refresh();},()=>{});
  if(mineSub){mineSub();mineSub=null;}
  MINE=[];
  if(CAP.uid) mineSub=CAP.db.collection("inbox/"+CAP.uid+"/items").onSnapshot(s=>{MINE=s.docs.map(d=>({id:d.id,...d.data()}));refresh();},()=>{});
}
async function syncSession(){
  CAP.uid=await CAP.user.id();
  CAP.admin=CAP.uid?await CAP.user.canEdit():false;
}
(async()=>{
  const KEY=SBCFG.anonKey||SBCFG.key||"";
  if(!SBCFG.url||!KEY||!window.supabase||!window.supabase.createClient){CAP.ready=true;authBtn();return;}
  SB=window.supabase.createClient(SBCFG.url,KEY,{auth:{flowType:"pkce",detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
  CAP.db=supaDb();CAP.user=supaUser();CAP.assets=supaAssets();
  try{await syncSession();}catch(_){}
  CAP.ready=true;
  wireStreams();
  SB.auth.onAuthStateChange(async()=>{try{await syncSession();}catch(_){}wireStreams();authBtn();chrome(curRoute);refresh();});
  authBtn();chrome(curRoute);refresh();
})();
const evMatch=(x,e)=>x.ev===e.name; /* by name: event indices shift when new selections arrive */
const MIME={pdf:"application/pdf",csv:"text/csv",txt:"text/plain",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png"};
async function saveSubmission(sub,files){
  const t=T();
  if(!CAP.db||!CAP.uid) throw {code:"no_store"};
  const up=[];
  for(const f of files){
    const ext=(f.name.split(".").pop()||"").toLowerCase(), type=MIME[ext];
    if(!type) throw {code:"bad_type",file:f.name};
    if(!CAP.assets) throw {code:"no_assets"};
    const r=await CAP.assets.upload(f,{type});
    up.push({id:r.id,url:r.url,name:f.name,type:r.contentType,size:r.sizeBytes});
  }
  const doc={...sub,files:up,status:"pending",at:Date.now(),by:CAP.uid};
  await CAP.db.collection("inbox/"+CAP.uid+"/items").add(doc);
  await CAP.db.doc("inbox/"+CAP.uid).set({lastAt:Date.now()});
}
const subErr=(t,e)=>e&&e.code==="no_store"?t.st_nostore:e&&e.code==="bad_type"?t.st_badtype(esc(e.file)):e&&e.code==="invalid_argument"?t.st_noright:e&&e.code==="no_assets"?t.st_noassets:t.st_fail;

/* Event contributions: upload a list of local umpires / "I worked at this tournament". */
function openEvModal(kind,ei,cty){
  const t=T(), e=cty?null:EVENTS[ei], up=kind==="loc";
  const roles=[["umpire",t.as_umpire_cap],...ROLES.map(r=>[r[0],r[0]])];
  $("#modalRoot").innerHTML=`<div class="scrim" id="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
    <h2 id="mt">${cty?t.c_up_title:up?t.loc_upload:t.loc_was}</h2>
    <p class="muted" style="margin:8px 0 0;font-size:14px"><b>${cty?esc(cty.name)+" · "+cty.code:esc(evName(e))}</b>${cty?"":" · "+fmtRange(e.s,e.e)}</p>
    <p class="muted" style="margin:6px 0 0;font-size:14px">${cty?t.c_up_sub:up?t.loc_up_sub:t.loc_was_sub}</p>
    <form id="mf">
      ${up?`<label for="m_file">${t.loc_file}</label><input id="m_file" type="file" multiple accept=".pdf,.csv,.txt,.jpg,.jpeg,.png" required><p class="muted" style="font-size:12px;margin:6px 0 0">${t.loc_types}</p>
      <label for="m_kind">${t.loc_kind}</label><select id="m_kind">${(cty?t.c_kinds:t.loc_kinds).map(k=>`<option>${k}</option>`).join("")}</select>`
      :`<label for="m_who">${t.your_profile}</label><input id="m_who" placeholder="${t.ph_profile}" required>
      <label for="m_role">${t.loc_role}</label><select id="m_role">${roles.map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select>
      <div class="two"><div><label for="m_ds">${t.loc_from}</label><input id="m_ds" type="date" min="${e.s}" max="${e.e}" value="${e.s}" required></div><div><label for="m_de">${t.loc_to}</label><input id="m_de" type="date" min="${e.s}" max="${e.e}" value="${e.e}" required></div></div>`}
      <label for="m_note">${t.loc_comment}</label><textarea id="m_note" placeholder="${cty?t.c_ph:up?t.loc_ph_up:t.loc_ph_was}"></textarea>
      <label for="m_mail">${t.email}</label><input id="m_mail" type="email" required placeholder="name@example.com">
      <p class="muted" style="font-size:12px;margin:10px 0 0">${up?t.loc_privacy:t.loc_check}</p>
      <div id="mok"></div>
      <div class="row"><button class="btn" type="button" id="mclose">${t.close}</button><button class="btn primary" type="submit">${t.send}</button></div>
    </form></div></div>`;
  $("#mclose").onclick=closeModal;
  $("#scrim").onclick=ev=>{if(ev.target.id==="scrim")closeModal();};
  const ds=$("#m_ds"),de=$("#m_de"); if(ds&&de){ds.onchange=()=>{de.min=ds.value;if(de.value<ds.value)de.value=ds.value;};}
  $("#mf").onsubmit=async ev=>{ev.preventDefault();
    const btn=$("#mf button[type=submit]");btn.disabled=true;btn.textContent=t.st_saving;
    const v=id=>{const x=$("#"+id);return x?x.value.trim():"";};
    const sub=cty?{kind:"loc",cc:cty.code,ev:cty.name,docType:v("m_kind"),note:v("m_note"),email:v("m_mail")}:up?{kind:"loc",ei:e.i,ev:e.name,docType:v("m_kind"),note:v("m_note"),email:v("m_mail")}
      :{kind:"was",ei:e.i,ev:e.name,who:v("m_who"),role:v("m_role"),ds:v("m_ds"),de:v("m_de"),note:v("m_note"),email:v("m_mail")};
    try{await saveSubmission(sub,up?[...$("#m_file").files]:[]);
      $("#mok").innerHTML=`<div class="ok">${t.st_saved}</div>`;$("#mf").querySelectorAll("input,select,textarea").forEach(x=>x.disabled=true);btn.remove();}
    catch(err){$("#mok").innerHTML=`<div class="ok" style="background:var(--gb-soft)">${subErr(t,err)}</div>`;btn.disabled=false;btn.textContent=t.send;}
  };
  const f=$("#modalRoot input,#modalRoot select");if(f)f.focus();
}
function closeModal(){$("#modalRoot").innerHTML="";}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

/* ---------- chrome + router ---------- */
let curRoute="home";
function chrome(r){
  const t=T();
  document.documentElement.lang=LANG;
  const umpR=["umpires","blue","gold","white"].includes(r);
  $("#nav").innerHTML=`<div class="dd"><button type="button" class="ddb" aria-haspopup="true" aria-expanded="false"${umpR?' aria-current="page"':""}>${t.nav_ump_menu}<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ddm" hidden><a href="#gold" data-r="gold">${t.dd_gold}</a><a href="#blue" data-r="blue">${t.dd_blue}</a><a href="#white" data-r="white">${t.dd_white}</a><a href="#umpires" data-r="umpires" class="ddall">${t.dd_all}</a></div></div><a href="#referees" data-r="referees">${t.nav_refs}</a><a href="#countries" data-r="countries">${t.nav_countries}</a><a href="#events" data-r="events">${t.nav_events}</a><a href="#graph" data-r="graph">${t.nav_graph}</a><a href="#olympics" data-r="olympics">${LANG==="ru"?"Олимпиады":"Olympics"}</a>`;
  document.querySelectorAll("#nav a").forEach(a=>{if(a.dataset.r===r)a.setAttribute("aria-current","page");});
  {const dd=$("#nav .dd"),b=dd.querySelector(".ddb"),m=dd.querySelector(".ddm");let tm=0;
   const open=v=>{clearTimeout(tm);m.hidden=!v;b.setAttribute("aria-expanded",v);};
   b.onclick=e=>{e.stopPropagation();open(e.pointerType==="mouse"?true:m.hidden);};
   dd.onpointerenter=e=>{if(e.pointerType==="mouse")open(true);};
   dd.onpointerleave=e=>{if(e.pointerType==="mouse"){clearTimeout(tm);tm=setTimeout(()=>open(false),180);}};
   m.onclick=()=>open(false);
   dd.onkeydown=e=>{if(e.key==="Escape"){open(false);b.focus();}};
   if(!window._ddDoc){window._ddDoc=1;document.addEventListener("click",e=>{const d=document.querySelector("#nav .dd");if(d&&!d.contains(e.target)){const mm=d.querySelector(".ddm");if(mm&&!mm.hidden){mm.hidden=true;d.querySelector(".ddb").setAttribute("aria-expanded","false");}}});}}
  $("#claimBtn").textContent=t.claim;
  document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===LANG));
  $("#ft1").textContent=t.foot1; $("#ft2").innerHTML=esc(t.foot2)+(CAP.admin?` · <a href="#inbox">${t.st_inbox}</a>`:"");
}
function route(keepScroll){
  const h=(location.hash||"#home").slice(1);
  let html,r="home";
  if(h==="umpires"){html=viewList("all");r="umpires";}
  else if(h==="blue"){html=viewList("1");r="blue";}
  else if(h==="gold"){html=viewList("2");r="gold";}
  else if(h==="white"){html=viewList("w");r="white";}
  else if(h==="countries"){html=viewCountries();r="countries";}
  else if(h==="referees"){html=viewReferees();r="referees";}
  else if(/^r\d+$/.test(h)&&REFS.find(x=>x.ir==+h.slice(1))){const rf=REFS.find(x=>x.ir==+h.slice(1));if(rf.o){location.replace("#u"+rf.o.iu);return;}html=viewProfile(rf);r="referees";}
  else if(h==="events"){html=viewEvents();r="events";}
  else if(h==="graph"){html=viewGraph();r="graph";}
  else if(h==="olympics"){html=viewOlympics();r="olympics";}
  else if(h==="inbox"){html=viewInbox();r="inbox";if(CAP.admin&&!INBOX.length&&!inboxSub)loadInbox().then(()=>{if(location.hash==="#inbox")route(true);});}
  else if(/^e\d+$/.test(h)&&EVENTS[+h.slice(1)]){html=viewEvent(EVENTS[+h.slice(1)]);r="events";}
  else if(/^u\d+$/.test(h)&&BYIU.get(+h.slice(1))){html=viewProfile(BYIU.get(+h.slice(1)));r="";}
  else if(/^x\d+$/.test(h)&&EXTRA[+h.slice(1)]){const x=EXTRA[+h.slice(1)];if(!x.asg.length&&x.iuX&&BYIU.get(x.iuX)){location.replace("#u"+x.iuX);return;}html=viewProfile(x);r="";}
  else if(h[0]==="c"&&COUNTRIES.find(c=>c.slug===h)){html=viewCountry(COUNTRIES.find(c=>c.slug===h));r="countries";}
  else html=viewHome();
  curRoute=r;chrome(r);
  $("#app").innerHTML=html;
  wire();fitH1();startRot();
  if(!keepScroll) window.scrollTo(0,0);
}
function wire(){
  const t=T();
  wireMap();
  wireOly();
  const q=$("#q");
  if(q){ const res=$("#res"); let sel=-1;
    const assoc=v=>{v=v.trim();if(v.length<2||/\d/.test(v))return [];const nz=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();const nv=nz(v);
      return COUNTRIES.filter(c=>(c.code.toLowerCase()===nv||(nv.length>=3&&nz(c.name).split(/[\s-]+/).some(w=>w.startsWith(nv))||nz(c.name).startsWith(nv)))).sort((a,b)=>(b.code.toLowerCase()===nv)-(a.code.toLowerCase()===nv)||b.list.length-a.list.length).slice(0,3);};
    const draw=()=>{const hits=searchOff(q.value);const cs=assoc(q.value);sel=-1;
      if(!q.value.trim()){res.hidden=true;return;}
      res.hidden=false;
      res.innerHTML=cs.map(c=>`<a href="#${c.slug}" class="ras"><span class="num muted" style="font-size:12px">${t.assoc_lbl}</span><span class="nm">${esc(c.name)} <span class="muted" style="font-weight:400">· ${c.list.length||!refsOf(c).length?t.n_umpires(c.list.length):t.ref_only(refsOf(c).length)}</span></span><span class="code">${c.code}</span></a>`).join("")+(hits.length?hits.map(o=>`<a href="${href(o)}"><span class="num muted" style="font-size:12px">${o.isRef?"IR":o.x?"—":String(o.iu).padStart(5,"0")}</span><span class="nm">${esc(o.sur)} ${esc(o.first)}</span><span class="code">${o.c?o.c.code:(o.code||"")}</span>${o.isRef?irBadge(o.st):o.x?csvBadge(o.csv):o.lvl?badge(o.lvl):""}</a>`).join(""):cs.length?"":`<div class="muted" style="padding:10px">${t.nothing} <button type="button" data-add style="font:inherit;color:var(--brand-ink);background:none;border:0;text-decoration:underline;cursor:pointer">${t.add_umpire}</button></div>`);};
    q.oninput=draw;
    q.onkeydown=e=>{const items=[...res.querySelectorAll("a")];if(!items.length)return;
      if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();sel=(sel+(e.key==="ArrowDown"?1:-1)+items.length)%items.length;items.forEach((a,i)=>a.classList.toggle("on",i===sel));}
      if(e.key==="Enter"){e.preventDefault();location.hash=items[Math.max(sel,0)].getAttribute("href");}};
    document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{q.value=b.dataset.q;draw();q.focus();});
  }
  const lq=$("#lq");
  if(lq){ $("#llvl").value=listState.lvl; $("#lc").value=listState.c;
    lq.oninput=()=>{listState.q=lq.value;listState.shown=100;renderListRows();};
    $("#llvl").onchange=e=>{listState.lvl=e.target.value;listState.shown=100;renderListRows();};
    $("#lc").onchange=e=>{listState.c=e.target.value;listState.shown=100;renderListRows();};
    $("#lcont").value=listState.cont;
    $("#lcont").onchange=e=>{listState.cont=e.target.value;if(listState.c!=="all"&&listState.cont!=="all"&&CONT[COUNTRIES[+listState.c].code]!==listState.cont)listState.c="all";$("#lc").innerHTML=countryOpts();$("#lc").value=listState.c;listState.shown=100;renderListRows();};
    renderListRows(); }
  if($("#evOut")){
    document.querySelectorAll("[data-period]").forEach(b=>b.onclick=()=>{evState.period=b.dataset.period;document.querySelectorAll("[data-period]").forEach(x=>x.setAttribute("aria-selected",x===b));renderEvents();});
    document.querySelectorAll("[data-etype]").forEach(b=>b.onclick=()=>{evState.type=b.dataset.etype;document.querySelectorAll("[data-etype]").forEach(x=>x.setAttribute("aria-pressed",x===b));renderEvents();});
    $("#eq").oninput=e=>{evState.q=e.target.value;renderEvents();};
    renderEvents();
  }
  if($("#topOut")) renderTop();
  wireGantt();
  wireGraph();
  wireInbox();
  const cmb=$("#coMore"); if(cmb) cmb.onclick=()=>{document.querySelectorAll("#coList [hidden]").forEach(x=>x.hidden=false);cmb.remove();};
  wireCoPop();
  const fmb=$("#feedMore"); if(fmb) fmb.onclick=()=>{document.querySelectorAll("#feed .xtra").forEach(li=>li.hidden=false);fmb.remove();};
  const ab=$("#addBtn"); if(ab) ab.onclick=()=>openModal("add");
}
/* H1 size (curator 01.11.2026): one size on every page, chosen so that the home line "Share your experience." is about as wide as the search field in the left hero card. Measured with the real display font, so it works on any screen. */
/* rotating word in the home H1: umpires → referees → officials (curator 01.11.2026) */
function startRot(){clearInterval(window._rotT);const el=document.querySelector(".rot");if(!el||el.dataset.on)return;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const ws=el.dataset.w.split("|");el.dataset.on="1";el.textContent="";
  const sp=ws.map((w,j)=>{const s=document.createElement("span");s.className="rw"+(j?"":" in");s.textContent=w;el.appendChild(s);return s;});
  let i=0;const size=()=>{el.style.width=sp[i].offsetWidth+"px";};size();el._size=size;
  el.addEventListener("pointerenter",()=>{el._hold=true;});el.addEventListener("pointerleave",()=>{el._hold=false;});
  window._rotT=setInterval(()=>{if(!document.body.contains(el)){clearInterval(window._rotT);return;}if(document.hidden||el._hold)return;
    const cur=sp[i];i=(i+1)%sp.length;const nx=sp[i];
    nx.style.transition="none";nx.className="rw";void nx.offsetWidth;nx.style.transition="";
    cur.className="rw out";nx.className="rw in";size();},2600);}
function fitH1(){try{const wrap=document.querySelector(".wrap");if(!wrap)return;const W=wrap.clientWidth;
  const hero=document.querySelector(".hero .search");let col;
  if(hero)col=hero.getBoundingClientRect().width;
  else{const card=50;col=innerWidth>900?(W-20)/2.6-card:W-card;}
  const s=document.createElement("span");const cs=getComputedStyle(document.documentElement);
  s.style.cssText="position:absolute;visibility:hidden;white-space:nowrap;font-weight:600;font-size:100px;letter-spacing:.005em;font-family:"+cs.getPropertyValue("--f-display");
  s.textContent="Share your experience.";document.body.appendChild(s);const w=s.getBoundingClientRect().width;s.remove();
  if(!w)return;let fs=col/w*100*0.99;if(innerWidth<=900)fs=Math.min(fs,56);
  document.documentElement.style.setProperty("--h1fs",fs.toFixed(2)+"px");const r=document.querySelector(".rot");if(r&&r._size)r._size();}catch(_){}}
addEventListener("resize",fitH1);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitH1);
/* floating tooltip for .ftip (not clipped by scrolling tables) */
(()=>{let box=null;const show=el=>{if(!box){box=document.createElement("div");box.id="ftipBox";box.setAttribute("role","tooltip");document.body.appendChild(box);}box.textContent=el.dataset.tip;box.hidden=false;const r=el.getBoundingClientRect(),w=box.offsetWidth,h=box.offsetHeight;let x=Math.min(Math.max(8,r.left),innerWidth-w-8),y=r.bottom+6;if(y+h>innerHeight-8)y=r.top-h-6;box.style.left=x+"px";box.style.top=y+"px";};const hide=()=>{if(box)box.hidden=true;};
  document.addEventListener("mouseover",e=>{const el=e.target.closest(".ftip");if(el)show(el);else hide();});
  document.addEventListener("focusin",e=>{const el=e.target.closest(".ftip");if(el)show(el);});document.addEventListener("focusout",hide);addEventListener("scroll",hide,true);})();
document.addEventListener("click",e=>{
  const tr=e.target.closest("tr[data-go]"); if(tr&&!e.target.closest("a")){location.hash=tr.dataset.go;return;}
  const c=e.target.closest("[data-claim]"); if(c){openModal("claim",c.dataset.claim);return;}
  const lb=e.target.closest("[data-lang]"); if(lb){LANG=lb.dataset.lang;try{localStorage.setItem("umpires_lang",LANG);}catch(_){}route(true);return;}
  {const ad=e.target.closest("[data-add]");if(ad){openModal("add",null,ad.dataset.add||"");return;}}
  {const cu=e.target.closest("[data-cup]");if(cu){openEvModal("loc",null,CBYCODE.get(cu.dataset.cup));return;}}
  if(e.target.closest("[data-find]")){const q=$("#q");if(q){q.scrollIntoView({block:"center",behavior:"smooth"});q.focus({preventScroll:true});}return;}
  const ea=e.target.closest("[data-evact]"); if(ea){openEvModal(ea.dataset.evact,+ea.dataset.ei);return;}
  if(!e.target.closest(".search")){const r=$("#res");if(r)r.hidden=true;}
});
$("#claimBtn").onclick=()=>{const m=/^#u(\d+)$/.exec(location.hash);openModal("claim",m?m[1]:null);};
window.addEventListener("hashchange",()=>route(false));
route(false);
