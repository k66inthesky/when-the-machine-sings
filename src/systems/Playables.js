// Cross-host platform adapter (YouTube Playables + Wavedash).
//
// In the YT Playables container, `window.ytgame` is injected by the SDK
// loaded from index.html. On Wavedash, `window.WavedashJS` is injected by
// the Wavedash dev server / runtime. Everywhere else (itch.io, local dev)
// both stay undefined and every method here becomes a graceful no-op.
//
// This shim lets the same build ship to three platforms without branching
// scene code — the scenes just call Playables.xxx() and the adapter
// decides whether to forward to ytgame, WavedashJS, or fall through to
// localStorage.
//
// Leaderboard behaviour:
//   - Playables env → ytgame.engagement.sendScore (YT's aggregate score feed)
//   - Wavedash env  → WavedashJS.getOrCreateLeaderboard + uploadLeaderboardScore
//   - anywhere else → local-only via setBest (no global submission)
//
// Required by YT Playables certification:
//   - firstFrameReady() once a loading UI is on screen (PreloadScene)
//   - gameReady() when game is interactive (TitleScene)
//   - onPause / onResume handlers that freeze execution
//   - isAudioEnabled / onAudioEnabledChange honored for YT's mute button
//   - saveData / loadData (MUST NOT use other save paths in Playables)
//   - No Page Visibility API elsewhere in the codebase (grepped: clean)

let loadPromise = null;
let loaded = null; // cached load() result for sync access
let audioEnabledCache = true;
let wavedashLeaderboardId = null; // cached after first getOrCreateLeaderboard
const LEADERBOARD_KEY = 'wtms-weekly-best';

function inPlayables() {
  return typeof window !== 'undefined'
    && !!window.ytgame
    && window.ytgame.IN_PLAYABLES_ENV === true;
}

function available() {
  return typeof window !== 'undefined' && !!window.ytgame;
}

function wavedashAvailable() {
  return typeof window !== 'undefined' && !!window.WavedashJS;
}

export const Playables = {
  inEnv: inPlayables,

  // Call exactly once, as early as boot.
  // On itch/Wavedash this resolves instantly with a localStorage-loaded object.
  // In Playables it awaits ytgame.game.loadData() and parses the JSON blob.
  async init() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      if (inPlayables()) {
        try {
          const raw = await window.ytgame.game.loadData();
          loaded = raw ? JSON.parse(raw) : {};
        } catch (e) {
          // If parse fails we cannot silently wipe the cloud save.
          // Log and return empty; saveData will overwrite with fresh structure.
          try { window.ytgame.health.logError(); } catch (_) {}
          loaded = {};
        }
        // Prime the audio-enabled cache.
        try { audioEnabledCache = window.ytgame.system.isAudioEnabled(); }
        catch (_) { audioEnabledCache = true; }
      } else {
        // Hydrate from localStorage so the rest of the app can go through
        // one uniform save surface.
        loaded = {};
        try {
          const best = parseInt(localStorage.getItem('wtms_best') || '0', 10) || 0;
          if (best > 0) loaded.best = best;
          const raw = localStorage.getItem('wtms_progress');
          if (raw) loaded.progress = JSON.parse(raw);
        } catch (_) {}
      }
      return loaded;
    })();
    return loadPromise;
  },

  // Synchronous reads against the cached blob. Safe to call after init().
  getBest() {
    return (loaded && loaded.best) || 0;
  },
  getProgress() {
    return (loaded && loaded.progress) || null;
  },

  // Writes are async in Playables (awaiting saveData) but fire-and-forget
  // callers are fine — the cached blob is always updated synchronously,
  // so any subsequent getBest()/getProgress() sees the new value.
  async setBest(score) {
    if (!loaded) loaded = {};
    if (score > (loaded.best || 0)) {
      loaded.best = score;
      await this.persist();
    }
    return loaded.best;
  },
  async setProgress(prog) {
    if (!loaded) loaded = {};
    loaded.progress = prog;
    await this.persist();
  },
  async clearProgress() {
    if (!loaded) loaded = {};
    delete loaded.progress;
    await this.persist();
  },

  async persist() {
    if (inPlayables()) {
      try {
        await window.ytgame.game.saveData(JSON.stringify(loaded || {}));
      } catch (e) {
        try { window.ytgame.health.logError(); } catch (_) {}
      }
    } else {
      try {
        if (loaded && typeof loaded.best === 'number') {
          localStorage.setItem('wtms_best', String(loaded.best));
        }
        if (loaded && loaded.progress) {
          localStorage.setItem('wtms_progress', JSON.stringify(loaded.progress));
        } else {
          localStorage.removeItem('wtms_progress');
        }
      } catch (_) {}
    }
  },

  // Lifecycle hooks. No-op outside Playables.
  firstFrameReady() {
    if (!available()) return;
    try { window.ytgame.game.firstFrameReady(); } catch (_) {}
  },
  gameReady() {
    if (!available()) return;
    try { window.ytgame.game.gameReady(); } catch (_) {}
  },

  // Returns true when audio should play. In non-Playables env, always true
  // (we have our own M-key mute for that case).
  isAudioEnabled() {
    if (!available()) return true;
    try { return window.ytgame.system.isAudioEnabled(); }
    catch (_) { return true; }
  },

  // Subscribe to YT's audio toggle. Returns unsubscribe or a no-op.
  onAudioEnabledChange(cb) {
    if (!available()) return () => {};
    try { return window.ytgame.system.onAudioEnabledChange(cb) || (() => {}); }
    catch (_) { return () => {}; }
  },

  onPause(cb) {
    if (!available()) return () => {};
    try { return window.ytgame.system.onPause(cb) || (() => {}); }
    catch (_) { return () => {}; }
  },
  onResume(cb) {
    if (!available()) return () => {};
    try { return window.ytgame.system.onResume(cb) || (() => {}); }
    catch (_) { return () => {}; }
  },

  // Platform-aware score submission.
  //   - YT Playables: feeds ytgame.engagement.sendScore (used by YT for ranking).
  //   - Wavedash:     creates/gets a shared leaderboard and uploads keepBest=true.
  //   - anywhere else: no-op (local best is already stored via setBest).
  async sendScore(value) {
    if (available()) {
      try { await window.ytgame.engagement.sendScore({ value }); } catch (_) {}
    }
    if (wavedashAvailable()) {
      try {
        if (!wavedashLeaderboardId) {
          // 0 = sort desc (higher is better), 2 = integer format — docs default.
          const lb = await window.WavedashJS.getOrCreateLeaderboard(LEADERBOARD_KEY, 0, 2);
          wavedashLeaderboardId = lb && lb.data && lb.data.id;
        }
        if (wavedashLeaderboardId) {
          await window.WavedashJS.uploadLeaderboardScore(wavedashLeaderboardId, value, true);
        }
      } catch (_) {}
    }
  },
};

export default Playables;
