// Элвис Авто — общий код всех страниц: шапка, подвал, логотип, появление блоков, счётчики.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmtPrice = n => n ? n.toLocaleString('ru-RU') + ' ₽' : 'по запросу';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const telHref = p => 'tel:' + p.replace(/[^\d+]/g, '').replace(/^8/, '+7');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

const LOGO = `<svg class="logo__svg" viewBox="-7.9 1.0 674.2 133.0" role="img" aria-label="Элвис Авто"><g class="all"><g transform="translate(-17.21 17.20) scale(0.9561)"><g><path d="M24.54 24.54 A36 36 0 1 1 24.54 75.46" fill="none" stroke="#FD0D1B" stroke-width="15"></path><line x1="31.97" y1="31.97" x2="36.92" y2="36.92" stroke="#fff" stroke-width="3" stroke-linecap="round"></line><line x1="45.03" y1="24.99" x2="45.81" y2="28.91" stroke="#fff" stroke-width="2.2" stroke-linecap="round"></line><line x1="59.76" y1="26.44" x2="57.08" y2="32.91" stroke="#fff" stroke-width="3" stroke-linecap="round"></line><line x1="71.2" y1="35.83" x2="67.88" y2="38.06" stroke="#fff" stroke-width="2.2" stroke-linecap="round"></line><line x1="75.5" y1="50" x2="68.5" y2="50" stroke="#fff" stroke-width="3" stroke-linecap="round"></line><line x1="71.2" y1="64.17" x2="67.88" y2="61.94" stroke="#fff" stroke-width="2.2" stroke-linecap="round"></line><line x1="59.76" y1="73.56" x2="57.08" y2="67.09" stroke="#fff" stroke-width="3" stroke-linecap="round"></line><line x1="45.03" y1="75.01" x2="45.81" y2="71.09" stroke="#fff" stroke-width="2.2" stroke-linecap="round"></line><line x1="31.97" y1="68.03" x2="36.92" y2="63.08" stroke="#fff" stroke-width="3" stroke-linecap="round"></line><g class="ndl" transform="rotate(0 50 50)"><path d="M16 50 L50 44.5 L58.8 50 L50 55.5Z" fill="#fff"></path></g><ellipse cx="50" cy="53" rx="12" ry="6" fill="#111"></ellipse><rect x="38" y="47" width="24" height="6" fill="#111"></rect><ellipse cx="50" cy="47" rx="12" ry="6" fill="#3a3a3a" stroke="rgba(255,255,255,.7)" stroke-width="1.2"></ellipse></g></g><text x="74.75121951219512" y="100" font-family="'Russo One'" font-weight="400" font-size="100" fill="#fff">ЛВИС<tspan dx="30" fill="#FD0D1B">АВТО</tspan></text></g></svg>`;
const PAGES = [['catalog.html', 'Каталог'], ['order.html', 'Под заказ'], ['buyout.html', 'Выкуп'], ['credit.html', 'Кредит'], ['hockey.html', 'Хоккей'], ['contacts.html', 'Контакты']];

