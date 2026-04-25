// Synthesize the 10 mom voice clips listed in
// assets/audio/voice/RECORDING_SCRIPT.md via Microsoft Edge's free TTS API.
//
// Voice: zh-TW-HsiaoChenNeural with aggressive pitch-drop + rate-slowdown to
// age the speaker into a 60s+ Taiwanese mom range. Earlier passes (-2Hz to
// -10Hz) still sounded twentysomething; the new floor (-14Hz to -22Hz) plus
// -14% to -22% rate puts her firmly in 阿姨/媽媽 territory.
// "missed" runs lean scoldy; "caught" runs play it warmer.
//
// Output: assets/audio/voice/mom_d{D}_{outcome}.mp3, ready for PreloadScene.

// Node 18 doesn't expose `crypto` as a global; msedge-tts needs it for the
// Sec-MS-GEC token. Polyfill before requiring the module.
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto').webcrypto;
}

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'audio', 'voice');
fs.mkdirSync(OUT, { recursive: true });

// Lines mirror RECORDING_SCRIPT.md verbatim. "missed" runs lean scoldy; "caught"
// runs lean warmer. Prosody nudges sell that without a real voice actor.
const LINES = [
  { day: 1, outcome: 'caught',  text: '你看，沒那麼難吧。',                        rate: '-14%', pitch: '-16Hz' },
  { day: 1, outcome: 'missed',  text: '才第一天？',                                 rate: '-16%', pitch: '-18Hz' },
  { day: 2, outcome: 'caught',  text: '表現不錯，飯快好了。',                       rate: '-14%', pitch: '-16Hz' },
  { day: 2, outcome: 'missed',  text: '跟你說了兩包，廚房現在都臭了。',             rate: '-18%', pitch: '-20Hz' },
  { day: 3, outcome: 'caught',  text: '淋濕了但有趕上，去換襪子。',                 rate: '-14%', pitch: '-16Hz' },
  { day: 3, outcome: 'missed',  text: '下雨，當然被你錯過了。',                     rate: '-18%', pitch: '-20Hz' },
  { day: 4, outcome: 'caught',  text: '在夜市那邊還聽得到，今晚耳朵夠尖。',         rate: '-14%', pitch: '-16Hz' },
  { day: 4, outcome: 'missed',  text: '只顧著看鹹酥雞排隊是不是？',                 rate: '-16%', pitch: '-20Hz' },
  { day: 5, outcome: 'caught',  text: '一整個禮拜，還不錯，來吃飯。',               rate: '-14%', pitch: '-16Hz' },
  { day: 5, outcome: 'missed',  text: '最後一天⋯⋯那些舊衣服我放好幾個禮拜了。',    rate: '-20%', pitch: '-22Hz' },
];

function synth(line) {
  return new Promise(async (resolve, reject) => {
    const tts = new MsEdgeTTS();
    await tts.setMetadata('zh-TW-HsiaoChenNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(line.text, { rate: line.rate, pitch: line.pitch });
    const chunks = [];
    audioStream.on('data', (d) => chunks.push(d));
    audioStream.on('close', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', reject);
  });
}

(async () => {
  for (const line of LINES) {
    const fname = `mom_d${line.day}_${line.outcome}.mp3`;
    const final = path.join(OUT, fname);
    const buf = await synth(line);
    fs.writeFileSync(final, buf);
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`${fname}: ${kb} KB — "${line.text}"`);
  }
  console.log('\nDone. PreloadScene will auto-pick these up on next reload.');
})().catch((e) => { console.error(e); process.exit(1); });
