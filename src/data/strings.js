// All user-visible UI strings, keyed. { en, zh } per entry.
// Placeholder interpolation uses {name} — I18n.t('key', { name: value }) fills them.
// Arrays (for multi-line bodies) are accessed via I18n.tArray('key').

export const STRINGS = {
  // ── Title ──────────────────────────────────────────────────────────────────
  'title.main': {
    en: 'WHEN THE MACHINE SINGS',
    zh: '當機器唱起〈給愛麗絲〉',
  },
  'title.subtitle': {
    en: 'In Taiwan, when the machine sings, you run.',
    zh: '在台灣，當機器唱起歌，你就該跑了',
  },
  'title.prompt': {
    en: '[ Press SPACE to start ]',
    zh: '[ 按 SPACE 開始 ]',
  },
  'title.credit_jam': {
    en: 'Gamedev.js Jam 2026 — Theme: Machines',
    zh: 'Gamedev.js Jam 2026 — 主題：機器',
  },
  'title.credit_dedication': {
    en: 'Dedicated to the sanitation workers of Taiwan',
    zh: '獻給台灣的清潔隊員',
  },
  'title.best': {
    en: 'Best: {n}',
    zh: '最高分：{n}',
  },
  'title.resume': {
    en: '[ R — resume Day {day} ({score} pts) ]',
    zh: '[ R — 繼續第 {day} 天 ({score} 分) ]',
  },
  // Language toggle button — each label advertises the language you'd switch TO.
  'title.lang_to_en': {
    en: 'EN',
    zh: 'EN',
  },
  'title.lang_to_zh': {
    en: '中文',
    zh: '中文',
  },

  // ── Intro slides ───────────────────────────────────────────────────────────
  'intro.slide1': {
    en: [
      'In Taiwan, the garbage trucks sing.',
      'Every evening, they play "Für Elise" through rooftop speakers',
      'as they crawl through the alleys.',
    ],
    zh: [
      '在台灣，垃圾車會唱歌。',
      '每天傍晚，它們一邊在巷子裡慢慢開，',
      '一邊從車頂喇叭播〈給愛麗絲〉。',
    ],
  },
  'intro.slide2': {
    en: [
      'You have to meet them on the street,',
      'bag in hand, before the music fades.',
      '',
      'Miss it, and your mother will not let you forget.',
    ],
    zh: [
      '你必須拎著垃圾袋在巷口等，',
      '在音樂消失前把袋子交上去。',
      '',
      '錯過了 — 媽媽不會讓你忘記這件事。',
    ],
  },
  'intro.continue': {
    en: '[ SPACE — continue ]',
    zh: '[ SPACE — 繼續 ]',
  },
  'intro.begin': {
    en: '[ SPACE — begin Day 1 ]',
    zh: '[ SPACE — 開始第一天 ]',
  },

  // ── Preload ────────────────────────────────────────────────────────────────
  'preload.loading': {
    en: 'Loading...',
    zh: '載入中⋯',
  },

  // ── Apartment scene ────────────────────────────────────────────────────────
  'apt.day_card': {
    en: 'Day {day}',
    zh: '第 {day} 天',
  },
  'apt.day_label': {
    en: 'Day {day} / 5',
    zh: '第 {day} / 5 天',
  },
  'apt.slack_label': {
    en: 'Slack: {n}',
    zh: '摸魚：{n}',
  },
  'apt.truck_label': {
    en: 'Truck: {status}',
    zh: '垃圾車：{status}',
  },
  'apt.truck_distant':     { en: 'distant',          zh: '還遠' },
  'apt.truck_approaching': { en: 'approaching',      zh: '接近中' },
  'apt.truck_nearby':      { en: 'nearby — hurry',   zh: '快到了 — 快點' },
  'apt.truck_outside':     { en: 'right outside',    zh: '就在門外' },
  'apt.truck_arrived':     { en: 'ARRIVED — GO NOW', zh: '到了 — 快出門' },
  'apt.hint': {
    en: 'E: phone   T: TV   ENTER: go downstairs   ESC: pause   M: mute',
    zh: 'E: 手機   T: 電視   ENTER: 下樓   ESC: 暫停   M: 靜音',
  },
  'apt.btn_phone': { en: 'Phone\nE',   zh: '手機\nE' },
  'apt.btn_tv':    { en: 'TV\nT',      zh: '電視\nT' },
  'apt.btn_go':    { en: 'Go →\nENTER', zh: '下樓 →\nENTER' },
  // Phone/TV/stairwell overlay flavor
  'apt.tv_news_head':    { en: 'BREAKING NEWS', zh: '即時新聞' },
  'apt.tv_news_ticker':  { en: 'Recycling truck schedule shifts again — full list at 8',
                           zh: '北市垃圾車路線又調整 — 詳細時刻晚間八點公布' },
  'apt.tv_weather_head': { en: 'Tonight: muggy', zh: '今晚：悶熱' },
  'apt.tv_weather_sub':  { en: 'Light shower after midnight', zh: '半夜過後可能短暫陣雨' },
  'apt.stairwell_caption': {
    en: 'down five flights — concrete + Für Elise echoing up',
    zh: '老公寓五樓走下去 — 給愛麗絲從樓下飄上來',
  },

  // ── Street scene ───────────────────────────────────────────────────────────
  'street.day_label': {
    en: 'Day {day} — chase',
    zh: '第 {day} 天 — 追車',
  },
  'street.bags_label': {
    en: 'Bags: {hit} / {total}',
    zh: '垃圾袋：{hit} / {total}',
  },
  'street.hint': {
    en: '← → move · SPACE throw · ESC pause · M mute',
    zh: '← → 移動 · SPACE 丟 · ESC 暫停 · M 靜音',
  },
  'street.btn_throw': { en: 'Throw\nSPACE', zh: '丟袋\nSPACE' },
  'street.go':   { en: 'GO!',    zh: '衝！' },
  'street.hit':  { en: '+HIT',   zh: '+ 命中' },
  'street.miss': { en: 'miss',   zh: '沒中' },
  // D1 — full controls primer; D2-D5 — one-line tip on what changed today.
  'street.tut_d1_title': { en: 'Catch the truck!', zh: '追上垃圾車！' },
  'street.tut_d1_body': {
    en: '← / →   move toward the truck\nSPACE   throw a bag when close\nGreen bar = throw NOW',
    zh: '← / →   左右移動追車\nSPACE   靠近時丟出垃圾袋\n綠色條亮起就是出手時機',
  },
  'street.tut_d2_title': { en: 'Two bags tonight', zh: '今晚兩包' },
  'street.tut_d2_body': {
    en: 'You have to land 2 throws now.\nThe truck doesn\'t wait twice.',
    zh: '今天要丟中兩袋。\n垃圾車不會等你第二次。',
  },
  'street.tut_d3_title': { en: 'Wet roads', zh: '下雨了' },
  'street.tut_d3_body': {
    en: 'Rain narrows the throw window.\nAim earlier — the truck slips faster.',
    zh: '雨夜手感比較滑，丟早一點。\n垃圾車跑起來更快。',
  },
  'street.tut_d4_title': { en: 'Night market crowd', zh: '夜市人潮' },
  'street.tut_d4_body': {
    en: 'Three bags. People will block your view.\nListen for the music between stalls.',
    zh: '三包。攤位人潮會擋視線。\n用聽的找垃圾車的位置。',
  },
  'street.tut_d5_title': { en: 'Last night', zh: '最後一晚' },
  'street.tut_d5_body': {
    en: 'Three bags, fastest truck of the week.\nMom is waiting — make it count.',
    zh: '三包，這禮拜跑最快的一晚。\n媽媽在等 — 別搞砸了。',
  },
  'street.tut_dismiss': {
    en: 'press any key to start',
    zh: '按任意鍵開始',
  },
  'street.cue_close': { en: 'CLOSE', zh: '靠近了' },
  'street.cue_now':   { en: 'SPACE!', zh: '丟！SPACE' },

  // ── Result scene ───────────────────────────────────────────────────────────
  'result.header': {
    en: 'Day {day} — Result',
    zh: '第 {day} 天 — 結算',
  },
  'result.slack': {
    en: 'Slack points : {n} × 5 = {s}',
    zh: '摸魚得分 : {n} × 5 = {s}',
  },
  'result.bags': {
    en: 'Bags thrown  : {h} / {t} × 100 = {s}',
    zh: '丟袋得分 : {h} / {t} × 100 = {s}',
  },
  'result.full_clear': {
    en: 'Full clear bonus : +{s}',
    zh: '完美清袋加成 : +{s}',
  },
  'result.missed': {
    en: 'Missed the truck : {s}',
    zh: '沒趕上垃圾車 : {s}',
  },
  'result.forced': {
    en: 'Ran out too late : {s}',
    zh: '太晚出門 : {s}',
  },
  'result.day_total': {
    en: 'Day {d} total : {s}',
    zh: '第 {d} 天小計 : {s}',
  },
  'result.week_total': {
    en: 'Week running total : {s}',
    zh: '本週累計 : {s}',
  },
  'result.next_day': {
    en: '[ SPACE — next day ]',
    zh: '[ SPACE — 下一天 ]',
  },
  'result.next_depot': {
    en: '[ SPACE — continue to the depot ]',
    zh: '[ SPACE — 前往垃圾場 ]',
  },

  // ── Ending scene ───────────────────────────────────────────────────────────
  'ending.act1.title': {
    en: 'Act I — The Machine Goes Home',
    zh: '第一幕 — 機器回家',
  },
  'ending.act1.body': {
    en: [
      'After the last stop, you follow the truck.',
      'The cleaner has been on this route for thirty years.',
      'He knows which grandma waits where, which bag is heavier than it looks.',
    ],
    zh: [
      '最後一站收完，你跟著垃圾車走。',
      '這位清潔隊員，已經跑這條路線三十年。',
      '他知道哪位阿嬤在哪等，哪一包看起來輕、其實很重。',
    ],
  },
  'ending.act2.title': {
    en: 'Act II — Taipei, July 2024',
    zh: '第二幕 — 台北，2024 年 7 月',
  },
  // The original Act II text card is now broken into 7 vignettes (a–g).
  // 2a — depot, finds rice cooker, remembers grandma he passes on the route
  'ending.act2a.body': {
    en: [
      'Sorting at the depot. A rice cooker — still works.',
      'He thinks of the old scavenger lady he passes every dusk.',
    ],
    zh: [
      '在資源回收場分類。一個電鍋 — 還能用。',
      '他想起每天傍晚路過的那位拾荒阿嬤。',
    ],
  },
  // 2b — handover
  'ending.act2b.title': { en: 'A small kindness', zh: '小小的好意' },
  'ending.act2b.body': {
    en: [
      'He brings it to her. She is overjoyed.',
      'Residual value: NT$32.56 — about one US dollar.',
    ],
    zh: [
      '他把電鍋拿去給阿婆。阿婆很開心。',
      '殘值：新台幣 32.56 元 — 大約一美元。',
    ],
  },
  // 2c — sentencing
  'ending.act2c.title': { en: 'And then', zh: '然後' },
  'ending.act2c.body': {
    en: [
      'Indicted. Convicted of misappropriating recycled goods.',
      'Three months — over a thirty-two NT$ rice cooker.',
    ],
    zh: [
      '起訴。以侵占回收物判刑定讞。',
      '三個月 — 為了一個三十二塊錢的電鍋。',
    ],
  },
  // 2d — interview, cleaner cries
  'ending.act2d.title': { en: 'After the verdict', zh: '判決之後' },
  'ending.act2d.body': {
    en: [
      'On the courthouse steps, the cameras find him.',
      'Thirty years on the route. He cries.',
    ],
    zh: [
      '在法院門口，記者圍上來。',
      '在這行三十年。他哭了。',
    ],
  },
  // 2e — netizens rally
  'ending.act2e.title': { en: 'The internet sees it', zh: '網路看見了' },
  'ending.act2e.body': {
    en: [
      'Comments pour in. Strangers send him support.',
      'A petition gathers signatures overnight.',
    ],
    zh: [
      '留言湧進。陌生人給他打氣。',
      '聲援連署一夜之間累積上千。',
    ],
  },
  'ending.netizen_c1': { en: 'You did nothing wrong', zh: '你沒有錯' },
  'ending.netizen_c2': { en: 'Helping people is not a crime', zh: '幫助別人不是罪' },
  'ending.netizen_c3': { en: '#StandWithTheCleaner', zh: '#力挺清潔隊員' },
  'ending.netizen_c4': { en: '32 dollars over a person?', zh: '三十二塊比人重要？' },
  'ending.netizen_c5': { en: 'Thank you for thirty years', zh: '謝謝你三十年' },
  // 2f — judges/prosecutors moved, leniency
  'ending.act2f.title': { en: 'A weighing', zh: '衡量' },
  'ending.act2f.body': {
    en: [
      'Judges and prosecutors are moved by the response.',
      'The sentence is reduced — three months, suspended two years.',
    ],
    zh: [
      '法官、檢察官也被輿論打動。',
      '從輕量刑 — 三個月有期徒刑，緩刑兩年。',
    ],
  },
  // 2g — interview again, "still would help"
  'ending.act2g.title': { en: 'Asked again', zh: '再被問起' },
  'ending.act2g.body': {
    en: [
      'A reporter: "After all this — would you still help others?"',
      '"…I think I still would."',
    ],
    zh: [
      '記者：「這次事件後，你還願不願意幫助他人？」',
      '「…還是會吧。」',
    ],
  },
  'ending.stamp_guilty': { en: 'GUILTY', zh: '有罪' },
  'ending.act3.title': {
    en: 'Act III — And Yet',
    zh: '第三幕 — 然而',
  },
  'ending.act3.body': {
    en: [
      'Ministry of Justice began drafting amendments.',
      'The Supreme Prosecutor issued a notice:',
      '"Weigh the law, the reason, and the heart."',
      '',
      'He is still on the route this morning.',
      'The machine is still singing.',
      '',
      'Thank them.',
    ],
    zh: [
      '法務部已著手研擬修正條文。',
      '最高檢察署發函：',
      '「衡情、衡理、衡法。」',
      '',
      '今天早上，他依然在跑這條路線。',
      '機器依然在唱歌。',
      '',
      '謝謝他們。',
    ],
  },
  'ending.credits.title': {
    en: 'Credits',
    zh: '製作名單',
  },
  'ending.credits.body': {
    en: [
      'A game by k66 — Gamedev.js Jam 2026',
      'Theme: Machines',
      '',
      'Music inspired by "Für Elise" — Ludwig van Beethoven',
      'Narrative drawn from Taiwan case coverage, 2024–2025',
      '',
      'Made with Phaser 3, Vite, WebAudio, and a lot of coffee.',
      '獻給所有在傍晚跑過巷子的人。',
    ],
    zh: [
      '一款 k66 的遊戲 — Gamedev.js Jam 2026',
      '主題：機器',
      '',
      '音樂靈感來自〈給愛麗絲〉 — 貝多芬',
      '故事取材自 2024–2025 年台灣新聞報導',
      '',
      '用 Phaser 3、Vite、WebAudio 與大量咖啡製作。',
      '獻給所有在傍晚跑過巷子的人。',
    ],
  },
  'ending.grade_perfect':  { en: 'Perfect week',   zh: '滿分的一週' },
  'ending.grade_good':     { en: 'Good kid',       zh: '乖孩子' },
  'ending.grade_by':       { en: 'Got by',         zh: '勉強過關' },
  'ending.grade_slack':    { en: 'The slack one',  zh: '廢柴青年' },
  'ending.grade_disaster': { en: 'Disaster week',  zh: '慘淡的一週' },
  'ending.score_best': {
    en: 'Your week: {s}   •   Best: {b}',
    zh: '本週：{s}   •   最高：{b}',
  },
  'ending.score_new_best': {
    en: 'Your week: {s}   •   New best!',
    zh: '本週：{s}   •   新紀錄！',
  },
  'ending.prompt_continue': {
    en: '[ SPACE to continue ]',
    zh: '[ SPACE — 繼續 ]',
  },
  'ending.prompt_return': {
    en: '[ SPACE to return to title ]',
    zh: '[ SPACE — 回到標題 ]',
  },

  // ── Pause scene ────────────────────────────────────────────────────────────
  'pause.title': {
    en: 'PAUSED',
    zh: '暫停中',
  },
  'pause.hint': {
    en: 'ESC: resume',
    zh: 'ESC 繼續',
  },

  // ── Global HUD ─────────────────────────────────────────────────────────────
  'hud.muted': { en: '♪ muted', zh: '♪ 靜音' },
  'hud.on':    { en: '♪ on',    zh: '♪ 開啟' },

  // ── Day openers (shown at Apartment scene top) ────────────────────────────
  'level.day1_opener': {
    en: 'Day 1. Mom: "Don\'t miss the truck tonight."',
    zh: '第一天。媽：「今晚垃圾車不要錯過。」',
  },
  'level.day2_opener': {
    en: 'Day 2. Mom: "Two bags. Don\'t forget the kitchen trash."',
    zh: '第二天。媽：「兩包喔，廚餘不要忘記。」',
  },
  'level.day3_opener': {
    en: 'Day 3. It\'s raining. Mom: "Take the umbrella. Hurry."',
    zh: '第三天，下雨。媽：「帶把傘，快點去。」',
  },
  'level.day4_opener': {
    en: 'Day 4. Mom: "Night market is loud tonight. Listen carefully."',
    zh: '第四天。媽：「今晚夜市很吵，耳朵放好。」',
  },
  'level.day5_opener': {
    en: 'Day 5. Mom: "One last bag, some old clothes. Please."',
    zh: '第五天。媽：「最後一包，一些舊衣服，拜託你。」',
  },

  // ── Mom lines per day/outcome — quoted speech (ResultScene prepends "Mom:")
  'mom.d1.caught': { en: '"Good. That wasn\'t so hard, was it?"',  zh: '「你看，沒那麼難吧。」' },
  'mom.d1.missed': { en: '"Already? On day one?"',                  zh: '「才第一天？」' },
  'mom.d2.caught': { en: '"Nicely done. Dinner\'s almost ready."',  zh: '「表現不錯，飯快好了。」' },
  'mom.d2.missed': { en: '"I told you two bags. The kitchen smells now."', zh: '「跟你說了兩包，廚房現在都臭了。」' },
  'mom.d3.caught': { en: '"Wet, but you made it. Change your socks."', zh: '「淋濕了但有趕上，去換襪子。」' },
  'mom.d3.missed': { en: '"Rain. Of course you missed it when it\'s raining."', zh: '「下雨，當然被你錯過了。」' },
  'mom.d4.caught': { en: '"You heard it through the market. Sharp ears tonight."', zh: '「在夜市那邊還聽得到，今晚耳朵夠尖。」' },
  'mom.d4.missed': { en: '"Too busy watching the fried chicken line?"', zh: '「只顧著看鹹酥雞排隊是不是？」' },
  'mom.d5.caught': { en: '"A whole week. Not bad. Come eat."', zh: '「一整個禮拜，還不錯，來吃飯。」' },
  'mom.d5.missed': { en: '"The last day... I had those old clothes ready for weeks."', zh: '「最後一天⋯⋯那些舊衣服我放好幾個禮拜了。」' },

  'mom.label': { en: 'Mom: ', zh: '媽：' },

  // ── Mom ambient nag popups ────────────────────────────────────────────────
  'mom.nag1': { en: '"Are you on your phone again?"',            zh: '「又在滑手機？」' },
  'mom.nag2': { en: '"Did you tie the bag?"',                    zh: '「垃圾袋綁了沒？」' },
  'mom.nag3': { en: '"The truck never waits."',                  zh: '「垃圾車不等人喔。」' },
  'mom.nag4': { en: '"Put your slippers on."',                   zh: '「拖鞋穿好。」' },
  'mom.nag5': { en: '"Turn the TV down."',                       zh: '「電視轉小聲。」' },
  'mom.nag6': { en: '"Did you take out the recycling too?"',     zh: '「資源回收也要一起拿下去。」' },
  'mom.nag7': { en: '"Your father never missed it."',            zh: '「你爸從來沒錯過。」' },
};
