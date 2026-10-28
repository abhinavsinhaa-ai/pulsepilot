/* Jyotish engine: sidereal (Lahiri) positions, whole-sign houses, Vimshottari dasha,
   Parashari Ashtakavarga, classical yogas, panchang, transits and muhurta.
   Depends on the global `Astronomy` (astronomy-engine 2.1.19). */
(function (root) {
  'use strict';
  const A = root.Astronomy;
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const DAY = 86400000, YEAR = 365.25 * DAY;
  const norm = (x) => ((x % 360) + 360) % 360;

  const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const SEVEN = PLANETS.slice(0, 7);
  const SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  const NAK_LEN = 360 / 27;

  const EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
  const OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10], Rahu: [], Ketu: [] };
  const MOOLA = { Sun: [4, 0, 20], Moon: [1, 3, 30], Mars: [0, 0, 12], Mercury: [5, 15, 20], Jupiter: [8, 0, 10], Venus: [6, 0, 15], Saturn: [10, 0, 20] };
  // Naisargika (natural) relationships, BPHS
  const FRIENDS = {
    Sun: { f: ['Moon', 'Mars', 'Jupiter'], e: ['Venus', 'Saturn'] },
    Moon: { f: ['Sun', 'Mercury'], e: [] },
    Mars: { f: ['Sun', 'Moon', 'Jupiter'], e: ['Mercury'] },
    Mercury: { f: ['Sun', 'Venus'], e: ['Moon'] },
    Jupiter: { f: ['Sun', 'Moon', 'Mars'], e: ['Mercury', 'Venus'] },
    Venus: { f: ['Mercury', 'Saturn'], e: ['Sun', 'Moon'] },
    Saturn: { f: ['Mercury', 'Venus'], e: ['Sun', 'Moon', 'Mars'] },
    Rahu: { f: ['Mercury', 'Venus', 'Saturn'], e: ['Sun', 'Moon', 'Mars'] },
    Ketu: { f: ['Mars', 'Venus', 'Saturn'], e: ['Sun', 'Moon'] },
  };
  const COMBUST = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };
  const SPECIAL_ASPECTS = { Mars: [4, 8], Jupiter: [5, 9], Saturn: [3, 10], Rahu: [5, 9], Ketu: [5, 9] };
  const DIG_BALA = { Jupiter: 1, Mercury: 1, Sun: 10, Mars: 10, Saturn: 7, Moon: 4, Venus: 4 };
  const NATURAL_BENEFIC = { Jupiter: 1, Venus: 1, Mercury: 1, Moon: 1 };
  const KENDRA = [1, 4, 7, 10], TRIKONA = [1, 5, 9], DUSTHANA = [6, 8, 12], UPACHAYA = [3, 6, 10, 11];

  // Parashari Ashtakavarga benefic places (BPHS). Order of contributors: Sun Moon Mars Mercury Jupiter Venus Saturn Lagna
  const AV = {
    Sun: [[1, 2, 4, 7, 8, 9, 10, 11], [3, 6, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [3, 5, 6, 9, 10, 11, 12], [5, 6, 9, 11], [6, 7, 12], [1, 2, 4, 7, 8, 9, 10, 11], [3, 4, 6, 10, 11, 12]],
    Moon: [[3, 6, 7, 8, 10, 11], [1, 3, 6, 7, 10, 11], [2, 3, 5, 6, 9, 10, 11], [1, 3, 4, 5, 7, 8, 10, 11], [1, 4, 7, 8, 10, 11, 12], [3, 4, 5, 7, 9, 10, 11], [3, 5, 6, 11], [3, 6, 10, 11]],
    Mars: [[3, 5, 6, 10, 11], [3, 6, 11], [1, 2, 4, 7, 8, 10, 11], [3, 5, 6, 11], [6, 10, 11, 12], [6, 8, 11, 12], [1, 4, 7, 8, 9, 10, 11], [1, 3, 6, 10, 11]],
    Mercury: [[5, 6, 9, 11, 12], [2, 4, 6, 8, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 3, 5, 6, 9, 10, 11, 12], [6, 8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 2, 4, 6, 8, 10, 11]],
    Jupiter: [[1, 2, 3, 4, 7, 8, 9, 10, 11], [2, 5, 7, 9, 11], [1, 2, 4, 7, 8, 10, 11], [1, 2, 4, 5, 6, 9, 10, 11], [1, 2, 3, 4, 7, 8, 10, 11], [2, 5, 6, 9, 10, 11], [3, 5, 6, 12], [1, 2, 4, 5, 6, 7, 9, 10, 11]],
    Venus: [[8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11, 12], [3, 5, 6, 9, 11, 12], [3, 5, 6, 9, 11], [5, 8, 9, 10, 11], [1, 2, 3, 4, 5, 8, 9, 10, 11], [3, 4, 5, 8, 9, 10, 11], [1, 2, 3, 4, 5, 8, 9, 11]],
    Saturn: [[1, 2, 4, 7, 8, 10, 11], [3, 6, 11], [3, 5, 6, 10, 11, 12], [6, 8, 9, 10, 11, 12], [5, 6, 11, 12], [6, 11, 12], [3, 5, 6, 11], [1, 3, 4, 6, 10, 11]],
  };

  // ---------- astronomy ----------
  function lahiriMean(T) {
    // Lahiri (Chitrapaksha) as defined by the Indian Calendar Reform Committee, anchored at
    // 1956-03-21 (JD 2435553.5) and carried by IAU 2006 general precession in longitude.
    const T0 = (2435553.5 - 2451545.0) / 36525;
    const p = (t) => 5028.796195 * t + 1.1054348 * t * t;
    return 23.245524743 + (p(T) - p(T0)) / 3600;
  }
  function nutation(T) {
    const om = (125.04452 - 1934.136261 * T) * D2R;
    const L = (280.4665 + 36000.7698 * T) * D2R;
    const Lp = (218.3165 + 481267.8813 * T) * D2R;
    return {
      dpsi: (-17.2 * Math.sin(om) - 1.32 * Math.sin(2 * L) - 0.23 * Math.sin(2 * Lp) + 0.21 * Math.sin(2 * om)) / 3600,
      deps: (9.2 * Math.cos(om) + 0.57 * Math.cos(2 * L) + 0.1 * Math.cos(2 * Lp) - 0.09 * Math.cos(2 * om)) / 3600,
    };
  }
  const meanObliquity = (T) => 23.4392911111 - (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  const meanNode = (T) => norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441 - (T * T * T * T) / 60616000);

  function tropical(name, time) {
    if (name === 'Sun') return A.SunPosition(time).elon;
    if (name === 'Moon') return A.EclipticGeoMoon(time).lon;
    return A.Ecliptic(A.GeoVector(A.Body[name], time, true)).elon;
  }
  function frame(ms) {
    const time = A.MakeTime(new Date(ms));
    const T = time.tt / 36525;
    const nut = nutation(T);
    return { time, T, nut, ayan: lahiriMean(T) };
  }
  // sidereal longitude of a body at an instant (ms UTC)
  function sidereal(name, ms, fr) {
    fr = fr || frame(ms);
    if (name === 'Rahu') return norm(meanNode(fr.T) - fr.ayan);
    if (name === 'Ketu') return norm(meanNode(fr.T) - fr.ayan + 180);
    return norm(tropical(name, fr.time) - fr.nut.dpsi - fr.ayan);
  }
  function ascendant(ms, lat, lon, fr) {
    fr = fr || frame(ms);
    const ramc = norm(A.SiderealTime(fr.time) * 15 + lon) * D2R;
    const eps = (meanObliquity(fr.T) + fr.nut.deps) * D2R;
    const f = lat * D2R;
    const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(f) * Math.sin(eps))) * R2D;
    return norm(asc - fr.nut.dpsi - fr.ayan);
  }

  // ---------- helpers ----------
  const signOf = (lon) => Math.floor(norm(lon) / 30);
  const nakOf = (lon) => Math.floor(norm(lon) / NAK_LEN);
  const padaOf = (lon) => Math.floor((norm(lon) % NAK_LEN) / (NAK_LEN / 4)) + 1;
  const navamsaOf = (lon) => Math.floor(norm(lon) / (30 / 9)) % 12;
  const houseFrom = (sign, fromSign) => ((sign - fromSign + 12) % 12) + 1;
  const angDist = (a, b) => { const d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; };

  function relation(planet, signLord) {
    if (planet === signLord) return 'own';
    const r = FRIENDS[planet];
    if (r.f.includes(signLord)) return 'friend';
    if (r.e.includes(signLord)) return 'enemy';
    return 'neutral';
  }
  function dignity(planet, lon) {
    const s = signOf(lon), d = norm(lon) % 30;
    if (EXALT[planet] === s) return 'exalted';
    if ((EXALT[planet] + 6) % 12 === s) return 'debilitated';
    const m = MOOLA[planet];
    if (m && m[0] === s && d >= m[1] && d < m[2]) return 'moolatrikona';
    if (OWN[planet].includes(s)) return 'own';
    return relation(planet, SIGN_LORD[s]);
  }
  const DIGNITY_PTS = { exalted: 14, moolatrikona: 11, own: 10, friend: 5, neutral: 0, enemy: -5, debilitated: -9 };

  // ---------- chart ----------
  function computeChart(input) {
    const { utcMs, lat, lon } = input;
    const timeKnown = input.timeKnown !== false;
    const fr = frame(utcMs);
    const p = {};
    for (const name of PLANETS) {
      const L = sidereal(name, utcMs, fr);
      let speed = 0;
      if (name !== 'Rahu' && name !== 'Ketu') {
        const a = sidereal(name, utcMs - DAY / 2), b = sidereal(name, utcMs + DAY / 2);
        speed = ((b - a + 540) % 360) - 180;
      } else speed = -0.053;
      p[name] = { name, lon: L, sign: signOf(L), deg: L % 30, nak: nakOf(L), pada: padaOf(L), nav: navamsaOf(L), speed, retro: speed < 0 };
    }
    const ascLon = ascendant(utcMs, lat, lon, fr);
    const asc = { lon: ascLon, sign: signOf(ascLon), deg: ascLon % 30, nak: nakOf(ascLon), pada: padaOf(ascLon), nav: navamsaOf(ascLon) };
    const lagnaSign = timeKnown ? asc.sign : p.Moon.sign; // Chandra lagna when the birth time is unknown

    for (const name of PLANETS) {
      const x = p[name];
      x.house = houseFrom(x.sign, lagnaSign);
      x.dignity = dignity(name, x.lon);
      x.vargottama = x.sign === x.nav;
      x.combust = name !== 'Sun' && COMBUST[name] !== undefined &&
        angDist(x.lon, p.Sun.lon) < (x.retro && name === 'Mercury' ? 12 : x.retro && name === 'Venus' ? 8 : COMBUST[name]);
      x.digBala = DIG_BALA[name] === x.house;
    }
    const moonPhase = norm(p.Moon.lon - p.Sun.lon);
    const waxing = moonPhase < 180;

    const chart = { input, timeKnown, ayanamsa: fr.ayan + fr.nut.dpsi, asc, lagnaSign, p, moonPhase, waxing };
    chart.signOfHouse = (h) => (lagnaSign + h - 1) % 12;
    chart.lordOf = (h) => SIGN_LORD[chart.signOfHouse(h)];
    chart.occupants = (h) => PLANETS.filter((n) => p[n].house === h);
    chart.housesOwned = (planet) => { const out = []; for (let h = 1; h <= 12; h++) if (chart.lordOf(h) === planet) out.push(h); return out; };
    chart.aspects = (planet) => [7].concat(SPECIAL_ASPECTS[planet] || []).map((k) => ((p[planet].house + k - 2) % 12) + 1);
    chart.aspectedBy = (h) => PLANETS.filter((n) => chart.aspects(n).includes(h));
    chart.influences = (h) => chart.occupants(h).concat(chart.aspectedBy(h).filter((n) => !chart.occupants(h).includes(n)));
    chart.isBenefic = (n) => n === 'Moon' ? waxing : n === 'Mercury' ? !['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'].some((m) => p[m].sign === p.Mercury.sign) : !!NATURAL_BENEFIC[n];

    // Neecha bhanga (cancellation of debilitation)
    for (const name of SEVEN) {
      const x = p[name];
      if (x.dignity !== 'debilitated') continue;
      const dispositor = SIGN_LORD[x.sign], exaltLord = SIGN_LORD[EXALT[name]];
      const inKendra = (n) => KENDRA.includes(p[n].house) || KENDRA.includes(houseFrom(p[n].sign, p.Moon.sign));
      x.neechaBhanga = inKendra(dispositor) || inKendra(exaltLord) || p[dispositor].sign === x.sign || chart.aspects(dispositor).includes(x.house);
    }

    // Planet strength (0-100ish, composite of classical dignity, house, dig bala, vargottama, combustion)
    for (const name of PLANETS) {
      const x = p[name];
      let s = 50 + DIGNITY_PTS[x.dignity] * 1.6;
      if (x.neechaBhanga) s += 20;
      if (KENDRA.includes(x.house) || TRIKONA.includes(x.house)) s += 9;
      else if (x.house === 11 || x.house === 2) s += 6;
      else if (x.house === 3) s += 2;
      else if (DUSTHANA.includes(x.house)) s -= 7;
      if (x.digBala) s += 9;
      if (x.vargottama) s += 8;
      if (x.combust) s -= 10;
      if (x.retro && name !== 'Rahu' && name !== 'Ketu') s += 3; // cheshta bala favours retrograde planets
      x.strength = Math.max(5, Math.min(100, Math.round(s)));
    }

    // Jaimini chara karakas (7-planet scheme)
    const byDeg = SEVEN.slice().sort((a, b) => p[b].deg - p[a].deg);
    chart.karakas = { atma: byDeg[0], amatya: byDeg[1], dara: byDeg[6] };

    chart.ashtakavarga = ashtakavarga(chart);
    chart.dasha = vimshottari(p.Moon.lon, utcMs);
    chart.panchang = panchang(utcMs, lat, lon, input.localWeekday, input.localMidnightUtc, p.Sun.lon, p.Moon.lon);
    chart.yogas = findYogas(chart);
    return chart;
  }

  function ashtakavarga(chart) {
    const { p } = chart;
    const refSign = (i) => i === 7 ? chart.lagnaSign : p[SEVEN[i]].sign;
    const bav = {};
    const sav = new Array(12).fill(0);
    for (const planet of SEVEN) {
      const row = new Array(12).fill(0);
      AV[planet].forEach((places, i) => { for (const h of places) row[(refSign(i) + h - 1) % 12] += 1; });
      bav[planet] = row;
      row.forEach((v, s) => { sav[s] += v; });
    }
    const byHouse = [0];
    for (let h = 1; h <= 12; h++) byHouse.push(sav[chart.signOfHouse(h)]);
    return { bav, sav, byHouse, total: sav.reduce((a, b) => a + b, 0) };
  }

  function vimshottari(moonLon, birthMs) {
    const idx = nakOf(moonLon);
    const frac = (norm(moonLon) - idx * NAK_LEN) / NAK_LEN;
    let li = idx % 9;
    let start = birthMs - frac * DASHA_YEARS[DASHA_ORDER[li]] * YEAR;
    const list = [];
    while (start < birthMs + 110 * YEAR) {
      const lord = DASHA_ORDER[li];
      const len = DASHA_YEARS[lord] * YEAR;
      const md = { lord, start, end: start + len, sub: [] };
      let s = start;
      for (let j = 0; j < 9; j++) {
        const al = DASHA_ORDER[(li + j) % 9];
        const l = (len * DASHA_YEARS[al]) / 120;
        md.sub.push({ lord: al, start: s, end: s + l });
        s += l;
      }
      list.push(md);
      start += len;
      li = (li + 1) % 9;
    }
    return { list, balanceYears: (1 - frac) * DASHA_YEARS[DASHA_ORDER[idx % 9]], startLord: DASHA_ORDER[idx % 9] };
  }
  function dashaAt(chart, ms) {
    const md = chart.dasha.list.find((d) => ms >= d.start && ms < d.end);
    if (!md) return null;
    const ad = md.sub.find((d) => ms >= d.start && ms < d.end);
    return { md, ad };
  }

  // ---------- panchang ----------
  const TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  const NITYA_YOGA = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];
  const VAARA = ['Ravivara (Sunday)', 'Somavara (Monday)', 'Mangalavara (Tuesday)', 'Budhavara (Wednesday)', 'Guruvara (Thursday)', 'Shukravara (Friday)', 'Shanivara (Saturday)'];

  function tithiInfo(sunLon, moonLon) {
    const e = norm(moonLon - sunLon);
    const n = Math.floor(e / 12) + 1; // 1..30
    const paksha = n <= 15 ? 'Shukla' : 'Krishna';
    const k = n <= 15 ? n : n - 15;
    const name = n === 15 ? 'Purnima' : n === 30 ? 'Amavasya' : TITHI[k - 1];
    const kIdx = Math.floor(e / 6);
    const karana = kIdx === 0 ? 'Kimstughna' : kIdx >= 57 ? ['Shakuni', 'Chatushpada', 'Naga'][kIdx - 57] : KARANA_MOVABLE[(kIdx - 1) % 7];
    return { n, paksha, name, karana };
  }
  function sunEvents(ms, lat, lon) {
    // sunrise / sunset nearest after ms - 12h, used for vaara and muhurta
    const obs = new A.Observer(lat, lon, 0);
    const rise = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(ms), 1);
    const set = rise ? A.SearchRiseSet(A.Body.Sun, obs, -1, rise, 1) : null;
    return { rise: rise ? rise.date.getTime() : null, set: set ? set.date.getTime() : null };
  }
  function panchang(utcMs, lat, lon, localWeekday, localMidnightUtc, sunLon, moonLon) {
    const t = tithiInfo(sunLon, moonLon);
    // Vedic day runs sunrise to sunrise: before local sunrise it is still the previous vaara
    let wd = localWeekday;
    let sunrise = null;
    if (wd !== undefined && wd !== null && localMidnightUtc != null) {
      sunrise = sunEvents(localMidnightUtc, lat, lon).rise;
      if (sunrise && utcMs < sunrise) wd = (wd + 6) % 7;
    }
    return {
      sunrise,
      tithi: t.name, tithiNum: t.n, paksha: t.paksha, karana: t.karana,
      yoga: NITYA_YOGA[Math.floor(norm(sunLon + moonLon) / NAK_LEN)],
      vaara: wd === undefined || wd === null ? null : VAARA[wd], weekday: wd,
      nak: nakOf(moonLon),
    };
  }

  // ---------- yogas (classical combinations, described in plain English) ----------
  function findYogas(c) {
    const { p } = c;
    const Y = [];
    const add = (name, kind, text, planets, strength) => Y.push({ name, kind, text, planets: planets || [], strength: strength || 'present' });
    const sameSign = (a, b) => p[a].sign === p[b].sign;
    const mutualAspect = (a, b) => c.aspects(a).includes(p[b].house) && c.aspects(b).includes(p[a].house);
    const exchange = (a, b) => a !== b && SIGN_LORD[p[a].sign] === b && SIGN_LORD[p[b].sign] === a;
    const connected = (a, b) => a !== b && (sameSign(a, b) || exchange(a, b) || mutualAspect(a, b));
    const how = (a, b) => sameSign(a, b) ? 'sit together' : exchange(a, b) ? 'swap signs' : 'face each other';
    const fromMoon = (n) => houseFrom(p[n].sign, p.Moon.sign);
    const strong = (n) => ['exalted', 'moolatrikona', 'own'].includes(p[n].dignity);
    const hs = (n) => c.housesOwned(n).join(' & ');

    if (KENDRA.includes(fromMoon('Jupiter')))
      add('Lasting reputation', 'fame', 'Jupiter sits at a strong angle from your Moon. This is one of the best-known lucky combinations: respect, intelligence and the ability to win people over.', ['Jupiter', 'Moon'], p.Jupiter.dignity === 'debilitated' && !p.Jupiter.neechaBhanga ? 'mild' : 'strong');
    if (sameSign('Sun', 'Mercury'))
      add('Sharp business mind', 'mind', 'Sun and Mercury share a sign. This gives business intelligence, clear communication and skill with numbers and negotiation.', ['Sun', 'Mercury'], p.Mercury.combust && angDist(p.Mercury.lon, p.Sun.lon) < 4 ? 'mild' : 'strong');
    if (sameSign('Moon', 'Mars') || mutualAspect('Moon', 'Mars'))
      add('Money through enterprise', 'wealth', `Moon and Mars ${how('Moon', 'Mars')}. A classic earning combination: money from quick decisions and the hunger to build.`, ['Moon', 'Mars']);
    const MP = { Mars: 'courage, leadership and command over competition', Mercury: 'a brilliant mind, way with words and natural trading sense', Jupiter: 'wisdom, good fortune and the respect of smart people', Venus: 'charm, taste, luxury and a comfortable life', Saturn: 'authority over large groups, discipline and long-term power' };
    for (const n of Object.keys(MP)) {
      if (strong(n) && KENDRA.includes(p[n].house))
        add(`${n} at full power`, 'power', `${n} is in its strongest sign and in one of the four power houses (1, 4, 7, 10). This is one of the five "great person" combinations and gives ${MP[n]}.`, [n], 'strong');
    }
    const ks = new Set(), seen = new Set();
    for (const k of [1, 4, 7, 10]) for (const t of [1, 5, 9]) {
      const a = c.lordOf(k), b = c.lordOf(t);
      if (a === b) { if (k !== 1 && t !== 1) ks.add(a); continue; }
      const key = [a, b].sort().join('+');
      if (seen.has(key) || !connected(a, b)) continue;
      seen.add(key);
      add('Success and status', 'power', `${a} (ruler of house ${hs(a)}) and ${b} (ruler of house ${hs(b)}) ${how(a, b)}. A power-house ruler joining a luck-house ruler is the core formula for rising in status.`, [a, b], 'strong');
    }
    for (const yk of ks) add(`${yk} is your success planet`, 'power', `${yk} rules both a power house and a luck house for your rising sign, making it your most rewarding planet. Its periods tend to bring promotions, recognition and big wins.`, [yk], strong(yk) || KENDRA.includes(p[yk].house) || TRIKONA.includes(p[yk].house) ? 'strong' : 'present');
    const dseen = new Set();
    for (const w of [2, 11]) for (const f of [1, 5, 9]) {
      const a = c.lordOf(w), b = c.lordOf(f);
      if (a === b) continue;
      const key = [a, b].sort().join('+');
      if (dseen.has(key) || !connected(a, b)) continue;
      dseen.add(key);
      add('Wealth combination', 'wealth', `${a} (ruler of money house ${w}) and ${b} (ruler of luck house ${f}) ${how(a, b)}. This links your money houses with your luck houses, a classic sign of building wealth.`, [a, b], 'strong');
    }
    if (c.lordOf(2) !== c.lordOf(11) && connected(c.lordOf(2), c.lordOf(11)))
      add('Wealth combination', 'wealth', `The rulers of your savings house (${c.lordOf(2)}) and income house (${c.lordOf(11)}) ${how(c.lordOf(2), c.lordOf(11))}. What you earn tends to stay and grow.`, [c.lordOf(2), c.lordOf(11)], 'strong');
    const L9 = c.lordOf(9), L1 = c.lordOf(1);
    if (strong(L9) && (KENDRA.includes(p[L9].house) || TRIKONA.includes(p[L9].house)) && p[L1].dignity !== 'debilitated')
      add('Prosperity combination', 'wealth', `Your luck ruler ${L9} is in a strong sign and a strong house. Named after the goddess of wealth, this combination gives prosperity, generosity and a graceful life.`, [L9, L1], 'strong');
    const L10 = c.lordOf(10);
    if (L9 !== L10 && connected(L9, L10))
      add('Luck meets career', 'power', `Your luck ruler ${L9} and career ruler ${L10} ${how(L9, L10)}. Luck and career are tied together, the strongest classic signal for a meaningful, successful career.`, [L9, L10], 'strong');
    else if (L9 === L10)
      add('Luck meets career', 'power', `${L9} rules both your luck and career houses, so one planet carries both.`, [L9], 'present');
    for (const h of [6, 8, 12]) {
      const l = c.lordOf(h);
      if (DUSTHANA.includes(p[l].house) && !c.housesOwned(l).some((x) => [1, 5, 9].includes(x)))
        add('Comeback combination', 'power', `The ruler of your ${h}th house (${l}) sits in another difficult house, which cancels the difficulty out. You do your best when things look hard, and you often gain where others lose.`, [l]);
    }
    for (const n of SEVEN) if (p[n].neechaBhanga)
      add('Weakness turned strength', 'power', `${n} starts in its weakest sign, but the weakness is cancelled. Classic texts rate this among the most powerful success combinations: a slow or humble start that turns into a remarkable rise.`, [n], 'strong');
    const pseen = new Set();
    for (const a of SEVEN) for (const b of SEVEN) {
      if (a >= b || !exchange(a, b)) continue;
      const key = a + b;
      if (pseen.has(key)) continue; pseen.add(key);
      const bad = DUSTHANA.includes(p[a].house) || DUSTHANA.includes(p[b].house);
      add('Planet exchange', bad ? 'mind' : 'power', `${a} and ${b} sit in each other's signs (houses ${p[a].house} and ${p[b].house}). The two areas they rule work as a team.`, [a, b], bad ? 'present' : 'strong');
    }
    const others = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const second = others.filter((n) => fromMoon(n) === 2), twelfth = others.filter((n) => fromMoon(n) === 12);
    if (second.length && twelfth.length) add('Supported on both sides', 'wealth', `Planets on both sides of your Moon (${second.concat(twelfth).join(', ')}). Classic results: wealth, comfort and a well supported life.`, second.concat(twelfth));
    else if (second.length) add('Self-made wealth', 'wealth', `${second.join(', ')} just after your Moon. You build your own money and reputation through your own intelligence.`, second);
    else if (twelfth.length) add('Magnetic presence', 'mind', `${twelfth.join(', ')} just before your Moon. A graceful, generous and magnetic personality.`, twelfth);
    const adhi = ['Mercury', 'Jupiter', 'Venus'].filter((n) => [6, 7, 8].includes(fromMoon(n)));
    if (adhi.length >= 2) add('Leadership combination', 'power', `${adhi.join(' and ')} sit opposite your Moon. Linked to leadership, a comfortable life and winning over rivals.`, adhi, adhi.length === 3 ? 'strong' : 'present');
    const amala = ['Jupiter', 'Venus', 'Mercury'].filter((n) => p[n].house === 10 || fromMoon(n) === 10);
    if (amala.length) add('Clean reputation', 'fame', `${amala.join(' and ')} in your career house. A clean, lasting reputation and work people admire.`, amala);
    const good = [1, 2, 4, 5, 7, 9, 10];
    if (['Jupiter', 'Venus', 'Mercury'].every((n) => good.includes(p[n].house)) && ['exalted', 'moolatrikona', 'own', 'friend'].includes(p.Jupiter.dignity))
      add('Gift of learning', 'mind', 'Jupiter, Venus and Mercury all sit in strong houses with Jupiter well placed. Named after the goddess of learning: gifted with words, creativity and knowledge.', ['Jupiter', 'Venus', 'Mercury'], 'strong');
    const b12 = ['Jupiter', 'Venus', 'Mercury'].filter((n) => p[n].house === 12), b2 = ['Jupiter', 'Venus', 'Mercury'].filter((n) => p[n].house === 2);
    if (b12.length && b2.length) add('Protected self', 'mind', 'Helpful planets on both sides of your rising sign protect your health, image and confidence.', b12.concat(b2));
    const fromSun = (n) => houseFrom(p[n].sign, p.Sun.sign);
    const s2 = others.filter((n) => fromSun(n) === 2), s12 = others.filter((n) => fromSun(n) === 12);
    if (s2.length && s12.length) add('Confidence and resources', 'fame', 'Planets on both sides of your Sun: confident, well spoken and well resourced.', s2.concat(s12));
    else if (s2.length) add('Balanced success', 'mind', `${s2.join(', ')} just after your Sun. Truthful, balanced and steadily prosperous.`, s2);
    else if (s12.length) add('Skill and generosity', 'mind', `${s12.join(', ')} just before your Sun. Skilful, generous and happy.`, s12);
    return Y;
  }

  // ---------- transits ----------
  function positionsAt(ms) {
    const fr = frame(ms);
    const out = {};
    for (const n of PLANETS) { const L = sidereal(n, ms, fr); out[n] = { lon: L, sign: signOf(L), nak: nakOf(L) }; }
    return out;
  }
  function sadeSati(chart, fromMs, toMs) {
    // months where Saturn transits the 12th, 1st or 2nd sign from the natal Moon
    const periods = [];
    let cur = null;
    for (let t = fromMs; t <= toMs; t += 15 * DAY) {
      const s = signOf(sidereal('Saturn', t));
      const rel = houseFrom(s, chart.p.Moon.sign);
      const on = rel === 12 || rel === 1 || rel === 2;
      if (on && !cur) cur = { start: t, end: t };
      if (on) cur.end = t;
      if (!on && cur) { periods.push(cur); cur = null; }
    }
    if (cur) periods.push(cur);
    // merge retrograde gaps shorter than ~14 months
    const merged = [];
    for (const pr of periods) {
      const last = merged[merged.length - 1];
      if (last && pr.start - last.end < 425 * DAY) last.end = pr.end; else merged.push({ ...pr });
    }
    return merged;
  }
  function signIngresses(planet, fromMs, toMs, stepDays) {
    const out = [];
    let prev = signOf(sidereal(planet, fromMs));
    out.push({ sign: prev, start: fromMs });
    for (let t = fromMs + stepDays * DAY; t <= toMs; t += stepDays * DAY) {
      const s = signOf(sidereal(planet, t));
      if (s !== prev) { out.push({ sign: s, start: t }); prev = s; }
    }
    for (let i = 0; i < out.length; i++) out[i].end = i + 1 < out.length ? out[i + 1].start : toMs;
    return out;
  }

  // ---------- muhurta ----------
  const BUSINESS_NAK = [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26];
  const AVOID_NAK = [1, 2, 5, 8, 9, 10, 15, 17, 18, 19, 24];
  const GOOD_TITHI = [2, 3, 5, 7, 10, 11, 13];
  const BAD_TITHI = [4, 8, 9, 14, 30];
  const TARA = ['Birth', 'Wealth', 'Danger', 'Well-being', 'Obstacle', 'Achievement', 'Loss', 'Friend', 'Best friend'];
  const RAHU_KAAL_SEG = [8, 2, 7, 5, 6, 4, 3]; // 1-indexed eighth of daytime, Sunday first

  function muhurtaDays(chart, opts) {
    const { lat, lon, startMs, days, weekdayOf } = opts;
    const natalNak = chart.p.Moon.nak, natalMoonSign = chart.p.Moon.sign;
    const out = [];
    let t = startMs;
    for (let i = 0; i < days; i++) {
      const ev = sunEvents(t, lat, lon);
      if (!ev.rise) { t += DAY; continue; }
      const at = ev.rise + 30 * 60000;
      const fr = frame(at);
      const sun = sidereal('Sun', at, fr), moon = sidereal('Moon', at, fr);
      const ti = tithiInfo(sun, moon);
      const nk = nakOf(moon);
      const wd = weekdayOf(ev.rise);
      const taraN = (((nk - natalNak) % 27 + 27) % 27) % 9; // 0..8
      const chandra = houseFrom(signOf(moon), natalMoonSign);
      let score = 0;
      const why = [], hard = [];
      const tNum = ti.n <= 15 ? ti.n : ti.n - 15;
      if (ti.n === 30 || BAD_TITHI.includes(tNum)) { hard.push(ti.n === 30 ? 'new Moon' : 'unlucky lunar day'); score -= 4; }
      else if (GOOD_TITHI.includes(tNum)) { score += 2; why.push(`${ti.paksha === 'Shukla' ? 'Waxing' : 'Waning'} Moon, lucky lunar day ${ti.n <= 15 ? ti.n : ti.n - 15}`); }
      if (ti.paksha === 'Shukla') score += 1;
      if ([3, 4, 5].includes(wd)) { score += 2; why.push(['', '', '', 'Wednesday, ruled by Mercury: commerce and deals', 'Thursday, ruled by Jupiter: growth and blessings', 'Friday, ruled by Venus: brand, beauty and money'][wd]); }
      else if (wd === 1 || wd === 0) score += 1;
      else { hard.push('Tuesday / Saturday'); score -= 3; }
      if (BUSINESS_NAK.includes(nk)) { score += 2; why.push(`Moon in a birth star favoured for opening a business`); }
      else if (AVOID_NAK.includes(nk)) { hard.push('harsh star'); score -= 2; }
      if ([1, 3, 5, 7, 8].includes(taraN)) { score += 2; why.push(`"${TARA[taraN]}" match with your birth star`); }
      else if ([2, 4, 6].includes(taraN)) { hard.push(`${TARA[taraN]} star match`); score -= 3; }
      if ([1, 3, 6, 7, 10, 11].includes(chandra)) { score += 1; why.push('Moon in a lucky position from your birth Moon'); }
      else if (chandra === 8) { hard.push('Moon 8th from birth Moon'); score -= 4; }
      if (ti.karana === 'Vishti') { hard.push('unlucky half-day'); score -= 2; }
      const dayLen = ev.set && ev.set > ev.rise ? ev.set - ev.rise : 12 * 3600000;
      const seg = dayLen / 8;
      const rk = ev.rise + (RAHU_KAAL_SEG[wd] - 1) * seg;
      const noon = ev.rise + dayLen / 2;
      out.push({
        sunrise: ev.rise, sunset: ev.set, weekday: wd, tithi: `${ti.paksha === 'Shukla' ? 'Waxing' : 'Waning'} Moon, day ${ti.n <= 15 ? ti.n : ti.n - 15}`, nak: nk, tara: TARA[taraN], chandra,
        score, why: why.filter(Boolean), hard, ok: hard.length === 0,
        rahuKaal: [rk, rk + seg], abhijit: wd === 3 ? null : [noon - 24 * 60000, noon + 24 * 60000],
      });
      t = ev.rise + 20 * 3600000;
    }
    return out;
  }

  root.Jyotish = {
    PLANETS, SEVEN, SIGN_LORD, DASHA_ORDER, DASHA_YEARS, EXALT, OWN, KENDRA, TRIKONA, DUSTHANA, UPACHAYA, DIGNITY_PTS, YEAR, DAY,
    norm, signOf, nakOf, padaOf, houseFrom, angDist, frame, sidereal, ascendant, lahiriMean,
    computeChart, dashaAt, positionsAt, sadeSati, signIngresses, muhurtaDays, tithiInfo, sunEvents,
  };
})(typeof window !== 'undefined' ? window : globalThis);
