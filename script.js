// ═══════════════════════════════════════════════════════════
// Бот «СВОй» — Центр «Мой бизнес» ДНР
// Интегрировано в сайт Smart AI Chat
// ═══════════════════════════════════════════════════════════

// ===== Восстановление настроек =====
(function restorePreferences() {
  if (localStorage.getItem("smartChat_themeDark") === "1") document.body.classList.add("dark");
  if (localStorage.getItem("smartChat_highContrast") === "1") document.body.classList.add("high-contrast");
  if (localStorage.getItem("smartChat_colorblind") === "1") document.body.classList.add("colorblind");
})();

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("smartChat_themeDark", document.body.classList.contains("dark") ? "1" : "0");
}
function toggleAccessibility() {
  document.body.classList.toggle("high-contrast");
  localStorage.setItem("smartChat_highContrast", document.body.classList.contains("high-contrast") ? "1" : "0");
}
function toggleColorblind() {
  document.body.classList.toggle("colorblind");
  localStorage.setItem("smartChat_colorblind", document.body.classList.contains("colorblind") ? "1" : "0");
}
function sendSOS() {
  if (!navigator.geolocation) { alert("Геолокация не поддерживается."); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => alert("SOS 112\nШирота: " + pos.coords.latitude.toFixed(5) + "\nДолгота: " + pos.coords.longitude.toFixed(5)),
    () => alert("Не удалось получить геолокацию.")
  );
}
function toggleSupport() {
  const p = document.getElementById("support-panel");
  if (p) p.style.display = p.style.display === "flex" ? "none" : "flex";
}
function toggleHelpHint() { document.body.classList.toggle("hints-active"); }

// ═══════════════════════════════════════════════════════════
// БАЗА ЗНАНИЙ БОТА
// ═══════════════════════════════════════════════════════════

const CONTACTS = {
  donetsk: { address: "пр-кт Дзержинского, 13, 1 этаж (БЦ «Скиф»)", phone: "+7 (949) 568-44-53" },
  mariupol: { address: "пр-кт Металлургов, 88А", phone: "+7 (949) 361-59-38" },
  email: "inform@mb180.ru", site: "mb180.ru"
};

