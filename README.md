# Fix&Fertig IT – Website

Website von **Fix&Fertig IT** (Eymen Kumaru) in reinem HTML, CSS und JavaScript – inklusive aller Unterseiten, Schriften, Bilder (AVIF/WebP/JPG/SVG), interaktiver Anfahrtskarte und Hell-/Dunkel-Modus.

## Enthaltene Seiten

- [`index.html`](./index.html) – Startseite (`/`)
- [`leistungen.html`](./leistungen.html) – Leistungen für Zuhause (`/leistungen`)
- [`preise.html`](./preise.html) – Preise & interaktive Einzugsgebietskarte (`/preise`)
- [`ueber-mich.html`](./ueber-mich.html) – Über mich (`/ueber-mich`)
- [`kontakt.html`](./kontakt.html) – Kontakt (`/kontakt`)
- [`impressum.html`](./impressum.html) – Impressum (`/impressum`)
- [`datenschutz.html`](./datenschutz.html) – Datenschutz (`/datenschutz`)

## Starten

### Option 1: Mitgelieferter lokaler Webserver (empfohlen, unterstützt saubere URLs wie `/leistungen`)

```bash
npm start
# Fix&Fertig IT – Website
node server.js
```

Anschließend im Browser öffnen: **http://localhost:3000**

### Option 2: Direkt im Dateisystem öffnen

Du kannst [`index.html`](./index.html) auch direkt per Doppelklick im Browser öffnen (`file://`-Protokoll wird durch einen automatischen Link-Handler in `assets/js/main.js` unterstützt).