// ---------- Шапка и подвал ----------
(function chrome() {
  const cur = document.body.dataset.page;
  document.body.insertAdjacentHTML('afterbegin', `<header class="gnav" id="gnav"><div class="wide gnav__in">
    <a class="gnav__logo" href="index.html" aria-label="Элвис Авто — на главную">${LOGO}</a>
    <nav class="gnav__menu">${PAGES.map(([h, t]) => `<a href="${h}"${cur === h ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <a class="gnav__tel" href="${telHref(SITE.phone)}">${SITE.phone}</a>
    <button class="gnav__burger" id="burger" aria-label="Меню"><i></i><i></i></button></div></header>`);
  document.body.insertAdjacentHTML('beforeend', `
  <nav class="dockbar" id="dockbar"><a href="${telHref(SITE.phone)}">Позвонить</a><a href="contacts.html#form">Заявка</a></nav>
  <footer class="gfoot"><div class="wrap">
    <p class="gfoot__note">Демонстрационная версия сайта. Цены и наличие уточняйте у менеджеров. Цена автомобиля соответствует заявленной при любой форме оплаты.</p>
    <div class="gfoot__cols">
      <div><h4>Купить</h4><ul><li><a href="catalog.html">Автомобили в наличии</a></li><li><a href="order.html">Авто под заказ</a></li><li><a href="credit.html">Кредит</a></li></ul></div>
      <div><h4>Продать</h4><ul><li><a href="buyout.html">Срочный выкуп</a></li><li><a href="buyout.html#tradein">Обмен (trade-in)</a></li></ul></div>
      <div><h4>Элвис Авто</h4><ul><li><a href="hockey.html">ХК «Элвис-Авто»</a></li><li><a href="contacts.html#reviews">Отзывы</a></li><li><a href="contacts.html#jobs">Вакансии</a></li></ul></div>
      <div><h4>Контакты</h4><ul>${SITE.salons.map(s => `<li>${s.addr.replace('г. Мурманск, ', '')}</li>`).join('')}<li><a href="${telHref(SITE.phone)}">${SITE.phone}</a></li><li><a href="${SITE.vk}" target="_blank" rel="noopener">ВКонтакте</a></li></ul></div>
    </div>
    <div class="gfoot__bottom"><span>© ${new Date().getFullYear()} Элвис Авто. Мурманск.</span><a href="mailto:${SITE.email}">${SITE.email}</a></div>
  </div></footer><div class="demo-tag">ДЕМО</div>`);
  const nav = $('#gnav');
  $('#burger').onclick = () => { nav.classList.toggle('open'); document.documentElement.classList.toggle('locked', nav.classList.contains('open')); };
  // Нижняя панель на телефоне — появляется, когда первый экран пролистан
  // Цвет шапки = цвет раздела под ней (тёмные: .dark, .hero, .hk; остальные светлые)
  const tone = () => { const x = innerWidth / 2, y = nav.offsetHeight + 2;
    const el = document.elementsFromPoint(x, y).find(e => !e.closest('.gnav')); const sec = el && el.closest('section, footer, [data-tone]');
    nav.classList.toggle('light', !!sec && !sec.matches('.dark, .hero, .hk, [data-tone=dark]')); };
  addEventListener('scroll', tone, { passive: true }); addEventListener('resize', tone); tone(); setTimeout(tone, 300);
  const dock = $('#dockbar'), onS = () => dock.classList.toggle('show', scrollY > innerHeight * .8);
  addEventListener('scroll', onS, { passive: true }); onS();
})();

// ---------- Логотип: стрелка делает «разгон» ----------
function logoRev() {
  const g = $('.gnav .ndl'); if (!g || REDUCE || g._run) return; g._run = 1; const t0 = performance.now();
  (function f(now) { const t = Math.min(1, (now - t0) / 1500), up = t < .45 ? 1 - Math.pow(1 - t / .45, 3) : 1 - (t - .45) / .55,
    wob = t < .5 ? 0 : Math.sin((t - .5) * 30) * 6 * (1 - t);
    g.setAttribute('transform', 'rotate(' + (200 * up + wob).toFixed(2) + ' 50 50)');
    if (t < 1) requestAnimationFrame(f); else { g.setAttribute('transform', 'rotate(0 50 50)'); g._run = 0; } })(t0);
}
$('.gnav__logo').addEventListener('mouseenter', logoRev);
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(logoRev, 500));

// ---------- Появление блоков и счётчики ----------
const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
  if (e.target.dataset.count) countUp(e.target); }), { rootMargin: '0px 0px -12% 0px' });
function watch(root = document) { $$('.rv, [data-count]', root).forEach(el => io.observe(el)); }
function countUp(el) {
  const to = +el.dataset.count, dur = 1600, t0 = performance.now();
  if (REDUCE) { el.textContent = to; return; }
  (function f(now) { const t = Math.min(1, (now - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(f); })(t0);
}
document.addEventListener('DOMContentLoaded', () => watch());
