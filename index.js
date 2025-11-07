// Feather icons
feather.replace();

/* ===== Animated navbar indicator ===== */
(function () {
    const menu = document.querySelector('.nav__menu');
    if (!menu) return;
    const links = [...menu.querySelectorAll('a')];
    const indicator = menu.querySelector('.nav__indicator');

    function moveIndicator(target) {
        const r = target.getBoundingClientRect();
        const pr = menu.getBoundingClientRect();
        indicator.style.width = r.width + 'px';
        indicator.style.transform = `translateX(${r.left - pr.left}px)`;
    }

    const active = links.find(a => a.getAttribute('href') === '#home') || links[0];
    requestAnimationFrame(() => moveIndicator(active));

    links.forEach(a => {
        a.addEventListener('mouseenter', () => moveIndicator(a));
        a.addEventListener('focus', () => moveIndicator(a));
    });
    menu.addEventListener('mouseleave', () => moveIndicator(active));
    addEventListener('resize', () => moveIndicator(active), { passive: true });
})();

/* ===== Compact header on scroll ===== */
(function () {
    const nav = document.querySelector('.nav');
    addEventListener('scroll', () => {
        const y = scrollY || pageYOffset;
        nav.classList.toggle('is-compact', y > 6);
        nav.style.boxShadow = y > 6 ? '0 6px 24px rgba(0,0,0,.35)' : 'none';
    }, { passive: true });
})();

/* ===== Scroll reveal ===== */
(function () {
    const els = [...document.querySelectorAll('.reveal')];
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
    }, { threshold: .22 });
    els.forEach(el => io.observe(el));
})();

/* ===== Hero particles (red/violet sparks) ===== */
(function () {
    const c = document.getElementById('fx');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(2, devicePixelRatio || 1);

    function resize() {
        w = c.clientWidth; h = c.clientHeight;
        c.width = w * dpr; c.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); addEventListener('resize', resize);

    const N = 70;
    const pts = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.2,
        vx: -0.3 + Math.random() * 0.6,
        vy: -0.6 + Math.random() * 0.2,
        hue: Math.random() < 0.5 ? 350 : 265 // red / violet
    }));

    function loop() {
        ctx.clearRect(0, 0, w, h);
        for (const p of pts) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
            if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
            g.addColorStop(0, `hsla(${p.hue},100%,60%,.85)`);
            g.addColorStop(1, `hsla(${p.hue},100%,50%,0)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        requestAnimationFrame(loop);
    }
    loop();
})();


  (function(){
    const burger = document.querySelector('.nav__burger, .nav_burger');
    const menu   = document.querySelector('.nav_menu, .nav__menu');
    if (!burger || !menu) return;

    let overlay = document.querySelector('.nav__overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav__overlay';
      document.body.appendChild(overlay);
    }

    function openMenu(on) {
      burger.setAttribute('aria-expanded', String(on));
      menu.classList.toggle('open', on);
      overlay.classList.toggle('show', on);
    }

    burger.addEventListener('click', () => openMenu(!menu.classList.contains('open')));
    overlay.addEventListener('click', () => openMenu(false));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') openMenu(false); });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => openMenu(false)));
  })();
