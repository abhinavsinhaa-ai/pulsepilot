/* Builds index.html (example profile) and, if profile.local.json exists, janma-kundli.html (your own profile). Run: node build.js */
const fs = require('fs');
const src = (f) => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
const page = src('page.html');
// Personal profile lives in profile.local.json (not committed): { "me": {...}, "family": [...] }
const local = fs.existsSync(__dirname + "/profile.local.json") ? JSON.parse(fs.readFileSync(__dirname + "/profile.local.json", "utf8")) : null;
const EXAMPLE = { name: 'Example chart', date: '1995-06-21', time: '07:30', timeMode: 'exact', gender: 'female', place: { label: 'New Delhi, Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' }, offset: null, launch: null, sample: true };
function build(defaults, family) {
  let out = page
    .replace('<script>/*CITIES*/</script>', () => '<script>' + src('cities.js') + '</script>')
    .replace('<script>/*ENGINE*/</script>', () => '<script>' + src('engine.js') + '</script>')
    .replace('<script>/*READING*/</script>', () => '<script>' + src('reading.js') + '</script>')
    .replace('<script>/*DEFAULTS*/</script>', () => '<script>window.KUNDLI_DEFAULT=' + JSON.stringify(defaults) + ';window.KUNDLI_FAMILY=' + JSON.stringify(family) + ';</script>');
  return out;
}
if (local) fs.writeFileSync(__dirname + '/janma-kundli.html', build(local.me, local.family || []));
fs.writeFileSync(__dirname + '/index.html', build(EXAMPLE, []));
for (const f of ['janma-kundli.html', 'index.html'].filter((f) => fs.existsSync(__dirname + '/' + f))) console.log(f, (fs.statSync(__dirname + '/' + f).size / 1024).toFixed(1) + 'KB');
const all = fs.readFileSync(__dirname + '/index.html', 'utf8');
console.log('em dashes:', (all.match(/—/g) || []).length);