const FAQ_SC = [
  {q:"Какие данные нужно указать о себе?",kw:["данные","заявитель","фио","инн","паспорт","информация о себе"],a:"В разделе указываются персональные данные:\n\n• ФИО полностью — строго как в паспорте\n• ИНН — если есть\n• Год рождения\n• Контактный телефон\n• Электронная почта\n• Место жительства\n• Образование и специальность\n• Общий трудовой стаж\n• Опыт работы в данной сфере"},
  {q:"Что писать в «Состав семьи»?",kw:["состав семьи","семья","проживающие"],a:"Перечислите всех членов семьи, проживающих с вами.\n\nПримеры:\n• «Супруга, двое детей (5 и 10 лет), мать-пенсионерка»\n• «Проживаю один(а)»"},
  {q:"Как заполнить «График работы»?",kw:["график","рабочий","часы","дни"],a:"Укажите дни и часы:\n• «5 дней, 40 часов» — полный день\n• «3 дня, 15 часов» — частичная занятость\n• «Свободный график»\n\nНе завышайте — комиссия оценивает реалистичность."},
  {q:"Что такое ОКВЭД?",kw:["оквэд","код","классификатор","вид деятельности"],a:"ОКВЭД — код вашего вида бизнеса.\n\nГде найти:\n• Поисковик: «ОКВЭД 2026»\n• Сайт ФНС\n• Центр «Мой бизнес» — бесплатно"},
  {q:"Какую систему налогообложения выбрать?",kw:["налог","усн","патент","нпд","самозанятый","система налогообложения"],a:"• НПД (самозанятый) — 4-6%, без сотрудников\n• Патент — фиксированная сумма\n• УСН 1% — 1% от выручки в ДНР\n• УСН 5% — 5% от (доходы − расходы)\n\nОдин + малые обороты → НПД.\nС сотрудниками → УСН."},
  {q:"Что писать в «Описании проекта»?",kw:["описание проекта","описание","проект"],a:"ЧТО делаете, ДЛЯ КОГО, ГДЕ.\n\n❌ «Буду печь торты»\n✅ «Домашняя кондитерская: торты, капкейки на заказ. Свадебные и детские торты. Доставка по городу»."},
  {q:"Что считается «имеющимся оборудованием»?",kw:["оборудование","имеющееся","что есть"],a:"Всё, что пригодится в бизнесе:\n• «Швейная машинка, оверлок, манекен»\n• «Ноутбук, принтер»\n\nЕсли ничего нет — «нет»."},
  {q:"Нужно ли нанимать сотрудников?",kw:["сотрудники","наём","персонал","работники"],a:"Самозанятый — сотрудников нет.\n\nНужны если:\n• Не справляетесь один\n• Бизнес посменный\n• Масштабирование\n\nЗарплату платить независимо от выручки."},
  {q:"Как описать товар или услугу?",kw:["товар","услуга","описание товара","маркетинговый"],a:"Конкретно: что, виды, преимущества.\n\nПример: «Ремонт обуви: замена набоек, ремонт подошвы, замена молний, растяжка, покраска. Любые материалы»."},
  {q:"Как заполнить «Конкуренты»?",kw:["конкуренты","конкуренция","анализ рынка"],a:"1. Перечислите конкурентов\n2. Их сильные/слабые стороны\n3. Чем вы лучше\n\nЕсли нет: «В районе нет мастерских. Ближайшая — в 3 км»."},
  {q:"Территориальный рынок?",kw:["территориальный рынок","география","зона"],a:"Зона продаж:\n• «Микрорайон» — мастерская у дома\n• «Город Донецк» — выезд\n• «Вся ДНР» — доставка"},
  {q:"Как определить целевую аудиторию?",kw:["целевая аудитория","потребители","клиенты"],a:"Кто купит: пол, возраст, интересы, где живут.\n\nПример: «Жители частного сектора, 30-70 лет, средний достаток»."},
  {q:"Каналы сбыта?",kw:["каналы сбыта","продажи","сбыт"],a:"• Точка / на дому / выезд\n• Интернет (ВК, Telegram)\n• Ярмарки, рынки\n• Магазины-партнёры\n\nКомбинируйте 2-3 канала."},
  {q:"Какую рекламу выбрать?",kw:["реклама","продвижение","маркетинг"],a:"3-5 каналов:\n• Сарафанное радио — бесплатно\n• Соцсети — от 0 руб.\n• Местные группы — от 100 руб.\n• Листовки — 1500-3000 руб.\n• Ярмарки — 500-2000 руб.\n\nБюджет: 1000-2000 руб./мес."},
  {q:"Перспективы бизнеса?",kw:["перспективы","масштабирование","развитие"],a:"• Расширение ассортимента\n• Найм помощника через 6-8 мес.\n• Вторая точка через год\n• Маркетплейсы\n• Повышение квалификации"},
  {q:"Как составить смету?",kw:["смета","расходы","затраты","на что потратить"],a:"350 000 руб.:\n• Оборудование (основная часть)\n• Сырьё (на 2-3 мес.)\n• Аренда (≤15%)\n• Услуги (до 5-10 тыс.)\n• Реклама (≤10-15%)\n\n❌ Кредиты, недвижимость, алкоголь."},
  {q:"Графа «Поставщик»?",kw:["поставщик","где купить","закупка"],a:"Конкретно:\n• Магазин: название, адрес\n• Рынок: ряд, место\n• Интернет: ссылка\n• Производитель: контакты"},
  {q:"Цена ниже запланированной?",kw:["цена ниже","разница","дешевле"],a:"1. Покупаете по реальной цене\n2. Чеки в соцзащиту\n3. Разницу вернуть государству\n4. Остаток нельзя тратить без согласования"},
  {q:"Товара нет в наличии?",kw:["нет в наличии","замена","другой товар"],a:"1. НЕ покупайте без согласования!\n2. Свяжитесь с куратором\n3. Предложите аналог\n4. Получите согласие\n5. Покупайте"},
  {q:"Прайс на товары/услуги?",kw:["прайс","цены","наименование","выручка"],a:"Графы:\n1. Наименование (конкретно!)\n2. Ед. измерения\n3. Кол-во в мес.\n4. Цена\n5. Выручка = кол-во × цена\n6. Расходы на 1 ед.\n7. Расходы всего"},
  {q:"Ежемесячные затраты?",kw:["ежемесячные","постоянные расходы","аренда"],a:"• Аренда, коммуналка\n• Интернет, связь\n• ГСМ, транспорт\n• Реклама, упаковка\n• Обслуживание оборудования\n• Зарплата\n\n+ налоги отдельно"},
  {q:"Финансовый план на 12 месяцев?",kw:["финансовый план","12 месяцев","помесячно"],a:"1. Доходы (растут постепенно)\n2. Расходы (материалы, ГСМ...)\n3. Налоги\n4. Прибыль = Доходы − Расходы − Налоги\n5. Накопленным итогом"},
  {q:"Как рассчитать налоги?",kw:["рассчитать налоги","сколько налогов"],a:"• НПД: 4% (физлица), 6% (юрлица)\n• УСН 1%: 1% от выручки\n• УСН 5%: 5% от (доходы − расходы)\n• Патент: фиксированная сумма/год"},
  {q:"Ячейки в Excel?",kw:["ячейки","формулы","excel","таблица"],a:"Не трогайте ячейки с формулами (знак «=», серый фон).\nМожно: пустые и с подсказками.\nНе уверены — не трогайте!"},
  {q:"Итоговые показатели?",kw:["показатели","прибыль","окупаемость","рентабельность"],a:"1. Чистая прибыль — положительная с 1-3 мес.\n2. Окупаемость — до 12 мес.\n3. Рентабельность — от 15-30%"},
  {q:"Документы к бизнес-плану?",kw:["документы","приложения","что приложить"],a:"• Договор аренды / гарантийное письмо\n• Коммерческие предложения\n• Скриншоты соцсетей\n• Фото работ, сертификаты\n• Удостоверение ВБД"},
  {q:"Не понимаю бизнес-план?",kw:["не понимаю","помощь","куда обратиться","сложно"],a:"1. Центр «Мой бизнес» — бесплатно\n   📍 Донецк: пр-кт Дзержинского, 13\n   📞 +7(949)568-44-53\n2. Соцзащита\n3. Знакомые предприниматели"},
  {q:"На что можно тратить деньги?",kw:["на что можно","разрешённые расходы"],a:"✅ Оборудование, сырьё, аренда (≤15%), транспорт, регистрация\n❌ Кредиты, недвижимость, авто, личное, алкоголь"},
  {q:"Если бизнес не пойдёт?",kw:["бизнес не пойдёт","провал","проблемы"],a:"Не скрывайте — сообщите куратору.\nОбязательства: отчётность, чеки.\nПропадёте — могут потребовать вернуть деньги."},
  {q:"Когда придут деньги?",kw:["когда деньги","сроки выплаты","ждать"],a:"3-30 дней (обычно 10-14).\nИногда частями: 50% → остальное."},
  {q:"После получения денег?",kw:["получил деньги","после получения","что дальше"],a:"1. Купите по смете (чеки!)\n2. Работайте\n3. Ведите учёт\n4. Отчитывайтесь\n5. Платите налоги"},
  {q:"Частые ошибки?",kw:["ошибки","частые ошибки","отказ"],a:"1. Нереалистичные доходы\n2. Разделы противоречат\n3. «Конкурентов нет» без обоснования\n4. Завышенные расходы\n5. Ошибки в налогах\n6. Нет поставщиков\n7. Плохое описание\n8. Нет перспектив\n9. Аренда >15%\n10. Грамматические ошибки"}
];

