/* ===== Utilities ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ===== Elements ===== */
const nav = $('.cs-nav');
const menu = $('.cs-menu');
const burger = $('.cs-burger');
const drawer = $('#mobileMenu');

/* ===== On-load navbar + logo reveal ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Navbar reveal
    requestAnimationFrame(() => nav.classList.add('is-ready'));

    // Logo sequence
    const logo = document.querySelector('.cs-logo');
    if (logo) {
        setTimeout(() => logo.classList.add('logo-ready'), 80);
        setTimeout(() => logo.classList.add('logo-reveal'), 150);   // left-to-right mask (slow)
        setTimeout(() => logo.classList.add('logo-underline'), 800);
        setTimeout(() => {
            logo.classList.add('logo-spark');
            setTimeout(() => logo.classList.remove('logo-spark'), 1200);
        }, 1000);
    }
});

/* ===== Scroll progress bar ===== */
let progress = $('.cs-progress');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const width = (scrollTop / docHeight) * 100;
    progress.style.width = width + '%';
});

/* ===== Hide navbar on scroll down, show on scroll up ===== */
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    if (current > lastScroll && current > 80) nav.classList.add('hide');
    else nav.classList.remove('hide');
    lastScroll = current <= 0 ? 0 : current;
});

/* ===== Hover underline tracker ===== */
if (menu) {
    const tracker = document.createElement('span');
    tracker.className = 'tracker';
    menu.appendChild(tracker);

    const links = $$('.cs-menu a');
    links.forEach(link => {
        link.addEventListener('mouseenter', e => {
            const rect = e.target.getBoundingClientRect();
            tracker.style.left = e.target.offsetLeft + 'px';
            tracker.style.width = rect.width + 'px';
            tracker.style.opacity = '1';
        });
        link.addEventListener('mouseleave', () => { tracker.style.opacity = '0'; });
    });
}

/* ===== Burger / Mobile drawer ===== */
if (burger && drawer) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        const open = drawer.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('no-scroll', open);
    });
    $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
        burger.classList.remove('open'); drawer.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll');
    }));
}

/* CardSharp 3D — stable single-file build (no extras) */
(() => {
  if (!window.THREE) { console.error('Three.js not loaded'); return; }

  const canvas = document.getElementById('csStage');
  if (!canvas) { console.error('#csStage not found'); return; }

  // --- Renderer / Scene / Camera
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;                 // темніше
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  cam.position.set(0, 2.5, 9);

  // --- Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 0.9); // м’якше
  key.position.set(6, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  scene.add(key);

  const rim = new THREE.PointLight(0xe11900, 0.65, 50); // приглушене червоне
  rim.position.set(-6, 4, -5);
  scene.add(rim);

  // --- Shadow ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.ShadowMaterial({ opacity: 0.28 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.05;
  ground.receiveShadow = true;
  scene.add(ground);

  const group = new THREE.Group();
  scene.add(group);

  // --- Materials (матовіші)
  const matWhite    = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.0 });
  const matInkBlack = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.50 });
  const matInkRed   = new THREE.MeshStandardMaterial({ color: 0xe11900, roughness: 0.48 });
  const matEdge     = new THREE.MeshPhysicalMaterial({
    color: 0xe6e6e6, metalness: 0.15, roughness: 0.50, clearcoat: 0.5, clearcoatRoughness: 0.25
  });
  const matDice     = new THREE.MeshPhysicalMaterial({
    color: 0xe11900, metalness: 0.18, roughness: 0.50, clearcoat: 0.4
  });

  // --- Card face texture (2♣ / 3♥)
  function faceTexture(rank, suit) {
    const W = 768, H = 1152;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');

    x.fillStyle = '#f7f9fb'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#b9b9b9'; x.lineWidth = 12; x.strokeRect(34, 34, W - 68, H - 68);

    const color = suit === 'heart' ? '#e11900' : '#1b1b1b';
    x.fillStyle = color; x.font = 'bold 120px system-ui, Arial'; x.textBaseline = 'top';
    x.fillText(rank, 56, 44);

    function club(cx, cy, s) {
      x.beginPath(); x.arc(cx - s * 0.9, cy, s * 0.55, 0, Math.PI * 2);
      x.arc(cx + s * 0.9, cy, s * 0.55, 0, Math.PI * 2);
      x.arc(cx, cy - s * 0.9, s * 0.55, 0, Math.PI * 2); x.fill();
      x.fillRect(cx - 0.18 * s, cy, 0.36 * s, 0.7 * s);
      x.beginPath(); x.moveTo(cx - 0.7 * s, cy + 0.7 * s); x.lineTo(cx + 0.7 * s, cy + 0.7 * s); x.lineTo(cx, cy + 1.1 * s); x.closePath(); x.fill();
    }
    function heart(cx, cy, s) {
      x.beginPath(); x.moveTo(cx, cy + 1.1 * s);
      x.bezierCurveTo(cx - 1.1 * s, cy + 0.2 * s, cx - 1.05 * s, cy - 0.9 * s, cx, cy - 0.2 * s);
      x.bezierCurveTo(cx + 1.05 * s, cy - 0.9 * s, cx + 1.1 * s, cy + 0.2 * s, cx, cy + 1.1 * s);
      x.fill();
    }
    const draw = suit === 'heart' ? heart : club;

    if (rank === '2') { draw(W / 2, H * 0.33, 90); draw(W / 2, H * 0.67, 90); }
    else { draw(W / 2, H * 0.28, 85); draw(W / 2, H * 0.50, 85); draw(W / 2, H * 0.72, 85); }

    // тонший діагональний штрих
    x.strokeStyle = '#c91a08'; x.lineWidth = 14;
    x.beginPath(); x.moveTo(60, H - 100); x.lineTo(W - 60, 100); x.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.flipY = false;
    return tex;
  }

  // --- Card geometry (rounded extrude + front/back planes)
