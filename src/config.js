export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const COLORS = {
  bg: 0x0a0a0f,
  dusk: 0x2a1a2a,
  warm: 0xe8b96a,
  neon: 0xff6b8a,
  text: 0xe8dccb,
  accent: 0x6acfff,
};

// Minimum week-end total to unlock the Act I–III ending. Below this, the
// player gets a "挑戰失敗" card instead. Set just below the "Got by" grade
// so a player who clears most days but slacks on one still sees the story.
export const ENDING_THRESHOLD = 500;

export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  APARTMENT: 'ApartmentScene',
  STREET: 'StreetScene',
  RESULT: 'ResultScene',
  ENDING: 'EndingScene',
  PAUSE: 'PauseScene',
  INTRO: 'IntroScene',
};
