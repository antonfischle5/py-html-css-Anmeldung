# Anmeldesystem (PHP-Version für ALL-INKL)

Die Oberfläche nutzt HTML, CSS und JavaScript. Registrierung, Anmeldung und Sitzungen werden durch `api.php` mit PHP verarbeitet.

## Hochladen auf ALL-INKL

1. Lade diese Version als ZIP herunter und entpacke sie.
2. Lade `index.html`, `api.php` und den Ordner `private-files` in den Ordner deiner Domain hoch.
3. Lade den Ordner `data` mit seiner `.htaccess` ebenfalls hoch. PHP legt darin die SQLite-Datenbank an.
4. Stelle sicher, dass der Ordner `data` vom PHP-Prozess beschreibbar ist. Verwende möglichst restriktive Dateirechte.
5. Öffne die Website über HTTPS und teste zuerst die Registrierung mit einem Testkonto.

## Voraussetzungen

- PHP mit PDO_SQLITE (muss auf dem Hosting aktiviert sein)
- Schreibrechte für den Ordner `data`
- HTTPS für den produktiven Betrieb

Wenn beim Registrieren die Meldung erscheint, dass PDO_SQLITE nicht verfügbar ist, kann diese PHP-Version die benötigte SQLite-Datenbank nicht verwenden. Dann muss eine unterstützte Datenbank eingerichtet oder eine andere Hosting-Variante verwendet werden.

## Sicherheit

- Passwörter werden mit `password_hash` gehasht und beim Login mit `password_verify` geprüft.
- Sitzungen verwenden HTTP-only-Cookies, SameSite Strict und werden nach erfolgreicher Anmeldung erneuert.
- Anmeldeversuche werden pro IP in einem 15-Minuten-Fenster begrenzt.
- Die Ordner `data` und `private-files` enthalten Schutzdateien, damit ihre Inhalte nicht direkt über den Browser abgerufen werden können.
- Die bisherige Node.js-Version bleibt in `server.js` und `package.json` erhalten. Diese PHP-Version ist auf dem Branch `php-backend`, damit die bisherige `main`-Version nicht überschrieben wird.

## Lokal testen

Zum Testen benötigst du PHP mit PDO_SQLITE. Lege die Dateien in einen lokalen Webserver-Ordner und öffne die Seite über diesen Webserver. Nicht einfach per Doppelklick auf `index.html` öffnen.
