(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-preistab]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-preispanel]'));
  if (!tabs.length || !panels.length) return;

  function zeigen(name) {
    tabs.forEach(function (tab) {
      var aktiv = tab.getAttribute('data-preistab') === name;
      tab.classList.toggle('is-aktiv', aktiv);
      tab.setAttribute('aria-selected', aktiv ? 'true' : 'false');
      tab.tabIndex = aktiv ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-preispanel') !== name;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      zeigen(tab.getAttribute('data-preistab'));
    });
  });

  // Pfeiltasten zwischen den Tabs wechseln (Tab-Pattern)
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    tablist.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      var index = tabs.indexOf(document.activeElement);
      if (index === -1) return;
      var next = ev.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      zeigen(tabs[next].getAttribute('data-preistab'));
      ev.preventDefault();
    });
  }

  // Direktlink: ?zielgruppe=unternehmen oder #preise-unternehmen zeigt den passenden Tab
  var hash = window.location.hash.replace('#', '');
  if (hash === 'preise-unternehmen') {
    zeigen('unternehmen');
  } else {
    zeigen('privat');
  }
})();