function makeCard(rank, suit) {
  const w = 2.6, h = 3.8, t = 0.06, br = 0.22, border = 0.09;

  // rounded rectangle
  const shape = (() => {
    const s = new THREE.Shape(), hw = w/2, hh = h/2, r = br;
    s.moveTo(-hw + r, -hh);
    s.lineTo(hw - r, -hh); s.quadraticCurveTo(hw, -hh, hw, -hh + r);
    s.lineTo(hw, hh - r);  s.quadraticCurveTo(hw, hh, hw - r, hh);
    s.lineTo(-hw + r, hh); s.quadraticCurveTo(-hw, hh, -hw, hh - r);
    s.lineTo(-hw, -hh + r); s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
    return s;
  })();

  // тонке тіло карти
  const body = new THREE.ExtrudeGeometry(shape, {
    depth: t, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035,
    bevelSegments: 3, curveSegments: 28
  });
  body.rotateX(-Math.PI / 2);

  const edgeMat = matEdge; // твій матеріал ребра
  const card = new THREE.Mesh(body, edgeMat);
  card.castShadow = true;

  // ЛИЦЕ — піднімаємо трохи вище, подвійна сторона і вищий renderOrder
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(w - border * 2, h - border * 2),
    new THREE.MeshStandardMaterial({
      map: faceTexture(rank, suit),
      roughness: 0.45,
      side: THREE.DoubleSide
    })
  );
  front.rotateX(-Math.PI / 2);
  front.position.y = t/2 + 0.003;     // було 0.001 — збільшили, щоб не мерехтіло
  front.renderOrder = 2;
  card.add(front);

  // ЗВОРОТ — теж DoubleSide і трохи нижче
  const backTex = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 768;
    const x = c.getContext('2d');
    x.fillStyle = '#0b0b0b'; x.fillRect(0,0,512,768);
    x.strokeStyle = '#e6e6e6'; x.lineWidth = 10; x.strokeRect(28,28,512-56,768-56);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; return t;
  })();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(w - border * 2, h - border * 2),
    new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide })
  );
  back.rotateX(-Math.PI / 2);
  back.rotateY(Math.PI);
  back.position.y = -t/2 - 0.003;     // було 0.001 — збільшили
  back.renderOrder = 1;
  card.add(back);

  return card;
}


  // --- Dice (box + white pips)
  function makeDice(size = 1.7) {
    const dice = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), matDice);
    dice.castShadow = true;
    const pip = new THREE.Mesh(new THREE.SphereGeometry(size * 0.09, 20, 20), matWhite);
    const r0 = size / 2 - size * 0.18;
    const add = (x, y, z) => { const s = pip.clone(); s.position.set(x, y, z); dice.add(s); };
    add(0, 0, r0);
    add(-r0 * 0.6, r0 * 0.6, -r0); add(r0 * 0.6, -r0 * 0.6, -r0);
    add(r0, r0 * 0.6, r0 * 0.6); add(r0, 0, 0); add(r0, -r0 * 0.6, -r0 * 0.6);
    add(-r0, r0 * 0.6, r0 * 0.6); add(-r0, r0 * 0.6, -r0 * 0.6); add(-r0, -r0 * 0.6, r0 * 0.6); add(-r0, -r0 * 0.6, -r0 * 0.6);
    add(-r0 * 0.6, r0, -r0 * 0.6); add(r0 * 0.6, r0, -r0 * 0.6); add(0, r0, 0); add(-r0 * 0.6, r0, r0 * 0.6); add(r0 * 0.6, r0, r0 * 0.6);
    add(-r0 * 0.6, -r0, -r0 * 0.6); add(r0 * 0.6, -r0, -r0 * 0.6); add(-r0 * 0.6, -r0, 0); add(r0 * 0.6, -r0, 0); add(-r0 * 0.6, -r0, r0 * 0.6); add(r0 * 0.6, -r0, r0 * 0.6);
    return dice;
  }

  // --- Poker chip
  function makeChip(color = 0xe11900, R = 1.0, H = 0.22) {
    const side = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, H, 64, 1, true),
      new THREE.MeshPhysicalMaterial({ color, metalness: 0.20, roughness: 0.48, clearcoat: 0.4 })
    );
    side.castShadow = true; side.receiveShadow = true;

    const faceMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.45 });
    const faceGeo = new THREE.CylinderGeometry(R * 0.98, R * 0.98, 0.001, 64);
    const top = new THREE.Mesh(faceGeo, faceMat); top.position.y = H / 2 + 0.0006; side.add(top);
    const bot = new THREE.Mesh(faceGeo, faceMat); bot.position.y = -H / 2 - 0.0006; bot.rotation.x = Math.PI; side.add(bot);

    const notchMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    for (let i = 0; i < 12; i++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.2, H * 0.92, 0.05), notchMat);
      const a = (i / 12) * Math.PI * 2;
      seg.position.set(Math.cos(a) * (R - 0.05), 0, Math.sin(a) * (R - 0.05));
      seg.rotation.y = -a;
      side.add(seg);
    }
    return side;
  }

  // --- Labels
  function makeLabelTexture(text, { color = '#cfcfcf', font = 'bold 56px system-ui', padding = 16 } = {}) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width) + padding * 2;
    const h = 72 + padding * 2;
    c.width = w; c.height = h;
    ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, h / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.transparent = true; tex.needsUpdate = true;
    return tex;
  }
  function addLabelPlane(parent, text, { w = 0.9, h = 0.22, offsetY = 0.04, rotX = -Math.PI / 2, rotY = 0, pos = new THREE.Vector3() } = {}) {
    const tex = makeLabelTexture(text);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85 });
    const geo = new THREE.PlaneGeometry(w, h);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.position.y += offsetY;
    m.rotation.x = rotX;
    m.rotation.y = rotY;
    parent.add(m);
  }

  // --- Build (підняті позиції)
  const card2c = makeCard('2', 'club');
  card2c.position.set(-3.2, 3.65, -1.0);
  card2c.rotation.set(THREE.MathUtils.degToRad(-8), THREE.MathUtils.degToRad(-22), THREE.MathUtils.degToRad(6));
  group.add(card2c);

  const card3h = makeCard('3', 'heart');
  card3h.position.set(3.2, 3.90, 1.0);
  card3h.rotation.set(THREE.MathUtils.degToRad(-6), THREE.MathUtils.degToRad(20), THREE.MathUtils.degToRad(-8));
  group.add(card3h);

  const dice = makeDice(1.7);
  dice.position.set(0, 0.75, 0); // вище
  group.add(dice);

  const chipR = makeChip(0xe11900, 1.02);
  chipR.position.set(-2.2, -0.45, 1.8); chipR.rotation.x = Math.PI / 2; group.add(chipR);

  const chipG = makeChip(0x1fb063, 0.92);
  chipG.position.set(4.6, -1.0, -2.0);  chipG.rotation.x = Math.PI / 2; group.add(chipG);

  const chipB = makeChip(0x4f78ff, 0.96);
  chipB.position.set(-0.5, 6.0, -2.0); chipB.rotation.x = Math.PI / 2; group.add(chipB);

  // Labels on cards
  addLabelPlane(card2c, '2♣  —  CardSharp', { w: 1.2, h: 0.22, offsetY: 0.035, pos: new THREE.Vector3(0, 0, 1.55) });
  addLabelPlane(card3h, '3♥  —  CardSharp', { w: 1.2, h: 0.22, offsetY: 0.035, pos: new THREE.Vector3(0, 0, 1.55) });

  // Labels on dice (CS on all faces)
  ['front','back','left','right','top','bottom'].forEach(side => {
    const p = new THREE.Vector3(); let rotY = 0, rotX = 0;
    const d = 0.86;
    if (side==='front') { p.set(0, 0, d); }
    if (side==='back')  { p.set(0, 0,-d); rotY = Math.PI; }
    if (side==='left')  { p.set(-d,0, 0); rotY =  Math.PI/2; }
    if (side==='right') { p.set( d,0, 0); rotY = -Math.PI/2; }
    if (side==='top')   { p.set(0, d, 0); rotX =  Math.PI/2; }
    if (side==='bottom'){ p.set(0,-d, 0); rotX = -Math.PI/2; }
    addLabelPlane(dice, 'CS', { w: 0.6, h: 0.22, offsetY: 0.0, rotX, rotY, pos: p });
  });

  // --- Resize
  function onResize() {
    const rect = canvas.parentElement?.getBoundingClientRect?.() || { width: 800, height: 450 };
    const w = Math.max(1, rect.width | 0), h = Math.max(1, rect.height | 0);
    r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 0);

  // --- Animation (повільніший)
  let t = 0, raf;
  function loop() {
    t += 0.016;
    group.position.y = Math.sin(t * 0.6) * 0.06;

    card2c.rotation.y += 0.012; card2c.rotation.x += 0.002;
    card3h.rotation.y -= 0.010; card3h.rotation.x += 0.002;

    dice.rotation.x  += 0.012;  // повільніше
    dice.rotation.y  += 0.002;

    chipR.rotation.z += 0.050;
    chipG.rotation.z -= 0.060;
    chipB.rotation.z += 0.055;

    r.render(scene, cam);
    raf = requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else loop();
  });

  console.log('CardSharp 3D: ready');
})();


