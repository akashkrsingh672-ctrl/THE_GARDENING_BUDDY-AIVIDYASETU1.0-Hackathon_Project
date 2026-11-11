# The Gardening Buddy — static website

Plain HTML, CSS and JavaScript (no build step, no dependencies), converted from the
Figma Make file **"The Gardening Buddy Homepage"**.

## Run it

- **Quickest:** double-click `index.html`.
- **Recommended** (some browsers, notably Firefox, don't share `localStorage` between
  `file://` pages, which the sign-in state relies on):

  ```bash
  cd gardening-buddy
  python3 -m http.server 8000      # then open http://localhost:8000
  ```

An internet connection is needed for the Google Fonts (Inter, Lora) and for the
Unsplash photos used on the crop, farm and login pages. The three photos on the home
page, and every icon, are bundled in `assets/`.

## Pages and how they connect

| Page | Files | Reached from |
| --- | --- | --- |
| `index.html` — home | `css/index.css`, `js/index.js` | brand logo on every page, every "Back to home" link |
| `login.html` — sign in | `css/login.css`, `js/login.js` | home → any protected action, after the 5-second "Login first!" toast |
| `crops.html` — crop library (10 guides) | `css/crops.css`, `js/crops.js` | home → **Explore Crops**; farm pages → "Explore all crop guides" / "Choose your first crop" |
| `kitchen-garden.html` | `css/farm.css`, `js/farm.js` | home → **Get started** / **Start with your farm** → dialog |
| `smallholding.html` | `css/farm.css`, `js/farm.js` | same dialog |
| `working-farm.html` | `css/farm.css`, `js/farm.js` | same dialog |

The three farm pages share one stylesheet and script because the design uses the same
layout for all three; only their content differs.

Shared files: `css/base.css` (reset, header, typography), `css/crop-panel.css` and
`js/crop-panel.js` (the "growing guide" side panel), `js/common.js` (login state helpers)
and `js/crop-data.js` (all crop and farm-type data).

## Behaviour (as in the design)

- **Login gate.** Signed out, the home page's *Sign in*, *Get started*, *Find the crop*,
  *Explore Crops* and *Start with your farm* show a "Login first!" toast, then go to
  `login.html` after 5 seconds. Signed in, they work directly.
- **Login.** Name, email and a password of 6+ characters. The name and email are saved in
  `localStorage` (`gardening-buddy-user`) and the header then shows the name. This is a
  placeholder: nothing is verified or sent anywhere. Replace `GB.saveUser()` in
  `js/common.js` / the submit handler in `js/login.js` with a real authentication call.
- **Find the crop.** Opens a photo picker and shows the chosen file name. No plant
  identification happens (the design has none either).
- **Crop panel.** Click any crop card (or press Enter/Space) on `crops.html`, or any
  recommended crop on a farm page, to open its growing guide. Close with ×, or Esc.

## Editing

- Crop details (text shown in the side panel): `js/crop-data.js`.
- The crop cards on `crops.html` and the crop lists on the farm pages repeat each crop's
  name, photo and growing period as plain HTML, so update those too if you change them.

## Notes on the conversion

- The Make app is a single-page React app with routes `/`, `/login`, `/crops` and
  `/farm/...`. These became real files, with relative links so the site also works
  from a folder or a sub-path.
- The Make file's three home-page photos are named `.png` but are JPEG data; they are
  saved here as `.jpg`.
- The Make file lists a `favicon.png` that doesn't exist in its source; `assets/icons/favicon.svg`
  (the logo mark on the brand green) is used instead.
- The empty navigation bar and empty footer link columns are kept as in the design.
