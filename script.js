/* =========================================================
   Totalplay Instalación Express — «La luz que llega hoy»
   JS propio, sin librerías. Todo lo visual tiene respaldo.
   ========================================================= */
'use strict';

/* ---------- WhatsApp: UNA sola constante ---------- */
const WHATSAPP_NUMERO = '524446503480';
const waLink = (texto) => 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(texto || '');

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const isDesk = () => innerWidth >= 900;
const isSmall = () => innerWidth < 768;
const root = document.documentElement;
const SPECTRO = ['#E5177E', '#7A3FD1', '#19AEEF', '#7ED321', '#FFC400', '#F7931E', '#E8344E'];

/* ---------- Bucle maestro (un solo rAF) ---------- */
const ticks = [];
let vel = 0;
let lastY = window.scrollY;
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
  lastT = now;
  const y = window.scrollY;
  vel = lerp(vel, (y - lastY) / dt, 0.12);
  lastY = y;
  const t = now / 1000;
  for (let i = 0; i < ticks.length; i++) {
    try { ticks[i](t, dt); } catch (e) { /* un efecto roto no detiene el resto */ }
  }
  requestAnimationFrame(loop);
}

/* Observa visibilidad de un elemento y devuelve un objeto {v} */
function watch(el, opts) {
  const st = { v: true };
  if (!el || !('IntersectionObserver' in window)) return st;
  st.v = false;
  new IntersectionObserver((es) => { st.v = es[0].isIntersecting; }, opts || { rootMargin: '120px' }).observe(el);
  return st;
}

