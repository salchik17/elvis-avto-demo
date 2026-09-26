// Общая логика для обоих вариантов: каталог, карточка авто, калькулятор, хоккей, отзывы, FAQ, новости, формы.
// Разметка одинаковая — внешний вид задаёт CSS каждого варианта.
const U = {
  $: (s, r = document) => r.querySelector(s),
  $$: (s, r = document) => [...r.querySelectorAll(s)],
  price: n => n ? n.toLocaleString('ru-RU') + ' ₽' : 'по запросу',
  esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  plural: (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; },
  tel: p => 'tel:' + p.replace(/[^\d+]/g, '').replace(/^8/, '+7'),
};

function carTag(c) { return c.order ? 'Под заказ' : c.isNew ? 'Новый' : 'С пробегом'; }
function carMeta(c) { return [c.engine, c.power, c.gear, c.drive].filter(Boolean).join(' · '); }
function carCard(c, eager) {
  return `<a class="car-card" href="#car-${c.id}" data-id="${c.id}">
    <div class="car-card__img"><img src="${carImg(c.img[0], 's')}" srcset="${carImg(c.img[0], 's')} 317w, ${carImg(c.img[0], 'm')} 695w"
      sizes="(max-width:640px) 100vw, 400px" alt="${U.esc(c.name)} ${c.year}" ${eager ? '' : 'loading="lazy"'} decoding="async" width="317" height="200">
      <span class="tag tag--${c.order ? 'order' : c.isNew ? 'new' : 'used'}">${carTag(c)}</span></div>
    <div class="car-card__body"><h3>${U.esc(c.name)} <span>${c.year}</span></h3>
      <p class="car-card__meta">${U.esc(carMeta(c))}</p>
      <div class="car-card__foot"><b>${U.price(c.price)}</b><small>${c.isNew || c.order ? c.body : U.esc(c.km)}</small></div></div></a>`;
}

// ---------- Каталог ----------
function initCatalog(root) {
  const st = { f: 'all', brand: '', sort: 'new', shown: 12 };
  const brands = [...new Set(CARS.map(c => c.brand))].sort();
  const filters = [['all', 'Все'], ['stock', 'В наличии'], ['order', 'Под заказ'], ['new', 'Новые'], ['used', 'С пробегом']];
  root.innerHTML = `<div class="cat-bar">
      <div class="chips">${filters.map(([k, t]) => `<button class="chip${k === 'all' ? ' on' : ''}" data-f="${k}">${t}</button>`).join('')}</div>
      <div class="cat-sel"><select id="catBrand" aria-label="Марка"><option value="">Все марки</option>${brands.map(b => `<option>${b}</option>`).join('')}</select>
      <select id="catSort" aria-label="Сортировка"><option value="new">Сначала новые</option><option value="cheap">Сначала дешевле</option><option value="exp">Сначала дороже</option><option value="year">По году выпуска</option></select></div></div>
    <p class="cat-count" id="catCount"></p><div class="cat-grid" id="catGrid"></div>
    <div class="cat-more"><button class="btn btn--ghost" id="catMore">Показать ещё</button></div>`;
  const draw = () => {
    let list = CARS.filter(c => st.f === 'all' || (st.f === 'stock' && !c.order) || (st.f === 'order' && c.order) || (st.f === 'new' && c.isNew) || (st.f === 'used' && !c.isNew));
    if (st.brand) list = list.filter(c => c.brand === st.brand);
    const s = { new: (a, b) => b.id - a.id, cheap: (a, b) => a.price - b.price, exp: (a, b) => b.price - a.price, year: (a, b) => b.year - a.year }[st.sort];
    list = [...list].sort(s);
    U.$('#catCount').textContent = `${list.length} ${U.plural(list.length, 'автомобиль', 'автомобиля', 'автомобилей')}`;
    U.$('#catGrid').innerHTML = list.slice(0, st.shown).map((c, i) => carCard(c, i < 3)).join('') || '<p class="empty">Ничего не найдено — попробуйте другой фильтр.</p>';
    U.$('#catMore').style.display = list.length > st.shown ? '' : 'none';
    document.dispatchEvent(new CustomEvent('catalog:drawn'));
  };
  U.$$('.chip', root).forEach(b => b.onclick = () => { U.$$('.chip', root).forEach(x => x.classList.remove('on')); b.classList.add('on'); st.f = b.dataset.f; st.shown = 12; draw(); });
  U.$('#catBrand').onchange = e => { st.brand = e.target.value; st.shown = 12; draw(); };
  U.$('#catSort').onchange = e => { st.sort = e.target.value; draw(); };
  U.$('#catMore').onclick = () => { st.shown += 12; draw(); };
  draw();
}

