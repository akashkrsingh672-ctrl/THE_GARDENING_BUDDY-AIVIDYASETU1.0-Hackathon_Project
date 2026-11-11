/* ==========================================================================
   Home page behaviour (index.html)
   - Header shows the signed-in user's name, or a "Sign in" button
   - Protected actions (Get started, Find the crop, Explore Crops, Start with
     your farm, Sign in) show a "Login first!" toast and, when signed out,
     send the visitor to login.html after 5 seconds
   - "Find the crop" identifies an uploaded photo through the server-side OpenAI API proxy
   - "Let's start with your growing space" dialog links to the 3 farm pages
   Requires: js/common.js, js/crop-data.js, js/crop-panel.js
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
  var recognitionPreview = document.getElementById("recognitionPreview");
  var identifyCropButton = document.getElementById("identifyCropButton");
  var recognitionResults = document.getElementById("recognitionResults");
  var selectedPhoto = null;
  var previewUrl = null;

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
      fileInput.value = "";
      fileInput.click();
    });
  });

  /* ---- Photo identification ---- */
  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    recognitionResults.replaceChildren();
    if (!file) return;
    selectedPhoto = null;
    identifyCropButton.hidden = true;
    recognitionPreview.hidden = true;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    if (["image/jpeg", "image/png", "image/webp"].indexOf(file.type) < 0) {
      recognitionTitle.textContent = "Choose a supported photo";
      recognitionText.textContent = "Use a JPEG, PNG, or WebP image.";
      identifyCropButton.hidden = true;
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      recognitionTitle.textContent = "This photo is too large";
      recognitionText.textContent = "Choose an image under 12 MB and we’ll resize it before sending.";
      identifyCropButton.hidden = true;
      return;
    }
    selectedPhoto = file;
    previewUrl = URL.createObjectURL(file);
    recognitionPreview.src = previewUrl;
    recognitionPreview.hidden = false;
    identifyCropButton.hidden = false;
    recognitionTitle.textContent = "Photo ready to identify";
    recognitionText.textContent = file.name + " · Your photo will be sent securely to OpenAI for plant identification.";
  });

  function makeSmallJpeg(file) {
    return createImageBitmap(file).then(function (bitmap) {
      var maxPixels = 2000000;
      var maxSide = 1500;
      var scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height), Math.sqrt(maxPixels / (bitmap.width * bitmap.height)));
      var canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      var context = canvas.getContext("2d", { alpha: false });
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) { reject(new Error("The photo could not be prepared.")); return; }
          resolve(blob);
        }, "image/jpeg", 0.86);
      });
    });
  }

  function showIdentification(data) {
    recognitionResults.replaceChildren();
    if (!data.isPlant) {
      recognitionTitle.textContent = "We couldn’t confirm this is a plant";
      recognitionText.textContent = "Try a clear photo with the plant filling most of the frame.";
      return;
    }
    var matches = Array.isArray(data.matches) ? data.matches.slice(0, 3) : [];
    if (!matches.length) {
      recognitionTitle.textContent = "No clear match yet";
      recognitionText.textContent = "Try another photo showing leaves, flowers, or fruit.";
      return;
    }
    recognitionTitle.textContent = matches[0].confidence === "low" ? "Possible plant matches" : "Likely plant matches";
    recognitionText.textContent = "Compare these suggestions with the plant in your photo. Confidence is a model estimate, not a guarantee.";
    matches.forEach(function (match, index) {
      var row = document.createElement("div");
      row.className = "recognition-match";
      var main = document.createElement("div");
      main.className = "recognition-match-main";
      var commonName = document.createElement("strong");
      commonName.textContent = match.commonName || match.scientificName || "Unknown plant";
      main.appendChild(commonName);
      if (match.commonName && match.scientificName) {
        var scientific = document.createElement("span");
        scientific.className = "recognition-scientific-name";
        scientific.textContent = match.scientificName;
        main.appendChild(scientific);
      }
      if (match.reason) {
        var reason = document.createElement("span");
        reason.textContent = match.reason;
        main.appendChild(reason);
      }
      row.appendChild(main);
      var confidence = document.createElement("span");
      confidence.className = "recognition-confidence confidence-" + match.confidence;
      confidence.textContent = match.confidence + " confidence";
      row.appendChild(confidence);
      var crop = (GB.crops || []).find(function (item) {
        return item.scientificName && item.scientificName.toLowerCase() === String(match.scientificName || "").toLowerCase();
      });
      if (crop && GB.cropPanel) {
        var guide = document.createElement("button");
        guide.type = "button";
        guide.className = "recognition-guide";
        guide.textContent = "Growing guide";
        guide.addEventListener("click", function () { GB.cropPanel.open(crop); });
        row.appendChild(guide);
      }
      row.setAttribute("aria-label", "Suggestion " + (index + 1));
      recognitionResults.appendChild(row);
    });
    var note = document.createElement("p");
    note.className = "recognition-disclaimer";
    note.textContent = "AI plant identification can be wrong. Verify important decisions with a trusted local source.";
    recognitionResults.appendChild(note);
  }

  identifyCropButton.addEventListener("click", function () {
    if (!selectedPhoto) return;
    identifyCropButton.disabled = true;
    recognitionResults.replaceChildren();
    recognitionTitle.textContent = "Identifying your plant…";
    recognitionText.textContent = "Preparing a smaller copy of the photo, then checking likely matches.";
    makeSmallJpeg(selectedPhoto).then(function (blob) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result).split(",")[1]); };
        reader.onerror = function () { reject(new Error("The photo could not be read.")); };
        reader.readAsDataURL(blob);
      });
    }).then(function (image) {
      return fetch("/api/identify-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image })
      });
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) throw new Error(data.error || "Plant identification is temporarily unavailable.");
        return data;
      });
    }).then(showIdentification).catch(function (error) {
      recognitionTitle.textContent = "We couldn’t identify this photo";
      recognitionText.textContent = error.message || "Check your connection and try again.";
    }).finally(function () {
      identifyCropButton.disabled = false;
    });
  });
})((window.GB = window.GB || {}));
