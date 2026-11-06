/* Logótipo de meio tom que reage ao rato (ou ao dedo). Os pontos fogem do cursor, crescem e voltam.
   Usa js/logo-dots.js, por isso funciona também ao abrir o ficheiro diretamente. */
window.AF_TOP = function (box, xf) {
  var g = box.afGeo, data = window.AF_DOTS; if (!g || !data) return null;
  var m = 1e9; data.dots.forEach(function (d) { if (Math.abs(d[0] - xf) < .018 && d[1] < m) m = d[1]; });
  if (m > 1e8) return null; return { x: g.ox + xf * g.S, y: g.oy + m * g.S };
};
(function () {
  var data = window.AF_DOTS;
  if (!data) return;
  [].forEach.call(document.querySelectorAll('[data-halftone]'), function (box) {
  var cv = box.querySelector('canvas'), ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, S = 1, ox = 0, oy = 0, dots = [], color = '#fff';
  var mouse = { x: -9999, y: -9999 }, R = 120, running = false, t0 = performance.now();
  var accT = -1, stiff = .07, mode = box.dataset.mode || '', vis = mode !== 'intro', meteors = [], ripples = [], rings = [], nextM = 0, shake = 0, introT = 0;
  function view() { return document.documentElement.dataset.view || 'inicio'; }
  function spawn(sx, sy, tx, ty, dur, cb) { meteors.push({ sx: sx, sy: sy, tx: tx, ty: ty, t0: performance.now(), dur: dur, cb: cb }); }
  function ripple(x, y, big) { ripples.push({ x: x, y: y, t0: performance.now(), big: big }); }
  function impact(x, y) {
    vis = true; rings.push({ x: x, y: y, t0: performance.now() }); shake = performance.now();
    dots.forEach(function (p) { var dx = p.hx - x, dy = p.hy - y, d = Math.sqrt(dx * dx + dy * dy) + 1; p.x = x + (Math.random() - .5) * 6; p.y = y + (Math.random() - .5) * 6; var s = 9 + Math.random() * 15; p.vx = dx / d * s; p.vy = dy / d * s; });
    box.dispatchEvent(new CustomEvent('af-impact', { bubbles: true, detail: { x: x, y: y } }));
  }
  function intro() {
    if (mode === 'accrete') {
      clearTimeout(introT); accT = performance.now(); stiff = .006; var gx = ox + S / 2, gy = oy + S * data.aspect / 2;
      dots.forEach(function (p) { var a = Math.random() * 6.2832, r = S * (.62 + Math.random() * .9); p.x = gx + Math.cos(a) * r; p.y = gy + Math.sin(a) * r * .8; p.vx = p.vy = 0; });
      box.dispatchEvent(new CustomEvent('af-reset', { bubbles: true }));
      if (reduce) { dots.forEach(function (p) { p.x = p.hx; p.y = p.hy; }); accT = -1; stiff = .07; }
      introT = setTimeout(function () { box.dispatchEvent(new CustomEvent('af-impact', { bubbles: true, detail: { x: W / 2, y: H / 2 } })); }, reduce ? 0 : 2300);
      return;
    }
    if (mode !== 'intro') return;
    meteors = []; rings = []; clearTimeout(introT);
    if (reduce) { vis = true; box.dispatchEvent(new CustomEvent('af-impact', { bubbles: true, detail: { x: W / 2, y: H / 2, instant: true } })); return; }
    vis = false; box.dispatchEvent(new CustomEvent('af-reset', { bubbles: true }));
    var tx = W / 2, ty = box.dataset.anchor ? oy + S * data.aspect * .3 : H * .5;
    introT = setTimeout(function () { spawn(W * .9, 0, tx, ty, 1500, function () { impact(tx, ty); }); }, 500);
  }
  document.addEventListener('af-route', function () { if (view() === 'inicio') { build(); intro(); } });
  setTimeout(function () { if (view() === 'inicio' && (mode === 'intro' || mode === 'accrete')) intro(); }, 120);

  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var r = box.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.min(W, H / data.aspect);                 // largura útil do logótipo
    ox = (W - S) / 2; oy = (H - S * data.aspect) / 2;
    if (box.dataset.anchor) { S = Math.min(W * .9, H * .98 / data.aspect); ox = (W - S) / 2; oy = H - S * data.aspect * parseFloat(box.dataset.anchor); }
    if (box.dataset.scale) { S = Math.min(W * parseFloat(box.dataset.scale), H * (parseFloat(box.dataset.hf) || .56) / data.aspect); ox = (W - S) / 2; oy = (H - S * data.aspect) / 2; }
    box.afGeo = { S: S, ox: ox, oy: oy, W: W, H: H };
    R = Math.max(70, S * 0.16);
    color = getComputedStyle(box).color;
    dots = data.dots.map(function (d) {
      var hx = ox + d[0] * S, hy = oy + d[1] * S;
      return { hx: hx, hy: hy, x: hx, y: hy, vx: 0, vy: 0, r: d[2] * S };
    });
    draw(performance.now());
  }

  function step(now) {
    now = now || performance.now();
    if (mode === 'shower' && view() === 'sobre' && !reduce && dots.length && now > nextM) {
      nextM = now + 1500 + Math.random() * 2600;
      var q = dots[(Math.random() * dots.length) | 0]; spawn(q.hx + 120 + Math.random() * 120, 0, q.hx, q.hy, 900 + Math.random() * 400, function () { ripple(q.hx, q.hy, false); });
    }
    for (var m = meteors.length - 1; m >= 0; m--) { var M = meteors[m]; if (now - M.t0 >= M.dur) { meteors.splice(m, 1); M.cb && M.cb(); } }
    for (var rr = ripples.length - 1; rr >= 0; rr--) {
      var Rp = ripples[rr], age = now - Rp.t0, rad = age * (Rp.big ? .5 : .4), amp = Math.exp(-age / (Rp.big ? 1100 : 800)) * (Rp.big ? 4 : 3);
      if (age > 2600) { ripples.splice(rr, 1); continue; }
      for (var j = 0; j < dots.length; j++) { var o = dots[j], ox = o.x - Rp.x, oy = o.y - Rp.y, od = Math.sqrt(ox * ox + oy * oy) + .01, w = Math.abs(od - rad);
        if (w < 38) { var g = (1 - w / 38) * amp; o.vx += ox / od * g; o.vy += oy / od * g; o.k = Math.max(o.k || 1, 1 + g * .25); } }
    }
    if (accT > 0) { var q0 = Math.min(1, (now - accT) / 3200); stiff = .006 + .064 * q0 * q0; if (q0 >= 1) accT = -2; }
    for (var i = 0; i < dots.length; i++) {
      var p = dots[i];
      var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < R * R && d2 > 0.01) {
        var d = Math.sqrt(d2), f = (1 - d / R); f = f * f;
        p.vx += (dx / d) * f * 5; p.vy += (dy / d) * f * 5;
        p.k = 1 + f * 1.1;
      } else { p.k = 1; }
      p.vx += (p.hx - p.x) * stiff; p.vy += (p.hy - p.y) * stiff;
      p.vx *= 0.86; p.vy *= 0.86;
      p.x += p.vx; p.y += p.vy;
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.globalAlpha = accT > 0 ? Math.min(1, (now - accT) / 1800) : 1;
    if (shake && now - shake < 450) { var sa = (1 - (now - shake) / 450) * 7; box.style.transform = 'translate(' + ((Math.random() - .5) * sa).toFixed(1) + 'px,' + ((Math.random() - .5) * sa).toFixed(1) + 'px)'; } else if (shake) { box.style.transform = ''; shake = 0; }
    meteors.forEach(function (M) {
      var u = Math.min(1, (now - M.t0) / M.dur);
      for (var k = 14; k >= 0; k--) { var uu = u - k * .022; if (uu < 0) continue; var e = uu * uu, x = M.sx + (M.tx - M.sx) * e, y = M.sy + (M.ty - M.sy) * e, rr = k === 0 ? 7 : Math.max(.8, 5.5 - k * .38); ctx.globalAlpha = k === 0 ? 1 : Math.max(.08, .8 - k * .055); ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = 1;
    });
    rings.forEach(function (g, gi) {
      var a = (now - g.t0) / 1500; if (a > 1) { rings.splice(gi, 1); return; }
      for (var q = 0; q < 3; q++) { var aq = a - q * .12; if (aq < 0) continue; ctx.globalAlpha = (1 - aq) * .7; ctx.lineWidth = 1.5; ctx.setLineDash([1, 7]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(g.x, g.y, aq * S * .75, 0, 6.2832); ctx.stroke(); }
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    });
    ctx.beginPath();
    var t = (now - t0) * 0.0016; ctx.globalAlpha = accT > 0 ? Math.min(1, (now - accT) / 1800) : 1;
    for (var i = 0; vis && i < dots.length; i++) {
      var p = dots[i];
      var breathe = reduce ? 1 : 1 + 0.07 * Math.sin(t + p.hx * 0.025 + p.hy * 0.018);
      var r = p.r * (p.k || 1) * breathe;
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, 6.2832);
    }
    ctx.fill();
  }

  function loop(now) {
    if (document.hidden) { running = false; return; }
    step(now); draw(now);
    requestAnimationFrame(loop);
  }
  function start() { if (!running && !reduce) { running = true; requestAnimationFrame(loop); } }

  function move(e) {
    var r = box.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    if (reduce) { step(); draw(performance.now()); }
  }
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', function (e) {       // clique: onda de choque
    move(e);
    if (mode === 'shower') { var rc = box.getBoundingClientRect(); if (e.clientX < rc.left || e.clientX > rc.right || e.clientY < rc.top || e.clientY > rc.bottom) return; var cx = mouse.x, cy = mouse.y; spawn(cx + cy * .45, 0, cx, cy, 520, function () { ripple(cx, cy, true); }); return; }
    if (mode === 'intro' && !vis) return;
    for (var i = 0; i < dots.length; i++) {
      var p = dots[i], dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy) + 1;
      var f = Math.max(0, 1 - d / (R * 2.2));
      p.vx += (dx / d) * f * 22; p.vy += (dy / d) * f * 22;
    }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', start);
  window.addEventListener('resize', function () { if (accT > 0) return; build(); });
  box.classList.add('live');
  build(); start();
  });
})();
