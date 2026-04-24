// Difficulty curve across the 5-day week.
// truckArrivalTime: seconds of slack phase before the truck becomes "here"
// bagCount: how many trash bags the player needs to throw successfully to fully clear
// throwWindow: seconds of the "throw window" during the street chase (shorter = harder)
// streetSpeed: multiplier for how fast the truck drives away
// weather / flavor: affects background tint and audio noise
// notifications: count of LINE notifications that will interrupt the slack phase
//
// Mom opener text is NOT stored here any more — scenes pull it from
// I18n via key `level.day{n}_opener` so it follows the language toggle.

import I18n from '../systems/I18n.js';

export const LEVELS = [
  { day: 1, truckArrivalTime: 35, bagCount: 1, throwWindow: 2.2, streetSpeed: 1.00, weather: 'clear',       notifications: 1 },
  { day: 2, truckArrivalTime: 32, bagCount: 2, throwWindow: 1.9, streetSpeed: 1.10, weather: 'clear',       notifications: 2 },
  { day: 3, truckArrivalTime: 30, bagCount: 2, throwWindow: 1.7, streetSpeed: 1.15, weather: 'rain',        notifications: 2 },
  { day: 4, truckArrivalTime: 28, bagCount: 3, throwWindow: 1.5, streetSpeed: 1.25, weather: 'nightmarket', notifications: 3 },
  { day: 5, truckArrivalTime: 26, bagCount: 3, throwWindow: 1.4, streetSpeed: 1.40, weather: 'clear',       notifications: 3 },
];

export function getLevel(day) {
  return LEVELS.find((l) => l.day === day) || LEVELS[0];
}

export function getMomOpener(day) {
  return I18n.t(`level.day${day}_opener`);
}

export const TOTAL_DAYS = LEVELS.length;
