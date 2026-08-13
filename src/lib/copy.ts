/**
 * Every user-facing string, in one place.
 *
 * The site ships Mongolian only. Components import `t` and never inline copy,
 * so adding English later means adding a second dictionary of the same shape
 * and a locale switch — no component edits.
 */
export const t = {
  /*
   * "MAISON" — French for house, in the sense an auction house or a fashion
   * house is one. Left in Latin script on purpose: against a page of Cyrillic it
   * reads as a mark rather than as a word, which is what a wordmark wants.
   *
   * It replaces the placeholder "ХУДАЛДАА", which was just the dictionary word
   * for "trade" — fine as scaffolding, but not a name a house can be known by.
   *
   * Renaming the house is these three lines and nothing else: every surface
   * reads brand.name and brand.mark from here.
   */
  brand: {
    name: "MAISON",
    mark: "M",
    tagline: "Дуудлага худалдааны танхим",
  },

  nav: {
    lots: "Лотууд",
    rules: "Журам",
    about: "Бидний тухай",
    back: "Буцах",
    schedule: "Хөтөлбөр",
    enter: "Нэвтрэх",
    register: "Бүртгүүлэх",
    menu: "Цэс",
    close: "Хаах",
  },

  theme: {
    label: "Өнгөний загвар",
    system: "Системийн загвар",
    light: "Цайвар",
    dark: "Бараан",
  },

  home: {
    eyebrow: "Зургаан тойрог · 2 цаг 45 минут",
    headline: ["Хугацаа", "хумигдана."],
    lede: "Тойрог давах тусам үнэ хаях хугацаа 5 минутаас 5 секунд болж хумирна. Хамгийн тэвчээртэй нь бус, хамгийн шийдэмгий нь цохино.",
    ctaPrimary: "Танхимд орох",
    ctaSecondary: "Журмыг үзэх",
    liveNow: "Шууд эхэлсэн",
    liveNowPlural: "Шууд явагдаж байна",
    liveCount: (n: number) => `${n} лот шууд явагдаж байна`,
    otherLive: "Бусад шууд лот",
    upcoming: "Хүлээгдэж байна",
    upcomingLede: "Дараагийн лотууд",
    allLots: "Бүх лот",
    /* Used on the featured lot, where "enter the room" is already the hero CTA
       and repeating it verbatim would read as two identical buttons. */
    ctaEnter: "Орж үзэх",
    results: "Үр дүн",
    resultsLede: "Цохигдсон лотууд",
    resultsNote: "Өмнөх худалдааны дүн",
    howItWorks: "Хэрхэн явагддаг",
    pointNote: "1 оноо = 1 000₮",
    statRounds: "тойрог",
    statDuration: "нийт хугацаа",
    statPoint: "нэг оноо",
    statFinal: "сүүлийн тойрог",
  },

  lot: {
    lot: "Лот",
    estimate: "Үнэлгээ",
    opening: "Нээлтийн үнэ",
    maker: "Зохиогч",
    year: "Он",
    provenance: "Гарал үүсэл",
    condition: "Хадгалалтын байдал",
    dimensions: "Хэмжээ",
    note: "Тайлбар",
    details: "Дэлгэрэнгүй",
    viewLot: "Лотыг үзэх",
    startsAt: "Эхлэх",
    placeholder: "Гэрэл зураг ороогүй",
    statusSold: "Цохигдсон",
    statusUnsold: "Худалдагдаагүй",
    hammer: "Цохисон үнэ",
    hammerRound: "Цохисон тойрог",
    result: "Үр дүн",
    bidCount: "Хаялтын тоо",
    aboveEstimate: "Үнэлгээнээс дээш",
    belowEstimate: "Үнэлгээнээс доош",
  },

  room: {
    live: "ШУУД",
    /* Header badge in the room — names the place, not the status. */
    liveRoom: "Шууд танхим",
    joinPenaltyLabel: "Нэгдэх төлбөр",
    joinPenalty: (points: number) =>
      `Энэ лот аль хэдийн явагдаж эхэлсэн. Дундаас нь нэгдсэн тул таны данснаас ${points} оноо суутгагдана.`,
    round: "Тойрог",
    ofRounds: "6 тойргоос",
    currentPrice: "Одоогийн үнэ",
    openingPrice: "Нээлтийн үнэ",
    noBidsYet: "Хаялт хийгдээгүй",
    leader: "Тэргүүлэгч",
    youLead: "Та тэргүүлж байна",
    outbid: "Таны үнэ давагдсан",
    bidClock: "Хаялтын хугацаа",
    roundClock: "Тойрог дуусахад",
    bidClockHint: "Хаялт болгонд дахин тоологдоно",
    feed: "Хаялтын урсгал",
    feedEmpty: "Анхны хаялтыг хүлээж байна",
    you: "Та",
    minNext: "Дараагийн доод үнэ",
    minIncrement: "Хаялтын доод хэмжээ",
    lateEntry: "Дундаас нэгдэх",
    lateEntryHint: (round: number, step: number) =>
      `Та энэ лотод хараахан хаялт хийгээгүй. ${round}-р тойрогт нэгдэх доод хэмжээ ${step} оноо.`,
    placeBid: "Үнэ хаях",
    bidding: "Хаяж байна…",
    custom: "Өөр дүн",
    customApply: "Хаях",
    tooLow: (min: number) => `Доод тал нь ${min} оноо байх ёстой`,
    sold: "ЦОХИВ",
    soldNote: "Хаялтын хугацаа дууслаа",
    soldFor: "Цохисон үнэ",
    unsold: "Худалдагдсангүй",
    winner: "Хүлээн авагч",
    rulesLink: "Журам",
    connection: "Холболт",
    connected: "Шууд дамжуулалт",
    roundAdvanced: (n: number) => `${n}-р тойрог эхэллээ`,
    roundClockShrunk: (label: string) => `Хаялтын хугацаа ${label} болов`,
  },

  rules: {
    title: "Журам",
    eyebrow: "Дуудлага худалдааны дэг",
    lede: "Худалдаа зургаан тойрогтой, нийт 2 цаг 45 минут үргэлжилнэ. Тойрог бүрд үнэ хаях хугацаа багасна.",
    table: {
      round: "Тойрог",
      bidClock: "Хаялтын хугацаа",
      duration: "Үргэлжлэх",
      increment: "Доод хэмжээ",
      lateEntry: "Дундаас нэгдэх",
    },
    pointsTitle: "Оноо ба үнэ",
    pointsBody:
      "Бүх үнэ онооны системээр тооцогдоно. 1 оноо нь 1 000₮-тэй тэнцэнэ. Хаялт бүр бүхэл оноогоор хийгдэнэ.",
    clocksTitle: "Хоёр цаг зэрэг явна",
    clocksBidTitle: "Хаялтын хугацаа",
    clocksBidBody:
      "Хаялт болгонд тухайн тойргийн хугацаа дахин тоологдоно. Хугацаа дуусвал лот тэр дор цохигдоно.",
    clocksRoundTitle: "Тойргийн хугацаа",
    clocksRoundBody:
      "Тойрог өөрийн хугацаагаараа явж, дуусахад дараагийн тойрог эхэлж, хаялтын хугацаа хумирна.",
    lateTitle: "Дундаас нэгдэх",
    lateBody:
      "Хараахан хаялт хийгээгүй хүн 2-р тойргоос хойш нэгдэхдээ тойргийн дугаарыг 10-аар үржүүлсэнтэй тэнцэх доод хэмжээгээр орно. Жишээ нь 3-р тойрогт 30 оноо, 6-р тойрогт 60 оноо.",
    incrementTitle: "Үнэ өсгөх доод хэмжээ",
    incrementBody:
      "1-р тойрогт 1 оноо, 2-р тойргоос хойш 2 оноо. Дундаас нэгдэгчид дээрх дүрэм давуу хүчинтэй.",
  },

  auth: {
    loginTitle: "Нэвтрэх",
    loginLede:
      "Дуудлага худалдаанд оролцохын тулд бүртгэлдээ нэвтэрнэ үү.",
    registerTitle: "Бүртгүүлэх",
    registerLede:
      "Оролцогчийн бүртгэл үүсгэснээр танд паддлын дугаар олгогдоно.",

    name: "Овог нэр",
    phone: "Утасны дугаар",
    password: "Нууц үг",
    passwordConfirm: "Нууц үгээ давтах",
    passwordHint: "Хамгийн багадаа 8 тэмдэгт.",

    showPassword: "Нууц үг харуулах",
    hidePassword: "Нууц үг нуух",
    forgot: "Нууц үгээ мартсан уу?",
    remember: "Намайг сана",

    terms: "Үйлчилгээний нөхцөл, нууцлалын бодлогыг зөвшөөрч байна.",

    noAccount: "Бүртгэлгүй юу?",
    haveAccount: "Бүртгэлтэй юу?",

    /* Stated plainly rather than faking a spinner: a form that looks like it
       submitted but silently drops the data is worse than one that says so. */
    demoNotice:
      "Энэ бол зөвхөн нүүр талын загвар. Маягт сервертэй хараахан холбогдоогүй тул мэдээлэл хадгалагдахгүй.",
  },

  about: {
    eyebrow: "Бидний тухай",
    headline: ["Цаг хугацаа", "шийднэ."],
    lede: "MAISON бол Монголын эртний эдлэл, урлагийн бүтээлийг дуудлага худалдаагаар шинэ эзэнд нь хүргэдэг танхим. Бид уртаас урт хүлээлт бус, богино бөгөөд шийдэмгий худалдааг сонгосон.",

    storyTitle: "Яагаад зургаан тойрог вэ",
    storyBody:
      "Сонгодог дуудлага худалдаа цагаар үргэлжилж, оролцогчид эцэст нь ядраад шийдвэрээ хойшлуулдаг. Бид эсрэгээр нь хийсэн: тойрог давах тусам хаялтын хугацаа хумигдаж, 5 минутаас 5 секунд болно. Сүүлийн тойрогт бодох цаг үлддэггүй — зөвхөн шийдэх цаг үлддэг.",

    principlesTitle: "Зарчим",
    principles: [
      {
        title: "Ил тод байдал",
        body: "Хаялт бүр бодит цагт, бүх оролцогчид ижил хугацаанд харагдана. Нуугдмал доод үнэ, дотоод давуу эрх байхгүй.",
      },
      {
        title: "Шалгагдсан гарал үүсэл",
        body: "Танхимд орох лот бүр гарал үүсэл, хадгалалтын байдлын шалгуур давсан байна. Тодорхойгүй зүйлийг бид тодорхойгүй гэж бичдэг.",
      },
      {
        title: "Тэгш боломж",
        body: "Тойргийн дундаас нэгдсэн оролцогч тухайн тойргийн дугаараар үржүүлсэн доод хэмжээгээр эхэлдэг. Хожуу ирсэн нь давуу тал болдоггүй.",
      },
    ],

    numbersTitle: "Тоо баримт",
    contactTitle: "Холбоо барих",
    contactBody:
      "Лот тавих, оролцогчоор бүртгүүлэх, эсхүл үнэлгээ хийлгэх талаар бидэнтэй холбогдоно уу.",
    contactNote: "Улаанбаатар хот",
  },

  footer: {
    rights: "Бүх эрх хуулиар хамгаалагдсан",
    contact: "Холбоо барих",
    terms: "Үйлчилгээний нөхцөл",
    demo: "Энэ нь зөвхөн нүүр хуудасны загвар — өгөгдөл нь жишээ өгөгдөл юм.",
  },

  common: {
    loading: "Ачаалж байна",
    notFound: "Хуудас олдсонгүй",
    backHome: "Нүүр хуудас",
    point: "оноо",
    min: "мин",
    sec: "сек",
    /* Lowercase, for running into a sentence or an ordinal ("1-р тойрог").
       room.round is the capitalised standalone label. */
    roundWord: "тойрог",
  },
} as const;
