/* Reading layer: turns a computed chart into plain-English answers.
   Every answer is derived from chart factors and lists the factors it used. */
(function (root) {
  'use strict';
  const J = root.Jyotish;
  const { PLANETS, SIGN_LORD, KENDRA, TRIKONA, DUSTHANA, DIGNITY_PTS, YEAR, DAY, houseFrom, signOf } = J;

  const SIGNS = [
    { en: 'Aries', sa: 'Mesha', el: 'Fire', body: 'head and face', lagna: 'You start things. Aries rising gives initiative, physical energy and the nerve to go first, and you learn fastest by doing.', moon: 'Your mind is quick and direct. You recharge by starting something new.', spouse: 'energetic, direct and independent' },
    { en: 'Taurus', sa: 'Vrishabha', el: 'Earth', body: 'throat, neck and face', lagna: 'You build things that last. Taurus rising gives patience, taste and a steady hand with money, and people trust you because you stay calm.', moon: 'The Moon is exalted in Taurus, giving a calm, steady and sensual mind with excellent taste.', spouse: 'loyal, attractive, steady and fond of comfort' },
    { en: 'Gemini', sa: 'Mithuna', el: 'Air', body: 'shoulders, arms and lungs', lagna: 'You connect ideas and people. Gemini rising gives a quick mind, wit and a gift for communication, and you can run several projects at once.', moon: 'Your mind is curious and witty and needs conversation and variety.', spouse: 'witty, youthful, talkative and smart' },
    { en: 'Cancer', sa: 'Karka', el: 'Water', body: 'chest and stomach', lagna: 'You lead by caring. Cancer rising gives emotional intelligence, protectiveness and a strong memory, and people feel at home around you.', moon: 'The Moon is in its own sign, so your instincts are reliable and your feelings run deep.', spouse: 'caring, emotional, family-minded and protective' },
    { en: 'Leo', sa: 'Simha', el: 'Fire', body: 'heart and spine', lagna: 'You are built to lead. Leo rising gives presence, dignity and generosity, and you do your best work when you own the outcome.', moon: 'Your mind is proud, warm and big-hearted. You give loyalty and expect respect.', spouse: 'confident, dignified, generous and proud' },
    { en: 'Virgo', sa: 'Kanya', el: 'Earth', body: 'digestion and intestines', lagna: 'You make things work. Virgo rising, ruled by Mercury, gives an analytical mind, precision and a talent for improving systems. You notice what others miss, which makes you a sharp strategist and operator.', moon: 'Your mind is thoughtful and precise and calms down when things are organised.', spouse: 'intelligent, practical, health-conscious and helpful' },
    { en: 'Libra', sa: 'Tula', el: 'Air', body: 'kidneys and lower back', lagna: 'You create balance and close deals. Libra rising gives charm, fairness and an eye for design, and you are a natural negotiator.', moon: 'Your mind is diplomatic and aesthetic. You think best in partnership.', spouse: 'graceful, fair-minded, stylish and social' },
    { en: 'Scorpio', sa: 'Vrishchika', el: 'Water', body: 'reproductive and eliminative organs', lagna: 'You go deep. Scorpio rising gives intensity, focus and resilience, and you read people and situations quickly.', moon: 'Your mind is intense, private and perceptive, with real staying power.', spouse: 'intense, loyal, private and magnetic' },
    { en: 'Sagittarius', sa: 'Dhanu', el: 'Fire', body: 'hips, thighs and liver', lagna: 'You aim high. Sagittarius rising gives optimism, a love of learning and a strong moral compass, and you inspire people with vision.', moon: 'Your mind is optimistic and philosophical. You need a bigger purpose to feel settled.', spouse: 'principled, cheerful, educated and adventurous' },
    { en: 'Capricorn', sa: 'Makara', el: 'Earth', body: 'knees, bones and joints', lagna: 'You climb. Capricorn rising gives discipline, ambition and practicality, and your success compounds with age.', moon: 'Your mind is practical and goal-driven. You show love through reliability.', spouse: 'mature, responsible, hardworking and grounded' },
    { en: 'Aquarius', sa: 'Kumbha', el: 'Air', body: 'calves, ankles and circulation', lagna: 'You think ahead of the crowd. Aquarius rising gives originality, a systems mind and a strong network, and you are drawn to work that helps many people.', moon: 'Your mind is independent, original and future-focused. You process feelings through ideas, and friends and networks matter a lot to you.', spouse: 'independent, unconventional, friendly and idealistic' },
    { en: 'Pisces', sa: 'Meena', el: 'Water', body: 'feet, sleep and immunity', lagna: 'You sense what others miss. Pisces rising gives imagination, compassion and intuition, and you shine in creative and advisory work.', moon: 'Your mind is gentle, imaginative and compassionate. Music, art and quiet time restore you.', spouse: 'kind, artistic, intuitive and spiritual' },
  ];

  const NAK_EN = ['The Horse Healers', 'The Bearer', 'The Flame', 'The Red Star', "The Deer's Head", 'The Storm', 'Return of the Light', 'The Nourisher', 'The Serpent', 'The Throne', 'The Former Red Star', 'The Latter Red Star', 'The Hand', 'The Bright Jewel', 'The Wind', 'The Forked Branch', 'The Lotus', 'The Eldest', 'The Root', 'Early Victory', 'Final Victory', 'The Ear', 'The Drum', 'The Hundred Healers', 'The Fire Visionary', 'The Deep Serpent', 'The Fish'];
  const NAKS = [
    ['Ashwini', 'the Ashwini Kumaras, divine healers', "a horse's head", 'speed, healing and fresh starts', ['Chu', 'Che', 'Cho', 'La']],
    ['Bharani', 'Yama, lord of dharma', 'the yoni', 'willpower, responsibility and the strength to carry big loads', ['Li', 'Lu', 'Le', 'Lo']],
    ['Krittika', 'Agni, the fire god', 'a flame or razor', 'sharpness, courage and decisive action', ['A', 'I', 'U', 'E']],
    ['Rohini', 'Brahma, the creator', 'a chariot', 'growth, beauty, charm and abundance', ['O', 'Va', 'Vi', 'Vu']],
    ['Mrigashira', 'Soma, the moon god', "a deer's head", 'curiosity, gentleness and the joy of searching', ['Ve', 'Vo', 'Ka', 'Ki']],
    ['Ardra', 'Rudra, the storm god', 'a teardrop', 'intensity, research and the power to transform', ['Ku', 'Gha', 'Ng', 'Chha']],
    ['Punarvasu', 'Aditi, mother of the gods', 'a quiver of arrows', 'renewal, optimism and coming back stronger', ['Ke', 'Ko', 'Ha', 'Hi']],
    ['Pushya', 'Brihaspati, guru of the gods', "a cow's udder", 'nourishment and wisdom; it is called the most auspicious nakshatra', ['Hu', 'He', 'Ho', 'Da']],
    ['Ashlesha', 'the Nagas', 'a coiled serpent', 'strategy, perception and magnetism', ['Di', 'Du', 'De', 'Do']],
    ['Magha', 'the Pitris, the ancestors', 'a royal throne', 'leadership, legacy and royal confidence', ['Ma', 'Mi', 'Mu', 'Me']],
    ['Purva Phalguni', 'Bhaga, god of fortune', 'the front legs of a bed', 'creativity, pleasure and charm', ['Mo', 'Ta', 'Ti', 'Tu']],
    ['Uttara Phalguni', 'Aryaman, god of contracts', 'the back legs of a bed', 'generosity, contracts and dependable alliances', ['Te', 'To', 'Pa', 'Pi']],
    ['Hasta', 'Savitar, the sun god', 'an open hand', 'skill, craftsmanship and wit', ['Pu', 'Sha', 'Na', 'Tha']],
    ['Chitra', 'Vishwakarma, the divine architect', 'a bright jewel', 'design, brilliance and building beautiful things', ['Pe', 'Po', 'Ra', 'Ri']],
    ['Swati', 'Vayu, the wind god', 'a young shoot in the wind', 'independence, flexibility and a natural trading sense', ['Ru', 'Re', 'Ro', 'Ta']],
    ['Vishakha', 'Indra and Agni', 'a triumphal arch', 'ambition, focus and winning the goal', ['Ti', 'Tu', 'Te', 'To']],
    ['Anuradha', 'Mitra, god of friendship', 'a lotus', 'friendship, devotion and success far from home', ['Na', 'Ni', 'Nu', 'Ne']],
    ['Jyeshtha', 'Indra, king of the gods', 'a protective umbrella', 'seniority, protection and command', ['No', 'Ya', 'Yi', 'Yu']],
    ['Mula', 'Nirriti', 'a bundle of roots', 'getting to the root of things and rebuilding from scratch', ['Ye', 'Yo', 'Bha', 'Bhi']],
    ['Purva Ashadha', 'Apas, the waters', 'a winnowing fan', 'persuasion, invincibility and purifying energy', ['Bhu', 'Dha', 'Pha', 'Dha']],
    ['Uttara Ashadha', 'the Vishvadevas', "an elephant's tusk", 'final victory, integrity and lasting success', ['Bhe', 'Bho', 'Ja', 'Ji']],
    ['Shravana', 'Vishnu, the preserver', 'an ear', 'listening, learning and reputation', ['Ju', 'Je', 'Jo', 'Gha']],
    ['Dhanishta', 'the eight Vasus', 'a drum', 'wealth, rhythm, music and fame', ['Ga', 'Gi', 'Gu', 'Ge']],
    ['Shatabhisha', 'Varuna, lord of the cosmic waters', 'an empty circle', 'healing, research and technology', ['Go', 'Sa', 'Si', 'Su']],
    ['Purva Bhadrapada', 'Aja Ekapada, the one-footed fire serpent', 'the front of a cot', 'idealism, vision and the courage to transform things', ['Se', 'So', 'Da', 'Di']],
    ['Uttara Bhadrapada', 'Ahir Budhnya, the serpent of the deep', 'the back of a cot', 'depth, wisdom and steadiness', ['Du', 'Tha', 'Jha', 'Na']],
    ['Revati', 'Pushan, the guide and nourisher', 'a fish', 'nourishment, guidance and prosperous journeys', ['De', 'Do', 'Cha', 'Chi']],
  ].map(([name, deity, symbol, gift, syl], i) => ({ name, en: NAK_EN[i], deity, symbol, gift, syl, lord: J.DASHA_ORDER[i % 9] }));
  const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD'; // per nakshatra: Deva / Manushya / Rakshasa
  const GANA_TEXT = { D: ['Deva', 'gentle, generous and idealistic'], M: ['Manushya', 'practical, balanced and ambitious'], R: ['Rakshasa', 'fearless, intense and protective'] };
  const NADI = ['Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi'];

  const PL = {
    Sun: { sa: 'Surya', ab: 'Su', means: 'soul, confidence, authority and father', theme: 'visibility, authority and leadership', fields: ['leadership and management roles', 'government and policy', 'medicine', 'running your own show'], edge: 'You lead from the front and people follow a confident founder.', gem: 'Ruby', color: 'saffron and copper red', day: 'Sunday', num: 1, deity: 'Surya', mantra: 'Om Suryaya Namah', dir: 'East', verb: 'brings visibility and authority to' },
    Moon: { sa: 'Chandra', ab: 'Mo', means: 'mind, emotions, mother and the public', theme: 'public connection, home and emotional growth', fields: ['anything mass-market or public-facing', 'hospitality and food', 'healthcare and care work', 'travel'], edge: 'You read what people feel, which is the core of marketing.', gem: 'Pearl', color: 'white and silver', day: 'Monday', num: 2, deity: 'Shiva and Parvati', mantra: 'Om Chandraya Namah', dir: 'North-west', verb: 'puts your heart and attention into' },
    Mars: { sa: 'Mangal', ab: 'Ma', means: 'energy, courage, property and competition', theme: 'action, courage and bold starts', fields: ['startups and fast execution', 'engineering and technology', 'real estate', 'sports and fitness'], edge: 'You execute fast and you are not afraid of competition.', gem: 'Red Coral', color: 'red', day: 'Tuesday', num: 9, deity: 'Hanuman', mantra: 'Om Mangalaya Namah', dir: 'South', verb: 'brings drive and fight to' },
    Mercury: { sa: 'Budh', ab: 'Me', means: 'intellect, speech, trade and numbers', theme: 'business, communication and smart deals', fields: ['business and trading', 'marketing and media', 'writing and content', 'consulting, IT and analytics'], edge: 'You think in deals, words and numbers. Selling and negotiating come naturally.', gem: 'Emerald', color: 'green', day: 'Wednesday', num: 5, deity: 'Vishnu and Ganesha', mantra: 'Om Budhaya Namah', dir: 'North', verb: 'brings intelligence and deal-making to' },
    Jupiter: { sa: 'Guru', ab: 'Ju', means: 'wisdom, wealth, teachers and growth', theme: 'growth, wisdom, mentors and wealth', fields: ['education and teaching', 'finance and investing', 'law and advisory', 'mentoring and coaching'], edge: 'People trust your judgement. You grow by teaching and advising.', gem: 'Yellow Sapphire', color: 'yellow and gold', day: 'Thursday', num: 3, deity: 'Vishnu and Brihaspati', mantra: 'Om Gurave Namah', dir: 'North-east', verb: 'blesses and expands' },
    Venus: { sa: 'Shukra', ab: 'Ve', means: 'love, beauty, art, luxury and comfort', theme: 'money, love, creativity and brand', fields: ['brands, fashion and beauty', 'design and the arts', 'entertainment and the creator economy', 'luxury and hospitality'], edge: 'You have taste. Brands, design and relationships are where you win.', gem: 'Diamond or White Sapphire', color: 'white, cream and pastels', day: 'Friday', num: 6, deity: 'Lakshmi', mantra: 'Om Shukraya Namah', dir: 'South-east', verb: 'brings charm, comfort and luck to' },
    Saturn: { sa: 'Shani', ab: 'Sa', means: 'discipline, time, scale and hard work', theme: 'discipline, structure and long-term foundations', fields: ['operations and systems', 'manufacturing and infrastructure', 'large organisations', 'anything built to scale over years'], edge: 'You outlast people. Systems and patience are your unfair advantage.', gem: 'Blue Sapphire', color: 'dark blue and black', day: 'Saturday', num: 8, deity: 'Shani Dev and Hanuman', mantra: 'Om Shanaischaraya Namah', dir: 'West', verb: 'builds slow, durable strength in' },
    Rahu: { sa: 'Rahu', ab: 'Ra', means: 'ambition, technology, foreign links and the masses', theme: 'ambition, technology, foreign links and big jumps', fields: ['technology and AI', 'social media and mass media', 'foreign markets', 'new-age, unconventional industries'], edge: 'You spot what is new before others do and you are hungry to grow.', gem: 'Hessonite', color: 'smoky blue', day: 'Saturday', num: 4, deity: 'Durga', mantra: 'Om Rahave Namah', dir: 'South-west', verb: 'creates hunger and unconventional growth in' },
    Ketu: { sa: 'Ketu', ab: 'Ke', means: 'detachment, research, intuition and mastery', theme: 'focus, research and deep mastery', fields: ['research and analysis', 'coding and technical depth', 'spiritual and healing work', 'niche expertise'], edge: 'You go deeper than anyone else in your niche.', gem: "Cat's Eye", color: 'grey and earthy tones', day: 'Tuesday', num: 7, deity: 'Ganesha', mantra: 'Om Ketave Namah', dir: 'North-west', verb: 'brings detached mastery to' },
  };

  const HOUSES = [null,
    { sa: 'Tanu', area: 'self, body and personality', channel: 'your own name, face and personal brand' },
    { sa: 'Dhana', area: 'savings, family, speech and food', channel: 'savings, family assets and anything you sell with your voice' },
    { sa: 'Sahaja', area: 'courage, effort, media and siblings', channel: 'your own effort, content, media, writing and sales' },
    { sa: 'Sukha', area: 'home, mother, property and peace of mind', channel: 'property, vehicles, home-based work and education' },
    { sa: 'Putra', area: 'creativity, intelligence, romance and children', channel: 'creative work, ideas, teaching, entertainment and smart investments' },
    { sa: 'Ari', area: 'competition, service, health and daily work', channel: 'service, problem-solving, consulting and beating competitors' },
    { sa: 'Kalatra', area: 'partners, spouse, clients and trade', channel: 'partnerships, clients, deals and public trade' },
    { sa: 'Ayu', area: 'research, transformation and shared money', channel: "research, investors, insurance and other people's money" },
    { sa: 'Dharma', area: 'luck, mentors, higher learning and father', channel: 'mentors, higher learning, publishing, travel and plain good luck' },
    { sa: 'Karma', area: 'career, status and reputation', channel: 'career status, authority and public reputation' },
    { sa: 'Labha', area: 'gains, networks and ambitions', channel: 'networks, large platforms, friends and recurring income' },
    { sa: 'Vyaya', area: 'expenses, foreign lands and spirituality', channel: 'foreign clients, overseas work and behind-the-scenes roles' },
  ];

  const ord = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const DIG_WORD = { exalted: 'exalted', moolatrikona: 'in a strong home sign', own: 'in its own sign', friend: "in a friend's sign", neutral: 'in a neutral sign', enemy: 'in a challenging sign', debilitated: 'debilitated' };
  const list = (a) => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

  function analyse(c, opts) {
    const p = c.p;
    const now = opts.now;
    const birth = c.input.utcMs;
    const zone = opts.zone || { tz: opts.tz || 'Asia/Kolkata' };
    const sav = c.ashtakavarga.byHouse;
    const ageAt = (ms) => Math.floor((ms - birth) / YEAR);
    const zf = (ms, o) => zone.tz
      ? new Intl.DateTimeFormat('en-IN', { ...o, timeZone: zone.tz }).format(new Date(ms))
      : new Intl.DateTimeFormat('en-IN', { ...o, timeZone: 'UTC' }).format(new Date(ms + (zone.offset || 0) * 60000));
    const fmtMY = (ms) => zf(ms, { month: 'short', year: 'numeric' });
    const fmtY = (ms) => zf(ms, { year: 'numeric' });
    const fmtD = (ms) => zf(ms, { day: 'numeric', month: 'short', year: 'numeric' });
    const sg = (i) => SIGNS[i].en;
    const pdesc = (n) => `${n} ${digw(n)} in your ${ord(p[n].house)} house`;
    const digw = (n) => DIG_WORD[p[n].dignity] + (p[n].neechaBhanga ? ' with cancellation' : '');
    const chartWord = c.timeKnown ? '' : ' (from your Moon chart)';

    // ---- house and area strength ----
    function houseScore(h) {
      let s = 50 + (sav[h] - 28) * 2.2;
      const L = c.lordOf(h), x = p[L];
      s += DIGNITY_PTS[x.dignity] * 0.9 + (x.neechaBhanga ? 12 : 0);
      if (KENDRA.includes(x.house) || TRIKONA.includes(x.house)) s += 7;
      else if (x.house === 2 || x.house === 11) s += 5;
      else if (x.house === 3) s += 2;
      else if (DUSTHANA.includes(x.house)) s += DUSTHANA.includes(h) ? 3 : -5;
      for (const n of c.occupants(h)) {
        if (n === 'Jupiter') s += 8;
        else if (c.isBenefic(n)) s += 6;
        else s += J.UPACHAYA.includes(h) ? 4 : -3;
      }
      if (c.aspects('Jupiter').includes(h) && p.Jupiter.house !== h) s += 6;
      if (x.vargottama) s += 3;
      if (x.combust) s -= 4;
      return clamp(s, 0, 100);
    }
    const H = [0]; for (let h = 1; h <= 12; h++) H.push(houseScore(h));
    const st = (n) => p[n].strength - 50;
    const yogaCount = (kind) => c.yogas.filter((y) => y.kind === kind && y.strength !== 'mild').length;
    const disp = (s) => Math.round(58 + clamp(s, 0, 100) * 0.38);
    const label = (d) => d >= 88 ? 'Exceptional' : d >= 81 ? 'Very strong' : d >= 74 ? 'Strong' : 'Steady';
    const raw = {
      wealth: (H[2] + H[11]) / 2 + st('Jupiter') * 0.1 + yogaCount('wealth') * 3,
      career: H[10] + st(c.lordOf(10)) * 0.15 + yogaCount('power') * 2,
      business: H[7] * 0.4 + H[10] * 0.3 + H[3] * 0.3 + st('Mercury') * 0.15 + (H[11] - 50) * 0.1,
      fame: H[10] * 0.5 + H[11] * 0.2 + H[1] * 0.3 + st('Sun') * 0.1 + yogaCount('fame') * 3,
      love: H[7] * 0.5 + H[5] * 0.3 + st('Venus') * 0.2 + 10,
      luck: H[9] + st('Jupiter') * 0.2,
      health: H[1] + st(c.lordOf(1)) * 0.2 + st('Sun') * 0.1,
      learning: H[5] * 0.5 + H[4] * 0.3 + st('Mercury') * 0.15 + st('Jupiter') * 0.1 + yogaCount('mind') * 2 + 10,
    };
    const AREA_META = {
      wealth: ['Wealth', `2nd house ${sav[2]} and 11th house ${sav[11]} bindus`],
      career: ['Career', `10th lord ${c.lordOf(10)} ${digw(c.lordOf(10))}`],
      business: ['Business', `7th, 10th and 3rd houses with Mercury`],
      fame: ['Fame', `10th house ${sav[10]} bindus, Sun in house ${p.Sun.house}`],
      love: ['Love', `7th house ${sav[7]} bindus, Venus ${DIG_WORD[p.Venus.dignity]}`],
      luck: ['Luck', `9th lord ${c.lordOf(9)} ${digw(c.lordOf(9))}`],
      health: ['Health', `lagna ${sav[1]} bindus, lagna lord ${c.lordOf(1)}`],
      learning: ['Learning', `4th and 5th houses with Mercury and Jupiter`],
    };
    const areas = Object.keys(raw).map((k) => { const d = disp(raw[k]); return { key: k, name: AREA_META[k][0], score: d, label: label(d), basis: AREA_META[k][1] }; });
    const A = Object.fromEntries(areas.map((a) => [a.key, a]));

    // ---- dasha periods ----
    function ownsOf(L) { return (L === 'Rahu' || L === 'Ketu') ? c.housesOwned(SIGN_LORD[p[L].sign]) : c.housesOwned(L); }
    function periodScore(L) {
      const x = p[L], owns = ownsOf(L);
      const W = { 1: 3, 2: 3, 3: 0, 4: 1, 5: 3, 6: -1, 7: 1, 8: -1, 9: 3, 10: 3, 11: 3, 12: -1 };
      let s = owns.reduce((a, h) => a + W[h], 0);
      if (owns.some((h) => [4, 7, 10].includes(h)) && owns.some((h) => [5, 9].includes(h))) s += 3;
      s += [1, 4, 7, 10, 5, 9].includes(x.house) ? 2 : [2, 11].includes(x.house) ? 3 : x.house === 3 ? 1 : -2;
      s += DIGNITY_PTS[x.dignity] / 4 + (x.neechaBhanga ? 4 : 0) + (x.vargottama ? 1 : 0);
      if (c.yogas.some((y) => y.planets.includes(L) && y.strength === 'strong' && y.kind !== 'mind')) s += 2;
      if (['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(L)) s += 1;
      return s;
    }
    const tier = (s) => s >= 9 ? 'Golden' : s >= 5 ? 'Rising' : s >= 1 ? 'Growth' : 'Foundation';
    const TIER_TEXT = { Golden: 'Golden period', Rising: 'Rising period', Growth: 'Growth period', Foundation: 'Foundation period' };
    function periodTheme(L) {
      const owns = ownsOf(L);
      const areasOwned = owns.map((h) => HOUSES[h].area.split(',')[0]).join(' and ');
      return `${PL[L].theme[0].toUpperCase() + PL[L].theme.slice(1)}. ${L === 'Rahu' || L === 'Ketu' ? 'Acting for ' + SIGN_LORD[p[L].sign] + ', it' : 'It'} rules your ${owns.map(ord).join(' and ')} house${owns.length > 1 ? 's' : ''} (${areasOwned}) and plays out through your ${ord(p[L].house)} house of ${HOUSES[p[L].house].area}.`;
    }
    const timeline = c.dasha.list.filter((d) => d.end > birth && d.start < birth + 92 * YEAR).map((d) => {
      const s = periodScore(d.lord);
      return {
        lord: d.lord, start: Math.max(d.start, birth), end: d.end, startAge: Math.max(0, ageAt(d.start)), endAge: ageAt(d.end),
        score: s, tier: tier(s), theme: periodTheme(d.lord), current: now >= d.start && now < d.end,
        sub: d.sub.map((a) => { const sc = s * 0.4 + periodScore(a.lord); return { lord: a.lord, start: a.start, end: a.end, tier: tier(sc), current: now >= a.start && now < a.end }; }),
      };
    });
    const cur = J.dashaAt(c, now);
    const curMD = timeline.find((t) => t.current);
    const curAD = curMD && curMD.sub.find((a) => a.current);
    const nextADs = curMD ? curMD.sub.filter((a) => a.start > now).slice(0, 2) : [];
    const upcoming = timeline.filter((t) => t.end > now);
    const best = upcoming.filter((t) => !t.current).find((t) => t.tier === 'Golden') || upcoming.slice().sort((a, b) => b.score - a.score)[0];

    // ---- transits ----
    const tNow = J.positionsAt(now);
    const fromMoon = (sign) => houseFrom(sign, p.Moon.sign);
    const fromLagna = (sign) => houseFrom(sign, c.lagnaSign);
    const sadeList = J.sadeSati(c, birth - 3 * YEAR, birth + 90 * YEAR).filter((s) => s.end > birth);
    const satRel = fromMoon(tNow.Saturn.sign);
    const sadeNow = sadeList.find((s) => now >= s.start && now <= s.end + 20 * DAY);
    const sadeNext = sadeList.find((s) => s.start > now);
    const jupNowMoon = fromMoon(tNow.Jupiter.sign);
    const JUP_GOOD = [2, 5, 7, 9, 11];
    const jupiterPath = J.signIngresses('Jupiter', now, now + 3.2 * YEAR, 4).map((seg) => ({
      ...seg, fromMoon: fromMoon(seg.sign), fromLagna: fromLagna(seg.sign), good: JUP_GOOD.includes(fromMoon(seg.sign)),
    }));

    // ---- helpers for answers ----
    const strongestPlanets = PLANETS.slice().sort((a, b) => p[b].strength - p[a].strength);
    const top3 = strongestPlanets.slice(0, 3);
    const yogasOf = (kinds) => c.yogas.filter((y) => kinds.includes(y.kind));
    const periodLine = (t) => `${t.lord} Mahadasha, ${fmtY(t.start)} to ${fmtY(t.end)} (age ${t.startAge} to ${t.endAge})`;
    const Q = [];
    const add = (group, id, q, a) => Q.push({ group, id, q, ...a });

    // ===== Next 8 months (transits from the Moon, the classical gochara rules, plus running sub-periods) =====
    const GOOD_FROM_MOON = { Sun: [3, 6, 10, 11], Mars: [3, 6, 11], Mercury: [2, 4, 6, 8, 10, 11], Jupiter: [2, 5, 7, 9, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], Saturn: [3, 6, 11], Rahu: [3, 6, 11] };
    const TW = { Jupiter: 3, Saturn: 2.5, Mars: 1.5, Venus: 1.2, Rahu: 1.2, Sun: 1, Mercury: 1 };
    const subSub = (ad) => {
      const out = []; let s = ad.start; const len = ad.end - ad.start; const i0 = J.DASHA_ORDER.indexOf(ad.lord);
      for (let j = 0; j < 9; j++) { const l = J.DASHA_ORDER[(i0 + j) % 9]; const d = (len * J.DASHA_YEARS[l]) / 120; out.push({ lord: l, start: s, end: s + d }); s += d; }
      return out;
    };
    const VERB = { Jupiter: 'Jupiter brings growth to', Saturn: 'Saturn rewards steady work in', Venus: 'Venus brings charm and money to', Mars: 'Mars fires up', Sun: 'The Sun spotlights', Mercury: 'Mercury helps deals in', Rahu: 'Rahu pushes fast growth in' };
    const FOCUS = [null, 'Personal brand', 'Money', 'Content and sales', 'Home', 'Creativity and love', 'Work and health', 'Partners and clients', 'Deep work', 'Learning and travel', 'Career', 'Income and network', 'Global reach and recharge'];
    const AREA = [null, 'personal image', 'savings', 'content and sales', 'home life', 'creativity and romance', 'daily work and health', 'partnerships and clients', 'research and deep work', 'luck and learning', 'career', 'income and network', 'foreign links and inner peace'];
    const owns = (n, hs) => ownsOf(n).some((h) => hs.includes(h));
    const d0 = new Date(now);
    const startK = d0.getUTCDate() > 20 ? 1 : 0;
    const months = [];
    for (let k = startK; k < startK + 8; k++) {
      const mid = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + k, 15, 6);
      const mStart = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + k, 1), mEnd = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + k + 1, 1);
      const pos = J.positionsAt(mid);
      const da = J.dashaAt(c, mid);
      const pd = subSub(da.ad).find((x) => mid >= x.start && mid < x.end);
      const hm = (n) => fromMoon(pos[n].sign), hl = (n) => fromLagna(pos[n].sign);
      let score = 0; const goods = [];
      for (const n of Object.keys(TW)) {
        const g = GOOD_FROM_MOON[n].includes(hm(n));
        score += g ? TW[n] : -TW[n] * 0.4;
        if (g) goods.push({ n, w: TW[n], h: hl(n) });
      }
      score += (periodScore(da.ad.lord) + periodScore(pd.lord)) * 0.15;
      goods.sort((a, b) => b.w - a.w);
      // money
      let money = 0; const mWhy = [];
      if ([2, 11].includes(hm('Jupiter')) || [2, 11].includes(hl('Jupiter'))) { money += 3; mWhy.push('Jupiter in a money house'); } else if (GOOD_FROM_MOON.Jupiter.includes(hm('Jupiter'))) money += 1;
      for (const n of ['Venus', 'Mercury', 'Sun']) if ([2, 10, 11].includes(hl(n))) { money += n === 'Venus' ? 1.5 : 1; mWhy.push(`${n} in your ${ord(hl(n))} house`); }
      if ([3, 6, 11].includes(hm('Saturn'))) { money += 1.5; mWhy.push('Saturn in a good position'); }
      if ([3, 6, 11].includes(hm('Mars'))) { money += 1; mWhy.push('Mars in a good position'); }
      if (owns(pd.lord, [2, 9, 10, 11]) || [2, 10, 11].includes(p[pd.lord].house)) { money += 1.5; mWhy.push(`${pd.lord} mini-period`); }
      // love
      let love = 0; const lWhy = [];
      for (const [ref, nm] of [[c.lagnaSign, 'rising sign'], [p.Moon.sign, 'Moon']]) if ([1, 5, 7, 11].includes(houseFrom(pos.Venus.sign, ref))) { love += 1.5; lWhy.push(`Venus in your ${ord(houseFrom(pos.Venus.sign, ref))} from your ${nm}`); }
      const jl = hl('Jupiter');
      if ([5, 7].includes(jl) || [5, 7, 9].map((k2) => ((jl + k2 - 2) % 12) + 1).some((h) => h === 5 || h === 7)) { love += 1.5; lWhy.push('Jupiter blessing your love or partner house'); }
      if ([5, 7].includes(hl('Mars'))) { love += 1; lWhy.push('Mars adding attraction'); }
      if (['Venus', c.lordOf(7), c.lordOf(5), 'Moon', 'Rahu'].includes(pd.lord)) { love += 1.5; lWhy.push(`${pd.lord} mini-period`); }
      if (['Venus', c.lordOf(7), c.lordOf(5)].includes(da.ad.lord)) love += 1;
      // business and career
      let biz = 0; const bWhy = [];
      for (const n of ['Jupiter', 'Saturn', 'Mars', 'Sun', 'Mercury']) if ([10, 11, 7, 3].includes(hl(n)) && (GOOD_FROM_MOON[n].includes(hm(n)) || n === 'Jupiter')) { biz += TW[n] * 0.8; bWhy.push(`${n} in your ${ord(hl(n))} house`); }
      if (owns(pd.lord, [1, 7, 10, 11])) { biz += 1.5; bWhy.push(`${pd.lord} mini-period`); }
      // travel
      let travel = 0;
      for (const n of ['Jupiter', 'Rahu', 'Saturn', 'Mars', 'Venus']) if ([9, 12, 3].includes(hl(n))) travel += n === 'Jupiter' || n === 'Rahu' ? 1.5 : 0.7;
      if (['Rahu', 'Ketu', c.lordOf(12), c.lordOf(9)].includes(pd.lord)) travel += 1;
      const best = goods[0];
      const head = best ? `${VERB[best.n]} your ${AREA[best.h]}` : `${pd.lord} mini-period: ${PL[pd.lord].theme.split(',')[0]}`;
      const events = [];
      if (da.ad.start >= mStart && da.ad.start < mEnd) events.push(`New sub-period begins: ${da.ad.lord}, ${PL[da.ad.lord].theme}`);
      for (const n of ['Jupiter', 'Saturn', 'Rahu']) {
        const a = J.signOf(J.sidereal(n, mStart)), b = J.signOf(J.sidereal(n, mEnd));
        if (a !== b) events.push(`${n} moves into your ${ord(fromLagna(b))} house (${AREA[fromLagna(b)]})`);
      }
      months.push({ mid, label: fmtMY(mid), score, money, love, biz, travel, mWhy, lWhy, bWhy, head, focus: best ? FOCUS[best.h] : FOCUS[p[pd.lord].house], ad: da.ad.lord, pd: pd.lord, events, goods });
    }
    for (const m of months) m.overall = m.score + ((m.money + m.love + m.biz) / 3) * 1.2;
    const rankBy = (key) => months.slice().sort((a, b) => b[key] - a[key]);
    const ranked = rankBy('overall');
    ranked.forEach((m, i) => { m.rating = i < 2 ? 'Best' : i < 5 ? 'Strong' : 'Steady'; });
    const topOf = (key, n) => rankBy(key).slice(0, n).sort((a, b) => a.mid - b.mid);
    const mlist = (arr) => list(arr.map((m) => m.label));
    {
      const first = months[0], last = months[months.length - 1];
      const bestTwo = ranked.slice(0, 2).sort((a, b) => a.mid - b.mid);
      const subs = [...new Set(months.map((m) => m.ad))];
      add('soon', 'next8', 'How will my next 8 months look?', {
        verdict: `Best months: ${mlist(bestTwo)}`, tone: 'great',
        body: [
          `From ${first.label} to ${last.label} you run the ${list(subs)} sub-period${subs.length > 1 ? 's' : ''} inside your ${curMD ? curMD.lord : ''} period. ${subs.map((s) => `${s} brings ${PL[s].theme}`).join('. ')}.`,
          `Your two strongest months are ${mlist(bestTwo)}. That is when the slow planets (Jupiter and Saturn) and the fast ones line up best from your Moon.`,
          ...months.flatMap((m) => m.events.map((e) => `${m.label}: ${e}.`)),
          'Month by month:',
        ],
        factors: ['Planet positions computed for the middle of each month', 'Good and bad transit houses counted from your birth Moon, the classic method', 'Your running sub-period and mini-period for each month'],
        timing: months.map((m) => ({ label: `${m.label} · ${m.rating}`, range: m.head })),
      });
    }
    {
      const top = topOf('money', 3);
      const avg = months.reduce((a, m) => a + m.money, 0) / months.length;
      add('soon', 'money8', 'Will I make good money in the next 8 months?', {
        verdict: `Yes, peaking in ${mlist(top.slice(0, 2))}`, tone: 'great',
        body: [
          avg >= 3 ? 'Yes. The next 8 months carry strong money signals in your chart.' : 'Yes, with clear peaks. Money comes in waves over these months, so time your big pushes for the peak months.',
          `Your best money months are ${mlist(top)}. ${top.map((m) => `${m.label}: ${list(m.mWhy.slice(0, 2)) || 'steady support'}`).join('. ')}.`,
          `Your main money channel is still ${HOUSES[p[c.lordOf(11)].house].channel} and ${HOUSES[p[c.lordOf(2)].house].channel}. Pitch, close deals and send invoices in the peak months.`,
        ],
        factors: ['Jupiter, Venus, Mercury and the Sun in your money houses (2nd, 10th, 11th)', 'Saturn and Mars in good positions from your Moon', 'Mini-period rulers linked to your money houses'],
        timing: top.map((m) => ({ label: m.label, range: list(m.mWhy.slice(0, 3)) || 'steady' })),
      });
    }
    {
      const top = topOf('love', 3);
      add('soon', 'partner8', 'When will I meet my next partner?', {
        verdict: `Best chances: ${mlist(top.slice(0, 2))}`, tone: 'great',
        body: [
          `Romance in a birth chart switches on when Venus moves through your 1st, 5th, 7th or 11th house, when Jupiter blesses your love or partner house, and during the mini-periods of Venus and your love-house rulers.`,
          `In the next 8 months that lines up best in ${mlist(top)}. ${top.map((m) => `${m.label}: ${list(m.lWhy.slice(0, 2)) || 'good social energy'}`).join('. ')}.`,
          `You are most likely to meet someone through ${HOUSES[7].area.includes('clients') ? 'work, clients and collaborations' : 'friends'} or your wider network, since your partner house is tied to the same planets as your work.`,
          'For long-term commitment and marriage, see the Love tab. This answer is about meeting someone in the coming months.',
        ],
        factors: [`Your partner house is ${sg(c.signOfHouse(7))}, ruled by ${c.lordOf(7)}`, `Your love house is ${sg(c.signOfHouse(5))}, ruled by ${c.lordOf(5)}`, 'Venus transit checked from both your rising sign and your Moon'],
        timing: top.map((m) => ({ label: m.label, range: list(m.lWhy.slice(0, 3)) || 'good social energy' })),
      });
      const soon = months.slice(0, 3).some((m) => top.slice(0, 2).includes(m));
      const firstTop = top.slice().sort((a, b) => a.mid - b.mid)[0];
      add('soon', 'look8', 'Should I actively look for love right now, or wait?', {
        verdict: soon ? `Look now, best in ${firstTop.label}` : `Focus on work, open up from ${firstTop.label}`, tone: 'good',
        body: [
          soon ? `Look. One of your best love months, ${firstTop.label}, is right around the corner, so say yes to plans, events and new people.` : `You do not need to chase it right now. Your love signals peak from ${firstTop.label}, so put your energy into work and yourself until then, and be open when that window arrives.`,
          `The quieter months for romance are ${mlist(rankBy('love').slice(-2).sort((a, b) => a.mid - b.mid))}. Use them for friendships and your own goals.`,
        ],
        factors: top.map((m) => `${m.label}: ${list(m.lWhy.slice(0, 2)) || 'support'}`),
      });
    }
    {
      const top = topOf('biz', 3);
      add('soon', 'biz8', 'Will my business grow in the next 8 months?', {
        verdict: `Yes, strongest in ${mlist(top.slice(0, 2))}`, tone: 'great',
        body: [
          `Yes. Business moves fastest when Jupiter, Saturn, Mars, Mercury or the Sun pass through your 3rd (effort), 7th (clients), 10th (career) or 11th (income) house in a good position from your Moon.`,
          `Your strongest business months: ${mlist(top)}. ${top.map((m) => `${m.label}: ${list(m.bWhy.slice(0, 2)) || 'steady support'}`).join('. ')}.`,
          'Launch, sign or announce in those months. The launch-dates section below gives exact days.',
        ],
        factors: ['Transits through your 3rd, 7th, 10th and 11th houses', 'Mini-period rulers linked to your 1st, 7th, 10th and 11th houses'],
        timing: top.map((m) => ({ label: m.label, range: list(m.bWhy.slice(0, 3)) || 'steady support' })),
      });
    }
    {
      const ev = months.flatMap((m) => m.events.map((e) => ({ m, e })));
      const jup = months.slice().sort((a, b) => (b.goods.some((g) => g.n === 'Jupiter') - a.goods.some((g) => g.n === 'Jupiter')) || b.score - a.score)[0];
      add('soon', 'opp8', 'Will a big opportunity come soon?', {
        verdict: `Yes, watch ${jup.label}`, tone: 'great',
        body: [
          `Big opportunities follow Jupiter. ${jup.goods.some((g) => g.n === 'Jupiter') ? `In ${jup.label} Jupiter sits in a lucky position from your Moon and brings growth to your ${AREA[jup.goods.find((g) => g.n === 'Jupiter').h]}.` : `${jup.label} is your strongest month overall.`}`,
          ev.length ? `Turning points in this window: ${ev.map((x) => `${x.m.label}: ${x.e}`).join('; ')}.` : 'No slow planet changes sign in this window, so opportunities build steadily rather than arriving all at once.',
          sadeNow && satRel === 2 ? `Saturn's 7.5-year phase is also wrapping up (around ${fmtMY(sadeNow.end)}), which takes pressure off and frees energy for bigger moves.` : '',
        ].filter(Boolean),
        factors: ['Jupiter position from your Moon each month', 'Sign changes of Jupiter, Saturn and Rahu in the window'],
      });
    }
    {
      const peaks = new Set(['money', 'love', 'biz'].flatMap((k) => rankBy(k).slice(0, 2)));
      const low = (ranked.filter((m) => !peaks.has(m)).slice(-2).length === 2 ? ranked.filter((m) => !peaks.has(m)).slice(-2) : ranked.slice(-2)).sort((a, b) => a.mid - b.mid);
      add('soon', 'slow8', 'Which months should I take it slow?', {
        verdict: mlist(low), tone: 'steady',
        body: [
          `${mlist(low)} are your quieter months overall. Fewer planets sit in lucky positions for you, so results take more effort.`,
          'Use them to plan, build systems, rest and fix what is not working. Push launches and big asks into your best months instead.',
        ],
        factors: low.map((m) => `${m.label}: ${m.goods.length} of 7 planets in lucky positions from your Moon`),
      });
    }
    {
      const top = topOf('travel', 2);
      add('soon', 'travel8', 'Will I travel in the next 8 months?', {
        verdict: top[0].travel >= 2 ? `Likely, around ${mlist(top)}` : 'Short trips, nothing major', tone: 'good',
        body: [
          top[0].travel >= 2 ? `Yes. Travel opens up in ${mlist(top)}, when planets pass through your travel houses (3rd for short trips, 9th for long journeys, 12th for abroad).` : 'Your travel houses stay fairly quiet in this window, so expect short trips rather than a big journey.',
        ],
        factors: ['Jupiter, Rahu, Saturn, Mars and Venus in your 3rd, 9th and 12th houses', 'Mini-periods of travel planets'],
      });
    }
    {
      const m = months[0];
      add('soon', 'focus8', `What should I focus on in ${m.label}?`, {
        verdict: m.focus, tone: 'great',
        body: [
          `${m.head}. Put your main effort into ${m.focus.toLowerCase()} this month.`,
          `You are in the ${m.ad} sub-period and the ${m.pd} mini-period, which favours ${PL[m.pd].theme}.`,
          m.goods.length ? `Planets helping you: ${list(m.goods.map((g) => `${g.n} (your ${ord(g.h)} house)`))}.` : '',
        ].filter(Boolean),
        factors: m.goods.map((g) => `${g.n} in a lucky position from your Moon`),
      });
    }

    // ===== Right now =====
    {
      const md = curMD, ad = curAD;
      const body = [];
      if (md && ad) {
        body.push(`You are running ${md.lord} Mahadasha with ${ad.lord} Antardasha. In Vimshottari terms, ${md.lord} sets the big theme of these years and ${ad.lord} sets the flavour of right now.`);
        body.push(`${md.lord} (until ${fmtMY(md.end)}): ${md.theme}`);
        body.push(`${ad.lord} sub-period (until ${fmtMY(ad.end)}): ${PL[ad.lord].theme}. ${ad.lord} sits in your ${ord(p[ad.lord].house)} house of ${HOUSES[p[ad.lord].house].area}, so that is where things move fastest right now.`);
        if (nextADs.length) body.push(`Next: ${nextADs.map((a) => `${a.lord} from ${fmtMY(a.start)} (${a.tier.toLowerCase()})`).join(', then ')}.`);
        const nextMD = upcoming[1];
        if (nextMD) body.push(`The next big chapter is ${nextMD.lord} Mahadasha from ${fmtY(nextMD.start)}, rated a ${TIER_TEXT[nextMD.tier].toLowerCase()} in your chart.`);
      }
      add('now', 'phase', 'What phase of life am I in right now?', {
        verdict: md ? `${md.lord} chapter, ${ad.lord} season` : 'Fresh start', tone: md && md.tier === 'Golden' ? 'great' : 'good', body,
        factors: [`Moon in ${NAKS[p.Moon.nak].en} nakshatra starts your Vimshottari sequence with ${c.dasha.startLord}`, `Jupiter now transits your ${ord(jupNowMoon)} house from the Moon${JUP_GOOD.includes(jupNowMoon) ? ', a favourable position' : ''}`, `Saturn now transits your ${ord(satRel)} house from the Moon`],
      });
    }
    {
      const phase = satRel === 12 ? 'rising phase (Saturn in the 12th from your Moon)' : satRel === 1 ? 'peak phase (Saturn over your Moon)' : satRel === 2 ? 'final, setting phase (Saturn in the 2nd from your Moon)' : null;
      const body = [];
      if (sadeNow && phase) {
        body.push(`Yes. You are in the ${phase}. It started around ${fmtMY(sadeNow.start)} and wraps up around ${fmtMY(sadeNow.end)}.`);
        body.push(satRel === 2 ? 'This is the lightest of the three phases, and most of the pressure is already behind you. Saturn rewards what you have built through discipline during these years, so expect the effort you put in to start paying off as it ends.' : 'Sade Sati is Saturn teaching structure. People who work hard and stay honest during it often build the foundation of their whole career in these years.');
      } else {
        body.push(`No. Saturn is in your ${ord(satRel)} house from the Moon, so Sade Sati is not running.`);
        if ([3, 6, 11].includes(satRel)) body.push('Even better, this is one of the three positions where Saturn transit is classically favourable: steady gains and wins over competition.');
      }
      if (sadeNext) body.push(`Your next Sade Sati begins around ${fmtMY(sadeNext.start)} (age ${ageAt(sadeNext.start)}).`);
      const past = sadeList.filter((s) => s.end < now);
      add('now', 'sadesati', "Am I in Saturn's tough 7.5-year phase?", {
        verdict: sadeNow ? (satRel === 2 ? 'Yes, in its last phase' : 'Yes') : 'No', tone: sadeNow ? 'steady' : 'great', body,
        factors: [`Natal Moon in ${sg(p.Moon.sign)}`, `Transit Saturn in ${sg(tNow.Saturn.sign)} today`, 'The phase runs while Saturn crosses the sign before, on and after your Moon sign'],
        timing: sadeList.slice(0, 4).map((s) => ({ label: s.end < now ? 'Completed' : s.start > now ? 'Upcoming' : 'Running', range: `${fmtMY(s.start)} to ${fmtMY(s.end)}` })),
      });
    }
    {
      const s = curMD ? curMD.score * 0.4 + periodScore(curAD.lord) : 5;
      const good = [];
      if (curAD) good.push(`${curAD.lord} Antardasha favours ${PL[curAD.lord].theme}.`);
      if (JUP_GOOD.includes(jupNowMoon)) good.push(`Jupiter is transiting your ${ord(jupNowMoon)} from the Moon, one of its five favourable houses.`);
      if (sadeNow && satRel === 2) good.push(`Sade Sati is in its final phase, so pressure is lifting.`);
      if (!sadeNow) good.push('Saturn is not pressing on your Moon.');
      const nextGoodJ = jupiterPath.find((j) => j.good && j.start > now);
      const body = [
        `Yes. A business started in a ${curMD ? curMD.lord : ''} period grows the way that planet works: ${curMD ? PL[curMD.lord].theme : ''}. ${curMD && curMD.lord === 'Saturn' ? 'Saturn rewards founders who build systems early and keep going, so treat these years as the foundation phase of something that compounds.' : 'Use that energy deliberately.'}`,
        good.join(' '),
      ];
      if (nextGoodJ && !JUP_GOOD.includes(jupNowMoon)) body.push(`Jupiter moves into a favourable house from your Moon around ${fmtMY(nextGoodJ.start)}. That is a strong window for launches, fundraising or big client wins.`);
      if (best && best.start > now) body.push(`Your next golden chapter, ${best.lord} Mahadasha, begins in ${fmtY(best.start)} (age ${best.startAge}). Starting now means the business is already mature when that period arrives.`);
      add('now', 'startnow', 'Is now a good time to start my business?', {
        verdict: s >= 5 ? 'Yes, strongly supported' : 'Yes, as a foundation-building phase', tone: s >= 5 ? 'great' : 'good', body,
        factors: [`Current period: ${curMD ? curMD.lord + ' / ' + curAD.lord : 'n/a'}`, `Jupiter transit: ${ord(jupNowMoon)} from Moon`, `Saturn transit: ${ord(satRel)} from Moon`],
      });
    }

    // ===== Money & business =====
    {
      const d = A.wealth.score;
      const L2 = c.lordOf(2), L11 = c.lordOf(11);
      const body = [
        `Jyotish doesn't print rupee figures. It reads capacity (your 2nd and 11th houses), channels (where their lords sit) and timing (your dashas). On those three, your wealth potential reads ${A.wealth.label.toLowerCase()}, ${d}/100.`,
        sav[11] >= sav[12]
          ? `Your 11th house of gains has ${sav[11]} bindus against ${sav[12]} in your 12th house of expenses. When gains beat expenses in Ashtakavarga, classical texts say income outruns spending and money accumulates.`
          : `Your 12th house carries ${sav[12]} bindus against ${sav[11]} in the 11th, so money moves fast through your hands. Park it in assets (equity, property, your own company) and it compounds instead of circulating.`,
        `Your 2nd lord ${pdesc(L2)} and your 11th lord ${pdesc(L11)}.`,
      ];
      const wy = yogasOf(['wealth']);
      if (wy.length) body.push(`Wealth yogas in your chart: ${list([...new Set(wy.map((y) => y.name))])}.`);
      const peaks = upcoming.filter((t) => t.tier === 'Golden' || t.tier === 'Rising').slice(0, 2);
      if (peaks.length) body.push(`Peak money periods: ${peaks.map(periodLine).join('; ')}.`);
      add('money', 'howmuch', 'How much money will I make?', {
        verdict: `${A.wealth.label} wealth potential`, tone: d >= 81 ? 'great' : 'good', body, score: d,
        factors: [`2nd house: ${sav[2]} bindus (28 is average)`, `11th house: ${sav[11]} bindus`, `12th house: ${sav[12]} bindus`, `Jupiter, karaka of wealth, ${DIG_WORD[p.Jupiter.dignity]} in house ${p.Jupiter.house}`],
      });
    }
    {
      const L2 = c.lordOf(2), L11 = c.lordOf(11), L10 = c.lordOf(10);
      const chans = [];
      const pushC = (h, why) => { if (!chans.some((x) => x.h === h)) chans.push({ h, why: [why] }); else chans.find((x) => x.h === h).why.push(why); };
      pushC(p[L11].house, `11th lord ${L11} sits here`);
      pushC(p[L2].house, `2nd lord ${L2} sits here`);
      pushC(p[L10].house, `10th lord ${L10} sits here`);
      for (const n of c.occupants(11)) pushC(11, `${n} occupies the 11th`);
      for (const n of c.occupants(2)) pushC(2, `${n} occupies the 2nd`);
      chans.sort((a, b) => b.why.length - a.why.length);
      const main = chans[0];
      const body = [
        `Your strongest money channel is ${HOUSES[main.h].channel}. ${main.why.join(' and ')}, so this area pulls in income more than any other.`,
        chans.length > 1 ? `Secondary channels: ${list(chans.slice(1, 3).map((x) => HOUSES[x.h].channel))}.` : '',
        `Your Amatyakaraka, the Jaimini planet of profession, is ${c.karakas.amatya}. It points to money through ${list(PL[c.karakas.amatya].fields.slice(0, 3))}.`,
      ].filter(Boolean);
      add('money', 'source', 'Where will my money come from?', {
        verdict: HOUSES[main.h].channel.split(',')[0].replace(/^your /, '').replace(/^\w/, (m) => m.toUpperCase()), tone: 'great', body,
        factors: chans.slice(0, 3).map((x) => `House ${x.h}: ${x.why.join(', ')}`),
      });
    }
    {
      const L10 = c.lordOf(10), L1 = c.lordOf(1);
      const biz = [], job = [];
      if ([1, 3, 7, 11].includes(p[L10].house)) biz.push(`10th lord ${L10} in your ${ord(p[L10].house)} house ties career to ${p[L10].house === 7 ? 'clients and trade' : p[L10].house === 1 ? 'your own name' : p[L10].house === 3 ? 'self-effort and media' : 'gains and networks'}`);
      if ([6, 10].includes(p[L10].house)) job.push(`10th lord ${L10} in house ${p[L10].house} favours structured roles`);
      if (c.occupants(7).some((n) => c.isBenefic(n) || ['exalted', 'own', 'moolatrikona'].includes(p[n].dignity))) biz.push(`strong planets in your 7th house of trade (${c.occupants(7).join(', ')})`);
      if (sav[3] >= 28) biz.push(`3rd house of initiative has ${sav[3]} bindus`);
      if (sav[11] >= 30) biz.push(`11th house of gains has ${sav[11]} bindus`);
      if (p.Mars.digBala || p.Mars.strength >= 65) biz.push('Mars strong for drive and risk-taking' + (p.Mars.digBala ? ' (directional strength in the 10th)' : ''));
      if (p.Mercury.strength >= 60) biz.push('Mercury, planet of trade, well supported');
      if ([3, 6, 10, 11].includes(p.Rahu.house)) biz.push(`Rahu in the ${ord(p.Rahu.house)}, an upachaya house where it grows ambition and beats competition`);
      if (KENDRA.includes(p[L1].house)) biz.push(`lagna lord ${L1} in a kendra gives a self-driven nature`);
      if (sav[6] >= 30) job.push(`6th house of service has ${sav[6]} bindus`);
      if (p.Sun.house === 10) job.push('Sun in the 10th supports authority roles and government');
      if (p.Saturn.house === 10 || p.Saturn.house === 6) job.push('Saturn in house ' + p.Saturn.house + ' supports long tenure in large organisations');
      const diff = biz.length - job.length;
      const verdict = diff >= 3 ? 'Built for business' : diff >= 1 ? 'Business, with strong structure' : diff === 0 ? 'Both work: build inside, then go out' : 'A leadership role, then your own venture';
      add('money', 'bizjob', 'Is business or a job better for me?', {
        verdict, tone: diff >= 1 ? 'great' : 'good',
        body: [
          diff >= 1 ? 'Your chart leans clearly toward running your own business.' : 'Your chart supports both paths. Many charts like yours do best by learning inside a strong organisation and then building their own venture.',
          biz.length ? `What points to business: ${list(biz)}.` : '',
          job.length ? `What supports structured roles: ${list(job)}. Use this side by building strong systems and a reliable team inside your business.` : 'Very little in your chart pulls toward a salaried path.',
        ].filter(Boolean),
        factors: biz.concat(job).slice(0, 6),
      });
    }
    {
      const d = Math.round((A.business.score + A.wealth.score + A.career.score) / 3 + Math.min(4, yogaCount('power')));
      const edges = top3.map((n) => `${n}: ${PL[n].edge}`);
      const support = (h) => sav[h] >= 28 ? `${sav[h]} bindus` : c.occupants(h).length ? `${list(c.occupants(h))} there` : `its lord ${c.lordOf(h)} ${digw(c.lordOf(h))}`;
      const watch = (() => {
        if (c.occupants(12).length) return `Your 12th house holds ${list(c.occupants(12))}, so spending, overseas costs and rest need deliberate limits. Keep a tight budget and protect your sleep.`;
        if (c.occupants(6).includes('Moon')) return 'Moon in the 6th means you take work stress personally. Build routines that let you switch off.';
        if (sav[12] > sav[11]) return 'Money flows out as quickly as it comes in. Automate savings from day one.';
        return 'Your chart has no major warning signs here. Keep reinvesting rather than spending early profits.';
      })();
      add('money', 'succeed', 'Will my new business succeed?', {
        verdict: `${label(clamp(d, 0, 100))} success signature`, tone: 'great', score: clamp(d, 0, 96),
        body: [
          `Your business success signature reads ${label(d).toLowerCase()} (${clamp(d, 0, 96)}/100), combining your trade, wealth and career houses with the raja yogas in your chart.`,
          `Your three strongest planets are your edge. ${edges.join(' ')}`,
          `What makes it work: partners and clients through your 7th house (${support(7)}), execution through your 10th (${support(10)}) and scale through your 11th (${support(11)}).`,
          `Keep an eye on: ${watch}`,
        ],
        factors: [`Strongest planets: ${top3.map((n) => `${n} (${p[n].strength})`).join(', ')}`].concat(yogasOf(['power', 'wealth']).slice(0, 4).map((y) => y.name + ': ' + y.planets.join(' + '))),
      });
    }
    {
      const L7 = c.lordOf(7), occ = c.occupants(7);
      const traits = [`${SIGNS[c.signOfHouse(7)].spouse} people (your 7th house is ${sg(c.signOfHouse(7))})`];
      for (const n of occ) traits.push({ Sun: 'people with authority and strong personalities', Moon: 'emotionally intelligent, public-facing people', Mars: 'driven, fast-moving operators', Mercury: 'sharp, numbers-minded business people', Jupiter: 'wise, ethical advisers', Venus: 'creative, well-connected people with taste', Saturn: 'older, disciplined, process-driven people', Rahu: 'unconventional or foreign partners', Ketu: 'quiet technical specialists' }[n]);
      const strong = H[7] >= 60;
      add('money', 'partner', 'Should I take a business partner?', {
        verdict: strong ? 'Yes, partners amplify you' : 'Yes, with clear roles', tone: strong ? 'great' : 'good',
        body: [
          `Your 7th house of partnerships scores ${disp(H[7])}/100 with ${sav[7]} bindus${occ.length ? ` and holds ${list(occ)}` : ''}. Its lord ${pdesc(L7)}.`,
          strong ? 'Partnerships are one of the strongest parts of your chart. The right partner or a small set of anchor clients can multiply your results.' : 'Partnerships work for you when roles, equity and decision rights are written down early.',
          `Best partner profile: ${list(traits)}.`,
          `Pick someone whose strengths cover your quieter houses, and put the agreement on paper.`,
        ],
        factors: [`7th house: ${sg(c.signOfHouse(7))}, ${sav[7]} bindus`, `7th lord ${L7} in house ${p[L7].house}`].concat(occ.map((n) => `${n} in the 7th, ${digw(n)}`)),
      });
    }
    {
      const nk = NAKS[p.Moon.nak];
      const L1 = c.lordOf(1), L9 = c.lordOf(9);
      add('money', 'name', 'What should I name my business?', {
        verdict: `Start with "${nk.syl[p.Moon.pada - 1]}"`, tone: 'good',
        body: [
          `Your birth star is ${nk.en}, quarter ${p.Moon.pada}. Its traditional lucky starting sound is "${nk.syl[p.Moon.pada - 1]}". The full set for your star is ${nk.syl.map((s) => `"${s}"`).join(', ')}.`,
          `Your lagna lord ${L1} carries the number ${PL[L1].num} and your 9th lord of luck ${L9} carries ${PL[L9].num}. Founders often use these numbers as a tie-breaker when two names feel equally good.`,
          `Use this as a filter on names you already like. A name that is clear, easy to say and easy to search will always do more work than the syllable alone.`,
        ],
        factors: [`Moon in ${nk.en}, quarter ${p.Moon.pada}`, `Lagna lord ${L1} = ${PL[L1].num}`, `9th lord ${L9} = ${PL[L9].num}`],
      });
    }

    // ===== Career & fame =====
    {
      const L10 = c.lordOf(10);
      const w = {};
      const bump = (n, k) => { w[n] = (w[n] || 0) + k; };
      bump(L10, 3); for (const n of c.occupants(10)) bump(n, 2); bump(c.karakas.amatya, 2); bump(strongestPlanets[0], 1);
      for (const n of c.aspectedBy(10)) bump(n, 0.5);
      const ranked = Object.keys(w).sort((a, b) => w[b] - w[a]).slice(0, 3);
      const fields = [...new Set(ranked.flatMap((n) => PL[n].fields.slice(0, 2)))];
      add('career', 'career', 'Which career or industry suits me?', {
        verdict: fields.slice(0, 2).map((f) => f.replace(/^\w/, (m) => m.toUpperCase())).join(' / '), tone: 'great',
        body: [
          `Your 10th house of career is ${sg(c.signOfHouse(10))}, ruled by ${L10}. ${c.occupants(10).length ? `${list(c.occupants(10))} ${c.occupants(10).length > 1 ? 'sit' : 'sits'} in it. ` : ''}Your Amatyakaraka is ${c.karakas.amatya}.`,
          `Combining these, the planets running your career are ${list(ranked)}. Fields that fit: ${list(fields)}.`,
          `Your career score is ${A.career.score}/100 (${A.career.label.toLowerCase()}).`,
        ],
        factors: ranked.map((n) => `${n}: ${PL[n].means}`),
      });
    }
    {
      const d = A.fame.score;
      const pts = [];
      if (c.occupants(10).length) pts.push(`${list(c.occupants(10))} in the 10th house of public status`);
      if ([1, 10, 11, 7, 3].includes(p.Rahu.house)) pts.push(`Rahu in the ${ord(p.Rahu.house)} gives mass appeal`);
      if (p.Rahu.house === 6) pts.push('Rahu in the 6th helps you outpace competitors');
      if (['exalted', 'own', 'moolatrikona'].includes(p.Sun.dignity) || [1, 10, 11, 9].includes(p.Sun.house)) pts.push('Sun well placed for recognition');
      if (p.Venus.strength >= 70) pts.push('Venus strong, giving charm and a brand others want to be near');
      for (const y of yogasOf(['fame'])) pts.push(y.name);
      if (sav[3] >= 30) pts.push(`3rd house of media and content has ${sav[3]} bindus`);
      add('career', 'fame', 'Will I become well known?', {
        verdict: `${A.fame.label} public potential`, tone: d >= 81 ? 'great' : 'good', score: d,
        body: [
          `Your fame potential reads ${d}/100. Fame in Jyotish comes from the 10th house (status), the 11th (reach), the lagna (your personal brand) and the Sun.`,
          pts.length ? `Working for you: ${list(pts)}.` : 'Your reputation builds steadily through results rather than hype.',
          `Your Moon is in ${NAKS[p.Moon.nak].en}, giving ${NAKS[p.Moon.nak].gift}. Make that the tone of your public brand.`,
        ],
        factors: [`10th house: ${sav[10]} bindus`, `11th house: ${sav[11]} bindus`, `Lagna: ${sav[1]} bindus`, `Sun in house ${p.Sun.house}`],
      });
    }
    {
      const tops = upcoming.slice().sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.start - b.start);
      add('career', 'bestyears', 'When are my best years?', {
        verdict: best ? `${best.lord} Mahadasha, ${fmtY(Math.max(best.start, now))} to ${fmtY(best.end)}` : 'Ahead of you', tone: 'great',
        body: [
          'Vimshottari dasha divides life into planetary chapters. A chapter is strongest when its planet rules good houses for your lagna, sits in a strong house and forms yogas.',
          ...tops.map((t) => `${periodLine(t)}: ${TIER_TEXT[t.tier].toLowerCase()}. ${t.theme}`),
          'Scroll down to the life timeline to see every period and sub-period.',
        ],
        factors: tops.map((t) => `${t.lord}: period score ${t.score.toFixed(1)}`),
      });
    }

    // ===== Love & marriage =====
    {
      const L7 = c.lordOf(7), L5 = c.lordOf(5);
      const karaka = opts.gender === 'female' ? 'Jupiter' : 'Venus';
      const sig = new Set([L7, 'Venus', karaka, c.karakas.dara, ...c.occupants(7)]);
      const t7 = [c.signOfHouse(7), p[L7].sign];
      const windows = [];
      let curW = null;
      for (let t = birth + 21 * YEAR; t < birth + 36 * YEAR; t += 30 * DAY) {
        const da = J.dashaAt(c, t);
        const rel = (sig.has(da.ad.lord) ? 2 : 0) + (sig.has(da.md.lord) ? 1 : 0);
        const pos = J.positionsAt(t);
        const jOn = t7.some((s) => [1, 5, 7, 9].includes(houseFrom(s, pos.Jupiter.sign)));
        const sOn = t7.some((s) => [1, 3, 7, 10].includes(houseFrom(s, pos.Saturn.sign)));
        const on = rel >= 2 && jOn && sOn;
        if (on && !curW) curW = { start: t, end: t, lords: da.md.lord + ' / ' + da.ad.lord };
        if (on) curW.end = t;
        if (!on && curW) { windows.push(curW); curW = null; }
      }
      if (curW) windows.push(curW);
      const win = windows.filter((w) => w.end - w.start >= 60 * DAY).slice(0, 3);
      const loveSigns = [];
      const conn = (a, b) => p[a].sign === p[b].sign || c.aspects(a).includes(p[b].house) && c.aspects(b).includes(p[a].house) || (SIGN_LORD[p[a].sign] === b && SIGN_LORD[p[b].sign] === a);
      if (L5 !== L7 && conn(L5, L7)) loveSigns.push('5th and 7th lords connected');
      if (p[L5].house === 7 || p[L7].house === 5) loveSigns.push('5th and 7th lords linked by placement');
      if ([5, 7].includes(p.Venus.house)) loveSigns.push(`Venus in the ${ord(p.Venus.house)}`);
      if ([5, 7].includes(p.Rahu.house)) loveSigns.push(`Rahu in the ${ord(p.Rahu.house)}`);
      if (p.Mars.sign === p.Venus.sign) loveSigns.push('Mars with Venus');
      const lean = loveSigns.length >= 2 ? 'Love marriage indicated' : loveSigns.length === 1 ? 'Love or introduced, both work' : 'Introduced through family or network';
      add('love', 'marriage', 'When will I get married?', {
        verdict: win.length ? `Windows in ${list([...new Set(win.map((w) => fmtY(w.start)))])}` : 'Late 20s, by dasha', tone: 'good',
        body: [
          `Marriage timing uses two classical checks together: a dasha of a 7th-house significator (${list([...sig])}) and the double transit, where Jupiter and Saturn both touch your 7th house or its lord.`,
          win.length ? `Windows where both line up: ${win.map((w) => `${fmtMY(w.start)} to ${fmtMY(w.end)} (age ${ageAt(w.start)}, ${w.lords})`).join('; ')}.` : 'No window shows both checks before 36, so timing will follow the dasha of your 7th lord and Venus.',
          `Love or arranged: ${lean.toLowerCase()}${loveSigns.length ? ` (${list(loveSigns)})` : ''}.`,
        ],
        factors: [`7th house ${sg(c.signOfHouse(7))}, lord ${L7}`, `Spouse karaka ${karaka} ${digw(karaka)}`, `Darakaraka (Jaimini spouse planet): ${c.karakas.dara}`],
        timing: win.map((w) => ({ label: w.lords, range: `${fmtMY(w.start)} to ${fmtMY(w.end)}` })),
      });
    }
    {
      const L7 = c.lordOf(7), occ = c.occupants(7);
      const bits = [`${SIGNS[c.signOfHouse(7)].spouse} (7th house in ${SIGNS[c.signOfHouse(7)].en})`];
      const lordAdj = { Sun: 'self-respecting and ambitious', Moon: 'caring and emotionally warm', Mars: 'energetic and decisive', Mercury: 'smart, witty and youthful', Jupiter: 'wise, cultured and principled', Venus: 'beautiful, artistic and affectionate', Saturn: 'mature, loyal and hardworking' }[L7];
      bits.push(lordAdj + ` (7th lord ${L7})`);
      const cap = (x) => x.replace(/^\w/, (m) => m.toUpperCase());
      const firstWord = (x) => x.split(/,| and /)[0].trim();
      for (const n of occ) bits.push({ Sun: 'confident with a strong personality', Moon: 'nurturing and attractive', Mars: 'passionate and driven', Mercury: 'intelligent and communicative', Jupiter: 'educated and kind', Venus: 'very attractive with refined taste', Saturn: 'steady and serious', Rahu: 'unusual, possibly from a different background', Ketu: 'spiritual and independent' }[n] + ` (${n} in the 7th)`);
      add('love', 'spouse', 'What will my partner be like?', {
        verdict: `${cap(firstWord(SIGNS[c.signOfHouse(7)].spouse))}, ${firstWord(SIGNS[c.signOfHouse(7)].spouse.split(', ')[1] || 'warm')} and ${firstWord(lordAdj)}`, tone: 'great',
        body: [
          `Your partner is described as ${list(bits)}.`,
          `Your Darakaraka is ${c.karakas.dara}, which adds a partner who brings ${PL[c.karakas.dara].theme} into your life.`,
          p.Venus.strength >= 70 ? `Venus is strong in your chart (${p.Venus.strength}/100), a classical sign of a happy, affectionate relationship.` : 'Venus is supported in your chart, giving warmth in relationships.',
        ],
        factors: [`7th house ${sg(c.signOfHouse(7))}`, `7th lord ${L7} in house ${p[L7].house}`, `Venus ${DIG_WORD[p.Venus.dignity]}`, `Darakaraka ${c.karakas.dara}`],
      });
    }
    {
      const M = [1, 2, 4, 7, 8, 12];
      const mh = p.Mars.house, fm = houseFrom(p.Mars.sign, p.Moon.sign), fv = houseFrom(p.Mars.sign, p.Venus.sign);
      const lag = M.includes(mh), moo = M.includes(fm), ven = M.includes(fv);
      const cancel = [];
      if (['own', 'exalted', 'moolatrikona'].includes(p.Mars.dignity)) cancel.push('Mars in its own or exalted sign');
      if (p.Mars.sign === p.Jupiter.sign || c.aspects('Jupiter').includes(mh)) cancel.push('Jupiter joins or aspects Mars');
      if (p.Mars.sign === p.Moon.sign) cancel.push('Mars with the Moon');
      if ([1, 7].includes(p.Jupiter.house) || [1, 7].includes(p.Venus.house)) cancel.push(`${[1, 7].includes(p.Jupiter.house) ? 'Jupiter' : 'Venus'} in the ${ord([1, 7].includes(p.Jupiter.house) ? p.Jupiter.house : p.Venus.house)} house`);
      const sm = { 2: [2, 5], 4: [0, 7], 7: [3, 9], 8: [8, 11], 12: [1, 6] };
      if (sm[mh] && sm[mh].includes(p.Mars.sign)) cancel.push(`Mars in ${SIGNS[p.Mars.sign].en} in the ${ord(mh)} house is a listed exception`);
      const verdict = !lag && !moo ? 'No, Mars is clear' : cancel.length ? 'Mars issue, cancelled' : 'Strong Mars energy';
      add('love', 'manglik', 'Does Mars cause problems in my marriage?', {
        verdict, tone: !lag && !moo ? 'great' : 'good',
        body: [
          `The classic Mars check for marriage (called Manglik in India) looks for Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house. Your Mars is in your ${ord(mh)} house from lagna${chartWord}, the ${ord(fm)} from your Moon and the ${ord(fv)} from Venus.`,
          !lag && !moo ? 'By the two main checks, from your rising sign and your Moon, Mars causes no marriage issue for you.' + (ven ? ' Some astrologers also check from Venus, where it does appear; most treat that as minor.' : '') : cancel.length ? `It appears, and it is cancelled by: ${list(cancel)}.` : 'Mars energy here means a passionate, driven partner suits you best, and matching with someone of similar Mars energy is the traditional answer.',
          'Mars in a good house gives drive, courage and protectiveness in relationships.',
        ],
        factors: [`Mars in ${sg(p.Mars.sign)}`, `From lagna: ${ord(mh)}`, `From Moon: ${ord(fm)}`, `From Venus: ${ord(fv)}`].concat(cancel),
      });
    }

    // ===== Life & luck =====
    {
      const nk = NAKS[p.Moon.nak];
      const g = GANA_TEXT[GANA[p.Moon.nak]];
      add('life', 'strengths', 'What are my biggest strengths?', {
        verdict: list(top3), tone: 'great',
        body: [
          `${c.timeKnown ? `Your lagna is ${sg(c.asc.sign)}. ${SIGNS[c.asc.sign].lagna}` : `Your birth time is not set, so your Moon sign stands in for the lagna.`}`,
          `Your Moon is in ${sg(p.Moon.sign)}. ${SIGNS[p.Moon.sign].moon}`,
          `Your birth star is ${nk.en} (${nk.name}), symbolised by ${nk.symbol}: ${nk.gift}.`,
          `Your Atmakaraka (soul planet) is ${c.karakas.atma}, so your life purpose runs through ${PL[c.karakas.atma].means}.`,
          `Your three strongest planets: ${top3.map((n) => `${n} (${p[n].strength}/100, ${digw(n)} in house ${p[n].house})`).join('; ')}.`,
        ],
        factors: top3.map((n) => `${n}: ${PL[n].edge}`),
      });
    }
    {
      let s = 0; const why = [];
      const L12 = c.lordOf(12), L9 = c.lordOf(9), L4 = c.lordOf(4), L1 = c.lordOf(1);
      const occ12 = c.occupants(12);
      if (occ12.length) { s += Math.min(2, occ12.length); why.push(`${list(occ12)} in the 12th house of foreign lands`); }
      if ([9, 12, 1].includes(p[L12].house)) { s += 2; why.push(`12th lord ${L12} in the ${ord(p[L12].house)}`); }
      if (p[L9].house === 12) { s += 2; why.push(`9th lord ${L9} in the 12th`); }
      if ([1, 4, 7, 9, 10, 12].includes(p.Rahu.house)) { s += 1; why.push(`Rahu in the ${ord(p.Rahu.house)}`); }
      if ([9, 12].includes(p[L1].house)) { s += 1; why.push(`lagna lord in the ${ord(p[L1].house)}`); }
      if (DUSTHANA.includes(p[L4].house)) { s += 1; why.push(`4th lord ${L4} away from the home house`); }
      if (p[L4].house === 4) { s -= 1; why.push(`4th lord ${L4} in its own house keeps you rooted`); }
      const links = s >= 1 && occ12.length;
      const verdict = s >= 4 ? 'Strong pull to live abroad' : s >= 2 ? 'Global work, home base' : links ? 'Home base, global links' : 'Rooted, with travel';
      add('life', 'abroad', 'Will I work or settle abroad?', {
        verdict, tone: 'good',
        body: [
          s >= 4 ? 'Your chart shows a strong foreign connection. Settling or spending long stretches abroad is well supported.' : s >= 2 ? 'Your chart supports foreign clients, foreign income and regular international travel, while your roots and base stay in India.' : links ? `Your base stays at home, and the planets in your 12th house bring foreign connections: overseas clients, remote work and trips abroad.` : 'Your chart keeps your base at home, with travel for work and pleasure.',
          why.length ? `Indications: ${list(why)}.` : '',
          `Jupiter's travel windows: whenever it transits your 9th or 12th house, long journeys open up.`,
        ].filter(Boolean),
        factors: why,
      });
    }
    {
      const L1 = c.lordOf(1);
      const el = SIGNS[c.lagnaSign].el;
      const habit = { Fire: 'burn energy daily through sport, and cool down properly', Earth: 'keep regular meal times, eat fibre and protect your gut', Air: 'guard your sleep and calm your nervous system with breathwork', Water: 'drink enough water and give yourself real emotional rest' }[el];
      add('life', 'health', 'What keeps my health strong?', {
        verdict: `${A.health.label} vitality`, tone: 'good', score: A.health.score,
        body: [
          `Your vitality score is ${A.health.score}/100, based on your lagna (${sav[1]} bindus), its lord ${pdesc(L1)} and the Sun.`,
          `Your lagna sign ${SIGNS[c.lagnaSign].en} governs the ${SIGNS[c.lagnaSign].body}, so that is the area to look after. As ${el === 'Air' || el === 'Earth' ? 'an' : 'a'} ${el.toLowerCase()} lagna, ${habit}.`,
          (() => { const m = c.occupants(6).filter((n) => ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'].includes(n)); return m.length ? `${list(m)} in your 6th house ${m.length > 1 ? 'give' : 'gives'} strong immunity and fighting power.` : ''; })(),
          c.occupants(6).includes('Moon') ? 'Moon in the 6th means stress lands in your body first. Fixed routines and time off screens help more than anything else.' : '',
        ].filter(Boolean),
        factors: [`Lagna ${sg(c.lagnaSign)}`, `Lagna lord ${L1}: ${p[L1].strength}/100`, `Sun: ${p.Sun.strength}/100`, `6th house: ${c.occupants(6).join(', ') || 'empty'}`],
      });
    }
    {
      const L4 = c.lordOf(4), L5 = c.lordOf(5), L9 = c.lordOf(9);
      const fields = [...new Set([...PL.Mercury.fields.slice(0, 2), ...PL[L5].fields.slice(0, 1), ...PL[L9].fields.slice(0, 1)])];
      add('life', 'education', 'Should I study further, and what?', {
        verdict: `${A.learning.label} learning chart`, tone: 'great', score: A.learning.score,
        body: [
          `Your learning score is ${A.learning.score}/100. Foundational education sits in your 4th house (${sg(c.signOfHouse(4))}, lord ${pdesc(L4)}), intelligence in the 5th (lord ${pdesc(L5)}) and higher learning in the 9th (lord ${L9}).`,
          p[L5].house === 12 || p[L9].house === 12 ? 'Your learning lords touch the 12th house, which favours study abroad, online programs and self-directed learning.' : 'Formal programs and mentors both work well for you.',
          `Subjects that suit your chart: ${list(fields)}.`,
        ],
        factors: [`4th house: ${sav[4]} bindus`, `5th house: ${sav[5]} bindus`, `Mercury ${DIG_WORD[p.Mercury.dignity]}`, `Jupiter ${DIG_WORD[p.Jupiter.dignity]}`],
      });
    }
    {
      const L4 = c.lordOf(4), L9 = c.lordOf(9);
      const body = [
        `Your mother is read from the 4th house and the Moon. Your 4th house is ${sg(c.signOfHouse(4))}${c.occupants(4).length ? ` holding ${list(c.occupants(4))}` : ''}, and its lord ${pdesc(L4)}. ${p[L4].strength >= 65 ? 'This is a strong, protective placement: your mother is a real pillar of support and the home is a source of strength.' : 'Your mother gives steady, practical support.'}`,
        `Your father is read from the 9th house and the Sun. Your 9th house is ${sg(c.signOfHouse(9))}, its lord ${pdesc(L9)}. ${p[L9].strength >= 65 ? 'This is a lucky placement for your father, and his blessings and guidance carry real weight in your success.' : 'Your father has built his path with effort, and his discipline shows up in you.'}`,
      ];
      const fam = (opts.family || []).filter((f) => f.moonSign != null);
      for (const f of fam) {
        const h = houseFrom(f.moonSign, c.lagnaSign);
        body.push(`${f.relation === 'mother' ? 'Your mother' : 'Your father'} (born ${f.dob}) has the Moon in ${sg(f.moonSign)}, which falls in your ${ord(h)} house of ${HOUSES[h].area}.${h === 1 ? ' That is your lagna itself, a close natural bond.' : h === 7 ? ' That is the house of partnership, so you work well as a team.' : ''}`);
      }
      add('life', 'parents', 'What does my chart say about my parents?', {
        verdict: 'Strong family backing', tone: 'great', body,
        factors: [`4th lord ${L4}: ${p[L4].strength}/100`, `Moon ${DIG_WORD[p.Moon.dignity]} in house ${p.Moon.house}`, `9th lord ${L9}: ${p[L9].strength}/100`, `Sun ${DIG_WORD[p.Sun.dignity]} in house ${p.Sun.house}`],
      });
    }
    {
      const L1 = c.lordOf(1), L5 = c.lordOf(5), L9 = c.lordOf(9);
      const P = PL[L1];
      // supporting stones only from trikona lords that do not also rule a dusthana
      const helpers = [...new Set([L5, L9])].filter((l) => l !== L1 && !c.housesOwned(l).some((h) => DUSTHANA.includes(h)));
      add('life', 'lucky', 'What are my lucky number, colour, day and gemstone?', {
        verdict: `${P.num}, ${P.color.split(' and ')[0]}, ${P.day}`, tone: 'great',
        body: [
          `These follow your lagna lord ${L1}, the classical choice because it rules your body and fortune. Supporting picks come from your 9th lord of luck, ${L9}.`,
          `Lucky numbers: ${P.num}${PL[L9].num !== P.num ? ' and ' + PL[L9].num : ''}. Colours: ${P.color}${L9 !== L1 ? ', plus ' + PL[L9].color : ''}. Days: ${P.day}${PL[L9].day !== P.day ? ' and ' + PL[L9].day : ''}. Direction: ${P.dir}.`,
          `Gemstone: ${P.gem} for ${L1}.${helpers.length ? ` Supporting stone${helpers.length > 1 ? 's' : ''}: ${helpers.map((l) => `${PL[l].gem} for ${l}, your ${c.housesOwned(l).map(ord).join(' and ')} lord`).join('; ')}.` : ''} Traditionally a stone is tried for a few days before committing to it.`,
        ],
        factors: [`Lagna lord ${L1}`, `5th lord ${L5}`, `9th lord ${L9}`],
      });
    }

    // ---- summary strings ----
    const nk = NAKS[p.Moon.nak];
    const summary = {
      lagna: c.timeKnown ? sg(c.asc.sign) : 'Needs birth time',
      lagnaDeg: c.asc.deg,
      rashi: sg(p.Moon.sign),
      nak: `${nk.en}, pada ${p.Moon.pada}`,
      nakLord: nk.lord,
      sunSign: sg(p.Sun.sign),
      dasha: curMD ? `${curMD.lord} / ${curAD.lord}` : '',
      dashaEnd: curAD ? fmtMY(curAD.end) : '',
      atma: c.karakas.atma,
      gana: GANA_TEXT[GANA[p.Moon.nak]][0], nadi: NADI[p.Moon.nak % 6], syllable: nk.syl[p.Moon.pada - 1],
    };
    return { months, areas, A, H, questions: Q, timeline, cur: { md: curMD, ad: curAD }, transits: { now: tNow, jupiterPath, sadeList, satRel, jupNowMoon }, summary, top3, fmt: { fmtMY, fmtY, fmtD } };
  }

  function chartText(c, r, name) {
    const p = c.p;
    const lines = [];
    lines.push(`Name: ${name || 'Native'}. Vedic chart, Lahiri ayanamsa, whole-sign houses${c.timeKnown ? '' : ', birth time unknown so houses are from the Moon'}.`);
    lines.push(`Rising sign ${c.timeKnown ? SIGNS[c.asc.sign].en + ' ' + c.asc.deg.toFixed(1) + '°' : 'unknown'}. Moon sign ${SIGNS[p.Moon.sign].en}, birth star ${NAKS[p.Moon.nak].en}.`);
    for (const n of PLANETS) { const x = p[n]; lines.push(`${n}: ${SIGNS[x.sign].en} ${x.deg.toFixed(1)}°, house ${x.house}, ${x.dignity}${x.neechaBhanga ? ' (neecha bhanga)' : ''}${x.retro && n !== 'Rahu' && n !== 'Ketu' ? ', retrograde' : ''}${x.combust ? ', combust' : ''}, strength ${x.strength}/100.`); }
    lines.push(`Ashtakavarga (SAV) by house 1-12: ${c.ashtakavarga.byHouse.slice(1).join(', ')}.`);
    lines.push(`Yogas: ${c.yogas.map((y) => y.name + ' (' + y.planets.join('+') + ')').join('; ') || 'none'}.`);
    lines.push(`Atmakaraka ${c.karakas.atma}, Amatyakaraka ${c.karakas.amatya}, Darakaraka ${c.karakas.dara}.`);
    if (r.cur.md) lines.push(`Current dasha: ${r.cur.md.lord} Mahadasha (to ${r.fmt.fmtMY(r.cur.md.end)}), ${r.cur.ad.lord} Antardasha (to ${r.fmt.fmtMY(r.cur.ad.end)}).`);
    lines.push(`Upcoming Mahadashas: ${r.timeline.filter((t) => t.start > Date.now()).slice(0, 4).map((t) => `${t.lord} ${r.fmt.fmtY(t.start)}-${r.fmt.fmtY(t.end)} (${t.tier})`).join(', ')}.`);
    lines.push(`Transits today: Jupiter in ${SIGNS[r.transits.now.Jupiter.sign].en} (${r.transits.jupNowMoon} from Moon), Saturn in ${SIGNS[r.transits.now.Saturn.sign].en} (${r.transits.satRel} from Moon), Rahu in ${SIGNS[r.transits.now.Rahu.sign].en}.`);
    lines.push(`Life area scores: ${r.areas.map((a) => `${a.name} ${a.score}`).join(', ')}.`);
    return lines.join('\n');
  }

  root.Reading = { SIGNS, NAKS, PL, HOUSES, analyse, chartText, ord };
})(typeof window !== 'undefined' ? window : globalThis);
