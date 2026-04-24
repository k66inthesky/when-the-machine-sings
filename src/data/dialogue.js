// Mom's dialogue. All text now lives in strings.js keyed by day/outcome,
// so the language toggle in TitleScene flips these automatically.

import I18n from '../systems/I18n.js';

export function getMomLine(day, outcome) {
  const key = `mom.d${day}.${outcome === 'caught' ? 'caught' : 'missed'}`;
  return `${I18n.t('mom.label')}${I18n.t(key)}`;
}

const NAG_KEYS = [
  'mom.nag1', 'mom.nag2', 'mom.nag3', 'mom.nag4',
  'mom.nag5', 'mom.nag6', 'mom.nag7',
];

export function randomNag() {
  const k = NAG_KEYS[Math.floor(Math.random() * NAG_KEYS.length)];
  return I18n.t(k);
}