/* ---------- Cargador ---------- */
(function cargador() {
  const el = $('#cargador');
  const n = $('#cg-n');
  const t0 = performance.now();
  function paso(now) {
    const u = clamp((now - t0) / 1700);
    if (n) n.textContent = Math.round(10000 * easeOut(u)).toLocaleString('es-MX');
    if (u < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
  setTimeout(() => root.classList.add('listo'), 1900);
  setTimeout(() => { if (el) el.style.display = 'none'; }, 2450);
})();

/* ---------- Enlaces de WhatsApp ---------- */
(function whatsapp() {
  if (!WHATSAPP_NUMERO) {
    const f = $('#wafloat'); if (f) f.hidden = true;
    $$('.hdr__wa,.btn--wa').forEach((e) => { e.hidden = true; });
    const b = $('#form-btn'); if (b) b.hidden = true;
    return;
  }
  $$('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
})();

/* ---------- Año ---------- */
const anio = $('#anio'); if (anio) anio.textContent = new Date().getFullYear();

/* =========================================================
   Revelado al scroll (con respaldos)
   ========================================================= */
const revelables = $$('[data-reveal]');
const controladoPorStage = (el) => isDesk() && el.hasAttribute('data-at');
function revelar(el) { el.classList.add('is-in'); }
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting && !controladoPorStage(e.target)) { revelar(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revelables.forEach((el) => io.observe(el));
}
function revelarPorGeometria() {
  const vh = innerHeight;
  revelables.forEach((el) => {
    if (el.classList.contains('is-in') || controladoPorStage(el)) return;
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.97 && r.bottom > 0) revelar(el);
  });
}
let geoPend = false;
function pedirGeo() {
  if (geoPend) return; geoPend = true;
  requestAnimationFrame(() => { geoPend = false; revelarPorGeometria(); });
}
addEventListener('scroll', pedirGeo, { passive: true });
addEventListener('resize', pedirGeo);
addEventListener('load', () => setTimeout(revelarPorGeometria, 2000));
setTimeout(revelarPorGeometria, 2600);
setTimeout(() => {
  if (window.scrollY > 5) return;
  const mitad = document.documentElement.scrollHeight / 2;
  revelables.forEach((el) => {
    if (controladoPorStage(el)) return;
    const r = el.getBoundingClientRect();
    if (r.top + window.scrollY < mitad) revelar(el);
  });
}, 4000);
if (reduced) revelables.forEach(revelar);

/* =========================================================
   Encabezado, progreso, riel y menú
   ========================================================= */
const hdr = $('#hdr');
const menu = $('#menu');
const burger = $('#burger');
const prog = $('#prog');
const railFill = $('#rail-fill');
let prevY = window.scrollY;

function cerrarMenu() {
  if (!menu) return;
  menu.classList.remove('abierto');
  menu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Abrir menú');
  root.style.overflow = '';
}
if (burger && menu) {
  burger.addEventListener('click', () => {
    const abrir = !menu.classList.contains('abierto');
    if (!abrir) { cerrarMenu(); return; }
    menu.classList.add('abierto');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar menú');
    root.style.overflow = 'hidden';
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', cerrarMenu));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });
}

// Riel de fibra
(function riel() {
  const ul = $('#rail-dots'); if (!ul) return;
  $$('.hdr__nav a').forEach((a) => {
    const li = document.createElement('li');
    const l = document.createElement('a');
    l.href = a.getAttribute('href'); l.dataset.nav = a.dataset.nav; l.tabIndex = -1;
    l.innerHTML = '<span>' + a.textContent + '</span>';
    li.appendChild(l); ul.appendChild(li);
  });
})();

function onScrollGlobal() {
  const y = window.scrollY;
  const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const p = clamp(y / total);
  if (prog) prog.style.setProperty('--sp', p.toFixed(4));
  if (railFill) railFill.style.setProperty('--rp', p.toFixed(4));
  const dy = y - prevY;
  if (hdr && !(menu && menu.classList.contains('abierto'))) {
    if (y > 240 && dy > 6) hdr.classList.add('oculto');
    else if (dy < -4 || y < 120) hdr.classList.remove('oculto');
  }
  prevY = y;
}

// Sección activa
(function activa() {
  if (!('IntersectionObserver' in window)) return;
  const links = $$('[data-nav]');
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach((l) => {
        const on = l.dataset.nav === id;
        if (l.closest('.hdr__nav')) l.classList.toggle('is-active', on);
        else l.classList.toggle('on', on);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-section]').forEach((s) => io.observe(s));
})();

/* =========================================================
   Contadores
   ========================================================= */
(function contadores() {
  const els = $$('[data-count]');
  if (reduced || !('IntersectionObserver' in window)) return;
  function fmt(el, v) {
    el.textContent = (el.dataset.prefix || '') + Math.round(v).toLocaleString('es-MX') + (el.dataset.suffix || '');
  }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const fin = parseFloat(el.dataset.count);
      const t0 = performance.now();
      const dur = 1700;
      (function paso(now) {
        const u = clamp((now - t0) / dur);
        fmt(el, fin * easeOut(u));
        if (u < 1) requestAnimationFrame(paso); else fmt(el, fin);
      })(t0);
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
})();

/* =========================================================
   Confeti de triángulos «play»
   ========================================================= */
function confeti(x, y, n) {
  if (reduced) return;
  const cont = $('#confeti'); if (!cont) return;
  n = n || 20;
  for (let i = 0; i < n; i++) {
    const t = document.createElement('i');
    t.style.left = x + 'px'; t.style.top = y + 'px';
    t.style.background = SPECTRO[i % SPECTRO.length];
    cont.appendChild(t);
    const ang = Math.random() * Math.PI * 2;
    const d = 80 + Math.random() * 220;
    const dx = Math.cos(ang) * d;
    const dy = Math.sin(ang) * d - 60;
    const rot = (Math.random() - 0.5) * 900;
    const a = t.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx + 'px,' + (dy + 160) + 'px) rotate(' + rot + 'deg) scale(.6)', opacity: 0 }
    ], { duration: 1100 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    a.onfinish = () => t.remove();
  }
}

/* =========================================================
   Canvas: fibras de luz (hero y contacto)
   ========================================================= */
const mouse = { x: 0, y: 0 };
addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

function fibras(cv, opt) {
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const RGB = [[229, 23, 126], [122, 63, 209], [25, 174, 239], [126, 211, 33], [255, 196, 0], [247, 147, 30], [232, 52, 78]];
  const vis = watch(cv, { rootMargin: '60px' });
  let w = 0, h = 0, R = [], P = [];
  let mx = 0, my = 0;
  function build() {
    const peq = innerWidth < 768;
    const n = peq ? Math.round(opt.rib * 0.58) : opt.rib;
    R = [];
    for (let i = 0; i < n; i++) {
      const c = RGB[i % RGB.length];
      const pk = [];
      const np = 2 + (i % 2);
      for (let k = 0; k < np; k++) pk.push({ x: Math.random() * (w + 200), v: 80 + Math.random() * 180 });
      R.push({
        base: h * (0.1 + 0.8 * (n === 1 ? 0.5 : i / (n - 1))),
        amp: 40 + Math.random() * 80,
        k: (1 + Math.random() * 1.6) * Math.PI * 2 / Math.max(w, 320),
        ph: Math.random() * 6.28, spd: 0.2 + Math.random() * 0.4,
        c, pk, dir: i % 2 ? 1 : -1
      });
    }
    P = [];
    const pn = peq ? Math.round(opt.part * 0.5) : opt.part;
    for (let i = 0; i < pn; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vy: 8 + Math.random() * 24, r: 0.6 + Math.random() * 1.3, ph: Math.random() * 6.28 });
  }
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    w = cv.clientWidth; h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduced) draw(2, 0);
  }
  const yAt = (r, x, t) => r.base + r.amp * Math.sin(r.k * x + r.ph + t * r.spd) + r.amp * 0.35 * Math.sin(2.3 * r.k * x - r.ph * 1.7 + t * r.spd * 0.6) + my * 18 * r.dir;
  function draw(t, dt) {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const boost = opt.boost ? 1 + Math.min(3, Math.abs(vel) / 700) : 1;
    for (let i = 0; i < R.length; i++) {
      const r = R[i];
      const ox = mx * 20 * r.dir;
      const path = new Path2D();
      for (let x = -20; x <= w + 20; x += 14) {
        const y = yAt(r, x - ox, t);
        if (x === -20) path.moveTo(x, y); else path.lineTo(x, y);
      }
      const col = r.c.join(',');
      ctx.strokeStyle = 'rgba(' + col + ',.06)'; ctx.lineWidth = 9; ctx.stroke(path);
      ctx.strokeStyle = 'rgba(' + col + ',.24)'; ctx.lineWidth = 1.4; ctx.stroke(path);
      for (let k = 0; k < r.pk.length; k++) {
        const p = r.pk[k];
        p.x += p.v * boost * dt;
        if (p.x > w + 100) p.x = -100;
        const len = 90;
        const x0 = p.x - len;
        const g = ctx.createLinearGradient(x0, 0, p.x, 0);
        g.addColorStop(0, 'rgba(' + col + ',0)');
        g.addColorStop(1, 'rgba(' + col + ',.9)');
        ctx.strokeStyle = g; ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let s = 0; s <= 9; s++) {
          const xx = x0 + (len * s) / 9;
          const yy = yAt(r, xx - ox, t);
          if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        const hy = yAt(r, p.x - ox, t);
        ctx.fillStyle = 'rgba(' + col + ',.22)'; ctx.beginPath(); ctx.arc(p.x, hy, 9, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(p.x, hy, 2.2, 0, 6.283); ctx.fill();
      }
    }
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      p.y -= p.vy * dt;
      if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
      const a = 0.12 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.6 + p.ph));
      ctx.fillStyle = 'rgba(220,210,255,' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  size();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
  if (reduced) return;
  ticks.push((t, dt) => {
    if (!vis.v || document.hidden || !w) return;
    mx = lerp(mx, mouse.x, 0.05); my = lerp(my, mouse.y, 0.05);
    draw(t, dt);
  });
}
fibras($('#cv-hero'), { rib: 14, part: 70, boost: true });
fibras($('#cv-cont'), { rib: 6, part: 0, boost: false });

/* =========================================================
   Velocímetro (SVG generado)
   ========================================================= */
function mkGauge(host) {
  if (!host) return null;
  const id = 'gg' + Math.random().toString(36).slice(2, 7);
  const L = (2 * Math.PI * 120 * 240) / 360;
  let tk = '';
  for (let i = 0; i < 48; i++) {
    const a = ((-120 + (240 * i) / 47) * Math.PI) / 180;
    tk += '<line class="tk" x1="' + (160 + Math.sin(a) * 96).toFixed(2) + '" y1="' + (150 - Math.cos(a) * 96).toFixed(2) + '" x2="' + (160 + Math.sin(a) * 106).toFixed(2) + '" y2="' + (150 - Math.cos(a) * 106).toFixed(2) + '"/>';
  }
  const lab = (t, txt) => {
    const a = ((-120 + 240 * t) * Math.PI) / 180;
    return '<text class="lb" x="' + (160 + Math.sin(a) * 136).toFixed(1) + '" y="' + (154 - Math.cos(a) * 136).toFixed(1) + '">' + txt + '</text>';
  };
  const arco = 'M56.08 210A120 120 0 1 1 263.92 210';
  host.innerHTML =
    '<svg viewBox="0 0 320 260" aria-hidden="true" focusable="false"><defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="56" y1="0" x2="264" y2="0">' +
    '<stop offset="0" stop-color="#E5177E"/><stop offset=".2" stop-color="#7A3FD1"/><stop offset=".4" stop-color="#19AEEF"/><stop offset=".58" stop-color="#7ED321"/><stop offset=".74" stop-color="#FFC400"/><stop offset=".86" stop-color="#F7931E"/><stop offset="1" stop-color="#E8344E"/></linearGradient></defs>' +
    '<path d="' + arco + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="10" stroke-linecap="round"/>' +
    '<path class="gp" d="' + arco + '" fill="none" stroke="url(#' + id + ')" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + L.toFixed(2) + '" stroke-dashoffset="' + L.toFixed(2) + '"/>' +
    tk + lab(0, '100') + lab(0.5, '1,000') + lab(1, '10,000') +
    '<g class="gtr"><line x1="160" y1="150" x2="160" y2="70" stroke="rgba(255,255,255,.22)" stroke-width="8" stroke-linecap="round"/></g>' +
    '<g class="gn"><line x1="160" y1="150" x2="160" y2="62" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="150" r="9" fill="#fff"/><circle cx="160" cy="150" r="4" fill="#D90B6E"/></g></svg>' +
    '<div class="gauge__num"><span class="gv">100</span><small>MBPS</small></div>';
  const gp = $('.gp', host), gn = $('.gn', host), gtr = $('.gtr', host), gv = $('.gv', host);
  const ticksEl = $$('.tk', host);
  let lastN = -1, ta = 0;
  return {
    set(t) {
      t = clamp(t);
      ta = lerp(ta, t, 0.1);
      gp.style.strokeDashoffset = (L * (1 - t)).toFixed(2);
      const ang = -120 + 240 * t;
      gn.setAttribute('transform', 'rotate(' + ang.toFixed(2) + ' 160 150)');
      gtr.setAttribute('transform', 'rotate(' + (-120 + 240 * ta).toFixed(2) + ' 160 150)');
      const n = Math.floor(t * 47 + 1e-6) + 1;
      if (n !== lastN) {
        lastN = n;
        ticksEl.forEach((e, i) => e.classList.toggle('on', i < n));
      }
      const m = 100 * Math.pow(10, 2 * t);
      const v = m < 1000 ? Math.round(m / 10) * 10 : Math.round(m / 100) * 100;
      gv.textContent = v.toLocaleString('es-MX');
    }
  };
}

/* Gauge del hero: aguja que oscila sin parar */
(function heroGauge() {
  const g = mkGauge($('[data-gauge="hero"]'));
  if (!g) return;
  const vis = watch($('#cabina'));
  const barras = $$('.barra');
  if (reduced) { g.set(0.62); barras.forEach((b) => b.style.setProperty('--bar', '.62')); return; }
  g.set(0.08);
  ticks.push((t) => {
    if (!vis.v || document.hidden) return;
    const u0 = (t % 7) / 7;
    const u = u0 < 0.5 ? u0 * 2 : 2 - u0 * 2;
    const v = 0.08 + 0.92 * easeIO(u);
    g.set(v);
    barras.forEach((b) => b.style.setProperty('--bar', (0.12 + 0.88 * v).toFixed(3)));
  });
})();

/* Inclinación 3D de la cabina */
(function cabina() {
  const cab = $('#cabina'); if (!cab || reduced) return;
  const vis = watch($('#cabwrap'));
  let rx = 0, ry = 0;
  ticks.push((t) => {
    if (!vis.v || !isDesk() && false) return;
    let tx, ty;
    if (finePointer && isDesk()) { ty = mouse.x * 8; tx = -mouse.y * 8; }
    else { ty = 6 * Math.sin((t * Math.PI * 2) / 9); tx = 3 * Math.sin((t * Math.PI * 2) / 11 + 1); }
    rx = lerp(rx, tx, 0.07); ry = lerp(ry, ty, 0.07);
    cab.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
  });
})();

/* =========================================================
   Cinta (marquee) con velocidad de scroll
   ========================================================= */
(function marquee() {
  const rows = $$('[data-marq]');
  rows.forEach((row) => {
    const track = $('.marq__track', row);
    const g = track && track.firstElementChild;
    if (!g) return;
    const c = g.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    track.appendChild(c);
  });
  if (reduced) return;
  const S = rows.map((row) => ({
    row, track: $('.marq__track', row), dir: parseFloat(row.dataset.marq) || 1, pos: 0, gw: 0, hover: false, vis: watch(row)
  }));
  S.forEach((s) => {
    s.row.addEventListener('pointerenter', () => { s.hover = true; });
    s.row.addEventListener('pointerleave', () => { s.hover = false; });
  });
  let sk = 0;
  ticks.push((t, dt) => {
    sk = lerp(sk, clamp(-vel * 0.006, -6, 6), 0.1);
    S.forEach((s) => {
      if (!s.vis.v) return;
      s.gw = s.track.firstElementChild.offsetWidth;
      if (!s.gw) return;
      if (s.dir > 0 && s.pos === 0) s.pos = 0;
      const sp = s.hover ? 0 : 60 + Math.abs(vel) * 0.22;
      s.pos -= s.dir * sp * dt;
      if (s.pos <= -s.gw) s.pos += s.gw;
      if (s.pos > 0) s.pos -= s.gw;
      s.track.style.transform = 'translate3d(' + s.pos.toFixed(1) + 'px,0,0) skewX(' + (sk * s.dir).toFixed(2) + 'deg)';
    });
  });
})();

/* =========================================================
   Escenarios con scroll (sticky) — instalación, Diana, promos
   ========================================================= */
const inst = $('#instalacion');
const diana = $('#diana');
const promos = $('#promos');

// --- Mapa de fibra
const ruta = $('#ruta');
const paquete = $('#paquete');
const pasos = $$('.paso');
let rutaL = 0;
if (ruta && ruta.getTotalLength) {
  rutaL = ruta.getTotalLength();
  ruta.style.strokeDasharray = rutaL;
  ruta.style.strokeDashoffset = rutaL;
}
let confetiLanzado = false;

function stageP(el) {
  const r = el.getBoundingClientRect();
  const vh = innerHeight;
  if (isDesk()) {
    const span = r.height - vh;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  return clamp((vh - r.top) / (vh + r.height));
}

function actualizarInstalacion() {
  if (!inst) return;
  const p = stageP(inst);
  inst.style.setProperty('--p', p.toFixed(4));
  const cta = $('.inst__cta', inst);
  const pasosOl = $('#pasos');
  if (isDesk()) {
    const q = clamp((p - 0.05) / 0.8);
    if (rutaL) {
      ruta.style.strokeDashoffset = ((1 - q) * rutaL).toFixed(1);
      const pt = ruta.getPointAtLength(q * rutaL);
      paquete.setAttribute('cx', pt.x.toFixed(1)); paquete.setAttribute('cy', pt.y.toFixed(1));
    }
    const um = [0, 0.33, 0.66, 0.995];
    pasos.forEach((el, i) => el.classList.toggle('on', q >= um[i] - 0.001 && (i > 0 || p > 0.005 || true)));
    if (pasos[3] && q >= 0.995 && !confetiLanzado) {
      confetiLanzado = true;
      const r = pasos[3].getBoundingClientRect();
      confeti(r.left + r.width / 2, r.top + r.height / 2, 24);
    }
    if (cta) cta.classList.toggle('is-in', p > 0.85);
    if (pasosOl) pasosOl.style.removeProperty('--line');
  } else {
    if (cta) cta.classList.add('is-in');
    if (pasosOl) {
      const r = pasosOl.getBoundingClientRect();
      const lim = innerHeight * 0.66;
      pasosOl.style.setProperty('--line', clamp((lim - r.top) / Math.max(1, r.height)).toFixed(3));
      pasos.forEach((el) => {
        const b = el.getBoundingClientRect();
        el.classList.toggle('on', b.top + 28 < lim);
      });
    }
  }
}

function actualizarDiana() {
  if (!diana) return;
  const p = stageP(diana);
  const portrait = $('#diana-p');
  let pp;
  if (isDesk()) {
    pp = clamp(p * 1.7);
    $$('[data-at]', diana).forEach((el) => el.classList.toggle('is-in', p >= parseFloat(el.dataset.at)));
  } else {
    const fig = portrait ? portrait.parentElement : null;
    if (fig) {
      const r = fig.getBoundingClientRect();
      pp = clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.6));
    } else pp = 1;
  }
  diana.style.setProperty('--pp', pp.toFixed(4));
  diana.style.setProperty('--p', p.toFixed(4));
}

