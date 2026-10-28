# Janma Kundli

A single-file Vedic birth chart reader. Open `index.html` in a browser.

- Sidereal positions (Lahiri ayanamsa) from astronomy-engine, checked against Swiss Ephemeris to within 20 arcseconds
- Whole-sign houses, North Indian chart (D1, Navamsa, Moon chart)
- Vimshottari dasha timeline, Parashari Ashtakavarga, classical yogas (BPHS, Phaladeepika)
- Plain-English answers to common questions (money, business, career, marriage, Sade Sati, lucky factors)
- Business launch dates from muhurta rules (tithi, vaar, nakshatra, Tarabala, Chandrabala, Rahu Kaal)

## Build

`src/` holds the engine, reading layer, city data and page template. `node build.js` writes `index.html` with an example profile.
To preload your own details, create `profile.local.json` (git-ignored) with `{ "me": { ... }, "family": [] }` in the same shape as `EXAMPLE` in `build.js`; the build then also writes `janma-kundli.html`.
