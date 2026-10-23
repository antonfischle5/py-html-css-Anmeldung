// Reine Designvorschau für GitHub Pages. Keine Konten oder Passwörter werden gespeichert.
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

const demoFiles = [
  { id: "welcome", name: "Willkommen.txt", content: "Willkommen!\n\nDies ist nur eine Beispiel-Datei für die Designvorschau.\nEs wurden keine echten Dateien geladen." },
  { id: "notes", name: "Notizen.txt", content: "Hier könnten später deine eigenen Dateien angezeigt werden.\n\nDies ist eine Vorschau, keine echte Dateiverwaltung." }
];

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
  subtitle.textContent = registering ? "Vorschau des Registrierungsformulars." : "Probiere das Design mit beliebigen Testdaten aus.";
  confirmLabel.classList.toggle("hidden", !registering);
  confirmPassword.classList.toggle("hidden", !registering);
  confirmPassword.required = registering;
  password.autocomplete = registering ? "new-password" : "current-password";
  password.minLength = registering ? 12 : 1;
  password.placeholder = registering ? "Mindestens 12 Zeichen" : "Beliebiges Testpasswort";
  submitButton.innerHTML = registering ? 'Vorschau öffnen <span>→</span>' : 'Vorschau öffnen <span>→</span>';
  showMessage("");
}
function showApp(username) {
  authView.classList.add("hidden");
  appView.classList.remove("hidden");
  document.querySelector("#welcome-user").textContent = username;
  document.querySelector("#user-avatar").textContent = username.slice(0, 1).toUpperCase();
  fileList.replaceChildren();
  for (const file of demoFiles) {
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
    description.textContent = "Beispieldatei · nur Vorschau";
    text.append(name, description);
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "→";
    button.append(icon, text, arrow);
    button.addEventListener("click", () => {
      document.querySelector("#preview-name").textContent = file.name;
      document.querySelector("#preview-content").textContent = file.content;
      filePreview.classList.remove("hidden");
    });
    fileList.append(button);
  }
}
function showAuth() {
  appView.classList.add("hidden");
  authView.classList.remove("hidden");
  filePreview.classList.add("hidden");
  form.reset();
  setMode("login");
}
loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
document.querySelector("#close-preview").addEventListener("click", () => filePreview.classList.add("hidden"));
document.querySelector("#logout-button").addEventListener("click", showAuth);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#username").value.trim();
  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
    showMessage("Benutzername: 3–32 Zeichen, nur Buchstaben, Zahlen, _ und -.");
    return;
  }
  if (mode === "register" && password.value.length < 12) {
    showMessage("Für die Vorschau mindestens 12 Zeichen eingeben.");
    return;
  }
  if (mode === "register" && password.value !== confirmPassword.value) {
    showMessage("Die Passwörter stimmen nicht überein.");
    return;
  }
  // Passwort wird absichtlich weder gespeichert noch weiterverarbeitet.
  password.value = "";
  confirmPassword.value = "";
  showApp(username);
});