// --- Galería horizontal de promos
const pTrack = $('#promos-track');
const cards = $$('[data-promo]');
const dots3 = $$('#dots3 i');
function medirPromos() {
  if (!promos || !pTrack) return;
  if (isDesk()) {
    const tw = pTrack.scrollWidth;
    const recorrido = Math.max(0, tw - innerWidth);
    promos.style.setProperty('--h', Math.round(recorrido + innerHeight * 1.05) + 'px');
  } else {
    promos.style.removeProperty('--h');
    pTrack.style.transform = '';
    cards.forEach((c) => { c.style.transform = ''; c.classList.remove('centro-card'); });
  }
}
function actualizarPromos() {
  if (!promos || !pTrack || !isDesk()) return;
  const p = stageP(promos);
  const tw = pTrack.scrollWidth;
  const recorrido = Math.max(0, tw - innerWidth);
  pTrack.style.transform = 'translate3d(' + (-p * recorrido).toFixed(1) + 'px,0,0)';
  let best = -1, bd = 9;
  cards.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    const d = clamp(((r.left + r.width / 2) - innerWidth / 2) / (innerWidth / 2), -1, 1);
    c.style.transform = 'perspective(1100px) rotateY(' + (-d * 12).toFixed(2) + 'deg)';
    if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
  });
  cards.forEach((c, i) => c.classList.toggle('centro-card', i === best && bd < 0.35));
  const idx = Math.round(p * (dots3.length - 1));
  dots3.forEach((d, i) => d.classList.toggle('on', i === idx));
}