const FAQ_SE = [
  {q:"Что такое реестр соц. предприятий?",kw:["реестр","социальное предприятие","что такое"],a:"Список МСП (ИП и ООО), подтвердивших социальную направленность. Даёт расширенную поддержку."},
  {q:"Преимущества реестра?",kw:["преимущества","зачем","льготы реестра"],a:"• Льготные микрозаймы\n• Льготная аренда коворкинга\n• Акселераторы, консультации, продвижение"},
  {q:"Процедура включения?",kw:["процедура","как попасть","включение"],a:"1. Определите категорию\n2. Документы: заявление, опись, подтверждение\n3. Подайте в Центр «Мой бизнес»"},
  {q:"Сроки приёма заявлений?",kw:["сроки","когда подавать","приём"],a:"• 20.01–31.05.2026 → реестр ФНС 10.07.2026\n• 02.06–31.12.2026 → 10 числа след. месяца"},
  {q:"Категории для реестра?",kw:["категории","критерии","попасть в реестр"],a:"1. Занятость льготников (≥50% штата)\n2. Реализация товаров льготников (≥50% дохода)\n3. Производство для льготников\n4. Общественная деятельность"}
];

const FAQ_GS = [
  {q:"Меры поддержки Центра?",kw:["меры поддержки","центр мой бизнес","что предлагают"],a:"• Сертификация — софин. 80/20% (до 450 тыс.)\n• Реклама на радио — бесплатно\n• «Быстрый старт» — софин. 90/10%\n• Товарный знак — бесплатно\n• Выставки и ярмарки\n• Гарантии (поручительства до 70%)\n• Аренда мест и оборудования"},
  {q:"Микрозаймы?",kw:["микрозаймы","кредит","финансирование","ставка"],a:"МКК ДНР:\n• Лёгкий старт — 3-5%\n• Приоритетный — 5-12%\n• Участники СВО — 1-2%\n• Социальный — 1%\n• Восстановительный — 0,3%\n• Универсальный — 12-16%\n\nДо 36 мес., до 5 млн руб."},
  {q:"Как получить поддержку?",kw:["как получить","как обратиться","заявка"],a:"Лично в офис Центра «Мой бизнес». Специалист проинформирует о сроках."},
  {q:"По каким вопросам?",kw:["какие вопросы","чем помогут","консультации"],a:"• Гос. поддержка\n• Законодательство, бухгалтерия, налоги\n• Начало дела\n• Контрольные органы\n• Финансовые инструменты"},
  {q:"Проекты для молодёжи?",kw:["молодёжь","этотема","пробизнес","студент"],a:"• «ЭтоТема!» — бизнес-идеи студентов\n• «ПроБизнес» — онлайн-курс с сертификатом"},
  {q:"Проекты для ветеранов?",kw:["свояТема","проект для ветеранов","сво проект"],a:"«СВОяТема!»:\n• Разбор бизнес-идеи + меры поддержки\n• Образовательные мероприятия\n• Консультации при реализации"},
  {q:"Регистрация ИП?",kw:["регистрация ип","открыть ип"],a:"Очно в Центре «Мой бизнес».\nНужно: паспорт, ИНН, СНИЛС, почта.\nДо 60 мин. Документы — 3 раб. дня."},
  {q:"Регистрация ООО?",kw:["регистрация ооо","открыть ооо"],a:"Очно в Центре «Мой бизнес».\nНужно: паспорт, ИНН, СНИЛС, почта, устав, гарантийное письмо.\nДо 60 мин. Документы — 3 раб. дня."}
];