// ---------- Карточка автомобиля (выезжающая панель) ----------
function initCarSheet() {
  const sheet = document.createElement('div');
  sheet.className = 'sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
  document.body.appendChild(sheet);
  let lastY = 0;
  const open = id => {
    const c = CARS.find(x => x.id === +id); if (!c) return;
    const rows = [['Производство', c.country], ['Двигатель', c.engine], ['Мощность', c.power], ['Коробка', c.gear], ['Привод', c.drive], ['Пробег', c.km], ['Кузов', c.body], ['Цвет', c.color], ['Владельцев', c.owners]].filter(r => r[1]);
    const desc = c.desc.map(d => `<li>${U.esc(d)}</li>`).join('');
    sheet.innerHTML = `<div class="sheet__bg" data-close></div><div class="sheet__panel">
      <button class="sheet__x" data-close aria-label="Закрыть">✕</button>
      <div class="gal"><div class="gal__track">${c.img.map((p, i) => `<img src="${carImg(p, 'm')}" alt="" ${i > 1 ? 'loading="lazy"' : ''} decoding="async">`).join('')}</div>
        <span class="gal__n">1 / ${c.img.length}</span>
        <button class="gal__btn gal__prev" aria-label="Назад">‹</button><button class="gal__btn gal__next" aria-label="Вперёд">›</button></div>
      <div class="sheet__body">
        <span class="tag tag--${c.order ? 'order' : c.isNew ? 'new' : 'used'}">${carTag(c)}</span>
        <h2>${U.esc(c.name)}, ${c.year}</h2><p class="sheet__price">${U.price(c.price)}</p>
        <div class="sheet__cta"><a class="btn" href="#contact" data-book="${U.esc(c.name + ', ' + c.year)}">Забронировать</a><a class="btn btn--ghost" href="${U.tel(SITE.phone)}">Позвонить</a></div>
        <dl class="specs">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${U.esc(v)}</dd></div>`).join('')}</dl>
        ${desc ? `<h3>Описание и комплектация</h3><ul class="desc${c.desc.length > 10 ? ' desc--cut' : ''}">${desc}</ul>${c.desc.length > 10 ? '<button class="btn btn--ghost desc-more">Показать полностью</button>' : ''}` : ''}
      </div></div>`;
    const tr = U.$('.gal__track', sheet), n = U.$('.gal__n', sheet);
    tr.addEventListener('scroll', () => { n.textContent = Math.round(tr.scrollLeft / tr.clientWidth) + 1 + ' / ' + c.img.length; }, { passive: true });
    U.$('.gal__prev', sheet).onclick = () => tr.scrollBy({ left: -tr.clientWidth, behavior: 'smooth' });
    U.$('.gal__next', sheet).onclick = () => tr.scrollBy({ left: tr.clientWidth, behavior: 'smooth' });
    const dm = U.$('.desc-more', sheet); if (dm) dm.onclick = () => { U.$('.desc', sheet).classList.remove('desc--cut'); dm.remove(); };
    U.$$('[data-close]', sheet).forEach(b => b.onclick = close);
    U.$('[data-book]', sheet).onclick = e => { e.preventDefault(); close(); const f = U.$('#contact textarea, #contact [name=msg]'); if (f) f.value = 'Хочу забронировать: ' + e.target.dataset.book; setTimeout(() => document.dispatchEvent(new CustomEvent('go', { detail: '#contact' })), 60); };
    lastY = scrollY; document.documentElement.classList.add('locked');
    sheet.classList.add('open'); document.dispatchEvent(new CustomEvent('sheet', { detail: true }));
    U.$('.sheet__panel', sheet).scrollTop = 0;
  };
  function close() {
    if (!sheet.classList.contains('open')) return;
    sheet.classList.remove('open'); document.documentElement.classList.remove('locked');
    if (location.hash.startsWith('#car-')) history.replaceState(null, '', location.pathname + location.search);
    document.dispatchEvent(new CustomEvent('sheet', { detail: false }));
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#car-"]'); if (!a) return;
    e.preventDefault(); history.pushState(null, '', a.getAttribute('href')); open(a.getAttribute('href').slice(5));
  });
  addEventListener('popstate', () => location.hash.startsWith('#car-') ? open(location.hash.slice(5)) : close());
  if (location.hash.startsWith('#car-')) open(location.hash.slice(5));
}

// ---------- Кредитный калькулятор ----------
function initCalc(root) {
  root.innerHTML = `<div class="calc__fields">
    <label class="rng"><span>Стоимость автомобиля <b id="cvP"></b></span><input id="cP" type="range" min="300000" max="10000000" step="50000" value="3000000"></label>
    <label class="rng"><span>Первый взнос <b id="cvD"></b></span><input id="cD" type="range" min="0" max="70" step="5" value="20"></label>
    <label class="rng"><span>Срок <b id="cvT"></b></span><input id="cT" type="range" min="12" max="96" step="12" value="60"></label></div>
    <div class="calc__res"><small>Примерный платёж в месяц</small><div class="calc__pay" id="cPay"></div>
    <a class="btn" href="#contact" data-msg="Заявка на кредит">Подать заявку на кредит</a>
    <p class="calc__note">Заявка — по 2 документам, можно без первого взноса. Подаём во многие банки. Расчёт условный (ставка 16% годовых), точные условия — в кредитном отделе: ${SITE.credit}</p></div>`;
  const f = () => {
    const p = +U.$('#cP').value, d = +U.$('#cD').value, t = +U.$('#cT').value, r = .16 / 12, loan = p * (1 - d / 100);
    U.$('#cvP').textContent = U.price(p); U.$('#cvD').textContent = d + '% · ' + U.price(p * d / 100);
    U.$('#cvT').textContent = t / 12 + ' ' + U.plural(t / 12, 'год', 'года', 'лет');
    U.$('#cPay').textContent = U.price(Math.round(loan * r / (1 - Math.pow(1 + r, -t))));
  };
  U.$$('input', root).forEach(i => i.addEventListener('input', f)); f();
}

// ---------- Хоккей: приглашение на матч ----------
function initHockey(root) {
  const m = HOCKEY.next, when = new Date(m.date);
  root.innerHTML = `
    <div class="hk__league">${HOCKEY.league}</div>
    <div class="hk__vs">
      <div class="hk__team"><div class="hk__badge hk__badge--home">СФ</div><b>${m.home}</b><small>${m.homeCity}</small></div>
      <div class="hk__mid">VS</div>
      <div class="hk__team"><div class="hk__badge hk__badge--us"><img src="../shared/logo-mark.svg" alt="Элвис Авто"></div><b>${m.away}</b><small>${m.awayCity}</small></div>
    </div>
    <div class="hk__info"><div><small>Когда</small><b>${m.dateText}</b></div><div><small>Где</small><b>${m.arena}</b><span>${m.arenaCity}</span></div></div>
    <div class="hk__timer" id="hkTimer"></div>
    <div class="hk__btns"><button class="btn" id="hkIcs">Добавить в календарь</button><a class="btn btn--ghost" target="_blank" rel="noopener" href="https://yandex.ru/maps/?text=${encodeURIComponent(m.arena + ' ' + m.arenaCity)}">Как добраться</a></div>
    <p class="hk__text">${HOCKEY.text}</p>`;
  const t = U.$('#hkTimer');
  const tick = () => {
    const s = Math.max(0, (when - Date.now()) / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), mi = Math.floor(s % 3600 / 60), se = Math.floor(s % 60);
    t.innerHTML = s > 0 ? [[d, 'дн'], [h, 'ч'], [mi, 'мин'], [se, 'сек']].map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><small>${l}</small></div>`).join('') : '<p>Матч уже прошёл — следите за новым расписанием!</p>';
  };
  tick(); setInterval(tick, 1000);
  U.$('#hkIcs').onclick = () => {
    const z = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ElvisAvto//HK//RU', 'BEGIN:VEVENT', 'UID:hk-' + when.getTime() + '@elvis-avto.ru', 'DTSTAMP:' + z(new Date()),
      'DTSTART:' + z(when), 'DTEND:' + z(new Date(+when + 2 * 3600e3)), `SUMMARY:Хоккей: ${m.home} — ${m.away}`, `LOCATION:${m.arena}, ${m.arenaCity}`,
      'DESCRIPTION:Приходите поддержать ХК «Элвис-Авто»!', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'hockey-elvis-avto.ics'; a.click();
  };
}

