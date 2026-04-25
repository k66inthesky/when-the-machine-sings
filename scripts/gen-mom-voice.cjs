// Synthesize the mom voice clips via Microsoft Edge's free TTS API.
//
// Generates BOTH the standard per-day caught/missed lines AND the deferred
// encounter override lines (張阿姨 scold / 黃爺爺 proud / 陳奶奶 mild scold)
// in BOTH languages. ResultScene picks the file by I18n.lang at play time.
//
// Voices:
//   - zh-TW-HsiaoChenNeural — Taiwanese female; aged with -14..-22Hz pitch
//   - en-US-AmberNeural     — warm US female; aged with -10..-16Hz pitch
//                              (English voice tolerates less aggressive
//                              shifts before going synthetic)
//
// File naming:
//   mom_d{N}_{outcome}_{lang}.mp3  — per-day standard lines
//   mom_enc_{kind}_{lang}.mp3      — encounter override lines
//
// Output dir: assets/audio/voice/

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto').webcrypto;
}

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'audio', 'voice');
fs.mkdirSync(OUT, { recursive: true });

// Per-language voice + prosody envelope. The lines below pull `text` from
// the matching lang field and use these voices.
const VOICES = {
  zh: { voice: 'zh-TW-HsiaoChenNeural', basePitch: -16, baseRate: -14 },
  // en-HK-YanNeural is Hong Kong English — Asian-accented, lands closer to
  // a Taiwanese-American mom than a generic US voice. Falls back gracefully
  // if listed under a different short name.
  en: { voice: 'en-HK-YanNeural',       basePitch: -8,  baseRate: -8  },
};

// Per-day standard lines (mirror src/data/strings.js mom.d{N}.{outcome}).
// `intensity` 0-2 nudges the prosody: 0 = warm/caught, 1 = mild scold,
// 2 = full scold. Final pitch/rate = base + per-intensity offset.
const STANDARD = [
  { day: 1, outcome: 'caught',  intensity: 0,
    zh: '你看，沒那麼難吧。',
    en: 'Good. That wasn\'t so hard, was it?' },
  { day: 1, outcome: 'missed',  intensity: 1,
    zh: '才第一天？',
    en: 'Already? On day one?' },
  { day: 2, outcome: 'caught',  intensity: 0,
    zh: '表現不錯，飯快好了。',
    en: 'Nicely done. Dinner\'s almost ready.' },
  { day: 2, outcome: 'missed',  intensity: 2,
    zh: '跟你說了兩包，廚房現在都臭了。',
    en: 'I told you two bags. The kitchen smells now.' },
  { day: 3, outcome: 'caught',  intensity: 0,
    zh: '淋濕了但有趕上，去換襪子。',
    en: 'Wet, but you made it. Change your socks.' },
  { day: 3, outcome: 'missed',  intensity: 2,
    zh: '下雨，當然被你錯過了。',
    en: 'Rain. Of course you missed it when it\'s raining.' },
  { day: 4, outcome: 'caught',  intensity: 0,
    zh: '在夜市那邊還聽得到，今晚耳朵夠尖。',
    en: 'You heard it through the market. Sharp ears tonight.' },
  { day: 4, outcome: 'missed',  intensity: 1,
    zh: '只顧著看鹹酥雞排隊是不是？',
    en: 'Too busy watching the fried chicken line?' },
  { day: 5, outcome: 'caught',  intensity: 0,
    zh: '一整個禮拜，還不錯，來吃飯。',
    en: 'A whole week. Not bad. Come eat.' },
  { day: 5, outcome: 'missed',  intensity: 2,
    zh: '最後一天⋯⋯那些舊衣服我放好幾個禮拜了。',
    en: 'The last day... I had those old clothes ready for weeks.' },
];

// Encounter override lines (mirror apt.mom_*_* keys in strings.js). Played
// when the player engaged with the matching neighbour.
const ENCOUNTERS = [
  { kind: 'zhang_scold', intensity: 2,
    zh: '⋯不是叫你少跟張阿姨聊八卦嗎？',
    en: '...didn\'t I tell you to stop letting Zhang yap your ear off?' },
  { kind: 'huang_proud', intensity: 0,
    zh: '雖然垃圾車沒趕上，但黃爺爺的家人特地來道謝。媽媽以你為傲。',
    en: 'Missed the truck — but Huang\'s kids came by to thank you. Good boy.' },
  { kind: 'chen_miss',   intensity: 1,
    zh: '聽陳奶奶講話可以，但是垃圾車快來的時候不行！',
    en: 'Listening to Chen-nai-nai is fine — but not when the truck is two minutes away!' },
];

function envelope(lang, intensity) {
  const v = VOICES[lang];
  // Heavier scold → lower pitch + slower rate. Stays inside what the voice
  // can render naturally before it sounds chipmunk-inverted.
  const pitchExtra  = intensity * 2; // extra Hz down per intensity step
  const rateExtra   = intensity * 2; // extra % slowdown per step
  return {
    pitch: `${v.basePitch - pitchExtra}Hz`,
    rate:  `${v.baseRate - rateExtra}%`,
  };
}

function synth(voice, text, prosody) {
  return new Promise(async (resolve, reject) => {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text, prosody);
    const chunks = [];
    audioStream.on('data', (d) => chunks.push(d));
    audioStream.on('close', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', reject);
  });
}

async function writeClip(filename, lang, text, intensity) {
  const v = VOICES[lang];
  const env = envelope(lang, intensity);
  const buf = await synth(v.voice, text, env);
  fs.writeFileSync(path.join(OUT, filename), buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`${filename}: ${kb} KB — "${text}"`);
}

(async () => {
  for (const line of STANDARD) {
    for (const lang of ['zh', 'en']) {
      const fname = `mom_d${line.day}_${line.outcome}_${lang}.mp3`;
      await writeClip(fname, lang, line[lang], line.intensity);
    }
  }
  for (const line of ENCOUNTERS) {
    for (const lang of ['zh', 'en']) {
      const fname = `mom_enc_${line.kind}_${lang}.mp3`;
      await writeClip(fname, lang, line[lang], line.intensity);
    }
  }
  console.log('\nDone. PreloadScene will pick these up on next reload.');
})().catch((e) => { console.error(e); process.exit(1); });
