/* ==========================================================================
   Home page behaviour (index.html)
   - Header shows the signed-in user's name, or a "Sign in" button
   - Protected actions (Get started, Find the crop, Explore Crops, Start with
     your farm, Sign in) show a "Login first!" toast and, when signed out,
     send the visitor to login.html after 5 seconds
   - "Find the crop" opens a photo picker and shows the chosen file name
   - "Let's start with your growing space" dialog links to the 3 farm pages
   Requires: js/common.js, js/crop-data.js
   ========================================================================== */
(function (GB) {
  "use strict";

  var LOGIN_URL = "login.html";
  var CROPS_URL = "crops.html";
  var REDIRECT_DELAY_MS = 5000;

  var user = GB.getUser();
  var loginTimer = null;

  var signInButton = document.getElementById("signInButton");
  var userName = document.getElementById("userName");
  var toast = document.getElementById("loginToast");
  var toastBar = toast.querySelector("i");
  var dialog = document.getElementById("startDialog");
  var dialogClose = document.getElementById("startDialogClose");
  var farmOptions = document.getElementById("farmOptions");
  var fileInput = document.getElementById("cropPhoto");
  var recognitionTitle = document.getElementById("recognitionTitle");
  var recognitionText = document.getElementById("recognitionText");

  var defaultTitle = recognitionTitle.textContent;
  var defaultText = recognitionText.textContent;
  var dialogOpener = null;

  /* ---- Signed-in / signed-out header ---- */
  if (user) {
    signInButton.hidden = true;
    userName.hidden = false;
    userName.textContent = user.name;
    userName.title = user.email || "";
  }

  /* ---- Login gate ---- */
  function showLoginPrompt() {
    var alreadyVisible = !toast.hidden;
    toast.hidden = false;

    if (alreadyVisible) {
      // Restart the 5-second countdown bar so it matches the new timer.
      toastBar.style.animation = "none";
      void toastBar.offsetWidth;
      toastBar.style.animation = "";
    }

    if (loginTimer) window.clearTimeout(loginTimer);
    loginTimer = window.setTimeout(function () {
      window.location.href = LOGIN_URL;
    }, REDIRECT_DELAY_MS);
  }

  function requireLogin(action) {
    if (user) {
      action();
      return;
    }
    showLoginPrompt();
  }

  /* ---- Start dialog ---- */
  function openDialog(opener) {
    dialogOpener = opener || null;
    dialog.hidden = false;
    dialogClose.focus();
  }

  function closeDialog() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    if (dialogOpener) dialogOpener.focus();
    dialogOpener = null;
  }

  (GB.farmProfiles || []).forEach(function (profile) {
    var button = document.createElement("button");
    button.type = "button";
    button.appendChild(document.createTextNode(profile.option));

    var arrow = document.createElement("img");
    arrow.src = "assets/icons/arrow-up-right-dark.svg";
    arrow.alt = "";
    button.appendChild(arrow);

    button.addEventListener("click", function () {
      window.location.href = profile.page;
    });
    farmOptions.appendChild(button);
  });

  dialogClose.addEventListener("click", closeDialog);

  // Clicking the dimmed backdrop (but not the dialog itself) closes it.
  dialog.addEventListener("mousedown", function (event) {
    if (event.target === dialog) closeDialog();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDialog();
  });

  /* ---- Buttons ---- */
  signInButton.addEventListener("click", function () {
    requireLogin(function () {});
  });

  [document.getElementById("getStartedButton"), document.getElementById("startFarmButton")].forEach(
    function (button) {
      button.addEventListener("click", function () {
        requireLogin(function () {
          openDialog(button);
        });
      });
    },
  );

  document.getElementById("exploreCropsButton").addEventListener("click", function () {
    requireLogin(function () {
      window.location.href = CROPS_URL;
    });
  });

  document.getElementById("findCropButton").addEventListener("click", function () {
    requireLogin(function () {
      fileInput.click();
    });
  });

  /* ---- Photo picker ---- */
  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    if (file) {
      recognitionTitle.textContent = "Photo ready to identify";
      recognitionText.textContent =
        file.name + " is ready. We’ll compare its leaves, shape, and growing pattern.";
    } else {
      recognitionTitle.textContent = defaultTitle;
      recognitionText.textContent = defaultText;
    }
  });
})((window.GB = window.GB || {}));
