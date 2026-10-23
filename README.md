# Anmeldesystem – HTML, CSS und JavaScript

Ein kleines, wiederverwendbares **Frontend-Demo** für Registrierung, Anmeldung, Abmeldung und einen Beispiel-Dateibereich.

## Dateien
- `index.html` – Anmelde- und Registrierungsoberfläche
- `style.css` – responsives dunkles Design
- `script.js` – Demo-Logik
- Nach Registrierung erscheint ein Dateibereich mit Links zu Projektdateien.

## Lokal starten
1. Repository herunterladen oder klonen.
2. `index.html` im Browser öffnen (alternativ mit der VS-Code-Erweiterung Live Server).
3. Einen Benutzernamen und ein Passwort mit mindestens 8 Zeichen wählen.
4. Abmelden und mit denselben Daten wieder anmelden.

## Wo werden die Daten gespeichert?
- Demo-Benutzerkonten liegen im `localStorage` des jeweiligen Browsers und bleiben dort normalerweise auch nach dem Schließen erhalten.
- Die aktuelle Anmeldung wird im `sessionStorage` gehalten und endet normalerweise, wenn die Browser-Sitzung geschlossen wird.
- Die Konten werden **nicht** automatisch zwischen Geräten oder Browsern synchronisiert.

## Wichtige Sicherheitsgrenze
**Diese Version ist nur zum Lernen und für lokale Demos geeignet. Nicht für echte Konten oder private Dateien verwenden.** Passwörter im Browser-`localStorage` sind nicht sicher. Da HTML/CSS/JavaScript hier ohne Backend laufen, kann jeder die Dateien direkt aufrufen und die Anmeldung umgehen. Die Anmeldung sperrt also nur die Demo-Oberfläche, nicht die Dateien selbst.

Für ein echtes System brauchst du ein Backend (z. B. Node.js), eine Datenbank, Passwort-Hashing mit Argon2id oder bcrypt, sichere serverseitige Sitzungen und Zugriffskontrollen auf dem Server. Geheimnisse und echte Passwörter dürfen niemals in GitHub-Dateien gespeichert werden.

## Wiederverwendung in anderen Projekten
Die Oberfläche und das Verhalten sind bewusst getrennt:
- Design anpassen in `style.css`
- Formular und Ansichten anpassen in `index.html`
- Authentifizierungslogik ersetzen in `script.js`

Wenn du die Demo später produktiv nutzen möchtest, ersetze die lokale Prüfung durch Anfragen an einen Backend-Endpunkt wie `POST /api/register` und `POST /api/login`. Der Server muss bei jedem privaten Dateiabruf selbst prüfen, ob die Sitzung berechtigt ist.
