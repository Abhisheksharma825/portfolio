(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Preloader
  const pre = $('#preloader');
  const hide = () => pre && pre.classList.add('done');
  addEventListener('load', () => setTimeout(hide, 350));
  setTimeout(hide, 2500);

  // Particle network background
  const cv = $('#particles');
  if (cv && !reduce) {
    const c = cv.getContext('2d'); let w, h, pts = [], mouse = { x: -999, y: -999 };
    const size = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; pts = Array.from({ length: Math.min(70, Math.floor(w * h / 22000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 })); };
    size(); addEventListener('resize', size);
    addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    const draw = () => {
      const col = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#22d3ee';
      c.clearRect(0, 0, w, h); c.fillStyle = col;
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        c.globalAlpha = .8; c.beginPath(); c.arc(p.x, p.y, 1.6, 0, 6.3); c.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) { c.globalAlpha = (1 - d / 120) * .35; c.strokeStyle = col; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); }
        }
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 160) { c.globalAlpha = (1 - dm / 160) * .6; c.strokeStyle = col; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(mouse.x, mouse.y); c.stroke(); }
      });
      requestAnimationFrame(draw);
    };
    draw();
  }

  // 3D tilt + spotlight on cards, magnetic buttons
  if (fine && !reduce) {
    $$('.project-card,.stat-card,.certificate-card,.profile-frame').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
        el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
    $$('.hero-buttons .btn,.social-icons a').forEach(b => {
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  }

  // Clone marquee for seamless loop
  const track = $('.marquee-track');
  if (track) track.innerHTML += track.innerHTML;

  // Side dot navigation
  const dots = $('#dots'), secs = $$('main section[id]');
  secs.forEach(s => {
    const b = document.createElement('button'); b.dataset.label = s.id[0].toUpperCase() + s.id.slice(1); b.setAttribute('aria-label', 'Go to ' + s.id);
    b.onclick = () => s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); dots.append(b);
  });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('button', dots).forEach((b, i) => b.classList.toggle('on', secs[i] === e.target)); }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => io.observe(s));

  // Command palette
  const dlg = $('#cmdk'), inp = $('#cmdk-input'), list = $('#cmdk-list');
  const toast = m => { const t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
  const go = id => () => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  const cmds = [
    ...['hero:Home:house', 'about:About:user', 'skills:Skills:layer-group', 'projects:Projects:code', 'experience:Experience:briefcase', 'certificates:Certificates:award', 'terminal:Terminal:terminal', 'contact:Contact:paper-plane']
      .map(x => { const [id, label, ic] = x.split(':'); return { label: 'Go to ' + label, ic, tag: 'Navigate', run: go(id) }; }),
    { label: 'Toggle dark / light theme', ic: 'circle-half-stroke', tag: 'Action', run: () => $('#theme-toggle').click() },
    { label: 'Copy email address', ic: 'copy', tag: 'Action', run: () => navigator.clipboard?.writeText('abhisheksharma.h2005@gmail.com').then(() => toast('Email copied')) },
    { label: 'Open GitHub', ic: 'brands github', tag: 'Link', run: () => open('https://github.com/Abhisheksharma825', '_blank', 'noopener') },
    { label: 'Open LinkedIn', ic: 'brands linkedin-in', tag: 'Link', run: () => open('https://www.linkedin.com/in/abhishek-sharma-ba6163318/', '_blank', 'noopener') }
  ];
  let shown = [], sel = 0;
  const render = () => {
    const q = inp.value.toLowerCase().trim(); shown = cmds.filter(c => c.label.toLowerCase().includes(q)); sel = 0;
    list.innerHTML = shown.map((c, i) => `<li role="option" data-i="${i}" class="${i ? '' : 'sel'}"><i class="fa-${c.ic.startsWith('brands') ? c.ic.replace(' ', ' fa-') : 'solid fa-' + c.ic}"></i>${c.label}<small>${c.tag}</small></li>`).join('') || '<li>No results</li>';
  };
  const mark = () => $$('li', list).forEach((li, i) => li.classList.toggle('sel', i === sel));
  const run = i => { const c = shown[i]; if (!c) return; dlg.close(); c.run(); };
  const openMenu = () => { inp.value = ''; render(); dlg.showModal(); inp.focus(); };
  $('#cmdk-open')?.addEventListener('click', openMenu);
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : openMenu(); } });
  inp.addEventListener('input', render);
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % shown.length; mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; mark(); }
    else if (e.key === 'Enter') run(sel);
  });
  list.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) run(+li.dataset.i); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
})();
