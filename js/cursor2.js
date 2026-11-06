/* Cursor cometa: uma cabeça e uma cauda de pontos que a segue. Na hora de clicar a cabeça abre-se. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var st = document.createElement('style'); st.textContent = 'html.cur-on,html.cur-on *{cursor:none!important}.cur-cv{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:9999}'; document.head.appendChild(st);
  var cv = document.createElement('canvas'); cv.className = 'cur-cv'; document.body.appendChild(cv); var x = cv.getContext('2d');
  var N = 16, P = [], mx = -100, my = -100, on = false, hot = 0, grab = false, down = false, dpr = 1;
  for (var i = 0; i < N; i++) P.push({ x: -100, y: -100 });
  function rs() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); } rs(); addEventListener('resize', rs);
  addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return; mx = e.clientX; my = e.clientY;
    if (!on) { on = true; P.forEach(function (p) { p.x = mx; p.y = my; }); document.documentElement.classList.add('cur-on'); }
    var t = e.target.closest ? e.target.closest('a,button,.bd,.rd,.dots,.page-title') : null; hot = t ? 1 : 0; grab = !!(t && t.classList && t.classList.contains('bd'));
  }, { passive: true });
  addEventListener('pointerdown', function () { down = true; }); addEventListener('pointerup', function () { down = false; });
  document.addEventListener('pointerleave', function () { on = false; document.documentElement.classList.remove('cur-on'); });
  var hr = 5;
  (function f() {
    x.clearRect(0, 0, innerWidth, innerHeight);
    if (on) {
      var col = getComputedStyle(document.documentElement).getPropertyValue('--tone').trim() || '#fff';
      P[0].x = mx; P[0].y = my; for (var i = 1; i < N; i++) { P[i].x += (P[i - 1].x - P[i].x) * .42; P[i].y += (P[i - 1].y - P[i].y) * .42; }
      x.fillStyle = col; x.strokeStyle = col;
      for (var k = N - 1; k >= 1; k--) { x.globalAlpha = (1 - k / N) * .75; x.beginPath(); x.arc(P[k].x, P[k].y, Math.max(.6, 4.2 * (1 - k / N)), 0, 6.2832); x.fill(); }
      x.globalAlpha = 1;
      var tr = down ? 3.5 : hot ? 11 : 5; hr += (tr - hr) * .25;
      x.beginPath(); x.arc(mx, my, hr, 0, 6.2832);
      if (hot && !down) { x.lineWidth = 1.5; x.stroke(); x.beginPath(); x.arc(mx, my, 2, 0, 6.2832); x.fill(); } else x.fill();
    }
    requestAnimationFrame(f);
  })();
})();
