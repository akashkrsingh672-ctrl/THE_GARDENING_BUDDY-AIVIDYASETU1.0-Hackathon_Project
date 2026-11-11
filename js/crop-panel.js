/* ==========================================================================
   Crop growing-guide side panel
   Used by crops.html and the three farm pages.
   API:  GB.cropPanel.open(crop)   GB.cropPanel.close()   GB.cropPanel.isOpen()
   Requires: js/common.js
   ========================================================================== */
(function (GB) {
  "use strict";

  var panel = null;

  function buildHtml(crop) {
    var e = GB.escapeHtml;
    return (
      '<div class="panel-image">' +
      '<img src="' + e(crop.image) + '" alt="' + e(crop.name) + ' growing in the field" />' +
      '<button type="button" class="panel-close" aria-label="Close crop guide">×</button>' +
      "<div>" +
      "<span>GROWING GUIDE</span>" +
      "<h2>" + e(crop.name) + "</h2>" +
      "<p>" + e(crop.scientificName) + "</p>" +
      "</div>" +
      "</div>" +
      '<div class="panel-content">' +
      "<section>" +
      '<p class="panel-kicker">01 · GET TO KNOW IT</p>' +
      '<p class="panel-intro">' + e(crop.intro) + "</p>" +
      '<dl class="crop-facts">' +
      "<div><dt>Everyday uses</dt><dd>" + e(crop.uses) + "</dd></div>" +
      "<div><dt>Expected yield</dt><dd>" + e(crop.yield) + "</dd></div>" +
      "</dl>" +
      "</section>" +
      "<section>" +
      '<p class="panel-kicker">02 · CARE &amp; FEASIBILITY</p>' +
      '<dl class="crop-facts">' +
      "<div><dt>Watering habits</dt><dd>" + e(crop.watering) + "</dd></div>" +
      "<div><dt>Where it works</dt><dd>" + e(crop.feasibility) + "</dd></div>" +
      "<div><dt>Difficulty to sow</dt><dd>" + e(crop.difficulty) + "</dd></div>" +
      "</dl>" +
      "</section>" +
      "<section>" +
      '<p class="panel-kicker">03 · SEASON AT A GLANCE</p>' +
      '<div class="season-facts">' +
      "<div><span>SOW</span><strong>" + e(crop.sowing) + "</strong></div>" +
      "<div><span>HARVEST</span><strong>" + e(crop.harvest) + "</strong></div>" +
      "<div><span>GROWING PERIOD</span><strong>" + e(crop.period) + "</strong></div>" +
      "</div>" +
      "</section>" +
      "</div>"
    );
  }

  function close() {
    if (!panel) return;
    panel.remove();
    panel = null;
  }

  function open(crop) {
    if (!crop) return;

    // Create the panel once; opening another crop swaps its content in place.
    if (!panel) {
      panel = document.createElement("aside");
      panel.className = "crop-panel";
      panel.setAttribute("aria-live", "polite");
      document.body.appendChild(panel);
    }

    panel.setAttribute("aria-label", crop.name + " growing guide");
    panel.innerHTML = buildHtml(crop);
    panel.scrollTop = 0;
    panel.querySelector(".panel-close").addEventListener("click", close);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") close();
  });

  GB.cropPanel = {
    open: open,
    close: close,
    isOpen: function () {
      return panel !== null;
    },
  };
})((window.GB = window.GB || {}));