// --- Hero: scroll
const hero = $('#inicio');
const heroInner = $('#hero-inner');
const heroCv = $('#cv-hero');
function actualizarHero() {
  if (!hero || !heroInner) return;
  const h = hero.offsetHeight || innerHeight;
  const y = window.scrollY;
  if (y > h * 1.2) return;
  const p = clamp(y / h);
  heroInner.style.transform = 'translate3d(0,' + (-12 * p).toFixed(2) + '%,0)';
  heroInner.style.opacity = (1 - 0.8 * p).toFixed(3);
  if (heroCv) heroCv.style.transform = 'scale(' + (1 + 0.15 * p).toFixed(3) + ')';
}

// --- Pie: texto gigante
const gig = $('#gigante');
function actualizarGigante() {
  if (!gig) return;
  const r = gig.getBoundingClientRect();
  const pf = clamp((innerHeight - r.top) / (innerHeight * 0.75));
  const o = $('.gigante__o', gig);
  const exceso = Math.max(0, (o ? o.offsetWidth : 0) - gig.clientWidth);
  gig.style.setProperty('--pf', pf.toFixed(3));
  gig.style.setProperty('--gx', (-exceso * pf).toFixed(1) + 'px');
}

let dirty = true;
let ultimoY = -1;
addEventListener('resize', () => { dirty = true; medirPromos(); });
addEventListener('load', () => { medirPromos(); dirty = true; });
ticks.push(() => {
  const y = window.scrollY;
  if (y === ultimoY && !dirty) return;
  ultimoY = y; dirty = false;
  onScrollGlobal();
  actualizarHero();
  actualizarInstalacion();
  actualizarDiana();
  actualizarPromos();
  actualizarGigante();
});
medirPromos();

