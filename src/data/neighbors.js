// Stairwell neighbour pool. Four named characters, each appears exactly once
// across days 2-5 in a randomised order. Choices in the stairwell set
// registry flags that ResultScene + EndingScene read later for deferred
// consequences (mom commentary, matchmaking insert, etc.).

export const NEIGHBOR_KINDS = ['zhang', 'huang', 'chen', 'gao'];

// `forfeit: true` means saying Y to the encounter forfeits the truck for
// that day — the player skips the chase and lands straight on the result
// screen as a forced miss.
export const NEIGHBORS = {
  zhang: {
    floor: 3,
    name:    'apt.nb_zhang_name',
    opener:  'apt.nb_zhang_opener',
    yes:     'apt.nb_zhang_yes',
    no:      'apt.nb_zhang_no',
    forfeit: false,
    momLine: 'apt.mom_zhang_scold',
    bodyColor: 0xb0506a, headColor: 0xf2c79a, hatColor: 0x2a1820,
    prop: null,
  },
  huang: {
    floor: 5,
    name:    'apt.nb_huang_name',
    opener:  'apt.nb_huang_opener',
    yes:     'apt.nb_huang_yes',
    no:      'apt.nb_huang_no',
    forfeit: true,
    momLine: 'apt.mom_huang_proud',
    bodyColor: 0x6a5a4a, headColor: 0xe8b890, hatColor: 0x2a1810,
    prop: 'cane',
  },
  chen: {
    floor: 2,
    name:    'apt.nb_chen_name',
    opener:  'apt.nb_chen_opener',
    yes:     'apt.nb_chen_yes',
    no:      'apt.nb_chen_no',
    forfeit: true,
    momLine: 'apt.mom_chen_miss',
    bodyColor: 0x4a8050, headColor: 0xe8c79a, hatColor: 0x4a3018,
    prop: 'sash', // civic-leader red sash
  },
  gao: {
    floor: 4,
    name:    'apt.nb_gao_name',
    opener:  'apt.nb_gao_opener',
    yes:     'apt.nb_gao_yes',
    no:      'apt.nb_gao_no',
    forfeit: false,
    momLine: null, // matchmaking event lives in EndingScene, not result
    bodyColor: 0xe8c0d0, headColor: 0xf2d6b6, hatColor: null,
    prop: 'tote',
  },
};

export const CHEN_INFO_KEYS = [
  'apt.chen_info_1',
  'apt.chen_info_2',
  'apt.chen_info_3',
  'apt.chen_info_4',
  'apt.chen_info_5',
];

// Picks (or recalls) the week-long shuffle of D2-D5 neighbours from the
// Phaser registry, so each appears exactly once and the order survives
// scene transitions within the same run.
export function getWeekNeighborOrder(registry) {
  let order = registry.get('weekNeighborOrder');
  if (!Array.isArray(order) || order.length !== 4) {
    order = [...NEIGHBOR_KINDS];
    // Fisher-Yates shuffle.
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    registry.set('weekNeighborOrder', order);
  }
  return order;
}

export function getNeighborForDay(registry, day) {
  if (day < 2 || day > 5) return null;
  const order = getWeekNeighborOrder(registry);
  const kind = order[day - 2];
  return { kind, ...NEIGHBORS[kind] };
}

export function getChenInfoKey(registry) {
  let key = registry.get('chenInfoKeyChosen');
  if (!key) {
    key = CHEN_INFO_KEYS[Math.floor(Math.random() * CHEN_INFO_KEYS.length)];
    registry.set('chenInfoKeyChosen', key);
  }
  return key;
}
