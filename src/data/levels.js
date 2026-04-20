// Difficulty curve across the 5-day week.
// truckArrivalTime: seconds of slack phase before the truck becomes "here"
// bagCount: how many trash bags the player needs to throw successfully to fully clear
// throwWindow: seconds of the "throw window" during the street chase (shorter = harder)
// streetSpeed: multiplier for how fast the truck drives away
// weather / flavor: affects background tint and audio noise
// notifications: count of LINE notifications that will interrupt the slack phase

export const LEVELS = [
  {
    day: 1,
    truckArrivalTime: 35,
    bagCount: 1,
    throwWindow: 2.2,
    streetSpeed: 1.0,
    weather: 'clear',
    notifications: 1,
    momOpener: "Day 1. Mom: \"Don't miss the truck tonight.\"\n第一天。媽:「今晚垃圾車不要錯過。」",
  },
  {
    day: 2,
    truckArrivalTime: 32,
    bagCount: 2,
    throwWindow: 1.9,
    streetSpeed: 1.1,
    weather: 'clear',
    notifications: 2,
    momOpener: "Day 2. Mom: \"Two bags. Don't forget the kitchen trash.\"\n第二天。媽:「兩包喔,廚餘不要忘記。」",
  },
  {
    day: 3,
    truckArrivalTime: 30,
    bagCount: 2,
    throwWindow: 1.7,
    streetSpeed: 1.15,
    weather: 'rain',
    notifications: 2,
    momOpener: "Day 3. It's raining. Mom: \"Take the umbrella. Hurry.\"\n第三天,下雨。媽:「帶把傘,快點去。」",
  },
  {
    day: 4,
    truckArrivalTime: 28,
    bagCount: 3,
    throwWindow: 1.5,
    streetSpeed: 1.25,
    weather: 'nightmarket',
    notifications: 3,
    momOpener: "Day 4. Mom: \"Night market is loud tonight. Listen carefully.\"\n第四天。媽:「今晚夜市很吵,耳朵放好。」",
  },
  {
    day: 5,
    truckArrivalTime: 26,
    bagCount: 3,
    throwWindow: 1.4,
    streetSpeed: 1.4,
    weather: 'clear',
    notifications: 3,
    momOpener: "Day 5. Mom: \"One last bag, some old clothes. Please.\"\n第五天。媽:「最後一包,一些舊衣服,拜託你。」",
  },
];

export function getLevel(day) {
  return LEVELS.find((l) => l.day === day) || LEVELS[0];
}

export const TOTAL_DAYS = LEVELS.length;
