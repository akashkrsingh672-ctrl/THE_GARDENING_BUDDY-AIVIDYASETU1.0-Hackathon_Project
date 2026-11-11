# The Gardening Buddy

A responsive, multi-page gardening and farm-planning website built with plain HTML, CSS, and JavaScript, plus a small Node.js server for plant-photo identification. There is no front-end build system or npm dependency installation. The site was adapted from the Figma Make design **“The Gardening Buddy Homepage.”**

## Project highlights

- **AI plant identifier:** upload a plant photo and get up to three likely plant matches from OpenAI's vision model. It can recognize plants beyond the ten crops with guides on this site. Matches to those crops link directly to their Gardening Buddy growing guides.
- **Three growing profiles:** tailored tools for a kitchen garden, smallholding, and working farm.
- **Seasonal planning tools:** planting calendar, space planner, saved checklist, and optional local weather forecast.

Photo identification is a core feature of this project. The browser prepares the image, while the Node.js server sends it to OpenAI's Responses API and keeps the API key out of public JavaScript. The model's qualitative confidence labels are estimates, not guarantees of correct identification.

## Run the site

Run the Node.js server from the project folder. Node.js 18 or newer is required; the server uses built-in modules only:

```powershell
$env:OPENAI_API_KEY = "your-openai-api-key"
node server.js
```

