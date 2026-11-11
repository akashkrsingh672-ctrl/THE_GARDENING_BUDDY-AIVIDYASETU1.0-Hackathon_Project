/* Shared interactive tools for the three farm profile pages. */
(function (GB, global) {
  "use strict";

  var page = document.querySelector(".farm-page");
  if (!page) return;

  var profile = page.getAttribute("data-farm-profile") || "kitchen-garden";
  var isKitchen = profile === "kitchen-garden";
  var unit = isKitchen ? "m²" : "acres";
  var recommended = Array.prototype.map.call(
    document.querySelectorAll(".farm-crop-list [data-crop]"),
    function (button) { return GB.findCrop(button.getAttribute("data-crop")); }
  ).filter(Boolean);

  document.querySelectorAll(".farm-crop-list button[data-crop]").forEach(function (button) {
    var crop = GB.findCrop(button.getAttribute("data-crop"));
    if (crop) button.addEventListener("click", function () { GB.cropPanel.open(crop); });
  });

  function parseMonths(windowText) {
    var names = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    var found = [];
    names.forEach(function (name, index) {
      if (new RegExp("\\b" + name.slice(0, 3), "i").test(windowText)) found.push(index);
    });
    if (found.length < 2) return found;
    var result = [];
    for (var month = found[0];; month = (month + 1) % 12) {
      result.push(month);
      if (month === found[1] || result.length === 12) break;
    }
    return result;
  }

  var calendarCrop = document.querySelector("[data-calendar-crop]");
  if (calendarCrop && recommended.length) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    recommended.forEach(function (crop) {
      var option = document.createElement("option");
      option.value = crop.name;
      option.textContent = crop.name;
      calendarCrop.appendChild(option);
    });
    var monthGrid = document.querySelector("[data-month-grid]");
    var status = document.querySelector("[data-calendar-status]");
    var selectedMonth = new Date().getMonth();
    function renderCalendar() {
      var crop = GB.findCrop(calendarCrop.value);
      if (!crop) return;
      var sow = parseMonths(crop.sowing);
      var harvest = parseMonths(crop.harvest);
      monthGrid.innerHTML = "";
      months.forEach(function (month, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "month-cell" + (sow.indexOf(index) >= 0 ? " is-sow" : "") + (harvest.indexOf(index) >= 0 ? " is-harvest" : "") + (index === selectedMonth ? " is-current" : "");
        button.setAttribute("aria-pressed", index === selectedMonth ? "true" : "false");
        button.textContent = month;
        button.addEventListener("click", function () { selectedMonth = index; renderCalendar(); });
        monthGrid.appendChild(button);
      });
      var currentSow = sow.indexOf(selectedMonth) >= 0;
      var currentHarvest = harvest.indexOf(selectedMonth) >= 0;
      var next = null;
      for (var offset = 1; offset <= 12; offset += 1) {
        var candidate = (selectedMonth + offset) % 12;
        if (sow.indexOf(candidate) >= 0 || harvest.indexOf(candidate) >= 0) { next = candidate; break; }
      }
      var messages = [];
      if (currentSow) messages.push("Sow or plant now");
      if (currentHarvest) messages.push("Harvest now");
      if (!messages.length && next !== null) messages.push("Next window: " + months[next]);
      if (!messages.length) messages.push("Check your local growing conditions");
      status.textContent = crop.name + " · " + messages.join(" · ");
    }
    calendarCrop.addEventListener("change", renderCalendar);
    renderCalendar();
  }

  document.querySelectorAll("[data-area-unit]").forEach(function (el) { el.textContent = unit; });
  var cropChoices = document.querySelector("[data-crop-choices]");
  if (cropChoices) {
    recommended.forEach(function (crop, index) {
      var label = document.createElement("label");
      label.className = "crop-choice";
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = crop.name;
      checkbox.checked = index < Math.min(2, recommended.length);
      var name = document.createElement("span");
      name.textContent = crop.name;
      label.appendChild(checkbox);
      label.appendChild(name);
      cropChoices.appendChild(label);
    });
    document.querySelector("[data-space-form]").addEventListener("submit", function (event) {
      event.preventDefault();
      var areaInput = document.querySelector("#space-size");
      var area = Number(areaInput.value);
      var selected = Array.prototype.slice.call(cropChoices.querySelectorAll("input:checked")).map(function (input) { return GB.findCrop(input.value); }).filter(Boolean);
      var result = document.querySelector("[data-calculator-results]");
      if (!(area > 0) || !selected.length) {
        result.innerHTML = '<p class="result-empty">Enter a growing area and choose at least one crop.</p>';
        return;
      }
      var areaSqM = isKitchen ? area : area * 4046.856;
      var plants = 0;
      var waterMin = 0;
      var waterMax = 0;
      var yieldMin = 0;
      var yieldMax = 0;
      var plotCounts = {};
      if (profile === "smallholding") {
        for (var plot = 0; plot < 4; plot += 1) {
          var assigned = selected[plot % selected.length].name;
          plotCounts[assigned] = (plotCounts[assigned] || 0) + 1;
        }
      } else {
        selected.forEach(function (crop) { plotCounts[crop.name] = 1; });
      }
      var rows = selected.map(function (crop) {
        var cropArea = profile === "smallholding" ? areaSqM * plotCounts[crop.name] / 4 : areaSqM / selected.length;
        var cropPlants = Math.floor(cropArea / ((crop.spacingCm / 100) * (crop.spacingCm / 100)));
        plants += cropPlants;
        waterMin += crop.waterMmPerWeek[0] * cropArea;
        waterMax += crop.waterMmPerWeek[1] * cropArea;
        yieldMin += crop.yieldKgPerSqM[0] * cropArea;
        yieldMax += crop.yieldKgPerSqM[1] * cropArea;
        var detail;
        if (isKitchen) detail = cropArea.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' m² bed · about ' + cropPlants.toLocaleString() + ' plants';
        else if (profile === "smallholding") detail = plotCounts[crop.name] + ' of 4 rotation plots · ' + (cropArea / 4046.856).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' acres';
        else detail = (cropArea / 4046.856).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' acres · about ' + cropPlants.toLocaleString() + ' plants · water priority ' + (crop.waterMmPerWeek[1] >= 60 ? 'high' : (crop.waterMmPerWeek[1] >= 30 ? 'medium' : 'standard'));
        return '<li><strong>' + GB.escapeHtml(crop.name) + '</strong><span>' + detail + '</span></li>';
      }).join("");
      var yieldLabel = isKitchen ? (yieldMin.toFixed(0) + "–" + yieldMax.toFixed(0) + " kg / harvest") : ((yieldMin / 1000).toFixed(1) + "–" + (yieldMax / 1000).toFixed(1) + " tonnes / harvest");
      var minimumArea = isKitchen ? 2 : (profile === "smallholding" ? 0.1 : 5);
      var verdict = area < minimumArea ? "A compact plan: consider fewer crops" : "Fits the typical scale for this profile";
      result.innerHTML = '<p class="fit-verdict">' + verdict + '</p><div class="result-metrics"><div><strong>' + plants.toLocaleString() + '</strong><span>estimated plants</span></div><div><strong>' + yieldLabel + '</strong><span>estimated total yield</span></div><div><strong>' + waterMin.toLocaleString(undefined, { maximumFractionDigits: 0 }) + '–' + waterMax.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' L</strong><span>water per week</span></div></div><ul class="crop-estimates">' + rows + '</ul>';
    });
  }

  /* Weekly checklist: saved separately for each page and ISO week. */
  var rhythm = document.querySelector(".farm-rhythm");
  if (rhythm) {
    var articles = Array.prototype.slice.call(rhythm.querySelectorAll(".rhythm-list article"));
    var monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    var weekKey = monday.getFullYear() + "-W" + String(Math.ceil((((monday - new Date(monday.getFullYear(), 0, 1)) / 86400000) + new Date(monday.getFullYear(), 0, 1).getDay() + 1) / 7)).padStart(2, "0");
    var localToday = new Date();
    var todayKey = localToday.getFullYear() + "-" + String(localToday.getMonth() + 1).padStart(2, "0") + "-" + String(localToday.getDate()).padStart(2, "0");
    var progress = document.createElement("div");
    progress.className = "checklist-progress";
    progress.innerHTML = '<div class="progress-ring" data-progress-ring><span data-progress-count>0/0</span></div><div><strong>This week</strong><p data-streak>0 tasks completed · 0 week streak</p></div>';
    rhythm.querySelector(".farm-section-heading").appendChild(progress);
    articles.forEach(function (article, index) {
      var key = "task-" + index;
      var cadence = article.querySelector("span").textContent.trim().toUpperCase();
      var period = cadence === "DAILY" ? todayKey : (cadence === "SEASON" ? String(new Date().getFullYear()) : weekKey);
      var taskStorageKey = "gb-checklist-" + profile + "-" + key + "-" + period;
      article.classList.add("checklist-task");
      article.setAttribute("tabindex", "0");
      var label = document.createElement("label");
      label.className = "task-check";
      label.setAttribute("aria-label", "Mark " + article.querySelector("h3").textContent + " complete");
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      try { checkbox.checked = global.localStorage.getItem(taskStorageKey) === "true"; } catch (ignore) { checkbox.checked = false; }
      label.appendChild(checkbox);
      article.appendChild(label);
      article.classList.toggle("is-complete", checkbox.checked);
      checkbox.addEventListener("change", function () {
        article.classList.toggle("is-complete", checkbox.checked);
        try { global.localStorage.setItem(taskStorageKey, checkbox.checked ? "true" : "false"); } catch (ignore) {}
        updateProgress();
      });
    });
    function updateProgress() {
      var done = articles.filter(function (article) { return article.querySelector("input[type=checkbox]").checked; }).length;
      var ratio = articles.length ? done / articles.length : 0;
      document.querySelector("[data-progress-count]").textContent = done + "/" + articles.length;
      document.querySelector("[data-progress-ring]").style.setProperty("--progress", (ratio * 100) + "%");
      var weeklyTasks = articles.filter(function (article) {
        var cadence = article.querySelector("span").textContent.trim().toUpperCase();
        return cadence !== "DAILY" && cadence !== "SEASON";
      });
      if (!weeklyTasks.length) weeklyTasks = articles;
      var weeklyComplete = weeklyTasks.every(function (article) { return article.querySelector("input[type=checkbox]").checked; });
      document.querySelector("[data-streak]").textContent = done + " tasks completed · " + getStreak(weeklyComplete) + " week streak";
    }
    function getStreak(complete) {
      var historyKey = "gb-streak-" + profile;
      var history = {};
      try { history = JSON.parse(global.localStorage.getItem(historyKey) || "{}"); } catch (ignore) {}
      if (complete && !history[weekKey]) {
        history[weekKey] = true;
        try { global.localStorage.setItem(historyKey, JSON.stringify(history)); } catch (ignore) {}
      }
      var streak = 0;
      var cursor = new Date(monday);
      while (history[weekKeyFor(cursor)]) { streak += 1; cursor.setDate(cursor.getDate() - 7); }
      return streak;
    }
    function weekKeyFor(date) {
      var year = date.getFullYear();
      var first = new Date(year, 0, 1);
      return year + "-W" + String(Math.ceil((((date - first) / 86400000) + first.getDay() + 1) / 7)).padStart(2, "0");
    }
    updateProgress();
  }

  /* Open-Meteo forecast: location is requested only after the user presses the button. */
  var weather = document.querySelector("[data-weather]");
  if (weather) {
    var loadButton = weather.querySelector("[data-weather-load]");
    var message = weather.querySelector("[data-weather-message]");
    var forecastGrid = weather.querySelector("[data-forecast-grid]");
    var place = weather.querySelector("[data-weather-place]");
    var savedCoords = null;
    try { savedCoords = JSON.parse(global.sessionStorage.getItem("gb-weather-coords") || "null"); } catch (ignore) {}
    function loadForecast(coords) {
      message.textContent = "Loading your five-day forecast…";
      loadButton.disabled = true;
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + encodeURIComponent(coords.latitude) + "&longitude=" + encodeURIComponent(coords.longitude) + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=5&timezone=auto";
      fetch(url).then(function (response) { if (!response.ok) throw new Error("Forecast unavailable"); return response.json(); }).then(function (data) {
        var daily = data.daily;
        var codes = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Cloudy", 45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle", 61: "Rain", 63: "Rain", 65: "Heavy rain", 71: "Snow", 73: "Snow", 75: "Heavy snow", 80: "Showers", 81: "Showers", 82: "Heavy showers", 95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm" };
        forecastGrid.innerHTML = "";
        daily.time.forEach(function (date, index) {
          var card = document.createElement("div");
          card.className = "forecast-day";
          var day = new Date(date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" });
          card.innerHTML = "<strong>" + day + "</strong><span>" + (codes[daily.weather_code[index]] || "Changeable") + "</span><b>" + Math.round(daily.temperature_2m_max[index]) + "° / " + Math.round(daily.temperature_2m_min[index]) + "°</b><small>Rain " + (daily.precipitation_probability_max[index] || 0) + "%</small>";
          forecastGrid.appendChild(card);
        });
        var frost = daily.temperature_2m_min.some(function (value) { return value <= 1; });
        var rain = daily.precipitation_probability_max.some(function (value, index) { return index < 2 && value >= 70; });
        var heat = daily.temperature_2m_max.some(function (value) { return value >= 33; });
        var wind = daily.wind_speed_10m_max.some(function (value) { return value >= 40; });
        var unsettledSpray = daily.precipitation_probability_max.some(function (value, index) { return index < 2 && value >= 40; }) || daily.wind_speed_10m_max.some(function (value, index) { return index < 2 && value >= 20; });
        if (frost) message.textContent = "Frost may be near: protect frost-sensitive plants and check your local alert.";
        else if (profile === "working-farm" && unsettledSpray) message.textContent = "Rain or wind may disrupt spraying soon. Check the product label and local spray guidance before planning a pass.";
        else if (profile === "working-farm" && !heat) message.textContent = "Forecast conditions look relatively dry and calm. Check the product label, crop stage, and field conditions before spraying.";
        else if (rain) message.textContent = "Rain is likely soon: check soil moisture before watering.";
        else if (heat) message.textContent = "Hot weather ahead: check plants early and keep an eye on soil moisture.";
        else if (wind) message.textContent = "Wind may be strong: secure supports and protect exposed young plants.";
        else message.textContent = "No strong weather trigger in this forecast. Follow your usual care routine.";
        place.textContent = "Five-day forecast · your approximate location";
      }).catch(function () { message.textContent = "We couldn't load the forecast. Check your connection and try again."; }).finally(function () { loadButton.disabled = false; });
    }
    loadButton.addEventListener("click", function () {
      if (!navigator.geolocation) { message.textContent = "Location sharing is not available in this browser."; return; }
      message.textContent = "Waiting for location permission…";
      navigator.geolocation.getCurrentPosition(function (position) {
        var coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        try { global.sessionStorage.setItem("gb-weather-coords", JSON.stringify(coords)); } catch (ignore) {}
        loadForecast(coords);
      }, function () { message.textContent = "Location was unavailable. Allow access in your browser settings, then try again."; }, { timeout: 10000, maximumAge: 3600000 });
    });
    if (savedCoords) loadForecast(savedCoords);
  }
})(window.GB = window.GB || {}, window);
