/*
 * Lern-Demo, KEINE echte sichere Authentifizierung.
 * localStorage ist für eine öffentliche Website nicht geeignet,
 * um Passwörter oder echte Zugangsdaten zu speichern.
 */
const USERS_KEY = "authDemoUsers";
const SESSION_KEY = "authDemoSession";

const authView = document.querySelector("#auth-view");
const appView = document.querySelector("#app-view");
const form = document.querySelector("#auth-form");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const title = document.querySelector("#panel-title");
const subtitle = document.querySelector("#panel-subtitle");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirm-password");
const confirmLabel = document.querySelector("#confirm-label");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#message");
let mode = "login";

function readUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
function showMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle("success", success);
}
function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);
  loginTab.setAttribute("aria-selected", String(!registering));
  registerTab.setAttribute("aria-selected", String(registering));
  title.textContent = registering ? "Konto erstellen" : "Willkommen zurück";
  subtitle.textContent = registering ? "Erstelle ein Demo-Konto für diesen Browser." : "Melde dich mit deinem Konto an.";
  confirmLabel.classList.toggle("hidden", !registering);
  confirmPassword.classList.toggle("hidden", !registering);
  confirmPassword.required = registering;
  password.autocomplete = registering ? "new-password" : "current-password";
  submitButton.innerHTML = registering ? 'Konto erstellen <span>→</span>' : 'Anmelden <span>→</span>';
  showMessage("");
}
function openApp(username) {
  authView.classList.add("hidden");
  appView.classList.remove("hidden");
  document.querySelector("#welcome-user").textContent = username;
  document.querySelector("#user-avatar").textContent = username.slice(0, 1).toUpperCase();
}
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  appView.classList.add("hidden");
  authView.classList.remove("hidden");
  form.reset();
  setMode("login");
}
loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
document.querySelector("#logout-button").addEventListener("click", logout);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#username").value.trim();
  const pass = password.value;
  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
    showMessage("Benutzername: 3–32 Zeichen, nur Buchstaben, Zahlen, _ und -.");
    return;
  }
  if (pass.length < 8) {
    showMessage("Das Passwort muss mindestens 8 Zeichen lang sein.");
    return;
  }

  const users = readUsers();
  const key = username.toLowerCase();
  if (mode === "register") {
    if (users[key]) {
      showMessage("Dieser Benutzername ist bereits vergeben.");
      return;
    }
    if (pass !== confirmPassword.value) {
      showMessage("Die Passwörter stimmen nicht überein.");
      return;
    }
    // Nur für eine lokale Demo: Passwörter werden hier unsicher im Browser gespeichert.
    users[key] = { username, password: pass };
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {
      showMessage("Speichern nicht möglich. Prüfe die Browser-Einstellungen.");
      return;
    }
    showMessage("Konto erstellt. Du bist jetzt angemeldet.", true);
  } else {
    if (!users[key] || users[key].password !== pass) {
      showMessage("Benutzername oder Passwort ist falsch.");
      return;
    }
  }

  sessionStorage.setItem(SESSION_KEY, username);
  openApp(username);
});

const activeSession = sessionStorage.getItem(SESSION_KEY);
if (activeSession) openApp(activeSession);
