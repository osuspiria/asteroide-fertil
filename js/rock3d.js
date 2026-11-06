/* Asteróide de meio tom a rodar em 3D. Os pontos são pontos de uma esfera deformada, iluminada de um lado. O rato acelera a rotação. */
(function () {
  var cv = document.getElementById('rock3d'); if (!cv) return;
  var ctx = cv.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = 3400, P = [], i, ga = Math.PI * (3 - Math.sqrt(5));
  var craters = [[.6, .3, .74, .34], [-.7, .35, .6, .3], [.2, -.8, .56, .26], [-.3, .1, -.95, .3], [.1, .9, -.4, .24], [.9, -.1, -.45, .22]].map(function (c) { var l = Math.hypot(c[0], c[1], c[2]); return [c[0] / l, c[1] / l, c[2] / l, c[3]]; });
  for (i = 0; i < N; i++) {
    var y = 1 - (i + .5) / N * 2, r = Math.sqrt(1 - y * y), th = i * ga, x = Math.cos(th) * r, z = Math.sin(th) * r;
    var rad = 1 + .09 * Math.sin(3 * x + 1) * Math.cos(2 * y + z) + .06 * Math.sin(5 * y + 2 * z) + .04 * Math.cos(7 * x - y);
    var dep = 0; craters.forEach(function (c) { var d = Math.acos(Math.max(-1, Math.min(1, x * c[0] + y * c[1] + z * c[2]))); if (d < c[3]) dep -= .13 * (1 - d / c[3]); else if (d < c[3] * 1.2) dep += .03; });
    rad += dep; P.push([x, y, z, rad, dep]);
  }
  var W = 0, H = 0, dpr = 1, R = 100, ang = 0, spin = .004, tgt = .004, tilt = .4, mx = 0;
  var L = [-.5, -.55, .67], ln = Math.hypot(L[0], L[1], L[2]); L = L.map(function (v) { return v / ln; });
  function size() { var b = cv.parentNode.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = Math.max(1, b.width); H = Math.max(1, b.height); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); R = Math.min(W, H) * .41; }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', function (e) { var b = cv.getBoundingClientRect(); mx = (e.clientX - (b.left + b.width / 2)) / Math.max(1, b.width); tgt = .004 + mx * .02; }, { passive: true });
  function frame() {
    spin += (tgt - spin) * .05; if (!reduce) ang += spin;
    ctx.clearRect(0, 0, W, H);
    var col = (getComputedStyle(document.documentElement).getPropertyValue('--rockc') || '').trim() || getComputedStyle(document.body).color; ctx.fillStyle = col;
    var ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), stt = Math.sin(tilt), s = R * Math.sqrt(4 * Math.PI / N) * 1.02, cx = W / 2, cy = H / 2;
    ctx.beginPath();
    for (var k = 0; k < N; k++) {
      var p = P[k], x0 = p[0] * p[3], y0 = p[1] * p[3], z0 = p[2] * p[3];
      var x1 = x0 * ca + z0 * sa, z1 = -x0 * sa + z0 * ca;
      var y2 = y0 * ct - z1 * stt, z2 = y0 * stt + z1 * ct;
      var nx = p[0] * ca + p[2] * sa, nz0 = -p[0] * sa + p[2] * ca, ny = p[1] * ct - nz0 * stt, nz = p[1] * stt + nz0 * ct;
      var lam = nx * L[0] + ny * L[1] + nz * L[2], b = .1 + .9 * Math.max(0, lam);
      if (p[4] < -.02) b *= .45 + .55 * (1 + p[4] * 5);
      var rr;
      if (z2 > 0) rr = s * .72 * Math.pow(b, .75) * (.8 + .25 * z2); else rr = s * .22 * (.4 + .6 * b);
      if (rr < .35) continue;
      var X = cx + x1 * R, Y = cy + y2 * R; ctx.moveTo(X + rr, Y); ctx.arc(X, Y, rr, 0, 6.2832);
    }
    ctx.globalAlpha = 1; ctx.fill(); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
