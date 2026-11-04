/* Clavis IT Service – Seitenverhalten (ohne Abhängigkeiten) */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'clavis-theme';

  /* ---------- Hell/Dunkel ---------- */
  var toggle = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function describeToggle() {
    if (!toggle) return;
    var text = currentTheme() === 'dark' ? 'Zur hellen Darstellung wechseln' : 'Zur dunklen Darstellung wechseln';
    toggle.setAttribute('aria-label', text);
    toggle.setAttribute('title', text);
  }
  function paintMeta() { if (themeMeta) themeMeta.setAttribute('content', currentTheme() === 'dark' ? '#0b111b' : '#f8f7f4'); }
  if (toggle) {
    describeToggle();
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      describeToggle();
      paintMeta();
    });
  }
  paintMeta();

  /* ---------- Kopfleiste: Linie beim Scrollen ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var ticking = false;
    var update = function () { header.classList.toggle('is-stuck', window.scrollY > 8); ticking = false; };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Dropdown „Leistungen“ ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-dropdown]'), function (item) {
    var trigger = item.querySelector('[aria-controls]');
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    var closeTimer = 0;
    var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function setOpen(open) {
      item.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }
    var hoverOpenedAt = 0;
    trigger.addEventListener('click', function () {
      // Mit der Maus hat das Überfahren schon geöffnet: der Klick soll es nicht gleich wieder schließen
      if (Date.now() - hoverOpenedAt < 600) { setOpen(true); return; }
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });
    if (hoverCapable) {
      item.addEventListener('mouseenter', function () {
        window.clearTimeout(closeTimer);
        if (trigger.getAttribute('aria-expanded') !== 'true') hoverOpenedAt = Date.now();
        setOpen(true);
      });
      item.addEventListener('mouseleave', function () { closeTimer = window.setTimeout(function () { setOpen(false); }, 160); });
    }
    item.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') { setOpen(false); trigger.focus(); }
    });
    item.addEventListener('focusout', function (ev) { if (!item.contains(ev.relatedTarget)) setOpen(false); });
    document.addEventListener('click', function (ev) { if (!item.contains(ev.target)) setOpen(false); });
    if (panel) panel.addEventListener('click', function (ev) { if (ev.target.closest('a')) setOpen(false); });
  });

  /* ---------- Mobile Navigation ---------- */
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('drawer');
  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function siblingsInert(on) {
    ['.skip-link', '.header .brand', '.header .nav', '.header__cta', '#main', '.footer', '.callbar'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    siblingsInert(open);
    if (open) { var first = drawer.querySelector(FOCUSABLE); if (first) first.focus(); }
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () { setDrawer(burger.getAttribute('aria-expanded') !== 'true'); });
    drawer.addEventListener('click', function (ev) { if (ev.target.closest('a')) setDrawer(false); });
    document.addEventListener('keydown', function (ev) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (ev.key === 'Escape') { setDrawer(false); burger.focus(); return; }
      if (ev.key !== 'Tab') return;
      var chain = [burger];
      var themeBtn = document.querySelector('.header .theme-toggle');
      if (themeBtn && themeBtn.offsetWidth) chain.push(themeBtn);
      Array.prototype.forEach.call(drawer.querySelectorAll(FOCUSABLE), function (el) { if (el.offsetParent !== null) chain.push(el); });
      var first = chain[0], last = chain[chain.length - 1], active = document.activeElement;
      if (ev.shiftKey && active === first) { last.focus(); ev.preventDefault(); }
      else if (!ev.shiftKey && active === last) { first.focus(); ev.preventDefault(); }
    });
    var wide = window.matchMedia('(min-width: 66em)');
    var onWide = function (e) { if (e.matches) setDrawer(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.drawer__toggle'), function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      var sub = document.getElementById(btn.getAttribute('aria-controls'));
      if (sub) sub.hidden = !open;
    });
  });

  /* ---------- Sprungleiste: aktiven Abschnitt markieren ---------- */
  var jumpLinks = Array.prototype.slice.call(document.querySelectorAll('.jump a[href^="#"]'));
  if (jumpLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    jumpLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        jumpLinks.forEach(function (a) { a.classList.remove('is-current'); });
        var link = byId[entry.target.id];
        if (link) {
          link.classList.add('is-current');
          if (link.scrollIntoView && link.parentElement) {
            var bar = link.closest('ul');
            if (bar) bar.scrollTo({ left: link.offsetLeft - 16, behavior: 'smooth' });
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) { var sec = document.getElementById(id); if (sec) spy.observe(sec); });
  }

  /* ---------- Anfahrts-Karte ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.karte'), function (karte) {
    var info = karte.querySelector('.karte__info');
    var aktiv = null;
    function waehle(el) {
      if (aktiv) { aktiv.classList.remove('ist-aktiv'); aktiv.setAttribute('aria-pressed', 'false'); }
      if (!el || el === aktiv) {
        aktiv = null;
        karte.removeAttribute('data-aktiv');
        if (info) info.textContent = info.getAttribute('data-standard');
        return;
      }
      aktiv = el;
      el.classList.add('ist-aktiv');
      el.setAttribute('aria-pressed', 'true');
      karte.setAttribute('data-aktiv', el.getAttribute('data-zone'));
      if (info) info.textContent = el.getAttribute('data-info');
    }
    karte.addEventListener('click', function (ev) { waehle(ev.target.closest('[data-info]')); });
    karte.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var el = ev.target.closest('[data-info]');
      if (!el) return;
      ev.preventDefault();
      waehle(el);
    });
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { karte.classList.add('is-visible'); obs.disconnect(); }
        });
      }, { threshold: 0.2 });
      obs.observe(karte);
    } else {
      karte.classList.add('is-visible');
    }
  });

  /* ---------- Fernwartung: passenden Download wählen ---------- */
  var fwKnopf = document.querySelector('[data-fw-download]');
  if (fwKnopf) {
    var ua = navigator.userAgent || '';
    var plattform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    var istMobil = /Android|iPhone|iPod|iPad/i.test(ua) || (/Mac/i.test(plattform) && navigator.maxTouchPoints > 1);
    var istMac = !istMobil && /Mac/i.test(plattform + ' ' + ua);
    var systemText = document.querySelector('[data-fw-system]');
    var label = document.querySelector('[data-fw-label]');
    if (istMac) {
      fwKnopf.href = 'https://download.teamviewer.com/download/TeamViewerQS.dmg';
      if (systemText) systemText.textContent = 'Erkannt: macOS';
      if (label) label.textContent = 'Fernwartung für Mac herunterladen';
    } else if (istMobil) {
      var hinweis = document.querySelector('[data-fw-mobil]');
      if (hinweis) hinweis.hidden = false;
    } else if (/Win/i.test(plattform + ' ' + ua)) {
      if (systemText) systemText.textContent = 'Erkannt: Windows';
      if (label) label.textContent = 'Fernwartung für Windows herunterladen';
    }
  }

  /* ---------- Lokale Vorschau ohne Server: saubere URLs auf .html umbiegen ---------- */
  if (window.location.protocol === 'file:') {
    document.addEventListener('click', function (ev) {
      var link = ev.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || /^(https?:|tel:|mailto:|#|javascript:)/i.test(href)) return;
      var parts = href.split('#');
      var path = parts[0].replace(/^(\.\/|\/)+|\/+$/g, '');
      var file = (path === '' ? 'index.html' : (/\.html$/.test(path) ? path : path + '.html')) + (parts[1] ? '#' + parts[1] : '');
      ev.preventDefault();
      window.location.href = window.location.href.replace(/\/[^/]*$/, '/') + file;
    });
  }
})();