/* =========================================================
   Simulador de velocidad (warp + control + carriles)
   ========================================================= */
(function velocidad() {
  const sec = $('#velocidad'); if (!sec) return;
  const rango = $('#rango');
  const out = $('#rango-out');
  const big = mkGauge($('[data-gauge="big"]'));
  const carriles = $$('.carril');
  const cta = $('#vel-cta');
  const visSec = watch(sec, { rootMargin: '0px' });
  let tc = 0;          // t suavizado del gauge y del warp
  let tObj = 0;        // t objetivo
  let touched = false, demo = false, demoT0 = 0, demoDone = false;

  function fmtT(s) {
    if (s < 0.01) return '< 0.01 s';
    if (s < 10) return s.toFixed(s < 1 ? 2 : 1) + ' s';
    if (s < 60) return Math.round(s) + ' s';
    if (s < 3600) { const m = Math.floor(s / 60); const r = Math.round(s % 60); return m + ' min' + (r ? ' ' + r + ' s' : ''); }
    const h = Math.floor(s / 3600); const m = Math.round((s % 3600) / 60);
    return h + ' h' + (m ? ' ' + m + ' min' : '');
  }
  function aplicar(v) {
    tObj = v / 100;
    const raw = 100 * Math.pow(10, 2 * tObj);
    let mbps = raw < 1000 ? Math.round(raw / 10) * 10 : Math.round(raw / 100) * 100;
    mbps = Math.max(100, mbps);
    const txt = mbps.toLocaleString('es-MX');
    if (out) out.textContent = txt + ' Mbps';
    if (rango) { rango.setAttribute('aria-valuetext', txt + ' megas'); }
    carriles.forEach((c) => {
      const mb = parseFloat(c.dataset.mb);
      const s = (mb * 8) / mbps;
      const w = 0.15 + 0.85 * ((Math.log10(100 / mbps) + 2) / 2);
      $('[data-v]', c).textContent = fmtT(s);
      c.style.setProperty('--w', w.toFixed(3));
      c.style.setProperty('--dur', (0.5 + 3.5 * ((w - 0.15) / 0.85)).toFixed(2) + 's');
    });
    if (cta && WHATSAPP_NUMERO) cta.href = waLink('Hola Diana, quiero esta velocidad en mi casa: alrededor de ' + txt + ' megas. Vi su página Totalplay Instalación Express.');
  }
  function tocar() { touched = true; demo = false; }
  if (rango) {
    rango.addEventListener('input', () => { tocar(); aplicar(parseFloat(rango.value)); });
    rango.addEventListener('pointerdown', tocar);
    rango.addEventListener('keydown', tocar);
  }
  aplicar(0);
  if (big) big.set(0);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !touched && !demoDone && !reduced) { demo = true; demoT0 = performance.now(); demoDone = true; }
    }, { threshold: 0.35 }).observe(sec);
  }

  // Estrellas warp
  const cv = $('#cv-warp');
  const ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  let w = 0, h = 0, S = [];
  function size() {
    if (!cv || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = innerWidth < 768 ? 80 : 160;
    const maxR = Math.hypot(w, h) / 2;
    S = [];
    for (let i = 0; i < n; i++) S.push({ a: Math.random() * 6.283, d: Math.random() * maxR, s: 0.4 + Math.random() * 0.8 });
  }
  size();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
  function dibujar(dt) {
    if (!ctx || !w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.42;
    const maxR = Math.hypot(w, h) / 2;
    const k = tc * tc;
    ctx.lineCap = 'round';
    for (let i = 0; i < S.length; i++) {
      const s = S[i];
      const f = s.d / maxR;
      s.d += (20 + k * 1500) * s.s * dt * (0.25 + f * 1.5);
      if (s.d > maxR) { s.d = Math.random() * maxR * 0.12; s.a = Math.random() * 6.283; }
      const len = 2 + k * 110 * f;
      const ca = Math.cos(s.a), sa = Math.sin(s.a);
      const hue = (s.a / 6.283) * 360 + 300;
      ctx.strokeStyle = 'hsla(' + (hue % 360).toFixed(0) + ',90%,70%,' + (0.15 + 0.85 * f).toFixed(2) + ')';
      ctx.lineWidth = 0.8 + f * 1.8;
      ctx.beginPath();
      ctx.moveTo(cx + ca * Math.max(0, s.d - len), cy + sa * Math.max(0, s.d - len));
      ctx.lineTo(cx + ca * s.d, cy + sa * s.d);
      ctx.stroke();
    }
  }
  if (reduced) { tc = 0.4; if (big) big.set(0.4); dibujar(0.5); }
  ticks.push((t, dt) => {
    if (demo && rango) {
      const u = (performance.now() - demoT0) / 14000;
      if (u >= 1) { demo = false; rango.value = 0; aplicar(0); }
      else {
        const tri = u < 0.5 ? u * 2 : 2 - u * 2;
        const v = 100 * easeIO(tri);
        rango.value = v.toFixed(1); aplicar(v);
      }
    }
    if (!visSec.v || document.hidden) return;
    tc = lerp(tc, tObj, 0.12);
    if (big && !reduced) big.set(tc);
    if (!reduced) dibujar(dt);
  });
})();