// ---------- Отзывы, FAQ, новости, вакансия, контакты ----------
function initReviews(root) {
  root.innerHTML = REVIEWS.map(r => `<figure class="rev"><div class="rev__stars">★★★★★</div><blockquote>${U.esc(r.text)}</blockquote>
    <figcaption><b>${U.esc(r.name)}</b>${r.date ? `<span>${r.date}</span>` : ''}</figcaption></figure>`).join('');
  // На компьютере: стрелки и перетаскивание мышью (на телефоне листается пальцем)
  const nav = document.createElement('div'); nav.className = 'revs-nav';
  nav.innerHTML = '<button type="button" aria-label="Предыдущий отзыв">‹</button><button type="button" aria-label="Следующий отзыв">›</button>';
  root.after(nav);
  const [prev, next] = nav.children, step = () => (root.firstElementChild ? root.firstElementChild.offsetWidth : 300) + 16;
  prev.onclick = () => root.scrollBy({ left: -step(), behavior: 'smooth' });
  next.onclick = () => root.scrollBy({ left: step(), behavior: 'smooth' });
  const upd = () => { prev.disabled = root.scrollLeft < 5; next.disabled = root.scrollLeft + root.clientWidth > root.scrollWidth - 5; };
  root.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  let x0 = null, s0 = 0;
  root.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; x0 = e.clientX; s0 = root.scrollLeft; root.classList.add('drag'); e.preventDefault(); });
  addEventListener('pointermove', e => { if (x0 !== null) root.scrollLeft = s0 - (e.clientX - x0); });
  addEventListener('pointerup', () => { if (x0 === null) return; x0 = null; root.classList.remove('drag'); });
}
function initFaq(root) {
  root.innerHTML = FAQ.map(([q, a]) => `<details class="faq"><summary>${U.esc(q)}</summary><p>${U.esc(a)}</p></details>`).join('');
}
function initNews(root) {
  root.innerHTML = NEWS.map(n => `<details class="news"><summary><img src="${newsImg(n.img)}" alt="" loading="lazy" decoding="async"><span><small>${n.date}</small><b>${U.esc(n.title)}</b></span></summary><p>${U.esc(n.text)}</p></details>`).join('');
}
function initVacancy(root) {
  const v = VACANCY, ul = a => '<ul>' + a.map(x => `<li>${U.esc(x)}</li>`).join('') + '</ul>';
  root.innerHTML = `<div class="vac__head"><h3>${v.title}</h3><b>${v.salary}</b></div><p>${v.lead}</p>
    <div class="vac__cols"><div><h4>Обязанности</h4>${ul(v.duties)}</div><div><h4>Требования</h4>${ul(v.reqs)}</div><div><h4>Условия</h4>${ul(v.terms)}</div></div>
    <a class="btn" href="#contact" data-msg="Отклик на вакансию: ${v.title}">Отправить анкету</a>`;
}
function initContacts(root) {
  root.innerHTML = `${SITE.salons.map(s => `<div class="salon"><h4>${s.name}</h4><p>${s.addr}</p><a href="${s.map}" target="_blank" rel="noopener">Открыть на карте →</a></div>`).join('')}
    <div class="salon"><h4>Телефоны</h4><p><a href="${U.tel(SITE.phone)}">${SITE.phone}</a> — единый</p>
    <p>Менеджеры: ${SITE.managers.map(p => `<a href="${U.tel(p)}">${p}</a>`).join(', ')}</p>
    <p>Кредитный отдел: <a href="${U.tel(SITE.credit)}">${SITE.credit}</a></p>
    <p>Выкуп: ${SITE.buyoutPhones.map(p => `<a href="${U.tel(p)}">${p}</a>`).join(', ')}</p>
    <p><a href="mailto:${SITE.email}">${SITE.email}</a> · <a href="${SITE.vk}" target="_blank" rel="noopener">ВКонтакте</a></p></div>`;
}

// ---------- Формы (демо: без отправки, подключим к почте/Telegram при запуске) ----------
function initForms() {
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-msg]'); if (!a) return;
    const f = U.$('#contact [name=msg]'); if (f) f.value = a.dataset.msg;
  });
  U.$$('form.lead-form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    U.$('.lead__ok', f).textContent = 'Спасибо! Менеджер перезвонит вам в ближайшее время.';
    f.reset();
  }));
}

function initAll() {
  const run = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };
  run('catalog-root', initCatalog); run('calc-root', initCalc); run('hockey-root', initHockey);
  run('reviews-root', initReviews); run('faq-root', initFaq); run('news-root', initNews);
  run('vacancy-root', initVacancy); run('contacts-root', initContacts);
  initCarSheet(); initForms();
  U.$$('[data-cars-count]').forEach(e => e.textContent = CARS.length);
  U.$$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
}