Then visit [http://localhost:8000](http://localhost:8000). Create an OpenAI API key and keep it in the server environment. Without the key, the site still loads, but photo identification reports that it is not configured. Never put the key in an HTML or JavaScript file. For production, use the hosting provider's secret manager and set `PORT` and `HOST` if needed. Set `OPENAI_MODEL` to override the default `gpt-6-luna` model.

The optional Python `http.server` can still serve static pages, but it does not provide the `/api/identify-plant` endpoint. Use `node server.js` to run the complete site locally. An internet connection is needed for Google Fonts, Unsplash images used on some pages, OpenAI API requests, and the optional Open-Meteo forecast. The home page photography and icons are bundled locally.

## Pages

| File | Purpose | Main code |
| --- | --- | --- |
| `index.html` | Home page, sign-in entry point, crop photo picker, and growing-space chooser | `css/index.css`, `js/index.js` |
| `login.html` | Demo sign-in form | `css/login.css`, `js/login.js` |
| `crops.html` | Library of ten growing guides | `css/crops.css`, `js/crops.js` |
| `kitchen-garden.html` | Small-space growing profile | `css/farm.css`, `js/farm.js` |
| `smallholding.html` | Mixed smallholding profile | `css/farm.css`, `js/farm.js` |
| `working-farm.html` | Working farm profile | `css/farm.css`, `js/farm.js` |

The home page links visitors to the crop library or to one of the three farm profiles. Recommended crops on farm pages open the same growing-guide panel used by the crop library.

## Features

### Home and sign-in demo

- The home page includes the site navigation, growing-space chooser, crop photo picker, and sign-in gate.
- When signed out, protected actions show a reminder and redirect to `login.html` after five seconds.
- The sign-in form checks the entered name, email, and password length, then stores the display name and email in browser `localStorage` under `gardening-buddy-user`.
- This is a local demonstration only. It does not authenticate a real account or send credentials to a server.
- The crop photo picker previews and resizes a selected JPEG, PNG, or WebP image, then sends it to the local server endpoint. The server forwards it to OpenAI's Responses API and returns up to three likely plant matches. This recognizes plants broadly, rather than limiting results to the ten crop guides on this site.
- A visitor can open an existing Gardening Buddy crop guide when a match corresponds to one of the site's crops. Other identified plants show provider names and match scores without implying this site has a care guide for them.

### Crop library and guides

- `js/crop-data.js` is the shared source for crop names, images, sowing and harvest windows, growing periods, watering guidance, and yields.
- Crop cards open an accessible side panel with the crop’s growing guide. Close it with the close button or Escape.
- Crop names and images also appear in static page markup. Keep those cards and recommendations in sync when editing crop data.

### Farm planning tools

All three farm pages share the same interactive engine and stylesheet. The `data-farm-profile` attribute on each page selects its profile-specific behavior.

- **Planting calendar:** Select a recommended crop to see its sowing and harvest months and the next relevant window. Month windows are read from the crop data.
- **Space planner:** Enter an area and choose crops. The kitchen garden reports bed area and estimated plant counts; the smallholding divides land across four equal rotation plots; the working farm reports estimated crop acreage, yield, and relative water priority. Water volume is estimated from millimetres per week, where 1 mm over 1 m² equals 1 litre.
- **Weekly checklist:** Existing page tasks become checkable items with a progress ring and completion streak. Progress is stored separately by profile and period in browser `localStorage`. Tasks marked Daily reset each day, Season reset each calendar year, and the other tasks reset weekly.
- **Weather action card:** Choose **Use my location** to request a five-day forecast from Open-Meteo. The site requests geolocation only after this action. Coordinates are held in browser `sessionStorage` for that session and are sent to Open-Meteo to retrieve the forecast. No location is sent to a Gardening Buddy server. Forecast reminders are general guidance, not a substitute for local alerts or product directions.
- **Plant-photo identification:** `server.js` exposes `POST /api/identify-plant`, keeps the OpenAI API key server-side, validates and size-limits the prepared JPEG, sends the image to the Responses API, and returns a compact set of suggestions. Photos are not written to disk by this project. The browser resizes images to at most about two megapixels before submitting. Submitting a photo sends it to OpenAI for analysis; review current API data controls and privacy terms before public launch.

#### Planner estimate limitations

Crop spacing, yield-per-area, and weekly water ranges in `js/crop-data.js` are indicative planning assumptions. Crop variety, climate, soil, field layout, growing method, rainfall, and irrigation efficiency can change actual results substantially. The planner is not an agronomic recommendation or a guaranteed yield forecast.

## Project structure

```text
gardening-buddy/
├── assets/
│   ├── icons/       # SVG logo, favicon, and interface illustrations
│   └── images/      # Bundled home page photography
├── css/
│   ├── base.css     # Reset, shared typography, header, and layout defaults
│   ├── crop-panel.css
│   ├── crops.css
│   ├── farm.css     # Shared farm profile and planning tool styles
│   ├── index.css
│   └── login.css
├── js/
│   ├── common.js    # GB namespace, local sign-in state, escaping, crop lookup
│   ├── crop-data.js # Crop records and farm profile choices
│   ├── crop-panel.js
│   ├── crops.js
│   ├── farm.js      # Calendar, calculator, checklist, weather, crop panel wiring
│   ├── index.js
│   └── login.js
├── crops.html
├── index.html
├── kitchen-garden.html
├── login.html
├── smallholding.html
├── working-farm.html
├── README.md
├── server.js        # Node.js static server and OpenAI API proxy
└── requirements.txt # No Python packages; Node server uses built-ins
```

Browser JavaScript files are classic scripts rather than ES modules. The home page loads `common.js`, `crop-data.js`, `crop-panel.js`, then `index.js`. Farm pages load shared scripts in dependency order: `common.js`, `crop-data.js`, `crop-panel.js`, then `farm.js`.

## Editing guide

- **Crop descriptions and planner assumptions:** edit `js/crop-data.js`. Planner fields are `spacingCm`, `yieldKgPerSqM`, and `waterMmPerWeek`.
- **Farm profile content and crop choices:** edit the matching farm page. Keep its `data-farm-profile` value aligned with profile logic in `js/farm.js`.
- **Shared page behavior:** edit `js/farm.js`, `js/common.js`, or `js/crop-panel.js` as appropriate.
- **Visual styles:** shared reset and typography live in `css/base.css`; farm layouts and all planning tools use `css/farm.css`; page-specific styles are in their named CSS files.
- **Images and icons:** local assets are under `assets/`. Some crop photos and farm-page photos use Unsplash URLs in the HTML or crop data.
- **Plant identification API:** the server reads `OPENAI_API_KEY` and optional `OPENAI_MODEL` from its environment. It defaults to `gpt-6-luna`. The demo server allows ten identification requests per client address per hour in one running process. This is a basic safeguard, not a complete production abuse-control system.

## Dependencies and services

- **Browser front end:** no npm packages, frameworks, or build tools.
- **Node.js:** version 18 or newer for the local static server and API proxy; no npm packages are required.
- **Python:** no Python packages are required (see `requirements.txt`). Python's static server does not provide the identification endpoint.
- **Google Fonts:** Inter and Lora are loaded from Google Fonts.
- **Photography:** some page and crop photographs are loaded from Unsplash.
- **Forecast:** optional Open-Meteo API request after the visitor grants location access.
- **AI plant identifier:** OpenAI Responses API with image input; a user-provided API key is required.
- **Backend:** `server.js` serves the site and proxies plant-identification requests. Demo sign-in and checklist data stay in browser storage; there is no user-account database.

## Design notes

- The source design used React routes for home, login, crops, and farm profiles. This version uses separate HTML files and relative links so it can be hosted from a folder or subpath.
- The three home-page images were supplied as JPEG data despite `.png` names in the design source; this project stores them as `.jpg` files.
- The design referenced a `favicon.png` that was not present. The site uses `assets/icons/favicon.svg` instead.
- The design’s empty navigation and footer columns remain intentionally minimal.
