// Generates the itch.io submission art set (English-only screenshots):
//   itch/art/cover.png         — 1280×720 wide cover (bilingual title kept as hook)
//   itch/art/01_apartment.png  — slack-phase apartment with mom dialogue + tip
//   itch/art/02_street.png     — street chase with truck + player
//   itch/art/03_stairwell.png  — stairwell encounter with Grandpa Huang
//   itch/art/04_result.png     — result screen with mom portrait
//   itch/art/05_courtroom.png  — Act II sentencing vignette (judge + prosecutor)
//   itch/art/06_stats.png      — branching-paths stats with the formula visible
//
// Composes painted backgrounds + character PNGs and overlays SVG-rendered
// text/HUD via librsvg. Requires Noto Serif TC + Noto Sans TC in fontconfig
// for the cover's bilingual title; everything else is EN-only.
//
// Run: node scripts/gen-itch-art.cjs

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BG  = (n) => path.join(ROOT, 'assets/images/bg', n);
const CH  = (n) => path.join(ROOT, 'assets/images/char', n);
const OUT = path.join(ROOT, 'itch/art');
fs.mkdirSync(OUT, { recursive: true });

const W = 960;
const H = 540;

// Reset OUT so old numbered files don't linger (we renumbered).
for (const f of fs.readdirSync(OUT)) {
  if (/^(0[1-6]_|cover\.png$)/.test(f)) fs.unlinkSync(path.join(OUT, f));
}

// ── SVG helpers ───────────────────────────────────────────────────────────

const SERIF = 'Noto Serif TC, serif';
const SANS  = 'Noto Sans TC, sans-serif';
const MONO  = 'monospace';

function svgEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSvg(width, height, body) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`);
}

function textBlock({ x, y, text, fontSize = 16, color = '#e8dccb', stroke = '#0a0a14', strokeW = 2.5,
                     anchor = 'middle', weight = 'normal', italic = false, family = SERIF,
                     bgRgba = null, padX = 8, padY = 4, lineHeight = null }) {
  const lines = String(text).split('\n');
  const lh = lineHeight || Math.round(fontSize * 1.2);
  const lineSvgs = lines.map((line, i) => {
    const dy = i * lh;
    return `<text x="${x}" y="${y + dy}" font-family="${family}" font-size="${fontSize}" font-weight="${weight}" font-style="${italic ? 'italic' : 'normal'}" fill="${color}" text-anchor="${anchor}" stroke="${stroke}" stroke-width="${strokeW}" paint-order="stroke">${svgEscape(line)}</text>`;
  }).join('');
  if (!bgRgba) return lineSvgs;
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const pillW = longest * (fontSize * 0.62) + padX * 2;
  const pillH = lh * lines.length + padY * 2;
  const pillX = anchor === 'middle' ? x - pillW / 2 : (anchor === 'end' ? x - pillW : x);
  const pillY = y - fontSize + padY * -1;
  const pill = `<rect x="${pillX}" y="${pillY - 4}" width="${pillW}" height="${pillH}" fill="${bgRgba}" rx="6"/>`;
  return pill + lineSvgs;
}

async function loadResized(file) {
  return sharp(file).resize(W, H, { fit: 'cover' }).toBuffer();
}

async function compose(bgFile, overlays, outFile, { tint = null } = {}) {
  let img = sharp(await loadResized(bgFile));
  if (tint) {
    const tintBuf = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
      `<rect width="${W}" height="${H}" fill="${tint}"/></svg>`
    );
    img = img.composite([{ input: tintBuf, blend: 'over' }]);
    img = sharp(await img.png().toBuffer());
  }
  if (overlays.length) {
    img = img.composite(overlays);
  }
  await img.png().toFile(outFile);
}

async function svgInput(body, w = W, h = H) {
  return { input: buildSvg(w, h, body), top: 0, left: 0 };
}

// ── 01: Apartment slack phase ─────────────────────────────────────────────

async function makeApartment() {
  const truckProgress = 0.42;
  const slackBarFill = 0.55;
  const slackPoints = 110;
  const body = []
    .concat(`<rect x="0" y="0" width="${W}" height="56" fill="rgba(5,5,16,0.30)"/>`)
    .concat(textBlock({ x: W / 2, y: 32, text: 'Day 3 / 5', fontSize: 22, color: '#e8b96a', stroke: '#2a1a10', strokeW: 2 }))
    .concat(`<rect x="22" y="22" width="14" height="22" fill="#1a1a2a" stroke="#6acfff" stroke-width="1"/>`)
    .concat(`<rect x="24" y="20" width="10" height="14" fill="#6acfff" fill-opacity="0.45"/>`)
    .concat(textBlock({ x: 42, y: 26, text: 'SLACK', fontSize: 13, color: '#9adfff', anchor: 'start', stroke: '#0a0a14', strokeW: 1.2, family: SANS }))
    .concat(`<rect x="42" y="34" width="110" height="9" fill="#102030" stroke="#4a6a80" stroke-width="1"/>`)
    .concat(`<rect x="43" y="35" width="${108 * slackBarFill}" height="7" fill="#e8b96a"/>`)
    .concat(textBlock({ x: 162, y: 41, text: String(slackPoints), fontSize: 16, color: '#e8b96a', anchor: 'start', weight: 'bold', stroke: '#0a0a14', strokeW: 1.5, family: MONO }))
    .concat(`<rect x="${W - 220}" y="22" width="200" height="14" fill="#1a1a2a" stroke="#4a3040" stroke-width="1"/>`)
    .concat(`<rect x="${W - 219}" y="23" width="${198 * truckProgress}" height="12" fill="#ff6b8a"/>`)
    .concat(textBlock({ x: W - 22, y: 50, text: 'Truck: approaching', fontSize: 12, color: '#e8dccb', anchor: 'end', stroke: '#0a0a14', strokeW: 1.5, family: SANS }))
    .concat(textBlock({
      x: W / 2, y: 78, text: 'Day 3. Mom: "Careful, the steps are wet."',
      fontSize: 14, color: '#e8dccb', italic: true, stroke: '#0a0a14', strokeW: 2,
      bgRgba: 'rgba(20,16,32,0.6)', padX: 14,
    }))
    .concat(`<rect x="${W / 2 - 300}" y="${H / 2 + 80}" width="600" height="86" rx="6" fill="rgba(20,16,32,0.86)" stroke="#2a1a10" stroke-width="2"/>`)
    .concat(textBlock({
      x: W / 2, y: H / 2 + 110, text: 'Truck is far. Slack as much as you can — slacking earns points!',
      fontSize: 16, color: '#fff4cc', italic: true, stroke: '#2a1a10', strokeW: 2.5,
    }))
    .concat(textBlock({
      x: W / 2, y: H / 2 + 138, text: '(but not too low or mom won\'t let you forget it)',
      fontSize: 13, color: '#fff4cc', italic: true, stroke: '#2a1a10', strokeW: 2,
    }))
    .concat(textBlock({
      x: W / 2, y: H - 36, text: 'E: phone   T: TV   ENTER: head downstairs   ESC: pause',
      fontSize: 13, color: '#aaa', stroke: '#0a0a14', strokeW: 1.5, family: SANS,
    }))
    .join('');
  await compose(BG('01_apartment_livingroom.png'), [await svgInput(body)], path.join(OUT, '01_apartment.png'),
    { tint: 'rgba(20,16,40,0.18)' });
}

// ── 02: Street chase ──────────────────────────────────────────────────────

async function makeStreet() {
  const body = []
    .concat(`<g transform="translate(620, 380)">`)
    .concat(`<rect x="-50" y="-22" width="100" height="38" fill="#e8a040" stroke="#4a3010" stroke-width="2"/>`)
    .concat(`<rect x="6" y="-30" width="36" height="26" fill="#e8a040" stroke="#4a3010" stroke-width="2"/>`)
    .concat(`<rect x="-50" y="-2" width="100" height="4" fill="#fdfcf2"/>`)
    .concat(`<rect x="10" y="-36" width="22" height="12" fill="#9ac0d8"/>`)
    .concat(`<circle cx="-30" cy="22" r="8" fill="#141014"/>`)
    .concat(`<circle cx="22" cy="22" r="8" fill="#141014"/>`)
    .concat(`<circle cx="42" cy="22" r="8" fill="#141014"/>`)
    .concat(`<text x="6" y="-46" font-family="${SERIF}" font-size="22" fill="#fff4cc" stroke="#2a1a10" stroke-width="3" paint-order="stroke" text-anchor="middle">♪</text>`)
    .concat(`<text x="34" y="-58" font-family="${SERIF}" font-size="16" fill="#fff4cc" stroke="#2a1a10" stroke-width="2" paint-order="stroke" text-anchor="middle">♪</text>`)
    .concat(`</g>`)
    .concat(`<g transform="translate(280, 410)">`)
    .concat(`<rect x="-12" y="-20" width="24" height="36" fill="#4a5a70"/>`)
    .concat(`<rect x="-8" y="14" width="8" height="18" fill="#2a2820"/>`)
    .concat(`<rect x="0" y="14" width="8" height="18" fill="#2a2820"/>`)
    .concat(`<circle cx="0" cy="-30" r="11" fill="#f2d6b6"/>`)
    .concat(`<rect x="-10" y="-38" width="20" height="6" fill="#2a1810"/>`)
    .concat(`<rect x="-22" y="-8" width="14" height="18" fill="#e8c850" stroke="#805520" stroke-width="1"/>`)
    .concat(`</g>`)
    .concat(`<rect x="0" y="0" width="${W}" height="50" fill="rgba(5,5,16,0.45)"/>`)
    .concat(textBlock({ x: 24, y: 32, text: 'Bags: 1 / 3', fontSize: 16, color: '#e8dccb', anchor: 'start', stroke: '#0a0a14', strokeW: 2, family: SANS }))
    .concat(textBlock({ x: W / 2, y: 32, text: 'Day 4 — chase', fontSize: 18, color: '#e8b96a', stroke: '#2a1a10', strokeW: 2 }))
    .concat(textBlock({ x: 280, y: 320, text: 'SPACE!', fontSize: 24, color: '#6affaa', weight: 'bold', stroke: '#0a0a14', strokeW: 3, family: SANS }))
    .concat(`<rect x="0" y="${H - 60}" width="${W}" height="60" fill="rgba(5,5,16,0.55)"/>`)
    .concat(textBlock({ x: W / 2, y: H - 32, text: '← → move · SPACE throw · green bar = throw NOW', fontSize: 13, color: '#999', stroke: '#0a0a14', strokeW: 1.5, family: SANS }))
    .join('');
  await compose(BG('05_alley_dusk_night_market.png'), [await svgInput(body)], path.join(OUT, '02_street.png'),
    { tint: 'rgba(10,8,24,0.10)' });
}

// ── 03: Stairwell encounter (Mr. Huang) ───────────────────────────────────

async function makeStairwell() {
  const nx = 600, ny = 360;
  const bx = 360, by = 280;
  const body = []
    .concat(`<rect x="${W / 2 - 380}" y="14" width="760" height="34" rx="4" fill="rgba(20,16,32,0.78)"/>`)
    .concat(textBlock({
      x: W / 2, y: 36, text: 'Urbanisation closes doors — but trash time is when neighbours nod hello.',
      fontSize: 13, color: '#fff4cc', italic: true,
      stroke: '#2a1a10', strokeW: 1.5,
    }))
    .concat(`<g transform="translate(${nx}, ${ny})">`)
    .concat(`<rect x="-11" y="-4" width="22" height="38" fill="#6a5a4a"/>`)
    .concat(`<rect x="-10" y="36" width="8" height="18" fill="#2a1f1a"/>`)
    .concat(`<rect x="2" y="36" width="8" height="18" fill="#2a1f1a"/>`)
    .concat(`<rect x="-19" y="-12" width="6" height="22" fill="#6a5a4a"/>`)
    .concat(`<rect x="13" y="-20" width="6" height="22" fill="#6a5a4a" transform="rotate(-20)"/>`)
    .concat(`<circle cx="0" cy="-32" r="11" fill="#e8b890"/>`)
    .concat(`<rect x="-11" y="-40" width="22" height="6" fill="#2a1810"/>`)
    .concat(`<circle cx="-3" cy="-32" r="1.4" fill="#101010"/>`)
    .concat(`<circle cx="3" cy="-32" r="1.4" fill="#101010"/>`)
    .concat(`<line x1="14" y1="-16" x2="22" y2="20" stroke="#6a4a30" stroke-width="2"/>`)
    .concat(`</g>`)
    .concat(`<rect x="${bx - 145}" y="${by - 32}" width="290" height="64" rx="6" fill="#fdfcf2" stroke="#1a1a1a" stroke-width="2"/>`)
    .concat(`<polygon points="${bx + 95},${by + 32} ${bx + 115},${by + 32} ${nx - 12},${ny - 22}" fill="#fdfcf2" stroke="#1a1a1a" stroke-width="1.5"/>`)
    .concat(textBlock({ x: bx, y: by - 14, text: 'Grandpa Huang (5F)', fontSize: 12, color: '#8a5a30', family: SANS, stroke: 'none', strokeW: 0 }))
    .concat(textBlock({ x: bx, y: by + 12, text: 'Sonny... could you carry this up for me?', fontSize: 13, color: '#1a1a1a', stroke: 'none', strokeW: 0 }))
    .concat(`<rect x="${W / 2 - 230}" y="${H - 90}" width="460" height="60" rx="4" fill="rgba(10,10,20,0.92)" stroke="#e8b96a" stroke-width="2"/>`)
    .concat(textBlock({ x: W / 2, y: H - 64, text: '[E] Help him', fontSize: 16, color: '#6affaa', weight: 'bold', family: SANS, stroke: '#0a0a14', strokeW: 1.5 }))
    .concat(textBlock({ x: W / 2, y: H - 44, text: 'press E within 2s — or just walk past', fontSize: 11, color: '#9aa0a8', family: SANS, stroke: '#0a0a14', strokeW: 1 }))
    .concat(`<rect x="${W / 2 - 200}" y="${H - 38}" width="400" height="3" fill="#102030"/>`)
    .concat(`<rect x="${W / 2 - 199}" y="${H - 37}" width="280" height="2" fill="#6affaa"/>`)
    .join('');
  await compose(BG('02_stairwell.png'), [await svgInput(body)], path.join(OUT, '03_stairwell.png'),
    { tint: 'rgba(10,8,16,0.18)' });
}

// ── 04: Result screen with mom portrait ───────────────────────────────────

async function makeResult() {
  const body = []
    .concat(textBlock({ x: W / 2, y: 56, text: 'Day 5 — Result', fontSize: 24, color: '#e8b96a', stroke: '#2a1a10', strokeW: 2 }))
    .concat(textBlock({
      x: W / 2 + 70, y: 160, text: 'Mom: "A whole week. Not bad. Come eat."',
      fontSize: 18, color: '#e8dccb', italic: true,
      stroke: '#1a1015', strokeW: 2,
    }))
    .concat(`<rect x="${W / 2 - 200}" y="${H / 2 + 30}" width="400" height="170" rx="4" fill="rgba(20,16,30,0.85)" stroke="#4a3a30" stroke-width="1"/>`)
    .concat(textBlock({ x: W / 2, y: H / 2 + 60, text: 'Slack points : 110 × 5 = 550', fontSize: 14, color: '#aaa', family: MONO, stroke: 'none', strokeW: 0 }))
    .concat(textBlock({ x: W / 2, y: H / 2 + 84, text: 'Bags thrown  : 3 / 3 × 100 = 300', fontSize: 14, color: '#aaa', family: MONO, stroke: 'none', strokeW: 0 }))
    .concat(textBlock({ x: W / 2, y: H / 2 + 108, text: 'Full clear bonus : +100', fontSize: 14, color: '#6affaa', family: MONO, stroke: 'none', strokeW: 0 }))
    .concat(textBlock({ x: W / 2, y: H / 2 + 142, text: 'Day 5 total : 950', fontSize: 16, color: '#e8b96a', family: MONO, weight: 'bold', stroke: 'none', strokeW: 0 }))
    .concat(textBlock({ x: W / 2, y: H / 2 + 168, text: 'Week running total : 2,840', fontSize: 16, color: '#e8b96a', family: MONO, weight: 'bold', stroke: 'none', strokeW: 0 }))
    .concat(textBlock({ x: W / 2, y: H - 30, text: '[ SPACE — continue to the depot ]', fontSize: 14, color: '#6acfff', family: SANS, stroke: '#0a0a14', strokeW: 1.5 }))
    .join('');
  const momBuf = await sharp(CH('mom_proud.png')).resize(140, 214, { fit: 'inside' }).toBuffer();
  const bgBuf = await sharp({
    create: { width: W, height: H, channels: 3, background: { r: 10, g: 10, b: 15 } },
  }).png().toBuffer();
  await sharp(bgBuf)
    .composite([
      { input: momBuf, top: 80, left: 30 },
      { input: buildSvg(W, H, body), top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(OUT, '04_result.png'));
}

// ── 05: Courtroom — Act II sentencing ─────────────────────────────────────

async function makeCourtroom() {
  // Recreate vignetteSentencing: bench + flags + judge (navy) + prosecutor
  // (purple) + cleaner + gavel + GUILTY stamp.
  const cy = H / 2 + 30; // shift composition slightly down so caption fits up top
  const trim = (kind) => kind === 'judge' ? '#1a3068' : '#6a2a8a';
  const person = (x, y, kind, scale = 1) => {
    const s = scale;
    if (kind === 'judge' || kind === 'prosecutor') {
      const t = trim(kind);
      return `
        <g transform="translate(${x}, ${y})">
          <rect x="${-15 * s}" y="${-10 * s}" width="${30 * s}" height="${44 * s}" fill="#141014"/>
          <rect x="${-9 * s}" y="${-8 * s}" width="${4 * s}" height="${38 * s}" fill="${t}"/>
          <rect x="${5 * s}"  y="${-8 * s}" width="${4 * s}" height="${38 * s}" fill="${t}"/>
          <rect x="${-7 * s}" y="${-22 * s}" width="${14 * s}" height="${12 * s}" fill="#fdfcf2"/>
          <rect x="${-4 * s}" y="${-16 * s}" width="${8 * s}" height="${6 * s}" fill="${t}" fill-opacity="0.55"/>
          <circle cx="0" cy="${-36 * s}" r="${10 * s}" fill="#f2c79a"/>
          <rect x="${-11 * s}" y="${-44 * s}" width="${22 * s}" height="${6 * s}" fill="#2a1a14"/>
          <text x="0" y="${50 * s}" font-family="${SANS}" font-size="${10 * s}" fill="${t}" stroke="#0a0a14" stroke-width="1.5" paint-order="stroke" text-anchor="middle" font-weight="bold">${kind === 'judge' ? 'JUDGE' : 'PROSECUTOR'}</text>
        </g>`;
    }
    if (kind === 'cleaner') {
      return `
        <g transform="translate(${x}, ${y}) scale(${s})">
          <rect x="-13" y="-4" width="26" height="36" fill="#3a3a3a"/>
          <rect x="-14" y="-8" width="28" height="24" fill="#e8a040"/>
          <rect x="-14" y="0"  width="28" height="4" fill="#e8dccb" fill-opacity="0.85"/>
          <rect x="-7" y="32" width="6" height="18" fill="#2a2a2a"/>
          <rect x="1"  y="32" width="6" height="18" fill="#2a2a2a"/>
          <circle cx="0" cy="-22" r="11" fill="#f2c79a"/>
          <rect x="-12" y="-30" width="24" height="6" fill="#e8a040"/>
        </g>`;
    }
    return '';
  };

  const body = []
    .concat(`<rect width="${W}" height="${H}" fill="#0a0810"/>`)
    // Wall back panel
    .concat(`<rect x="${W/2 - 220}" y="${cy - 130}" width="440" height="80" fill="#1a1614"/>`)
    // Two flags
    .concat(`<rect x="${W/2 - 200}" y="${cy - 130}" width="30" height="70" fill="#9a2030"/>`)
    .concat(`<rect x="${W/2 + 170}" y="${cy - 130}" width="30" height="70" fill="#142060"/>`)
    // Bench
    .concat(`<rect x="${W/2 - 220}" y="${cy + 30}" width="440" height="22" fill="#4a3020"/>`)
    .concat(`<rect x="${W/2 - 230}" y="${cy + 52}" width="460" height="22" fill="#3a2418"/>`)
    // Judge + prosecutor behind bench
    .concat(person(W/2 - 60, cy - 10, 'judge', 1.1))
    .concat(person(W/2 + 60, cy - 10, 'prosecutor', 1.1))
    // Defendant cleaner small at bottom-left
    .concat(person(W/2 - 200, cy + 130, 'cleaner', 0.85))
    .concat(textBlock({ x: W/2 - 200, y: cy + 200, text: 'Mr. Huang (defendant)', fontSize: 11, color: '#aaa', anchor: 'middle', family: SANS, stroke: 'none', strokeW: 0 }))
    // Gavel coming down
    .concat(`<g transform="translate(${W/2 + 160}, ${cy + 70})">`)
    .concat(`<rect x="-20" y="-7" width="36" height="14" fill="#6a4a28" stroke="#2a1a08" stroke-width="1"/>`)
    .concat(`<rect x="0" y="-3" width="32" height="6" fill="#6a4a28"/>`)
    .concat(`<line x1="-30" y1="-22" x2="-12" y2="-8" stroke="#e8b96a" stroke-opacity="0.7" stroke-width="2"/>`)
    .concat(`<line x1="-30" y1="-30" x2="-14" y2="-16" stroke="#e8b96a" stroke-opacity="0.6" stroke-width="2"/>`)
    .concat(`</g>`)
    // GUILTY stamp tilted
    .concat(`<g transform="translate(${W/2 + 230}, ${cy + 130}) rotate(-8)">`)
    .concat(`<rect x="-65" y="-22" width="130" height="44" fill="#141014" stroke="#9a2030" stroke-width="3" fill-opacity="0.92"/>`)
    .concat(`<text x="0" y="6" font-family="${SERIF}" font-size="22" font-weight="bold" fill="#ff6b8a" text-anchor="middle">GUILTY</text>`)
    .concat(`</g>`)
    // Headline caption — emotional hook for the page
    .concat(`<rect x="0" y="0" width="${W}" height="60" fill="rgba(5,5,16,0.55)"/>`)
    .concat(textBlock({ x: W/2, y: 26, text: 'Act II — A NT$32 rice cooker', fontSize: 18, color: '#e8b96a', italic: true, stroke: '#1a1015', strokeW: 2 }))
    .concat(textBlock({ x: W/2, y: 50, text: '3 months — over a recycled rice cooker he gave to a scavenger grandma.', fontSize: 12, color: '#aac0d0', italic: true, stroke: '#0a0a14', strokeW: 1.5, family: SANS }))
    // Footer note about robe colours (real Taiwan court detail)
    .concat(textBlock({ x: W/2, y: H - 18, text: 'Navy trim = judge · Purple trim = prosecutor (Taiwan court robes)', fontSize: 11, color: '#8a8880', family: SANS, stroke: '#0a0a14', strokeW: 1 }))
    .join('');

  const bgBuf = await sharp({
    create: { width: W, height: H, channels: 3, background: { r: 10, g: 8, b: 16 } },
  }).png().toBuffer();
  await sharp(bgBuf)
    .composite([{ input: buildSvg(W, H, body), top: 0, left: 0 }])
    .png()
    .toFile(path.join(OUT, '05_courtroom.png'));
}

// ── 06: Stats — branching paths + easter eggs ─────────────────────────────
//
// Math:
//   Stairwell: 4 days × (4 neighbours × 2 engage choices) = 8⁴ = 4,096
//   × Ending gate (story / FAILED)                          × 2
//                                                           ─────
//                                                           8,192 paths
//
//   Easter eggs (unique unlockable scenes):
//     1  Matchmaking insert — Miss Gao greeted
//     1  Mom proud line     — Grandpa Huang helped
//     5  Local-info pool    — Mrs. Chen listened
//     1  Mom gossip scold   — Auntie Zhang chatted
//     1  CHALLENGE FAILED   — week score < 500
//     ─────
//     9 easter eggs

async function makeStats() {
  const stairwellPaths = Math.pow(4 * 2, 4); // 4096
  const endingGate = 2;
  const totalPaths = stairwellPaths * endingGate; // 8192
  const eggBreakdown = [
    { sym: '♡', txt: 'Matchmaking insert  —  Miss Gao greeted',           n: 1 },
    { sym: '★', txt: 'Mom proud line       —  Grandpa Huang helped',       n: 1 },
    { sym: '◆', txt: 'Local-info pool        —  Mrs. Chen listened',        n: 5 },
    { sym: '✦', txt: 'Mom gossip scold     —  Auntie Zhang chatted',     n: 1 },
    { sym: '⚠', txt: 'CHALLENGE FAILED  —  week score < 500',           n: 1 },
  ];
  const totalEggs = eggBreakdown.reduce((s, e) => s + e.n, 0);

  const lines = [];
  // Title
  lines.push(textBlock({ x: W/2, y: 56, text: 'How many endings?', fontSize: 28, color: '#e8b96a', stroke: '#2a1a10', strokeW: 3, weight: 'bold' }));
  lines.push(textBlock({ x: W/2, y: 84, text: 'and how many easter eggs hidden inside', fontSize: 14, color: '#aac0d0', italic: true, stroke: '#1a1015', strokeW: 1.5, family: SANS }));

  // Equation block
  const eqX = W/2;
  let y = 130;
  const monoLine = (txt, color = '#e8dccb', size = 16) => textBlock({ x: eqX, y, text: txt, fontSize: size, color, family: MONO, stroke: 'none', strokeW: 0 });
  lines.push(`<rect x="${W/2 - 320}" y="110" width="640" height="160" rx="6" fill="rgba(20,16,30,0.78)" stroke="#4a3a30" stroke-width="1"/>`);
  lines.push(monoLine('Stairwell branching:'));                            y += 24;
  lines.push(monoLine('  4 neighbours × 2 (engage) = 8 outcomes / day', '#aac0d0', 14)); y += 22;
  lines.push(monoLine('  × 4 stairwell days        = 8⁴ = 4,096', '#aac0d0', 14)); y += 26;
  lines.push(monoLine('Ending gate (story / FAILED) × 2', '#aac0d0', 14)); y += 36;
  lines.push(textBlock({ x: eqX, y, text: '= 8,192 distinct runs', fontSize: 22, color: '#6affaa', family: MONO, weight: 'bold', stroke: '#0a0a14', strokeW: 1.5 }));

  // Easter eggs block
  y += 50;
  lines.push(textBlock({ x: W/2, y, text: 'Easter-egg scenes hidden in the game', fontSize: 16, color: '#e8b96a', italic: true, stroke: '#2a1a10', strokeW: 1.5 }));
  y += 18;
  const eggLeft = W/2 - 280;
  for (const e of eggBreakdown) {
    y += 22;
    lines.push(`<text x="${eggLeft}" y="${y}" font-family="${SANS}" font-size="14" fill="#e8dccb">${e.sym}  ${svgEscape(e.txt)}</text>`);
    lines.push(`<text x="${W/2 + 280}" y="${y}" font-family="${MONO}" font-size="14" fill="#9adfff" text-anchor="end">×${e.n}</text>`);
  }
  y += 30;
  lines.push(textBlock({ x: W/2, y, text: `1 + 1 + 5 + 1 + 1  =  ${totalEggs} easter eggs`, fontSize: 18, color: '#ffd28a', family: MONO, weight: 'bold', stroke: '#0a0a14', strokeW: 1.5 }));

  // Bottom kicker
  lines.push(textBlock({ x: W/2, y: H - 24, text: `You experienced 1 of ${totalPaths.toLocaleString()}.  Try them all?`, fontSize: 14, color: '#fff4cc', italic: true, stroke: '#2a1a10', strokeW: 1.5 }));

  const bgBuf = await sharp({
    create: { width: W, height: H, channels: 3, background: { r: 6, g: 6, b: 14 } },
  }).png().toBuffer();
  await sharp(bgBuf)
    .composite([{ input: buildSvg(W, H, lines.join('')), top: 0, left: 0 }])
    .png()
    .toFile(path.join(OUT, '06_stats.png'));
}

// ── COVER (1280×720, bilingual title kept as hook) ────────────────────────

async function makeCover() {
  const W2 = 1280, H2 = 720;
  const bg = await sharp(BG('05_alley_dusk_night_market.png'))
    .resize(W2, H2, { fit: 'cover' })
    .toBuffer();
  const body = `
    <rect width="${W2}" height="${H2}" fill="rgba(5,5,16,0.55)"/>
    <g transform="translate(${W2 / 2 + 200}, ${H2 / 2 + 120})">
      <rect x="36" y="-22" width="46" height="32" fill="#e8a040" stroke="#4a3010" stroke-width="2"/>
      <rect x="-60" y="-22" width="120" height="46" fill="#e8a040" stroke="#4a3010" stroke-width="2"/>
      <rect x="-60" y="-3" width="120" height="5" fill="#fdfcf2"/>
      <rect x="42" y="-30" width="28" height="14" fill="#9ac0d8"/>
      <circle cx="-36" cy="26" r="9" fill="#141014"/>
      <circle cx="26" cy="26" r="9" fill="#141014"/>
      <circle cx="78" cy="26" r="9" fill="#141014"/>
      <text x="36" y="-40" font-family="${SERIF}" font-size="34" fill="#fff4cc" stroke="#2a1a10" stroke-width="3" paint-order="stroke" text-anchor="middle">♪</text>
      <text x="78" y="-58" font-family="${SERIF}" font-size="24" fill="#fff4cc" stroke="#2a1a10" stroke-width="3" paint-order="stroke" text-anchor="middle">♪</text>
      <text x="106" y="-72" font-family="${SERIF}" font-size="18" fill="#fff4cc" stroke="#2a1a10" stroke-width="2" paint-order="stroke" text-anchor="middle">♪</text>
    </g>
    <text x="${W2/2}" y="${H2/2 - 60}" font-family="${SERIF}" font-size="72" font-weight="bold" fill="#e8b96a" stroke="#2a1a10" stroke-width="8" paint-order="stroke" text-anchor="middle">當機器唱起〈給愛麗絲〉</text>
    <text x="${W2/2}" y="${H2/2 + 6}" font-family="${SERIF}" font-size="32" font-weight="bold" fill="#e8b96a" stroke="#2a1a10" stroke-width="5" paint-order="stroke" text-anchor="middle">WHEN THE MACHINE SINGS</text>
    <text x="${W2/2}" y="${H2/2 + 42}" font-family="${SERIF}" font-size="20" font-style="italic" fill="#e8dccb" stroke="#1a1015" stroke-width="2" paint-order="stroke" text-anchor="middle">在台灣，當機器唱起歌，你就該跑了</text>
    <text x="${W2/2}" y="${H2/2 + 70}" font-family="${SERIF}" font-size="16" font-style="italic" fill="#aac0d0" stroke="#1a1015" stroke-width="1.5" paint-order="stroke" text-anchor="middle">In Taiwan, when the machine sings, you run.</text>
    <text x="${W2/2}" y="${H2 - 32}" font-family="${SANS}" font-size="16" fill="#8a8880" stroke="#0a0a14" stroke-width="1.5" paint-order="stroke" text-anchor="middle">Gamedev.js Jam 2026 · Theme: Machines · @k66inthesky</text>
  `;
  await sharp(bg)
    .composite([{ input: buildSvg(W2, H2, body), top: 0, left: 0 }])
    .png()
    .toFile(path.join(OUT, 'cover.png'));
}

(async () => {
  console.log('Generating itch.io art set (EN screenshots, bilingual cover)...');
  await makeApartment();  console.log('  ✓ 01_apartment.png');
  await makeStreet();     console.log('  ✓ 02_street.png');
  await makeStairwell();  console.log('  ✓ 03_stairwell.png');
  await makeResult();     console.log('  ✓ 04_result.png');
  await makeCourtroom();  console.log('  ✓ 05_courtroom.png');
  await makeStats();      console.log('  ✓ 06_stats.png');
  await makeCover();      console.log('  ✓ cover.png (1280×720)');
  console.log(`\nWrote ${path.relative(ROOT, OUT)}/`);
})().catch((e) => { console.error(e); process.exit(1); });
