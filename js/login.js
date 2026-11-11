/* ==========================================================================
   Login page behaviour (login.html)
   Validates the form, stores { name, email } locally and returns to index.html.
   Replace the GB.saveUser() call with a real authentication API when ready.
   Requires: js/common.js
   ========================================================================== */
(function (GB) {
  "use strict";

  var HOME_URL = "index.html";

  var form = document.getElementById("loginForm");
  var nameInput = document.getElementById("loginName");
  var emailInput = document.getElementById("loginEmail");
  var passwordInput = document.getElementById("loginPassword");
  var errorBox = document.getElementById("loginError");

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!name || !email || password.length < 6) {
      showError("Enter your name, email, and a password of at least 6 characters.");
      return;
    }

    errorBox.hidden = true;

    if (!GB.saveUser({ name: name, email: email })) {
      showError("Your browser is blocking local storage, so we couldn’t sign you in.");
      return;
    }

    window.location.href = HOME_URL;
  });
})((window.GB = window.GB || {}));
