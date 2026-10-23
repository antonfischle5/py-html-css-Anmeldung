const form = document.querySelector("#auth-form");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const title = document.querySelector("#panel-title");
const subtitle = document.querySelector("#panel-subtitle");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirm-password");
const confirmLabel = document.querySelector("#confirm-label");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#message");

let mode = "login";
let busy = false;

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
  subtitle.textContent = registering
    ? "Erstelle ein neues Konto."
    : "Melde dich mit deinem Konto an.";
  confirmLabel.classList.toggle("hidden", !registering);
  confirmPassword.classList.toggle("hidden", !registering);
  confirmPassword.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  passwordInput.minLength = registering ? 12 : 1;
  passwordInput.placeholder = registering ? "Mindestens 12 Zeichen" : "Dein Passwort";
  submitButton.innerHTML = registering
    ? 'Konto erstellen <span>→</span>'
    : 'Anmelden <span>→</span>';
  showMessage("");
}

async function submitAuth(event) {
  event.preventDefault();
  if (busy) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
    showMessage("Benutzername: 3–32 Zeichen, nur Buchstaben, Zahlen, _ und -.");
    return;
  }
  if (mode === "register" && password.length < 12) {
    showMessage("Das Passwort muss mindestens 12 Zeichen lang sein.");
    return;
  }
  if (mode === "register" && password !== confirmPassword.value) {
    showMessage("Die Passwörter stimmen nicht überein.");
    return;
  }

  busy = true;
  submitButton.disabled = true;
  showMessage(mode === "register" ? "Konto wird erstellt …" : "Anmeldung läuft …");

  try {
    const response = await fetch(mode === "register" ? "/api/register" : "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username, password })
    });
    const result = response.status === 204 ? {} : await response.json().catch(() => ({}));
    if (!response.ok) {
      showMessage(result.error || "Das hat leider nicht funktioniert. Bitte versuche es erneut.");
      return;
    }

    form.reset();
    showMessage(
      mode === "register"
        ? "Konto erfolgreich erstellt. Du bist jetzt angemeldet."
        : "Du bist erfolgreich angemeldet.",
      true
    );
    title.textContent = "Erfolgreich angemeldet";
    subtitle.textContent = "Du bist angemeldet als " + (result.username || username) + ".";
    form.classList.add("hidden");
    document.querySelector(".tabs").classList.add("hidden");
    confirmPassword.required = false;
  } catch {
    showMessage("Der Server ist nicht erreichbar. Starte das Projekt mit npm start und öffne http://localhost:3000.");
  } finally {
    busy = false;
    submitButton.disabled = false;
  }
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
form.addEventListener("submit", submitAuth);
