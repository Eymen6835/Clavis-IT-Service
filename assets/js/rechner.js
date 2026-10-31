(function () {
  'use strict';

  var root = document.querySelector('[data-rechner]');
  if (!root) return;

  var zeilen = Array.prototype.slice.call(root.querySelectorAll('[data-zeile]'));
  var summeEl = root.querySelector('[data-summe]');
  var resetBtn = root.querySelector('[data-reset]');
  var anfrageLink = root.querySelector('[data-anfrage]');
  var mailBetreff = 'Anfrage%20Wartungsvertrag';
  var mailAdresse = 'kontakt@clavis-itservice.de';

  function formatEuro(betrag) {
    return betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  function zeilenWert(zeile) {
    var preis = parseFloat(zeile.getAttribute('data-preis')) || 0;
    var anzahl = parseInt(zeile.getAttribute('data-anzahl'), 10) || 0;
    return { preis: preis, anzahl: anzahl, summe: preis * anzahl };
  }

  function zeileAktualisieren(zeile) {
    var werte = zeilenWert(zeile);
    var anzeige = zeile.querySelector('[data-anzeige]');
    var zeilensumme = zeile.querySelector('[data-zeilensumme]');
    if (anzeige) anzeige.textContent = String(werte.anzahl);
    if (zeilensumme) zeilensumme.textContent = formatEuro(werte.summe);

    var minusBtn = zeile.querySelector('[data-aktion="minus"]');
    var min = parseInt(zeile.getAttribute('data-min'), 10) || 0;
    if (minusBtn) minusBtn.disabled = werte.anzahl <= min;
  }

  function gesamtAktualisieren() {
    var gesamt = zeilen.reduce(function (summe, zeile) {
      return summe + zeilenWert(zeile).summe;
    }, 0);
    if (summeEl) summeEl.textContent = formatEuro(gesamt);
    if (anfrageLink) anfrageLink.href = mailtoHref(gesamt);
  }

  function mailtoHref(gesamt) {
    var zeilen2 = zeilen
      .map(function (zeile) {
        var werte = zeilenWert(zeile);
        if (werte.anzahl <= 0) return null;
        var label = zeile.querySelector('[data-einheit]');
        var name = zeile.querySelector('.rechner__label');
        var einheit = zeile.getAttribute('data-einheit') || '';
        return (name ? name.textContent : '') + ': ' + werte.anzahl + ' x ' + einheit + ' = ' + formatEuro(werte.summe).replace(' ', ' ');
      })
      .filter(Boolean);

    var body =
      'Guten Tag,%0D%0A%0D%0Aich interessiere mich für einen Wartungsvertrag mit folgender Zusammenstellung:%0D%0A%0D%0A' +
      zeilen2.map(encodeURIComponent).join('%0D%0A') +
      '%0D%0A%0D%0AMonatsbeitrag (unverbindliche Kalkulation): ' +
      encodeURIComponent(formatEuro(gesamt).replace(' ', ' ')) +
      ' netto zzgl. 19%25 USt.%0D%0A%0D%0ABitte melden Sie sich bei mir.';

    return 'mailto:' + mailAdresse + '?subject=' + mailBetreff + '&body=' + body;
  }

  zeilen.forEach(function (zeile) {
    zeileAktualisieren(zeile);

    zeile.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-aktion]');
      if (!btn) return;

      var anzahl = parseInt(zeile.getAttribute('data-anzahl'), 10) || 0;
      var min = parseInt(zeile.getAttribute('data-min'), 10) || 0;

      if (btn.getAttribute('data-aktion') === 'plus') {
        anzahl += 1;
      } else if (btn.getAttribute('data-aktion') === 'minus') {
        anzahl = Math.max(min, anzahl - 1);
      }

      zeile.setAttribute('data-anzahl', String(anzahl));
      zeileAktualisieren(zeile);
      gesamtAktualisieren();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      zeilen.forEach(function (zeile) {
        var start = zeile.getAttribute('data-start');
        var min = parseInt(zeile.getAttribute('data-min'), 10) || 0;
        zeile.setAttribute('data-anzahl', start !== null ? start : String(min));
        zeileAktualisieren(zeile);
      });
      gesamtAktualisieren();
    });
  }

  zeilen.forEach(function (zeile) {
    zeile.setAttribute('data-start', zeile.getAttribute('data-anzahl'));
  });

  gesamtAktualisieren();
})();
