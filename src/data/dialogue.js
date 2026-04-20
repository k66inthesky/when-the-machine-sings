// Mom's reactions at the Result screen.
// Keyed by day + outcome. Outcomes: 'caught' (made the truck) or 'missed'.

export const MOM_LINES = {
  1: {
    caught: 'Mom: "Good. That wasn\'t so hard, was it?"',
    missed: 'Mom: "Already? On day one?"',
  },
  2: {
    caught: 'Mom: "Nicely done. Dinner\'s almost ready."',
    missed: 'Mom: "I told you two bags. The kitchen smells now."',
  },
  3: {
    caught: 'Mom: "Wet, but you made it. Change your socks."',
    missed: 'Mom: "Rain. Of course you missed it when it\'s raining."',
  },
  4: {
    caught: 'Mom: "You heard it through the market. Sharp ears tonight."',
    missed: 'Mom: "Too busy watching the fried chicken line?"',
  },
  5: {
    caught: 'Mom: "A whole week. Not bad. Come eat."',
    missed: 'Mom: "The last day... I had those old clothes ready for weeks."',
  },
};

export function getMomLine(day, outcome) {
  const entry = MOM_LINES[day];
  if (!entry) return 'Mom: "..."';
  return entry[outcome] || entry.missed;
}

// Flavor dialogue that appears during slack phase — mom nagging through a closed door.
export const MOM_NAGS = [
  "Mom: 'Are you on your phone again?'",
  "Mom: 'Did you tie the bag?'",
  "Mom: 'The truck never waits.'",
  "Mom: 'Put your slippers on.'",
  "Mom: 'Turn the TV down.'",
];

export function randomNag(scene) {
  return MOM_NAGS[Math.floor(Math.random() * MOM_NAGS.length)];
}
