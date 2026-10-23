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
const fileList = document.querySelector("#file-list");
const filePreview = document.querySelector("#file-preview");
let mode = "login";

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
  subtitle.textContent = registering ? "Erstelle ein Konto für diese Website." : "Melde dich mit deinem Konto an.";
  confirmLabel.classList.toggle("hidden", !registering);
  confirmPassword.classList.toggle("hidden", !registering);
  confirmPassword.required = registering;
  password.autocomplete = registering ? "new-password" : "current-password";
  password.minLength = registering ? 12 : 1;
  submitButton.innerHTML = registering ? 'Konto erstellen <span>→</span>' : 'Anmelden <span>→</span>';
  showMessage("");
}
function showApp(username) {
  authView.classList.add("hidden");
  appView.classList.remove("hidden");
  document.querySelector("#welcome-user").textContent = username;
  document.querySelector("#user-avatar").textContent = username.slice(0, 1).toUpperCase();
  loadFiles();
}
function showAuth() {
  appView.classList.add("hidden");
  authView.classList.remove("hidden");
  filePreview.classList.add("hidden");
  form.reset();
  setMode("login");
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Die Anfrage ist fehlgeschlagen.");
  return data;
}
async function loadFiles() {
  fileList.replaceChildren();
  try {
    const files = await api("/api/files");
    for (const file of files) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "file";
      const icon = document.createElement("span");
      icon.className = "file-icon";
      icon.textContent = "TXT";
      const text = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = file.name;
      const description = document.createElement("small");
      description.textContent = "Geschützte Serverdatei";
      text.append(name, description);
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.textContent = "→";
      button.append(icon, text, arrow);
      button.addEventListener("click", () => openFile(file));
      fileList.append(button);
    }
  } catch {
    showMessage("Dateiliste konnte nicht geladen werden.");
  }
}
async function openFile(file) {
  try {
    const content = await api("/api/files/" + encodeURIComponent(file.id));
    document.querySelector("#preview-name").textContent = file.name;
    document.querySelector("#preview-content").textContent = content;
    filePreview.classList.remove("hidden");
  } catch (error) {
    showMessage(error.message);
  }
}
loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
document.querySelector("#close-preview").addEventListener("click", () => filePreview.classList.add("hidden"));
document.querySelector("#logout-button").addEventListener("click", async () => {
  try { await api("/api/logout", { method: "POST" }); } catch {}
  showAuth();
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.querySelector("#username").value.trim();
  const pass = password.value;
  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
    showMessage("Benutzername: 3–32 Zeichen, nur Buchstaben, Zahlen, _ und -.");
    return;
  }
  if (mode === "register" && pass.length < 12) {
    showMessage("Das Passwort muss mindestens 12 Zeichen lang sein.");
    return;
  }
  if (mode === "register" && pass !== confirmPassword.value) {
    showMessage("Die Passwörter stimmen nicht überein.");
    return;
  }
  submitButton.disabled = true;
  try {
    const result = await api(mode === "register" ? "/api/register" : "/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password: pass })
    });
    showApp(result.username);
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

api("/api/me").then(data => showApp(data.username)).catch(() => showAuth());