/* =========================================================
   Comparador deslizable
   ========================================================= */
(function comparador() {
  const comp = $('#comp'); const h = $('#comp-h');
  if (!comp || !h) return;
  const vis = watch(comp);
  let touched = false, drag = false;
  function set(x) {
    x = clamp(x, 3, 97);
    comp.style.setProperty('--x', x.toFixed(2) + '%');
    h.setAttribute('aria-valuenow', Math.round(x));
  }
  function desdeEvento(e) {
    const r = comp.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  }
  comp.addEventListener('pointerdown', (e) => {
    touched = true; drag = true;
    try { comp.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    desdeEvento(e);
  });
  comp.addEventListener('pointermove', (e) => { if (drag) desdeEvento(e); });
  const fin = () => { drag = false; };
  comp.addEventListener('pointerup', fin);
  comp.addEventListener('pointercancel', fin);
  h.addEventListener('keydown', (e) => {
    const cur = parseFloat(h.getAttribute('aria-valuenow')) || 50;
    let n = null;
    if (e.key === 'ArrowLeft') n = cur - 5;
    else if (e.key === 'ArrowRight') n = cur + 5;
    else if (e.key === 'Home') n = 3;
    else if (e.key === 'End') n = 97;
    if (n !== null) { e.preventDefault(); touched = true; set(n); }
  });
  set(50);
  if (reduced) return;
  ticks.push((t) => {
    if (touched || !vis.v) return;
    set(50 + 25 * Math.sin(t * 0.6));
  });
})();

/* =========================================================
   Paneles Hogar / Negocio
   ========================================================= */
(function duo() {
  const panels = $$('[data-panel]');
  if (!panels.length) return;
  function activar(p) {
    panels.forEach((x) => {
      const on = x === p;
      x.classList.toggle('is-active', on);
      const b = $('.panel__tab', x); if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }
  panels.forEach((p) => {
    const tab = $('.panel__tab', p);
    tab.addEventListener('click', () => activar(p));
    tab.addEventListener('focus', () => activar(p));
    p.addEventListener('pointerenter', (e) => { if (finePointer && isDesk() && e.pointerType === 'mouse') activar(p); });
  });
})();

/* =========================================================
   Bento: foco de luz + inclinación 3D
   ========================================================= */
(function bento() {
  if (!finePointer) return;
  $$('[data-tilt]').forEach((c) => {
    let off;
    c.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      clearTimeout(off);
      c.classList.add('tilting');
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (!reduced) c.style.transform = 'perspective(900px) rotateX(' + (-(y / r.height - 0.5) * 8).toFixed(2) + 'deg) rotateY(' + ((x / r.width - 0.5) * 8).toFixed(2) + 'deg)';
    });
    c.addEventListener('pointerleave', () => {
      c.style.transform = '';
      off = setTimeout(() => c.classList.remove('tilting'), 320);
    });
  });
})();

/* =========================================================
   FAQ
   ========================================================= */
(function faq() {
  const items = $$('.qa');
  items.forEach((q) => {
    const b = $('button', q);
    b.addEventListener('click', () => {
      const abrir = !q.classList.contains('open');
      items.forEach((o) => { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); });
      if (abrir) { q.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
})();

/* =========================================================
   Visor de promos
   ========================================================= */
(function visor() {
  const dlg = $('#visor'); if (!dlg || typeof dlg.showModal !== 'function') return;
  const img = $('#visor-img');
  $$('[data-zoom]').forEach((b) => {
    b.addEventListener('click', () => {
      const src = $('img', b);
      img.src = src.currentSrc || src.src; img.alt = src.alt;
      dlg.showModal();
    });
  });
  $('#visor-x').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
})();

/* =========================================================
   Formulario → WhatsApp
   ========================================================= */
(function formulario() {
  const form = $('#form'); if (!form) return;
  const nombre = $('#f-nombre'), zona = $('#f-zona');
  const ok = $('#form-ok'), cuerpo = $('#form-in');
  function error(input, id, msg) {
    const e = $('#' + id);
    if (e) e.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    input.parentElement.classList.toggle('bad', !!msg);
  }
  function validar(input, id, msg) {
    const bad = input.value.trim().length < 2;
    error(input, id, bad ? msg : '');
    return !bad;
  }
  nombre.addEventListener('blur', () => validar(nombre, 'e-nombre', 'Dime tu nombre para saber cómo llamarte.'));
  zona.addEventListener('blur', () => validar(zona, 'e-zona', 'Dime tu colonia o zona para revisar cobertura.'));
  nombre.addEventListener('input', () => { if (nombre.value.trim().length >= 2) error(nombre, 'e-nombre', ''); });
  zona.addEventListener('input', () => { if (zona.value.trim().length >= 2) error(zona, 'e-zona', ''); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const a = validar(nombre, 'e-nombre', 'Dime tu nombre para saber cómo llamarte.');
    const b = validar(zona, 'e-zona', 'Dime tu colonia o zona para revisar cobertura.');
    if (!a) { nombre.focus(); return; }
    if (!b) { zona.focus(); return; }
    if (!WHATSAPP_NUMERO) return;
    const tipo = (form.elements.tipo.value || 'mi casa');
    const vel = form.elements.vel.value;
    let msg = form.elements.msg.value.trim();
    if (msg && !/[.!?]$/.test(msg)) msg += '.';
    const texto = 'Hola Diana, soy ' + nombre.value.trim() + '. Quiero mi instalación de Totalplay para ' + tipo + ' en ' + zona.value.trim() + '. Velocidad que me interesa: ' + vel + '.' + (msg ? ' ' + msg : '') + ' Vi su página Totalplay Instalación Express.';
    const url = waLink(texto);
    const a2 = $('#form-ok-a'); if (a2) a2.href = url;
    cuerpo.hidden = true; ok.hidden = false;
    const r = ok.getBoundingClientRect();
    confeti(r.left + r.width / 2, r.top + 40, 20);
    const w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
    setTimeout(() => { ok.hidden = true; cuerpo.hidden = false; form.reset(); }, 9000);
  });
})();

/* =========================================================
   Burbuja del botón flotante
   ========================================================= */
(function burbuja() {
  const b = $('#wa-bub'); const x = $('#wa-bub-x');
  if (!b || !WHATSAPP_NUMERO) return;
  let cerrada = false;
  setTimeout(() => { if (!cerrada) b.hidden = false; }, 6000);
  setTimeout(() => { b.hidden = true; }, 22000);
  if (x) x.addEventListener('click', () => { cerrada = true; b.hidden = true; });
})();

/* ---------- Arranque ---------- */
onScrollGlobal();
requestAnimationFrame(loop);
