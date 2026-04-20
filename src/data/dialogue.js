// Mom's dialogue. English primary (jam submission default language),
// 中文 subtitle for authenticity on Taiwan setting.

export const MOM_LINES = {
  1: {
    caught: ['"Good. That wasn\'t so hard, was it?"', '「你看，沒那麼難吧。」'],
    missed: ['"Already? On day one?"', '「才第一天？」'],
  },
  2: {
    caught: ['"Nicely done. Dinner\'s almost ready."', '「表現不錯，飯快好了。」'],
    missed: ['"I told you two bags. The kitchen smells now."', '「跟你說了兩包，廚房現在都臭了。」'],
  },
  3: {
    caught: ['"Wet, but you made it. Change your socks."', '「淋濕了但有趕上，去換襪子。」'],
    missed: ['"Rain. Of course you missed it when it\'s raining."', '「下雨，當然被你錯過了。」'],
  },
  4: {
    caught: ['"You heard it through the market. Sharp ears tonight."', '「在夜市那邊還聽得到，今晚耳朵夠尖。」'],
    missed: ['"Too busy watching the fried chicken line?"', '「只顧著看鹹酥雞排隊是不是？」'],
  },
  5: {
    caught: ['"A whole week. Not bad. Come eat."', '「一整個禮拜，還不錯，來吃飯。」'],
    missed: ['"The last day... I had those old clothes ready for weeks."', '「最後一天⋯⋯那些舊衣服我放好幾個禮拜了。」'],
  },
};

export function getMomLine(day, outcome) {
  const entry = MOM_LINES[day];
  if (!entry) return 'Mom: "..."';
  const pair = entry[outcome] || entry.missed;
  return `Mom: ${pair[0]}\n${pair[1]}`;
}

// Ambient nag lines — truncated, mom shouting through the door.
export const MOM_NAGS = [
  ['"Are you on your phone again?"', '「又在滑手機？」'],
  ['"Did you tie the bag?"', '「垃圾袋綁了沒？」'],
  ['"The truck never waits."', '「垃圾車不等人喔。」'],
  ['"Put your slippers on."', '「拖鞋穿好。」'],
  ['"Turn the TV down."', '「電視轉小聲。」'],
  ['"Did you take out the recycling too?"', '「資源回收也要一起拿下去。」'],
  ['"Your father never missed it."', '「你爸從來沒錯過。」'],
];

export function randomNag() {
  const pair = MOM_NAGS[Math.floor(Math.random() * MOM_NAGS.length)];
  return `${pair[0]}\n${pair[1]}`;
}
