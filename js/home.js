/* Home: o menu gravita à volta do logótipo, em quatro órbitas. A metade de trás passa por trás dos pontos. */
(function () {
  var box = document.querySelector('.home-logo'), nav = document.querySelector('.orbit-nav');
  if (!box || !nav) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chips = [].slice.call(nav.querySelectorAll('a'));
  var mob = matchMedia('(max-width:700px)').matches;
  if (mob) { box.dataset.scale = '.8'; box.dataset.hf = '.9'; window.dispatchEvent(new Event('resize')); }
  document.documentElement.classList.add('js-orbit');
  var O = [
    { rx: .31, ry: .33, t: -.38, s: 1.00, p: 1.2 },
    { rx: .37, ry: .37, t: .26, s: .72, p: 3.9 },
    { rx: .43, ry: .41, t: -.14, s: .52, p: 5.6 },
    { rx: .48, ry: .45, t: .46, s: .38, p: 2.4 }
  ];
  var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'orbit-lines'); svg.setAttribute('aria-hidden', 'true');
  var ells = O.map(function () { var e = document.createElementNS(NS, 'ellipse'); svg.appendChild(e); return e; });
  box.insertBefore(svg, box.firstChild);
  var TR = 0, trails = O.map(function () { var a = []; for (var k = 0; k < TR; k++) { var m = document.createElement('i'); m.className = 'tr'; nav.insertBefore(m, nav.firstChild); a.push(m); } return a; });
  var tI = -1, IX = 0, IY = 0, W = 0, H = 0, angs = chips.map(function () { return 0; }), vs = chips.map(function () { return 1; }), hovs = chips.map(function () { return false; }), last = performance.now();
  var touch = matchMedia('(hover: none)').matches, focused = false;
  /* o menu pára sempre que o ponteiro se aproxima de um separador, para se poder clicar a qualquer momento */
  addEventListener('pointermove', function (e) {
    chips.forEach(function (a, i) { var r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; hovs[i] = Math.abs(e.clientX - cx) < r.width / 2 + 40 && Math.abs(e.clientY - cy) < r.height / 2 + 40; });
  }, { passive: true });
  function clearHov() { hovs = hovs.map(function () { return false; }); }
  document.addEventListener('pointerleave', clearHov); addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') clearHov(); }); addEventListener('pointercancel', clearHov);
  chips.forEach(function (a) { a.addEventListener('focus', function () { focused = true; }); a.addEventListener('blur', function () { focused = false; }); });
  box.addEventListener('af-impact', function (e) { tI = performance.now(); IX = e.detail.x; IY = e.detail.y; if (e.detail.instant) tI = -9999; });
  box.addEventListener('af-reset', function () { tI = -1; });
  function eob(x) { var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function size() {
    W = box.clientWidth; H = box.clientHeight; svg.setAttribute('width', W); svg.setAttribute('height', H);
    var narrow = W < 560;
    O.forEach(function (o, i) {
      var rx = W * o.rx, ry = Math.min(H * o.ry, rx * .9);
      o.T = o.t;
      if (W < 700) {
        /* telemóvel: elipses compridas e inclinadas, que aproveitam a altura */
        var M = [[.27,.17],[.32,.25],[.36,.33],[.40,.41]][i], TT = [-.32,.22,-.12,.34][i];
        rx = Math.min(W * M[0], W / 2 - (chips[i] ? chips[i].offsetWidth * 0.56 : 40) - 12); ry = H * M[1]; o.T = TT;
      }
      o.RX = rx; o.RY = ry; var e = ells[i];
      e.setAttribute('cx', W / 2); e.setAttribute('cy', H / 2); e.setAttribute('rx', rx); e.setAttribute('ry', ry);
      e.setAttribute('transform', 'rotate(' + (o.T * 57.3) + ' ' + W / 2 + ' ' + H / 2 + ')');
    });
  }
  function place(o, q) {
    var x = Math.cos(q) * o.RX, y = Math.sin(q) * o.RY, ct = Math.cos(o.T), st = Math.sin(o.T);
    return { x: W / 2 + x * ct - y * st, y: H / 2 + x * st + y * ct, d: (Math.sin(q) + 1) / 2 };
  }
  function frame(now) {
    var dt = Math.min(50, now - last); last = now;
    chips.forEach(function (a, i) {
      var tg = (hovs[i] || reduce) ? 0 : 1; vs[i] += (tg - vs[i]) * (tg === 0 ? .3 : .05); angs[i] += dt * .00022 * vs[i];
      var ang = angs[i], hl = hovs[i] || a === document.activeElement;
      var o = O[i], p = place(o, ang * o.s + o.p), s = .84 + .26 * p.d, kk = tI < 0 ? 0 : Math.min(1, Math.max(0, (now - tI - i * 380) / 1500)), ke = 1; p.x = IX + (p.x - IX) * ke; p.y = IY + (p.y - IY) * ke;
      a.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + s.toFixed(3) + ')';
      a.style.opacity = kk > 0 ? Math.min(1, kk * 3) : 0; a.classList.toggle('hl', !!hl); a.style.pointerEvents = kk < 1 ? 'none' : ''; a.style.zIndex = 5;
      trails[i].forEach(function (m, k) { var q = place(o, ang * o.s + o.p - (k + 1) * .085 * (o.s > 0 ? 1 : -1)); q.x = IX + (q.x - IX) * ke; q.y = IY + (q.y - IY) * ke; m.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px) translate(-50%,-50%)'; m.style.opacity = (kk * (1 - k / TR) * .7 * (.4 + .6 * q.d)).toFixed(2); m.style.zIndex = q.d > .45 ? 3 : 0; });
    });
    svg.style.opacity = tI < 0 ? 0 : Math.min(1, (now - tI) / 1400);
    requestAnimationFrame(frame);
  }
  size(); addEventListener('resize', size); requestAnimationFrame(frame);
})();