const CHECKLIST = [
  "Паспорт гражданина РФ","ИНН","СНИЛС",
  "Удостоверение ветерана / справка об участии в СВО",
  "Заявление на соцконтракт","Бизнес-план",
  "Смета расходов с подтверждением цен","Справка о составе семьи",
  "Справка о доходах (для не-участников СВО)","Реквизиты банковского счёта"
];

// ═══════════════════════════════════════════════════════════
// ДВИЖОК ЧАТА
// ═══════════════════════════════════════════════════════════

const $chat = () => document.getElementById("chat");
const $msg = () => document.getElementById("msg");

function scrollChat() {
  const c = $chat();
  if (c) setTimeout(() => c.scrollTop = c.scrollHeight, 60);
}

function addBotMsg(text, buttons, delay) {
  delay = delay || 450;
  const chat = $chat(); if (!chat) return;
  // typing
  const t = document.createElement("div");
  t.className = "typing-row";
  t.innerHTML = '<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  chat.appendChild(t);
  scrollChat();

  setTimeout(() => {
    t.remove();
    const msg = document.createElement("div");
    msg.className = "message ai";
    msg.textContent = text;
    chat.appendChild(msg);

    if (buttons && buttons.length) {
      const wrap = document.createElement("div");
      wrap.className = "bot-buttons";
      buttons.forEach(b => {
        const btn = document.createElement("button");
        btn.className = "bot-btn";
        btn.textContent = b.label;
        btn.onclick = () => handleBotBtn(b);
        wrap.appendChild(btn);
      });
      chat.appendChild(wrap);
    }
    scrollChat();
  }, delay);
}

