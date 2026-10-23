# Anmeldemenü – Designvorschau

Diese Website ist eine **statische Designvorschau** für ein Anmeldemenü. Sie kann über GitHub Pages oder direkt als HTML-Datei angezeigt werden.

## Was funktioniert in der Vorschau?

- Zwischen „Anmelden“ und „Konto erstellen“ wechseln
- Formularfelder und einfache Eingabeprüfung ausprobieren
- Nach Absenden eine Beispielansicht mit Beispieldateien öffnen
- Beispiel-Dateien in einer Vorschau ansehen und sich wieder abmelden
- Layout auf Desktop und Smartphone ansehen

## Wichtig: keine echte Anmeldung

Die Vorschau erstellt keine Konten, sendet keine Daten an einen Server und speichert keine Passwörter. Beliebige Testdaten reichen, um die Oberfläche auszuprobieren. Die angezeigten Dateien sind nur Beispiele.

**Für echte Konten auf deinem eigenen Server** ist das separate Backend in `server.js` nötig. Dafür gelten die Installationsanweisungen und Sicherheitsvoraussetzungen weiter unten in diesem Repository. Eine statische GitHub-Pages-Seite kann selbst keine sichere serverseitige Passwortprüfung durchführen.

## Lokale Vorschau

Öffne `index.html` im Browser oder veröffentliche das Repository mit GitHub Pages. Die Dateien verwenden relative Pfade, damit es auch unter einer GitHub-Pages-Projektadresse funktioniert.

## Echtes Backend starten

Benötigt Node.js 20 oder neuer:

```bash
npm install
npm run dev
```

Für den Betrieb im Internet sind zusätzlich HTTPS, ein sicher gesetzter `SESSION_SECRET`, eine passende `APP_ORIGIN`-Umgebungsvariable und eine geprüfte Serverkonfiguration erforderlich. Siehe `server.js` und die weiter unten dokumentierten Schritte aus der vorherigen Version.
