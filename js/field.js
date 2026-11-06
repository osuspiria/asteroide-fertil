/* Artistas e especialistas: asteróides de meio tom a pairar. Rochas (artistas) e cristais (especialistas), todos do mesmo tamanho. */
(function () {
  var f = document.querySelector('.field'); if (!f) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, B = [], drag = null, mouse = { x: -999, y: -999 }, seed = 5, moved = 0, t0 = performance.now();
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function size() { W = f.clientWidth; H = f.clientHeight; }
  size();
  var L = (function () { var x = -.5, y = -.62, z = .6, n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; })();

  function draw(b) {
    var c = b.cv, d = Math.min(2, devicePixelRatio || 1), r = b.r, S = Math.ceil(2 * r);
    c.width = S * d; c.height = S * d; var x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    var cs0 = getComputedStyle(document.documentElement), col = (cs0.getPropertyValue('--rockc') || '').trim() || getComputedStyle(document.body).color; x.fillStyle = col;
    var step = Math.max(3.6, Math.min(7.5, r / 9)), cx = r, cy = r, path = new Path2D(), n = 0;
    var inside, bright;
    if (b.kind === 'rock') {
      var s1 = b.s[0], s2 = b.s[1], s3 = b.s[2], R0 = r * .8, cr = b.cr;
      var rr = function (a) { return R0 * (1 + .12 * Math.sin(3 * a + s1) + .07 * Math.sin(5 * a + s2) + .05 * Math.sin(9 * a + s3)); };
      inside = function (px, py) { var dx = px - cx, dy = py - cy; return Math.hypot(dx, dy) < rr(Math.atan2(dy, dx)); };
      bright = function (px, py) {
        var dx = (px - cx) / (R0 * 1.05), dy = (py - cy) / (R0 * 1.05), q = Math.min(1, Math.hypot(dx, dy)), nz = Math.sqrt(1 - q * q);
        var lam = dx * L[0] + dy * L[1] + nz * L[2], br = .18 + .82 * Math.max(0, lam);
        cr.forEach(function (k) {
          var ddx = px - (cx + k[0] * r), ddy = py - (cy + k[1] * r), dc = Math.hypot(ddx, ddy), kr = k[2] * r;
          if (dc < kr) { br *= .28; if (dc > kr * .66 && ddx * L[0] + ddy * L[1] > 0) br += .42; }
          else if (dc < kr * 1.18 && ddx * L[0] + ddy * L[1] < 0) br += .22;
        });
        return br;
      };
    } else {
      var V = b.v, N = V.length;
      inside = function (px, py) { var c2 = false, i, j; for (i = 0, j = N - 1; i < N; j = i++) { var xi = cx + V[i][0] * r, yi = cy + V[i][1] * r, xj = cx + V[j][0] * r, yj = cy + V[j][1] * r; if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c2 = !c2; } return c2; };
      bright = function (px, py) {
        var a = Math.atan2(py - cy, px - cx), k = Math.floor(((a + 6.2832) % 6.2832) / 6.2832 * N * 1.0), fi = Math.floor(((a + 6.2832) % 6.2832) / (6.2832 / N)) % N;
        var fa = (fi + .5) * 6.2832 / N, la = Math.atan2(L[1], L[0]);
        return .12 + .88 * Math.max(0, Math.cos(fa - la) * .62 + .38) * (.55 + .45 * b.fb[fi]);
      };
    }
    var rowi = 0;
    for (var py = step / 2; py < S; py += step * .866, rowi++) for (var px = (rowi % 2 ? step : step / 2); px < S; px += step) {
      if (!inside(px, py)) continue;
      var br = Math.max(0, Math.min(1.1, bright(px, py))), rad = step * .56 * Math.pow(br, .85);
      if (rad < .5) continue; path.moveTo(px + rad, py); path.arc(px, py, rad, 0, 6.2832);
    }
    x.fill(path);
  }

  function make(el) {
    var kind = el.dataset.kind || 'rock', mini = el.classList.contains('mini');
    var base = Math.max(64, Math.min(118, W / 9.2)), r = mini ? 12 + rnd() * 20 : base;
    var cv = document.createElement('canvas'); el.insertBefore(cv, el.firstChild);
    el.style.width = el.style.height = (2 * r) + 'px';
    var b = { el: el, cv: cv, kind: kind, r: r, mini: mini, m: r * r, rot: rnd() * 360, spin: (rnd() - .5) * (mini ? .6 : .22), ph: rnd() * 6.28, href: el.dataset.href };
    if (kind === 'rock') { b.s = [rnd() * 6, rnd() * 6, rnd() * 6]; b.cr = [[-.22 + rnd() * .1, -.18, .17 + rnd() * .05], [.26, .12 + rnd() * .1, .12 + rnd() * .04], [-.04, .38, .09 + rnd() * .03], [.1, -.4, .07]]; }
    else { var N = 7, V = []; for (var i = 0; i < N; i++) { var a = i / N * 6.2832 + rnd() * .3, q = .55 + rnd() * .4; V.push([Math.cos(a) * q, Math.sin(a) * q]); } b.v = V; b.fb = []; for (i = 0; i < N; i++) b.fb.push(rnd()); }
    var a0 = rnd() * 6.28; b.x = r + rnd() * Math.max(1, W - 2 * r); b.y = r + rnd() * Math.max(1, H - 2 * r); b.vx = Math.cos(a0) * (.35 + rnd() * .3); b.vy = Math.sin(a0) * (.35 + rnd() * .3);
    draw(b); return b;
  }
  [].forEach.call(f.querySelectorAll('.bd'), function (el) { B.push(make(el)); });
  function collide(init) {
    for (var i = 0; i < B.length; i++) for (var j = i + 1; j < B.length; j++) {
      var a = B[i], b = B[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || .01, m = (a.r + b.r) * .86;
      if (d < m) {
        var nx = dx / d, ny = dy / d, o = (m - d) / 2;
        if (a !== drag) { a.x -= nx * o; a.y -= ny * o; } if (b !== drag) { b.x += nx * o; b.y += ny * o; }
        if (!init) { var rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { var imp = rv * 1.7 / (1 / a.m + 1 / b.m); a.vx += imp * nx / a.m; a.vy += imp * ny / a.m; b.vx -= imp * nx / b.m; b.vy -= imp * ny / b.m; } }
      }
    }
  }
  for (var it = 0; it < 80; it++) collide(true);
  function frame(now) {
    var t = (now - t0) / 1000;
    B.forEach(function (b) {
      if (b === drag) return;
      if (!reduce) {
        var dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy), R = b.r + 120;
        if (d < R && d > 1) { var p = 1 - d / R; b.vx += dx / d * p * .42; b.vy += dy / d * p * .42; }
        b.x += b.vx; b.y += b.vy; b.rot += b.spin;
        var sp = Math.hypot(b.vx, b.vy); b.vx *= .996; b.vy *= .996; if (sp < .26) { b.vx += (rnd() - .5) * .03; b.vy += (rnd() - .5) * .03; }
      }
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * .9; } if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * .9; }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * .9; } if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * .9; }
    });
    collide(false);
    B.forEach(function (b) {
      var bob = reduce ? 0 : Math.sin(t * .8 + b.ph) * 5;
      b.el.style.transform = 'translate(' + (b.x - b.r).toFixed(1) + 'px,' + (b.y - b.r + bob).toFixed(1) + 'px)';
      b.cv.style.transform = 'rotate(' + b.rot.toFixed(1) + 'deg)';
    });
    requestAnimationFrame(frame);
  }
  function pos(e) { var r = f.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  B.forEach(function (b) {
    if (b.mini) return;
    b.el.addEventListener('pointerdown', function (e) { var p = pos(e); drag = b; moved = 0; b.ox = b.x - p.x; b.oy = b.y - p.y; b.vx = b.vy = 0; b.el.setPointerCapture(e.pointerId); b.el.classList.add('grab'); e.preventDefault(); });
  });
  addEventListener('pointermove', function (e) {
    var p = pos(e); mouse.x = p.x; mouse.y = p.y;
    if (drag) { var nx = p.x + drag.ox, ny = p.y + drag.oy; moved += Math.hypot(nx - drag.x, ny - drag.y); drag.vx = (nx - drag.x) * .6 + drag.vx * .4; drag.vy = (ny - drag.y) * .6 + drag.vy * .4; drag.x = nx; drag.y = ny; }
  }, { passive: true });
  function up() {
    if (!drag) return; var b = drag; b.el.classList.remove('grab');
    if (moved < 6 && b.href) { drag = null; location.href = b.href; return; }
    var s = Math.hypot(b.vx, b.vy); if (s > 14) { b.vx *= 14 / s; b.vy *= 14 / s; } drag = null;
  }
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  f.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); B.forEach(function (b) { b.x = Math.min(Math.max(b.r, b.x), W - b.r); b.y = Math.min(Math.max(b.r, b.y), H - b.r); draw(b); }); }, 120); });
  addEventListener('af-theme', function () { B.forEach(draw); });
  requestAnimationFrame(frame);
})();