function addUserMsg(text) {
  const chat = $chat(); if (!chat) return;
  const msg = document.createElement("div");
  msg.className = "message user";
  msg.textContent = text;
  chat.appendChild(msg);
  scrollChat();
}

function searchFAQ(query) {
  const q = query.toLowerCase();
  const all = [...FAQ_SC, ...FAQ_SE, ...FAQ_GS];
  let best = null, bestScore = 0;
  for (const item of all) {
    let score = 0;
    for (const kw of item.kw) {
      if (q.includes(kw)) score += 3;
      else { for (const w of kw.split(/\s+/)) { if (w.length > 3 && q.includes(w)) score += 1; } }
    }
    if (item.q.toLowerCase().split(/\s+/).some(w => w.length > 3 && q.includes(w.toLowerCase()))) score += 1;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return bestScore >= 1 ? best : null;
}

const BACK = {label:"🏠 Главное меню", action:"back_main"};

function handleBotBtn(b) {
  addUserMsg(b.label);
  const a = b.action;

  if (a === "veteran" || a === "family") {
    const g = a === "veteran" ? "Спасибо! Мы ценим ваш вклад в защиту Родины." : "Спасибо! Поддержка семей героев — наш приоритет.";
    addBotMsg(g + "\n\nЧем могу помочь?", [
      {label:"📋 Социальный контракт",action:"social_contract"},
      {label:"🏛 Меры поддержки",action:"gov_support"},
      {label:"🚀 Акселератор «СВОяТема»",action:"accelerator"},
      {label:"💬 Консультация",action:"consult"}
    ]);
    return;
  }
  if (a === "back_main") {
    addBotMsg("Главное меню:", [
      {label:"📋 Социальный контракт",action:"social_contract"},
      {label:"🏛 Меры поддержки",action:"gov_support"},
      {label:"🚀 Акселератор «СВОяТема»",action:"accelerator"},
      {label:"💬 Консультация",action:"consult"}
    ]);
    return;
  }
  if (a === "social_contract") {
    addBotMsg("📋 СОЦИАЛЬНЫЙ КОНТРАКТ\n\nВ 2026 году: 2 000 контрактов по 350 000 руб.!\nПоможем подготовить документы!", [
      {label:"📝 Бизнес-план",action:"sc_bizplan"},
      {label:"📋 Чек-лист документов",action:"checklist"},
      {label:"❓ Вопросы",action:"sc_faq"},
      BACK
    ]);
    return;
  }
  if (a === "sc_bizplan") {
    addBotMsg("📝 Выберите раздел бизнес-плана:", [
      {label:"👤 Р.1 Заявитель",action:"sec_1"},
      {label:"📄 Р.2 Описание",action:"sec_2"},
      {label:"📊 Р.3 Маркетинг",action:"sec_3"},
      {label:"💰 Р.4 Смета",action:"sec_4"},
      {label:"📈 Р.5 Финансы",action:"sec_5"},
      {label:"📎 Приложения",action:"sec_6"},
      {label:"⚠️ Ошибки",action:"sec_err"},
      {label:"◀️ Назад",action:"social_contract"}
    ]);
    return;
  }
  const secMap = {
    sec_1:{items:FAQ_SC.slice(0,3),t:"Р.1 ЗАЯВИТЕЛЬ"},
    sec_2:{items:FAQ_SC.slice(3,8),t:"Р.2 ОПИСАНИЕ"},
    sec_3:{items:FAQ_SC.slice(8,15),t:"Р.3 МАРКЕТИНГ"},
    sec_4:{items:FAQ_SC.slice(15,20),t:"Р.4 СМЕТА"},
    sec_5:{items:FAQ_SC.slice(20,26),t:"Р.5 ФИНАНСЫ"},
    sec_6:{items:FAQ_SC.slice(26,29),t:"ПРИЛОЖЕНИЯ"},
    sec_err:{items:FAQ_SC.slice(31,32),t:"ОШИБКИ"},
  };
  if (secMap[a]) {
    const s = secMap[a];
    const btns = s.items.map(item => ({label:"❓ "+item.q, action:"faq_sc_"+FAQ_SC.indexOf(item)}));
    btns.push({label:"◀️ Назад",action:"sc_bizplan"});
    addBotMsg("📚 "+s.t+":", btns);
    return;
  }
  if (a.startsWith("faq_sc_")) {
    const item = FAQ_SC[parseInt(a.replace("faq_sc_",""))];
    if (item) addBotMsg(item.a, [{label:"◀️ Разделы",action:"sc_bizplan"},BACK]);
    return;
  }
  if (a === "sc_faq") {
    addBotMsg("Задайте вопрос текстом или выберите:", [
      {label:"📝 Разделы бизнес-плана",action:"sc_bizplan"},
      {label:"📋 Чек-лист",action:"checklist"},
      {label:"💬 Специалист",action:"consult"},
      BACK
    ]);
    return;
  }
  if (a === "checklist") {
    addBotMsg("📋 ЧЕК-ЛИСТ:\n\n"+CHECKLIST.map((d,i)=>(i+1)+". "+d).join("\n")+"\n\n💡 Начните сбор заранее!", [
      {label:"📝 Бизнес-план",action:"sc_bizplan"},{label:"💬 Консультация",action:"consult"},BACK
    ]);
    return;
  }
  if (a === "gov_support") {
    const btns = FAQ_GS.map((item,i) => ({label:"❓ "+item.q, action:"faq_gs_"+i}));
    btns.push({label:"🏢 Соц. предприятие",action:"soc_ent"});
    btns.push(BACK);
    addBotMsg("🏛 МЕРЫ ПОДДЕРЖКИ:", btns);
    return;
  }
  if (a.startsWith("faq_gs_")) {
    const item = FAQ_GS[parseInt(a.replace("faq_gs_",""))];
    if (item) addBotMsg(item.a, [{label:"◀️ Поддержка",action:"gov_support"},BACK]);
    return;
  }
  if (a === "soc_ent") {
    const btns = FAQ_SE.map((item,i) => ({label:"❓ "+item.q, action:"faq_se_"+i}));
    btns.push({label:"◀️ Назад",action:"gov_support"});
    addBotMsg("🏢 СТАТУС СОЦ. ПРЕДПРИЯТИЯ:", btns);
    return;
  }
  if (a.startsWith("faq_se_")) {
    const item = FAQ_SE[parseInt(a.replace("faq_se_",""))];
    if (item) addBotMsg(item.a, [{label:"◀️ Соц. предприятие",action:"soc_ent"},BACK]);
    return;
  }
  if (a === "accelerator") {
    addBotMsg("🚀 АКСЕЛЕРАТОР «СВОяТема»\n\n• Разбор бизнес-идеи + подбор мер поддержки\n• Образовательные мероприятия\n• Консультации\n\n📞 Донецк: "+CONTACTS.donetsk.phone+"\n📞 Мариуполь: "+CONTACTS.mariupol.phone, [
      {label:"💬 Записаться",action:"consult"},BACK
    ]);
    return;
  }
  if (a === "consult") {
    addBotMsg("💬 СВЯЗЬ СО СПЕЦИАЛИСТОМ:", [
      {label:"📝 Оставить заявку",action:"leave_request"},
      {label:"📞 Контакты",action:"show_contacts"},
      {label:"📍 Адреса",action:"show_addresses"},
      BACK
    ]);
    return;
  }
  if (a === "leave_request") {
    addBotMsg("📝 Заполните форму ниже:");
    setTimeout(() => {
      const f = document.getElementById("consult-form");
      if (f) f.style.display = "block";
      scrollChat();
    }, 500);
    return;
  }
  if (a === "show_contacts") {
    addBotMsg("📞 КОНТАКТЫ\n\n🏢 Донецк:\n"+CONTACTS.donetsk.address+"\n📞 "+CONTACTS.donetsk.phone+"\n\n🏢 Мариуполь:\n"+CONTACTS.mariupol.address+"\n📞 "+CONTACTS.mariupol.phone+"\n\n📧 "+CONTACTS.email+"\n🌐 "+CONTACTS.site, [
      {label:"📝 Заявка",action:"leave_request"},BACK
    ]);
    return;
  }
  if (a === "show_addresses") {
    addBotMsg("📍 АДРЕСА\n\n🏢 Донецк\n"+CONTACTS.donetsk.address+"\n📞 "+CONTACTS.donetsk.phone+"\nПн-Пт, 9:00-18:00\n\n🏢 Мариуполь\n"+CONTACTS.mariupol.address+"\n📞 "+CONTACTS.mariupol.phone+"\nПн-Пт, 9:00-18:00", [
      {label:"📝 Заявка",action:"leave_request"},BACK
    ]);
    return;
  }
}

// ═══════════════════════════════════════════════
// ПУБЛИЧНЫЕ ФУНКЦИИ
// ═══════════════════════════════════════════════

function startBot() {
  const card = document.getElementById("main-card");
  const welcome = document.getElementById("welcome-content");
  const chatContent = document.getElementById("chat-content");
  card.classList.remove("welcome");
  card.classList.add("chat-mode");
  if (welcome) welcome.style.display = "none";
  if (chatContent) chatContent.style.display = "flex";

  addBotMsg(
    "Здравствуйте! 👋\n\nЯ — бот-навигатор «СВОй» Центра «Мой бизнес» ДНР.\n\nПомогу разобраться в мерах поддержки и оформлении социального контракта.\n\nВыберите категорию:",
    [{label:"🎖 Ветеран СВО",action:"veteran"},{label:"👨‍👩‍👧 Член семьи ветерана",action:"family"}],
    300
  );
}

function sendMessage() {
  const input = $msg();
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addUserMsg(text);

  const found = searchFAQ(text);
  if (found) {
    addBotMsg(found.a, [{label:"❓ Другой вопрос",action:"back_main"},{label:"💬 Специалист",action:"consult"},BACK]);
  } else {
    addBotMsg("Не нашёл точного ответа.\n\n• Переформулируйте вопрос\n• Или свяжитесь со специалистом", [
      {label:"💬 Специалист",action:"consult"},{label:"📋 Соцконтракт",action:"social_contract"},BACK
    ]);
  }
}

function submitConsultForm() {
  const name = document.getElementById("form-name").value.trim();
  const phone = document.getElementById("form-phone").value.trim();
  if (!name || !phone) return;
  hideConsultForm();
  addUserMsg("Заявка: " + name + ", " + phone);
  addBotMsg("✅ Спасибо, "+name+"!\n\nСпециалист свяжется по номеру "+phone+".\n\n📞 Срочно:\n"+CONTACTS.donetsk.phone+" (Донецк)\n"+CONTACTS.mariupol.phone+" (Мариуполь)", [BACK]);
  document.getElementById("form-name").value = "";
  document.getElementById("form-phone").value = "";
}

function hideConsultForm() {
  const f = document.getElementById("consult-form");
  if (f) f.style.display = "none";
}

// ═══════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ
// ═══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const input = $msg();
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }
});
