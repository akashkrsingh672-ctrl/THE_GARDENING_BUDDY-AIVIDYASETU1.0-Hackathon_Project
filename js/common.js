/* ==========================================================================
   Shared helpers (loaded on every page that has behaviour)
   - GB namespace
   - Login state, stored in localStorage under "gardening-buddy-user"
   - HTML escaping + crop lookup
   Classic script (no ES modules) so the site also works when opened from disk.
   ========================================================================== */
(function (global) {
  "use strict";

  var GB = (global.GB = global.GB || {});
  var USER_STORAGE_KEY = "gardening-buddy-user";

  GB.USER_STORAGE_KEY = USER_STORAGE_KEY;

  /** Returns { name, email } for the signed-in user, or null. */
  GB.getUser = function () {
    try {
      var stored = global.localStorage.getItem(USER_STORAGE_KEY);
      if (!stored) return null;
      var user = JSON.parse(stored);
      return user && typeof user.name === "string" ? user : null;
    } catch (error) {
      return null;
    }
  };

  /**
   * Saves the signed-in user. Returns false if the browser blocks storage.
   * Replace this local adapter with a real authentication API when one exists.
   */
  GB.saveUser = function (user) {
    try {
      global.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      return false;
    }
  };

  GB.escapeHtml = function (value) {
    var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value).replace(/[&<>"']/g, function (char) {
      return map[char];
    });
  };

  /** Finds a crop from js/crop-data.js by its name, e.g. "Tomato". */
  GB.findCrop = function (name) {
    var crops = GB.crops || [];
    for (var i = 0; i < crops.length; i += 1) {
      if (crops[i].name === name) return crops[i];
    }
    return null;
  };
})(window);
