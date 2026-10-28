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

  // ---------- yogas ----------
  function findYogas(c) {
    const { p } = c;
    const Y = [];
    const add = (name, kind, text, planets, strength) => Y.push({ name, kind, text, planets: planets || [], strength: strength || 'present' });
    const sameSign = (a, b) => p[a].sign === p[b].sign;
    const mutualAspect = (a, b) => c.aspects(a).includes(p[b].house) && c.aspects(b).includes(p[a].house);
    const exchange = (a, b) => a !== b && SIGN_LORD[p[a].sign] === b && SIGN_LORD[p[b].sign] === a;
    const connected = (a, b) => a !== b && (sameSign(a, b) || exchange(a, b) || mutualAspect(a, b));
    const how = (a, b) => sameSign(a, b) ? 'sit together' : exchange(a, b) ? 'exchange signs' : 'aspect each other';
    const fromMoon = (n) => houseFrom(p[n].sign, p.Moon.sign);
    const strong = (n) => ['exalted', 'moolatrikona', 'own'].includes(p[n].dignity);

    // Gajakesari
    if (KENDRA.includes(fromMoon('Jupiter')))
      add('Gajakesari Yoga', 'fame', 'Jupiter stands in a kendra from your Moon. Classical texts promise lasting reputation, intelligence, a respected voice and the ability to win people over.', ['Jupiter', 'Moon'], p.Jupiter.dignity === 'debilitated' && !p.Jupiter.neechaBhanga ? 'mild' : 'strong');
    // Budhaditya
    if (sameSign('Sun', 'Mercury'))
      add('Budhaditya Yoga', 'mind', 'Sun and Mercury share a sign. This is the yoga of sharp business intelligence, clear communication and skill with numbers and negotiation.', ['Sun', 'Mercury'], p.Mercury.combust && angDist(p.Mercury.lon, p.Sun.lon) < 4 ? 'mild' : 'strong');
    // Chandra-Mangala
    if (sameSign('Moon', 'Mars') || mutualAspect('Moon', 'Mars'))
      add('Chandra-Mangala Yoga', 'wealth', 'Moon and Mars ' + how('Moon', 'Mars') + '. This is a classic earning yoga: money through enterprise, quick decisions and a hunger to build.', ['Moon', 'Mars']);
    // Pancha Mahapurusha
    const MP = { Mars: ['Ruchaka Yoga', 'courage, leadership and command over competition'], Mercury: ['Bhadra Yoga', 'brilliant intellect, eloquence and natural trading sense'], Jupiter: ['Hamsa Yoga', 'wisdom, good fortune and the respect of learned people'], Venus: ['Malavya Yoga', 'charm, luxury, artistic taste and a comfortable life'], Saturn: ['Sasa Yoga', 'authority over large groups, discipline and long-term power'] };
    for (const n of Object.keys(MP)) {
      if (['exalted', 'moolatrikona', 'own'].includes(p[n].dignity) && KENDRA.includes(p[n].house))
        add(MP[n][0], 'power', `One of the five Mahapurusha yogas. ${n} is in its own or exalted sign in a kendra, giving ${MP[n][1]}.`, [n], 'strong');
    }
    // Raja yogas: kendra lord + trikona lord
    const ks = new Set(), seen = new Set();
    for (const k of [1, 4, 7, 10]) for (const t of [1, 5, 9]) {
      const a = c.lordOf(k), b = c.lordOf(t);
      if (a === b) { if (k !== 1 && t !== 1) ks.add(a); continue; }
      const key = [a, b].sort().join('+');
      if (seen.has(key) || !connected(a, b)) continue;
      seen.add(key);
      add('Raja Yoga', 'power', `${a} (lord of house ${c.housesOwned(a).join(' & ')}) and ${b} (lord of house ${c.housesOwned(b).join(' & ')}) ${how(a, b)}. A kendra lord joining a trikona lord is the core Parashari formula for rise in status and authority.`, [a, b], 'strong');
    }
    for (const yk of ks) add('Yogakaraka ' + yk, 'power', `${yk} rules both a kendra and a trikona for your lagna, which makes it your single most rewarding planet. Its periods tend to bring promotions, recognition and big wins.`, [yk], strong(yk) || KENDRA.includes(p[yk].house) || TRIKONA.includes(p[yk].house) ? 'strong' : 'present');
    // Dhana yogas
    const dseen = new Set();
    for (const w of [2, 11]) for (const f of [1, 5, 9]) {
      const a = c.lordOf(w), b = c.lordOf(f);
      if (a === b) continue;
      const key = [a, b].sort().join('+');
      if (dseen.has(key) || !connected(a, b)) continue;
      dseen.add(key);
      add('Dhana Yoga', 'wealth', `${a} (wealth lord of house ${w}) and ${b} (fortune lord of house ${f}) ${how(a, b)}. This links your money houses with your luck houses, a classical sign of accumulated wealth.`, [a, b], 'strong');
    }
    if (c.lordOf(2) !== c.lordOf(11) && connected(c.lordOf(2), c.lordOf(11)))
      add('Dhana Yoga', 'wealth', `Your 2nd lord ${c.lordOf(2)} and 11th lord ${c.lordOf(11)} ${how(c.lordOf(2), c.lordOf(11))}. Income and savings feed each other, so what you earn tends to stay and grow.`, [c.lordOf(2), c.lordOf(11)], 'strong');
    // Lakshmi
    const L9 = c.lordOf(9), L1 = c.lordOf(1);
    if (strong(L9) && (KENDRA.includes(p[L9].house) || TRIKONA.includes(p[L9].house)) && p[L1].dignity !== 'debilitated')
      add('Lakshmi Yoga', 'wealth', `Your 9th lord ${L9} is dignified and well placed while your lagna lord is steady. Named after the goddess of wealth, this yoga gives prosperity, generosity and a graceful life.`, [L9, L1], 'strong');
    // Dharma-Karmadhipati
    const L10 = c.lordOf(10);
    if (L9 !== L10 && connected(L9, L10))
      add('Dharma-Karmadhipati Yoga', 'power', `Your 9th lord ${L9} and 10th lord ${L10} ${how(L9, L10)}. Luck and career are tied together, the strongest classical signal for a meaningful, successful career.`, [L9, L10], 'strong');
    else if (L9 === L10)
      add('Dharma-Karmadhipati Yoga', 'power', `${L9} rules both your 9th and 10th houses, so luck and career are carried by one planet. Its strength becomes your career's engine.`, [L9], 'present');
    // Vipreet raja
    const VR = { 6: 'Harsha', 8: 'Sarala', 12: 'Vimala' };
    for (const h of [6, 8, 12]) {
      const l = c.lordOf(h);
      if (DUSTHANA.includes(p[l].house) && !c.housesOwned(l).some((x) => [1, 5, 9].includes(x)))
        add(VR[h] + ' Vipreet Raja Yoga', 'power', `Your ${h}th lord ${l} sits in a dusthana. This reverse raja yoga turns setbacks into springboards: you win when situations look difficult and often gain from others' losses.`, [l]);
    }
    // Neecha bhanga
    for (const n of SEVEN) if (p[n].neechaBhanga)
      add('Neecha Bhanga Raja Yoga', 'power', `${n} is debilitated but the debilitation is cancelled. Classical texts rate this among the most powerful raja yogas: a slow or humble start that turns into a remarkable rise.`, [n], 'strong');
    // Parivartana
    const pseen = new Set();
    for (const a of SEVEN) for (const b of SEVEN) {
      if (a >= b || !exchange(a, b)) continue;
      const key = a + b;
      if (pseen.has(key)) continue; pseen.add(key);
      const bad = DUSTHANA.includes(p[a].house) || DUSTHANA.includes(p[b].house);
      add('Parivartana Yoga', bad ? 'mind' : 'power', `${a} and ${b} sit in each other's signs (houses ${p[a].house} and ${p[b].house}). The two houses they rule work as a team and strengthen each other.`, [a, b], bad ? 'present' : 'strong');
    }
    // Moon yogas
    const others = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const second = others.filter((n) => fromMoon(n) === 2), twelfth = others.filter((n) => fromMoon(n) === 12);
    if (second.length && twelfth.length) add('Durudhara Yoga', 'wealth', `Planets on both sides of your Moon (${second.concat(twelfth).join(', ')}). Classical results: wealth, vehicles, generosity and a well supported life.`, second.concat(twelfth));
    else if (second.length) add('Sunapha Yoga', 'wealth', `${second.join(', ')} in the 2nd from your Moon. You build self-earned wealth and a reputation through your own intelligence.`, second);
    else if (twelfth.length) add('Anapha Yoga', 'mind', `${twelfth.join(', ')} in the 12th from your Moon. Graceful personality, good health and a generous, magnetic presence.`, twelfth);
    const adhi = ['Mercury', 'Jupiter', 'Venus'].filter((n) => [6, 7, 8].includes(fromMoon(n)));
    if (adhi.length >= 2) add('Adhi Yoga', 'power', `${adhi.join(' and ')} in the 6th, 7th or 8th from your Moon. Adhi yoga is linked to leadership, a comfortable life and success over rivals.`, adhi, adhi.length === 3 ? 'strong' : 'present');
    // Amala
    const amala = ['Jupiter', 'Venus', 'Mercury'].filter((n) => p[n].house === 10 || fromMoon(n) === 10);
    if (amala.length) add('Amala Yoga', 'fame', `${amala.join(' and ')} in the 10th house. Amala means spotless: a clean, lasting reputation and work people admire.`, amala);
    // Saraswati
    const good = [1, 2, 4, 5, 7, 9, 10];
    if (['Jupiter', 'Venus', 'Mercury'].every((n) => good.includes(p[n].house)) && ['exalted', 'moolatrikona', 'own', 'friend'].includes(p.Jupiter.dignity))
      add('Saraswati Yoga', 'mind', 'Jupiter, Venus and Mercury all occupy kendras, trikonas or the 2nd house with Jupiter well disposed. Named after the goddess of learning: gifted with words, creativity and knowledge.', ['Jupiter', 'Venus', 'Mercury'], 'strong');
    // Shubha kartari on lagna
    const b12 = ['Jupiter', 'Venus', 'Mercury'].filter((n) => p[n].house === 12), b2 = ['Jupiter', 'Venus', 'Mercury'].filter((n) => p[n].house === 2);
    if (b12.length && b2.length) add('Shubha Kartari Yoga', 'mind', 'Benefics on both sides of your lagna protect your health, image and self-confidence.', b12.concat(b2));
    // Vesi / Vasi / Ubhayachari
    const fromSun = (n) => houseFrom(p[n].sign, p.Sun.sign);
    const s2 = others.filter((n) => fromSun(n) === 2), s12 = others.filter((n) => fromSun(n) === 12);
    if (s2.length && s12.length) add('Ubhayachari Yoga', 'fame', 'Planets on both sides of your Sun. Equal to a king in comfort, says Phaladeepika: confident, eloquent and well resourced.', s2.concat(s12));
    else if (s2.length) add('Vesi Yoga', 'mind', `${s2.join(', ')} in the 2nd from your Sun. Truthful, balanced and steadily prosperous.`, s2);
    else if (s12.length) add('Vasi Yoga', 'mind', `${s12.join(', ')} in the 12th from your Sun. Charitable, skilful and happy.`, s12);
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
  const TARA = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhana', 'Naidhana', 'Mitra', 'Param Mitra'];
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
      if (ti.n === 30 || BAD_TITHI.includes(tNum)) { hard.push(ti.n === 30 ? 'Amavasya' : 'Rikta / avoided tithi'); score -= 4; }
      else if (GOOD_TITHI.includes(tNum)) { score += 2; why.push(`${ti.paksha} ${ti.name}, an auspicious tithi`); }
      if (ti.paksha === 'Shukla') score += 1;
      if ([3, 4, 5].includes(wd)) { score += 2; why.push(['', '', '', 'Wednesday, ruled by Mercury: commerce and deals', 'Thursday, ruled by Jupiter: growth and blessings', 'Friday, ruled by Venus: brand, beauty and money'][wd]); }
      else if (wd === 1 || wd === 0) score += 1;
      else { hard.push('Tuesday / Saturday'); score -= 3; }
      if (BUSINESS_NAK.includes(nk)) { score += 2; why.push(`Moon in a nakshatra favoured for opening a business`); }
      else if (AVOID_NAK.includes(nk)) { hard.push('sharp or mixed nakshatra'); score -= 2; }
      if ([1, 3, 5, 7, 8].includes(taraN)) { score += 2; why.push(`${TARA[taraN]} tara from your birth star`); }
      else if ([2, 4, 6].includes(taraN)) { hard.push(`${TARA[taraN]} tara`); score -= 3; }
      if ([1, 3, 6, 7, 10, 11].includes(chandra)) { score += 1; why.push('Moon transiting a favourable house from your natal Moon (Chandrabala)'); }
      else if (chandra === 8) { hard.push('Chandrashtama'); score -= 4; }
      if (ti.karana === 'Vishti') { hard.push('Bhadra (Vishti karana)'); score -= 2; }
      const dayLen = ev.set && ev.set > ev.rise ? ev.set - ev.rise : 12 * 3600000;
      const seg = dayLen / 8;
      const rk = ev.rise + (RAHU_KAAL_SEG[wd] - 1) * seg;
      const noon = ev.rise + dayLen / 2;
      out.push({
        sunrise: ev.rise, sunset: ev.set, weekday: wd, tithi: `${ti.paksha} ${ti.name}`, nak: nk, tara: TARA[taraN], chandra,
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
