# Anmeldesystem

Eine einfache Anmeldeseite mit Registrierung und echter serverseitiger Anmeldung. Die Oberfläche verwendet HTML, CSS und JavaScript; Node.js und SQLite verarbeiten Konten und Sitzungen.

## Voraussetzungen

- Node.js 20 oder neuer
- npm (wird mit Node.js installiert)

## Lokal starten

1. Lade das Repository herunter und entpacke die ZIP-Datei.
2. Öffne einen Terminal-/Konsolen-Tab im Projektordner.
3. Installiere die Abhängigkeiten:

   ```bash
   npm install
   ```

4. Starte den Server:

   ```bash
   npm start
   ```

5. Öffne **http://localhost:3000** im Browser. Öffne `index.html` nicht direkt per Doppelklick, weil dann kein Backend für die Anmeldung läuft.

Beim ersten Registrieren wird ein Benutzerkonto in der SQLite-Datenbank erstellt. Passwörter werden mit Argon2id gehasht; sie werden nicht im Klartext gespeichert. Sitzungen werden serverseitig verwaltet.

## Wichtige Hinweise

- GitHub Pages kann nur die statische Oberfläche ausliefern. Für die echte Anmeldung muss der Node.js-Server auf einem Server laufen, der Node.js unterstützt.
- Für den produktiven Internetbetrieb müssen HTTPS und ein starkes, geheimes `SESSION_SECRET` in der Server-Umgebung gesetzt sein. Lege außerdem `APP_ORIGIN` auf die genaue öffentliche Adresse deiner Website fest.
- Die Datenbank und Sitzungsdateien liegen im Verzeichnis `data`. Sichere dieses Verzeichnis und veröffentliche es nicht.
- Private Dateien werden nicht automatisch öffentlich gemacht. Der Beispiel-Endpunkt erlaubt nur die Datei, die ausdrücklich in `server.js` eingetragen ist.

## Server-Start für die Entwicklung

```bash
npm install
npm start
```
