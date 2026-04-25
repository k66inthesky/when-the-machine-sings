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
  'title.branching_teaser': {
    en: 'Each run is 1 of 8,192 paths · 9 hidden easter-egg scenes',
    zh: '每次都是 8,192 條路徑之一 · 內建 9 段隱藏彩蛋',
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
      '',
      '🎧 The melody IS the mechanic — please play with sound on.',
    ],
    zh: [
      '你必須拎著垃圾袋在巷口等，',
      '在音樂消失前把袋子交上去。',
      '',
      '錯過了 — 媽媽不會讓你忘記這件事。',
      '',
      '🎧 旋律就是核心機制 — 請開喇叭玩。',
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
  'apt.slack_label_short': {
    en: 'SLACK',
    zh: '摸魚',
  },
  'apt.both_eyes_warning': {
    en: 'You only have one pair of eyes — phone AND TV at once?',
    zh: '你只有一雙眼睛，還想著同時滑手機及看電視啊！',
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
  // Stairwell neighbours (D2-D5). Pool of 4 — order is randomised at week
  // start and stored in the registry so each appears exactly once. Each
  // encounter has an opener + a Y/N choice with consequences.
  // ── 張阿姨 (3F gossip auntie) ──
  'apt.nb_zhang_name':   { en: 'Auntie Zhang (3F)',     zh: '張阿姨（三樓）' },
  'apt.nb_zhang_opener': { en: 'Wait, wait — I have to tell you about No. 12...',
                            zh: '等等！我跟你說，十二號那家最近⋯' },
  'apt.nb_zhang_yes':    { en: 'Listen', zh: '聽她說' },
  'apt.nb_zhang_no':     { en: 'Excuse me',  zh: '先走一步' },
  // ── 黃爺爺 (5F mobility-impaired grandpa) ──
  'apt.nb_huang_name':   { en: 'Grandpa Huang (5F)',     zh: '黃爺爺（五樓）' },
  'apt.nb_huang_opener': { en: 'Sonny... could you carry this up for me?',
                            zh: '小朋友⋯這袋米可不可以幫爺爺提一下？' },
  'apt.nb_huang_yes':    { en: 'Help him', zh: '幫他提' },
  'apt.nb_huang_no':     { en: 'Sorry, in a rush',  zh: '不好意思要趕時間' },
  // ── 陳奶奶 (2F village chief grandma) ──
  'apt.nb_chen_name':    { en: 'Mrs. Chen (2F)',         zh: '里長陳奶奶（二樓）' },
  'apt.nb_chen_opener':  { en: 'Heard the latest? Come, let me tell you...',
                            zh: '欸欸欸 你聽我說喔，最近⋯' },
  'apt.nb_chen_yes':     { en: 'Listen', zh: '停下來聽' },
  'apt.nb_chen_no':      { en: 'Tomorrow!',  zh: '明天再聽' },
  // ── 高小姐 (4F neighbour, same floor as player) ──
  'apt.nb_gao_name':     { en: 'Miss Gao (4F)',         zh: '高小姐（四樓）' },
  'apt.nb_gao_opener':   { en: '(she glances over for a beat)',
                            zh: '（她朝你的方向望了一眼）' },
  'apt.nb_gao_yes':      { en: 'Say hi', zh: '打招呼' },
  'apt.nb_gao_no':       { en: 'Just a nod',  zh: '點頭走過' },
  // 陳奶奶's local-info pool — shown in her bubble after the player chooses
  // to listen. One picked at random per week.
  'apt.chen_info_1':     { en: 'They put a new CCTV at the alley mouth — finally.',
                            zh: '巷口剛裝新監視器，總算啦。' },
  'apt.chen_info_2':     { en: 'Wang-tai-tai\'s boy got into Taida — celebration Saturday.',
                            zh: '市場王太太的兒子考上台大，週六辦慶祝。' },
  'apt.chen_info_3':     { en: 'Free masks at the chief\'s office tomorrow morning.',
                            zh: '里長辦公室明天早上發口罩，記得拿。' },
  'apt.chen_info_4':     { en: 'The phoenix tree by the park is finally blooming.',
                            zh: '公園的鳳凰樹終於開花了，好看。' },
  'apt.chen_info_5':     { en: '5F Huang\'s grandkids drove down — first time in months.',
                            zh: '五樓黃爺爺的孫子下來了，幾個月不見囉。' },
  // Common UI for the encounter prompt
  'apt.nb_press_e_window': {
    en: 'press E within 2s — or just walk past',
    zh: '2 秒內按 E 互動 — 否則直接走過',
  },
  'apt.nb_walk_past':    { en: 'walked past', zh: '走過去了' },
  // Mom commentary — appended on the result screen when encounter flags set
  'apt.mom_zhang_scold': { en: '...didn\'t I tell you to stop letting Zhang yap your ear off?',
                            zh: '⋯不是叫你少跟張阿姨聊八卦嗎？' },
  'apt.mom_huang_proud': { en: 'Missed the truck — but Huang\'s kids came by to thank you. Good boy.',
                            zh: '雖然垃圾車沒趕上，但黃爺爺的家人特地來道謝。媽媽以你為傲。' },
  'apt.mom_chen_miss':   { en: 'Listening to Mrs. Chen is fine — but not when the truck is two minutes away!',
                            zh: '聽陳奶奶講話可以，但是垃圾車快來的時候不行！' },
  'apt.stairwell_caption': {
    en: 'down five flights — concrete + Für Elise echoing up',
    zh: '老公寓五樓走下去 — 給愛麗絲從樓下飄上來',
  },
  // On-screen tutorial hint shown briefly at the start of each apartment day —
  // tells the player slacking is not just allowed, it's scored.
  'apt.slack_hint': {
    en: 'Truck is far. Slack as much as you can — slacking earns points!\n(but not too low or mom won\'t let you forget it)',
    zh: '離垃圾車到還很久，請盡可能地偷懶吧！\n偷懶會計分喔，但不能太低分被媽媽念！',
  },
  // Cultural footnote shown on stairwell encounters — frames why these
  // chance meetings still happen in modern Taipei.
  'apt.stairwell_meta': {
    en: 'Urbanisation closes doors — but trash time is when neighbours nod hello.',
    zh: '都市化讓人們關起家門 — 倒垃圾時段卻成了街坊點頭打招呼閒聊之時。',
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
      'Residual value: NT$32.56 — about 1 US dollar.',
    ],
    zh: [
      '他把電鍋拿去給阿婆。阿婆很開心。',
      '殘值：新台幣 32.56 元 — 大約 1 美元。',
    ],
  },
  // 2c — sentencing
  'ending.act2c.title': { en: 'And then', zh: '然後' },
  'ending.act2c.body': {
    en: [
      'Indicted. Convicted of misappropriating recycled goods.',
      '3 months — over a NT$32 rice cooker.',
    ],
    zh: [
      '起訴。以侵占回收物判刑定讞。',
      '3 個月 — 為了一個 32 元新台幣的電鍋。',
    ],
  },
  // 2d — interview, cleaner cries
  'ending.act2d.title': { en: 'After the verdict', zh: '判決之後' },
  'ending.act2d.body': {
    en: [
      'A reporter asks Mr. Huang how he feels right now.',
      '30 years on the sanitation route. He cries.',
    ],
    zh: [
      '記者問黃姓清潔隊員，你現在的心情怎麼樣？',
      '從事清潔隊員 30 年的他，哭了。',
    ],
  },
  // 2e — netizens rally
  'ending.act2e.title': { en: 'The news breaks. The internet boils.', zh: '經新聞報導、網路發酵' },
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
  'ending.netizen_c1': { en: 'The grandma is grateful for him',          zh: '阿婆感謝有你' },
  'ending.netizen_c2': { en: 'After this, who would dare help anyone?',  zh: '這樣大家以後怎麼幫人⋯？' },
  'ending.netizen_c3': { en: '#StandWithTheCleaner',                      zh: '#力挺清潔隊員' },
  'ending.netizen_c4': { en: 'Helped a grandma — and ended up sentenced...', zh: '幫助阿婆結果搞得自己被判刑⋯' },
  'ending.netizen_c5': { en: '30 years of honest work and this is what he gets...', zh: '一生勤勤業業工作 30 年結果⋯' },
  // 2f — judges/prosecutors moved, leniency
  'ending.act2f.title': { en: 'The scales', zh: '天平' },
  'ending.act2f.body': {
    en: [
      'Judges and prosecutors are moved by the response.',
      'The sentence is reduced — 3 months, suspended for 2 years.',
    ],
    zh: [
      '法官、檢察官也被輿論打動。',
      '從輕量刑 — 3 個月有期徒刑，緩刑 2 年。',
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
    en: 'Act III — Sun After Rain',
    zh: '第三幕 — 雨後天晴',
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
      '今天早上，機器依然在跑這路線，',
      '它依然在唱歌。',
      '',
      '謝謝他們。',
    ],
  },
  // Optional matchmaking insert — only shown if the player greeted 高小姐
  // in the stairwell sometime that week.
  'ending.gao.title': { en: 'A side note from Mom', zh: '媽媽順便講一件事' },
  'ending.gao.body': {
    en: [
      'Miss Gao\'s mom said she really likes you.',
      'Mom and her have been talking — they want to set you two up.',
      '',
      'You. Just. Stare.',
    ],
    zh: [
      '高小姐的媽媽說她很喜歡你。',
      '媽媽跟她最近在聊，說想把你們湊成一對。',
      '',
      '你⋯傻眼。',
    ],
  },
  'ending.credits.title': {
    en: 'Credits',
    zh: '製作名單',
  },
  'ending.credits.body': {
    en: [
      'Author: k66 (X: @k66inthesky)',
      'Gamedev.js Jam 2026 — Theme: Machines',
      '',
      'Music inspired by "Für Elise" — Ludwig van Beethoven',
      'Based on real Taipei news, 2024–2026',
      '',
      'Made with Phaser 3, Vite, WebAudio, and a lot of coffee.',
      'Have you ever chased a garbage truck? Hope you enjoyed the story.',
    ],
    zh: [
      '作者：k66（X: @k66inthesky）',
      'Gamedev.js Jam 2026 — 主題：機器',
      '',
      '音樂靈感來自〈給愛麗絲〉 — 貝多芬',
      '取自台北市 2024–2026 年真實新聞',
      '',
      '用 Phaser 3、Vite、WebAudio 與大量咖啡製作。',
      '大家有追過垃圾車嗎？希望你們會喜歡這個故事。',
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

  // ── Fail card (week below ending threshold) ────────────────────────────────
  'fail.title': {
    en: 'CHALLENGE FAILED',
    zh: '挑戰失敗',
  },
  'fail.body': {
    en: [
      'Your week ended at {s} points.',
      'Reach at least {t} to see the rest of the story.',
      '',
      'The route still rolls without you.',
    ],
    zh: [
      '你這週的分數：{s} 分。',
      '至少要達到 {t} 才能看完故事。',
      '',
      '路線照樣跑，少了你也沒差。',
    ],
  },
  'fail.prompt': {
    en: '[ SPACE — back to title ]',
    zh: '[ SPACE — 回到標題重來 ]',
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
