// I18n — minimal runtime language switcher.
//
// Two languages: 'en' (default, jam-submission spec) and 'zh' (繁體中文).
// One global singleton so any scene can call I18n.t('key'). A TitleScene
// toggle flips the language and re-renders the title; later scenes pick
// up the new value on entry via I18n.lang.
//
// Persistence: localStorage first (works everywhere), mirrored into the
// Playables save blob (loaded.lang) so YT cloud saves carry language
// preference across devices. Auto-detect from navigator.language on the
// very first run.

import { STRINGS } from '../data/strings.js';

const STORAGE_KEY = 'wtms_lang';
const SUPPORTED = ['en', 'zh'];
const FALLBACK = 'en';

function detectDefault() {
  try {
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
  } catch (_) {}
  return FALLBACK;
}

function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
}

let current = FALLBACK;
let initialized = false;
const listeners = new Set();

export const I18n = {
  get lang() { return current; },

  init(persistedLang) {
    if (initialized) return current;
    initialized = true;
    let chosen = null;
    if (persistedLang && SUPPORTED.includes(persistedLang)) {
      chosen = persistedLang;
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED.includes(stored)) chosen = stored;
      } catch (_) {}
    }
    current = chosen || detectDefault();
    return current;
  },

  setLang(lang) {
    if (!SUPPORTED.includes(lang)) return current;
    if (lang === current) return current;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    listeners.forEach((cb) => { try { cb(current); } catch (_) {} });
    return current;
  },

  toggle() {
    return this.setLang(current === 'en' ? 'zh' : 'en');
  },

  // key lookup with optional {placeholder} interpolation.
  // Always returns a string — falls back to English, then to the raw key
  // if the string is missing entirely (so a typo surfaces as the key on
  // screen instead of an empty box).
  t(key, params) {
    const entry = STRINGS[key];
    if (!entry) return key;
    const v = entry[current] ?? entry[FALLBACK] ?? key;
    return typeof v === 'string' ? interpolate(v, params) : v;
  },

  // Returns an array (for multi-line bodies stored as arrays). Falls back
  // to English array if the current-lang array is missing.
  tArray(key) {
    const entry = STRINGS[key];
    if (!entry) return [key];
    const v = entry[current] ?? entry[FALLBACK];
    return Array.isArray(v) ? v : [String(v ?? key)];
  },

  onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

export default I18n;