/* ===== Services slider: always 5 in a row, centered active ===== */
(function(){
  const track = document.getElementById('svcTrack');
  if(!track) return;

  const prev = document.querySelector('.svc-btn--prev');
  const next = document.querySelector('.svc-btn--next');
  const dotsWrap = document.getElementById('svcDots');
  const bar = document.getElementById('svcBar');
  const idxEl = document.getElementById('svcIndex');

  let cards = [...track.querySelectorAll('.svc-card')];
  const GAP = 22;           // має збігатися з --svc-gap
  const VISIBLE = 5;        // рівно 5 у ряд
  const PADDING = 2;        // по 2 “порожніх” з кожного боку

  // 1) додамо 2+2 “spacer”, щоб першу/останні центрувати теж
  function ensureSpacers(){
    const makeSpacer = ()=>{ const li = document.createElement('li'); li.className='svc-card spacer'; return li; };
    // перед
    for(let i=0;i<PADDING;i++) track.insertBefore(makeSpacer(), track.firstChild);
    // після
    for(let i=0;i<PADDING;i++) track.appendChild(makeSpacer());
  }
  ensureSpacers();

  // колекції
  const allItems = [...track.children];
  cards = allItems.filter(el => !el.classList.contains('spacer')); // тільки реальні

  // 2) dots під реальну кількість
  dotsWrap.innerHTML = '';
  cards.forEach((_, n) => {
    const b = document.createElement('button');
    b.type='button'; b.setAttribute('role','tab');
    b.setAttribute('aria-label', `Go to ${n+1}`);
    if(n===0) b.setAttribute('aria-selected','true');
    b.addEventListener('click', ()=> goTo(n));
    dotsWrap.appendChild(b);
  });

  let i = 0;  // індекс активної (центральної) серед реальних карток
  let colW = 0;

  function measure(){
    // беремо ширину будь-якої реальноï картки
    const sample = cards[0] || track.querySelector('.svc-card');
    if(!sample) return;
    const rect = sample.getBoundingClientRect();
    colW = rect.width + GAP;     // ширина колонки з gap
    goTo(i, false);
  }

  function goTo(n, animate=true){
    i = Math.max(0, Math.min(n, cards.length-1));     // clamp
    // зсув треку: у нас попереду 2 “spacer”, а активна має стати в центр (позиція 3-я зі 5)
    const centerOffset = (i + PADDING - 2) * colW;
    track.style.transition = animate ? 'transform .45s cubic-bezier(.2,.7,.2,1)' : 'none';
    track.style.transform  = `translate3d(${-centerOffset}px,0,0)`;

    cards.forEach((el, k)=> el.classList.toggle('is-active', k===i));
    [...dotsWrap.children].forEach((d, k)=> d.setAttribute('aria-selected', String(k===i)));

    prev.disabled = (i===0);
    next.disabled = (i===cards.length-1);

    if(idxEl) idxEl.textContent = String(i+1).padStart(2,'0');
    if(bar){
      const pages = cards.length;                    // центральні позиції
      const progress = i / Math.max(1, pages-1);
      bar.style.width = (progress*100)+'%';
    }
  }

  next?.addEventListener('click', ()=> goTo(i+1));
  prev?.addEventListener('click', ()=> goTo(i-1));
  window.addEventListener('resize', measure, {passive:true});
  // swipe (mobile)
  let sx=0, dx=0;
  track.addEventListener('pointerdown', e=>{ sx=e.clientX; track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', e=>{ if(!sx) return; dx=e.clientX-sx; track.style.transform=`translate3d(${-( (i+PADDING-2)*colW - dx)}px,0,0)`; });
  track.addEventListener('pointerup', ()=>{ if(Math.abs(dx)>40) goTo(i + (dx<0?1:-1)); else goTo(i); sx=0; dx=0; });

  measure();
})();
