/* ==========================================================================
   Crop library behaviour (crops.html)
   Clicking a crop card (or pressing Enter / Space on it) opens its growing
   guide in the side panel.
   Requires: js/common.js, js/crop-data.js, js/crop-panel.js
   ========================================================================== */
(function (GB) {
  "use strict";

  document.querySelectorAll(".crop-card").forEach(function (card) {
    var crop = GB.findCrop(card.getAttribute("data-crop"));
    if (!crop) return;

    card.addEventListener("click", function () {
      GB.cropPanel.open(crop);
    });

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        GB.cropPanel.open(crop);
      }
    });
  });
})((window.GB = window.GB || {}));
