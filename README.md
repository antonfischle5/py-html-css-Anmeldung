# Sicheres Anmeldesystem (Node.js)

Ein kleines, wiederverwendbares Login-System mit HTML/CSS/JavaScript im Frontend und Node.js/Express im Backend.

## Was ist sicherer als die vorherige Demo?

- **Passwörter werden nicht im Klartext gespeichert.** Der Server hasht sie mit Argon2id. Ein Hash ist keine verschlüsselte, wieder entschlüsselbare Kopie.
- Benutzerkonten liegen in einer SQLite-Datenbank unter `data/users.sqlite`. Dieser Ordner wird nicht als Website ausgeliefert.
- Sitzungen werden serverseitig in SQLite gespeichert. Der Browser erhält nur ein Cookie mit `HttpOnly`, `SameSite=Strict` und in Produktion `Secure`.
- Bei Anmeldung und Registrierung wird die Sitzungs-ID erneuert.
- Login-/Registrierungsversuche sind begrenzt; Helmet setzt wichtige HTTP-Sicherheitsheader.
- Private Beispieldateien werden nur über API-Routen nach Prüfung der Sitzung ausgeliefert. Es gibt keine allgemeine Freigabe des Projektordners.

## Voraussetzungen

- Node.js 20 oder neuer
- HTTPS für den öffentlichen Server (z. B. Reverse Proxy mit Let's Encrypt)

## Lokal starten

```bash
npm install
npm run dev
```

Öffne dann http://localhost:3000. Neue Konten benötigen ein Passwort mit mindestens **12 Zeichen**.

## Auf dem eigenen Server starten

1. Projekt auf den Server laden.
2. Node.js 20+ installieren und im Projektordner `npm install` ausführen.
3. Einen langen, zufälligen Sitzungsschlüssel als Umgebungsvariable setzen. Beispiel zum Erzeugen: `openssl rand -hex 32`.
4. `NODE_ENV=production`, `SESSION_SECRET` und `APP_ORIGIN=https://deine-domain.example` in der Server-Umgebung konfigurieren. Ersetze die Beispiel-Domain durch deine echte HTTPS-Adresse.
5. Starte mit `npm start` und betreibe den Prozess dauerhaft, z. B. mit systemd oder einem Prozessmanager.
6. Richte einen Reverse Proxy ein, der HTTPS erzwingt. Falls der Proxy TLS beendet, setze zusätzlich `TRUST_PROXY=1`.
7. Sorge dafür, dass nur der Server-Benutzer auf den Ordner `data/` zugreifen kann. Sichere die Datenbank regelmäßig mit Backups.

`SESSION_SECRET` niemals in GitHub committen. Setze `DATA_DIR` auf einen dauerhaften, nicht öffentlich erreichbaren Ordner, wenn deine Hosting-Umgebung temporäre Projektverzeichnisse verwendet.

## Private Dateien hinzufügen

1. Lege die Datei in `private-files/` ab.
2. Füge in `server.js` einen festen Eintrag in das Objekt `privateFiles` ein, z. B. eine ID und einen Dateipfad.
3. Lade Dateien ausschließlich über `/api/files` und `/api/files/:id`. Übernimm niemals einen beliebigen Dateipfad direkt aus einer URL.
4. Falls unterschiedliche Benutzer verschiedene Dateien sehen dürfen, ergänze eine Berechtigungsprüfung pro Benutzer und Datei.

## Wichtig

Das ist ein solides Lern-/Starterprojekt, aber kein automatisch vollständig geprüftes Produktionsprodukt. Halte Node.js und Pakete aktuell, nutze ausschließlich HTTPS, überwache Loginversuche und prüfe die Konfiguration deines Servers. Registrierung ist derzeit öffentlich offen. Für ein privates Projekt solltest du sie abschalten oder nur Einladungen erlauben. Alte Konten aus der vorherigen localStorage-Demo werden nicht übernommen; registriere neue Konten.
