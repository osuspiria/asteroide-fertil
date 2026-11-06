/* PT / ENG: elementos com data-en trocam de texto. A escolha fica guardada. */
(function () {
  var root = document.documentElement, btn = document.querySelector('[data-lang-toggle]');
  function get() { try { return localStorage.getItem('af-lang') || 'pt'; } catch (e) { return 'pt'; } }
  function apply(l) {
    root.lang = l;
    [].forEach.call(document.querySelectorAll('[data-en]'), function (el) {
      if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;
      el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.pt;
    });
    if (btn) { btn.textContent = l === 'en' ? 'pt' : 'eng'; btn.setAttribute('aria-label', l === 'en' ? 'Mudar para português' : 'Switch to English'); }
    dispatchEvent(new Event('af-lang'));
  }
  if (btn) btn.addEventListener('click', function () { var n = root.lang === 'en' ? 'pt' : 'en'; try { localStorage.setItem('af-lang', n); } catch (e) {} apply(n); });
  apply(get());
})();
