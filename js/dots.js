/* Texto em pontos de meio tom que fogem do rato, como o logótipo. Uso: <h1 data-dots>texto</h1>.
   A cor vem da variável CSS --dotc. Sem JS, o texto normal fica visível. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mouse = { x: -9999, y: -9999 };
  addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  function setup(el) {
    var cs = getComputedStyle(el), dt = el.querySelector('.dt') || el, txt = '';
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
    el.appendChild(c);
    var P = [], w = 0, h = 0, R = 120, col = '#fff', running = false, active = true, ctx = null;
    function paint() {
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = col; ctx.beginPath();
      for (var i = 0; i < P.length; i++) { var p = P[i], r = p.r * p.k; ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, 6.2832); }
      ctx.fill();
    }
    function build() {
      el.style.color = ''; cs = getComputedStyle(el); txt = dt.textContent.trim();
      var fs = parseFloat(cs.fontSize), d = Math.min(2, devicePixelRatio || 1);
      var kids = c.parentNode === el; if (!kids) return;
      c.style.display = 'none';
      var r = el.getBoundingClientRect(); w = Math.ceil(r.width); h = Math.ceil(r.height);
      c.style.display = '';
      if (!w || !h) return;
      c.width = w * d; c.height = h * d; c.style.width = w + 'px'; c.style.height = h + 'px';
      ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
      var g = Math.max(2.6, fs / 44); R = Math.max(60, fs * .55);
      var o = document.createElement('canvas'); o.width = w; o.height = h; var ox = o.getContext('2d');
      ox.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      if ('letterSpacing' in ox) ox.letterSpacing = cs.letterSpacing;
      ox.textBaseline = 'alphabetic'; ox.fillStyle = '#000';
      var m = ox.measureText(txt), asc = m.fontBoundingBoxAscent || fs * .95, desc = m.fontBoundingBoxDescent || fs * .25;
      var lh = parseFloat(cs.lineHeight); if (!lh || isNaN(lh)) lh = fs * 1.2;
      var pb = parseFloat(cs.paddingBottom) || 0, lines = [], cur = '';
      txt.split(/\s+/).forEach(function (wd) { var t = cur ? cur + ' ' + wd : wd; if (cur && ox.measureText(t).width > w - 2) { lines.push(cur); cur = wd; } else cur = t; });
      lines.push(cur);
      if (lines.length === 1) ox.fillText(txt, 0, (h - (asc + desc)) / 2 + asc);
      else lines.forEach(function (ln, i) { ox.fillText(ln, 0, pb / 2 + i * lh + (lh - (asc + desc)) / 2 + asc); });
      var sw = Math.ceil(w / g), sh = Math.ceil(h / g), s = document.createElement('canvas'); s.width = sw; s.height = sh;
      var sx = s.getContext('2d'); sx.imageSmoothingQuality = 'high'; sx.drawImage(o, 0, 0, sw, sh);
      var px = sx.getImageData(0, 0, sw, sh).data; P = [];
      for (var j = 0; j < sh; j++) for (var i = 0; i < sw; i++) {
        var a = px[(j * sw + i) * 4 + 3] / 255;
        if (a > .13) P.push({ hx: i * g + g / 2, hy: j * g + g / 2, x: i * g + g / 2, y: j * g + g / 2, vx: 0, vy: 0, r: g * .62 * Math.sqrt(a), k: 1 });
      }
      col = (getComputedStyle(el).getPropertyValue('--dotc') || '').trim() || getComputedStyle(document.body).color;
      el.style.color = 'transparent'; paint(); active = true;
      if (!running && !reduce) { running = true; requestAnimationFrame(loop); }
    }
    function loop() {
      var r = c.getBoundingClientRect(), mx = mouse.x - r.left, my = mouse.y - r.top;
      var near = mx > -R * 1.5 && mx < w + R * 1.5 && my > -R * 1.5 && my < h + R * 1.5;
      if (near || active) {
        var moving = false;
        for (var i = 0; i < P.length; i++) {
          var p = P[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < R * R && d2 > .01) { var d = Math.sqrt(d2), f = 1 - d / R; f *= f; p.vx += dx / d * f * 5; p.vy += dy / d * f * 5; p.k = 1 + f * 1.1; } else p.k = 1;
          p.vx += (p.hx - p.x) * .07; p.vy += (p.hy - p.y) * .07; p.vx *= .86; p.vy *= .86; p.x += p.vx; p.y += p.vy;
          if (Math.abs(p.vx) + Math.abs(p.vy) > .05 || p.k !== 1) moving = true;
        }
        active = moving; paint();
      }
      requestAnimationFrame(loop);
    }
    var t; function again() { clearTimeout(t); t = setTimeout(build, 120); }
    (document.fonts && document.fonts.ready || Promise.resolve()).then(build);
    addEventListener('resize', again); addEventListener('af-theme', function () { build(); }); addEventListener('af-lang', function () { setTimeout(build, 30); });
  }
  [].forEach.call(document.querySelectorAll('[data-dots]'), setup);
})();
