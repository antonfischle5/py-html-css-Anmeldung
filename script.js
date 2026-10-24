const form = document.querySelector("#auth-form");
const title = document.querySelector("#panel-title");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const confirmField = document.querySelector("#confirm-field");
const confirmPassword = document.querySelector("#confirm-password");
const submitButton = document.querySelector("#submit-button");
const switchText = document.querySelector("#switch-text");
const switchLink = document.querySelector("#switch-link");
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

  title.textContent = registering ? "Register Here" : "Login Here";
  submitButton.textContent = registering ? "Register" : "Login";
  switchText.textContent = registering ? "Already a Member?" : "Not yet a Member?";
  switchLink.textContent = registering ? "Login" : "Register";
  confirmField.classList.toggle("hidden", !registering);
  confirmPassword.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  passwordInput.minLength = registering ? 12 : 1;
  showMessage("");
}

switchLink.addEventListener("click", (event) => {
  event.preventDefault();
  setMode(mode === "login" ? "register" : "login");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username)) {
    showMessage("Username must be 3–32 characters and use only letters, numbers, _ or -.");
    return;
  }
  if (mode === "register" && password.length < 12) {
    showMessage("Password must be at least 12 characters long.");
    return;
  }
  if (mode === "register" && password !== confirmPassword.value) {
    showMessage("The passwords do not match.");
    return;
  }

  busy = true;
  submitButton.disabled = true;
  showMessage(mode === "register" ? "Creating account..." : "Logging in...");

  try {
    const response = await fetch(mode === "register" ? "/api/register" : "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username, password })
    });
    const result = response.status === 204 ? {} : await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(result.error || "Something went wrong. Please try again.");
      return;
    }

    showMessage(
      mode === "register" ? "Account created successfully." : "Login successful.",
      true
    );
    form.querySelectorAll(".field, .actions").forEach((element) => {
      element.classList.add("hidden");
    });
    title.textContent = "Success";
  } catch {
    showMessage("The server could not be reached. Start the project with npm start and open http://localhost:3000.");
  } finally {
    busy = false;
    submitButton.disabled = false;
  }
});
