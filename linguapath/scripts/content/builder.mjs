// ─────────────────────────────────────────────────────────────
// LinguaPath content builder — the single place to extend courses.
// To add a language: add a LANGUAGE entry + VOCAB + FILL_BLANKS below,
// then run `npm run content:build && npm run db:seed`. No code changes needed.
// ─────────────────────────────────────────────────────────────

export const LANGUAGES = [
  { id: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", learners: 2413000, ttsLocale: "de-DE", script: "latin", readingAidLabel: "", order: 1 },
  { id: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", learners: 812000, ttsLocale: "nl-NL", script: "latin", readingAidLabel: "", order: 2 },
  { id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", learners: 8140000, ttsLocale: "es-ES", script: "latin", readingAidLabel: "", order: 3 },
  { id: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", learners: 2930000, ttsLocale: "ko-KR", script: "hangul", readingAidLabel: "Romanization", order: 4 },
  { id: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", learners: 3710000, ttsLocale: "ja-JP", script: "kana", readingAidLabel: "Romaji", order: 5 },
];

// Locked roadmap units (Elementary → Advanced). Same structure for every
// language; content team fills these in later via this same config format.
export const ROADMAP_UNITS = [
  { number: 4, title: "Daily Routines", description: "Talk about your day, time and habits.", cefr: "A2", color: "grape" },
  { number: 5, title: "Past & Future", description: "Tell stories and make plans.", cefr: "A2", color: "grape" },
  { number: 6, title: "Real Conversations", description: "Opinions, ordering, small talk.", cefr: "B1", color: "sun" },
  { number: 7, title: "Fluent Life", description: "Work, travel and culture.", cefr: "B2", color: "coral" },
  { number: 8, title: "Mastery", description: "Idioms, nuance and debate.", cefr: "C1", color: "brand" },
];

// Item: [target, english, readingAid?, emoji?]
const V = (t, e, r = "", emoji = "") => ({ t, e, r, emoji });

export const VOCAB = {
  de: {
    meta: { 1: { title: "First Words", skill: "Greetings", cefr: "A1", color: "brand" }, 2: { title: "Food & Numbers", skill: "Basics", cefr: "A1", color: "brand" }, 3: { title: "People & Articles", skill: "der · die · das", cefr: "A1", color: "brand" } },
    1: [V("Hallo", "Hello", "", "👋"), V("Guten Morgen", "Good morning", "", "🌅"), V("Guten Tag", "Good afternoon", "", "☀️"), V("Guten Abend", "Good evening", "", "🌆"), V("Gute Nacht", "Good night", "", "🌙"), V("Tschüss", "Bye", "", "👋"), V("Danke", "Thank you", "", "🙏"), V("Bitte", "Please", "", "✨"), V("Ja", "Yes", "", "✅"), V("Nein", "No", "", "❌"), V("Entschuldigung", "Excuse me", "", "🙇"), V("Willkommen", "Welcome", "", "🎉"), V("Wie geht's?", "How are you?", "", "😊"), V("Gut", "Good", "", "👍"), V("Super", "Great", "", "⭐"), V("Prost", "Cheers", "", "🍻"), V("Bis später", "See you later", "", "👋"), V("Viel Spaß", "Have fun", "", "🎈")],
    2: [V("Wasser", "Water", "", "💧"), V("Brot", "Bread", "", "🍞"), V("Apfel", "Apple", "", "🍎"), V("Milch", "Milk", "", "🥛"), V("Kaffee", "Coffee", "", "☕"), V("Tee", "Tea", "", "🍵"), V("Käse", "Cheese", "", "🧀"), V("Ei", "Egg", "", "🥚"), V("eins", "one", "", "1️⃣"), V("zwei", "two", "", "2️⃣"), V("drei", "three", "", "3️⃣"), V("vier", "four", "", "4️⃣"), V("fünf", "five", "", "5️⃣"), V("Lecker", "Delicious", "", "😋"), V("Ich mag Äpfel", "I like apples", "", "🍎"), V("Ein Kaffee, bitte", "A coffee, please", "", "☕"), V("Die Rechnung, bitte", "The bill, please", "", "🧾"), V("Guten Appetit", "Enjoy your meal", "", "🍽️")],
    3: [V("der Mann", "the man", "", "👨"), V("die Frau", "the woman", "", "👩"), V("das Kind", "the child", "", "🧒"), V("der Junge", "the boy", "", "👦"), V("das Mädchen", "the girl", "", "👧"), V("der Freund", "the friend", "", "🧑‍🤝‍🧑"), V("die Familie", "the family", "", "👪"), V("Ich bin", "I am", "", "🙋"), V("Du bist", "You are", "", "👉"), V("Er ist", "He is", "", "👨"), V("Sie ist", "She is", "", "👩"), V("Wir sind", "We are", "", "🧑‍🤝‍🧑"), V("der Hund", "the dog", "", "🐶"), V("die Katze", "the cat", "", "🐱"), V("das Haus", "the house", "", "🏠"), V("das Buch", "the book", "", "📕"), V("groß", "big", "", "📦"), V("klein", "small", "", "🔍")],
  },
  nl: {
    meta: { 1: { title: "First Words", skill: "Greetings", cefr: "A1", color: "brand" }, 2: { title: "Food & Numbers", skill: "Basics", cefr: "A1", color: "brand" }, 3: { title: "People & Articles", skill: "de · het", cefr: "A1", color: "brand" } },
    1: [V("Hallo", "Hello", "", "👋"), V("Goedemorgen", "Good morning", "", "🌅"), V("Goedemiddag", "Good afternoon", "", "☀️"), V("Goedenavond", "Good evening", "", "🌆"), V("Tot ziens", "Goodbye", "", "👋"), V("Doei", "Bye", "", "👋"), V("Dank je wel", "Thank you", "", "🙏"), V("Alsjeblieft", "Please", "", "✨"), V("Ja", "Yes", "", "✅"), V("Nee", "No", "", "❌"), V("Sorry", "Sorry", "", "🙇"), V("Welkom", "Welcome", "", "🎉"), V("Hoe gaat het?", "How are you?", "", "😊"), V("Goed", "Good", "", "👍"), V("Leuk", "Nice", "", "⭐"), V("Mooi", "Beautiful", "", "🌷"), V("Proost", "Cheers", "", "🍻"), V("Veel plezier", "Have fun", "", "🎈")],
    2: [V("Water", "Water", "", "💧"), V("Brood", "Bread", "", "🍞"), V("Appel", "Apple", "", "🍎"), V("Melk", "Milk", "", "🥛"), V("Koffie", "Coffee", "", "☕"), V("Thee", "Tea", "", "🍵"), V("Kaas", "Cheese", "", "🧀"), V("Ei", "Egg", "", "🥚"), V("een", "one", "", "1️⃣"), V("twee", "two", "", "2️⃣"), V("drie", "three", "", "3️⃣"), V("vier", "four", "", "4️⃣"), V("vijf", "five", "", "5️⃣"), V("Lekker", "Tasty", "", "😋"), V("Ik lust appels", "I like apples", "", "🍎"), V("Een koffie, alsjeblieft", "A coffee, please", "", "☕"), V("De rekening, alsjeblieft", "The bill, please", "", "🧾"), V("Eet smakelijk", "Enjoy your meal", "", "🍽️")],
    3: [V("de man", "the man", "", "👨"), V("de vrouw", "the woman", "", "👩"), V("het kind", "the child", "", "🧒"), V("de jongen", "the boy", "", "👦"), V("het meisje", "the girl", "", "👧"), V("de vriend", "the friend", "", "🧑‍🤝‍🧑"), V("de familie", "the family", "", "👪"), V("Ik ben", "I am", "", "🙋"), V("Jij bent", "You are", "", "👉"), V("Hij is", "He is", "", "👨"), V("Zij is", "She is", "", "👩"), V("Wij zijn", "We are", "", "🧑‍🤝‍🧑"), V("de hond", "the dog", "", "🐶"), V("de kat", "the cat", "", "🐱"), V("het huis", "the house", "", "🏠"), V("de fiets", "the bike", "", "🚲"), V("groot", "big", "", "📦"), V("klein", "small", "", "🔍")],
  },
  es: {
    meta: { 1: { title: "First Words", skill: "Greetings", cefr: "A1", color: "brand" }, 2: { title: "Food & Numbers", skill: "Basics", cefr: "A1", color: "brand" }, 3: { title: "People & Articles", skill: "el · la", cefr: "A1", color: "brand" } },
    1: [V("Hola", "Hello", "", "👋"), V("Buenos días", "Good morning", "", "🌅"), V("Buenas tardes", "Good afternoon", "", "☀️"), V("Buenas noches", "Good night", "", "🌙"), V("Adiós", "Goodbye", "", "👋"), V("Hasta luego", "See you later", "", "👋"), V("Gracias", "Thank you", "", "🙏"), V("Por favor", "Please", "", "✨"), V("Sí", "Yes", "", "✅"), V("No", "No", "", "❌"), V("Perdón", "Excuse me", "", "🙇"), V("Bienvenido", "Welcome", "", "🎉"), V("¿Cómo estás?", "How are you?", "", "😊"), V("Bien", "Good", "", "👍"), V("Muy bien", "Very well", "", "⭐"), V("Genial", "Great", "", "🌟"), V("Salud", "Cheers", "", "🍻"), V("Encantado", "Nice to meet you", "", "🤝")],
    2: [V("Agua", "Water", "", "💧"), V("Pan", "Bread", "", "🍞"), V("Manzana", "Apple", "", "🍎"), V("Leche", "Milk", "", "🥛"), V("Café", "Coffee", "", "☕"), V("Té", "Tea", "", "🍵"), V("Queso", "Cheese", "", "🧀"), V("Huevo", "Egg", "", "🥚"), V("uno", "one", "", "1️⃣"), V("dos", "two", "", "2️⃣"), V("tres", "three", "", "3️⃣"), V("cuatro", "four", "", "4️⃣"), V("cinco", "five", "", "5️⃣"), V("Rico", "Delicious", "", "😋"), V("Me gustan las manzanas", "I like apples", "", "🍎"), V("Un café, por favor", "A coffee, please", "", "☕"), V("La cuenta, por favor", "The bill, please", "", "🧾"), V("Buen provecho", "Enjoy your meal", "", "🍽️")],
    3: [V("el hombre", "the man", "", "👨"), V("la mujer", "the woman", "", "👩"), V("el niño", "the boy", "", "👦"), V("la niña", "the girl", "", "👧"), V("el amigo", "the friend", "", "🧑‍🤝‍🧑"), V("la familia", "the family", "", "👪"), V("Yo soy", "I am", "", "🙋"), V("Tú eres", "You are", "", "👉"), V("Él es", "He is", "", "👨"), V("Ella es", "She is", "", "👩"), V("Nosotros somos", "We are", "", "🧑‍🤝‍🧑"), V("el perro", "the dog", "", "🐶"), V("el gato", "the cat", "", "🐱"), V("la casa", "the house", "", "🏠"), V("el libro", "the book", "", "📕"), V("grande", "big", "", "📦"), V("pequeño", "small", "", "🔍"), V("Este es un libro", "This is a book", "", "📖")],
  },
  ko: {
    meta: { 1: { title: "Hangul Basics", skill: "한글", cefr: "A1", color: "brand" }, 2: { title: "Food & Numbers", skill: "Basics", cefr: "A1", color: "brand" }, 3: { title: "People & Phrases", skill: "Basics", cefr: "A1", color: "brand" } },
    1: [V("가", "ga (letter)", "ga", "🔤"), V("나", "na (letter)", "na", "🔤"), V("다", "da (letter)", "da", "🔤"), V("라", "ra (letter)", "ra", "🔤"), V("마", "ma (letter)", "ma", "🔤"), V("바", "ba (letter)", "ba", "🔤"), V("사", "sa (letter)", "sa", "🔤"), V("아", "a (letter)", "a", "🔤"), V("자", "ja (letter)", "ja", "🔤"), V("카", "ka (letter)", "ka", "🔤"), V("타", "ta (letter)", "ta", "🔤"), V("파", "pa (letter)", "pa", "🔤"), V("하", "ha (letter)", "ha", "🔤"), V("안녕하세요", "Hello", "annyeonghaseyo", "👋"), V("네", "Yes", "ne", "✅"), V("아니요", "No", "aniyo", "❌"), V("감사합니다", "Thank you", "gamsahamnida", "🙏"), V("죄송합니다", "Sorry", "joesonghamnida", "🙇")],
    2: [V("물", "Water", "mul", "💧"), V("빵", "Bread", "ppang", "🍞"), V("사과", "Apple", "sagwa", "🍎"), V("우유", "Milk", "uyu", "🥛"), V("커피", "Coffee", "keopi", "☕"), V("차", "Tea", "cha", "🍵"), V("김치", "Kimchi", "gimchi", "🥬"), V("밥", "Rice / meal", "bap", "🍚"), V("하나", "one", "hana", "1️⃣"), V("둘", "two", "dul", "2️⃣"), V("셋", "three", "set", "3️⃣"), V("넷", "four", "net", "4️⃣"), V("다섯", "five", "daseot", "5️⃣"), V("맛있어요", "Delicious", "masisseoyo", "😋"), V("주세요", "Please give me", "juseyo", "✨"), V("커피 주세요", "A coffee, please", "keopi juseyo", "☕"), V("저", "I / me", "jeo", "🙋"), V("좋아요", "I like it", "joayo", "👍")],
    3: [V("남자", "Man", "namja", "👨"), V("여자", "Woman", "yeoja", "👩"), V("아이", "Child", "ai", "🧒"), V("소년", "Boy", "sonyeon", "👦"), V("소녀", "Girl", "sonyeo", "👧"), V("친구", "Friend", "chingu", "🧑‍🤝‍🧑"), V("가족", "Family", "gajok", "👪"), V("고양이", "Cat", "goyangi", "🐱"), V("개", "Dog", "gae", "🐶"), V("집", "House", "jip", "🏠"), V("학생", "Student", "haksaeng", "🎒"), V("선생님", "Teacher", "seonsaengnim", "👩‍🏫"), V("저는 학생이에요", "I am a student", "jeoneun haksaeng-ieyo", "🙋"), V("이것은 책이에요", "This is a book", "igeoseun chaeg-ieyo", "📕"), V("크다", "Big", "keuda", "📦"), V("작다", "Small", "jakda", "🔍"), V("한국", "Korea", "hanguk", "🇰🇷"), V("사랑", "Love", "sarang", "❤️")],
  },
  ja: {
    meta: { 1: { title: "Hiragana First Steps", skill: "ひらがな", cefr: "A1", color: "brand" }, 2: { title: "Katakana & Food", skill: "カタカナ", cefr: "A1", color: "brand" }, 3: { title: "Kanji & People", skill: "漢字", cefr: "A1", color: "brand" } },
    1: [V("あ", "a (hiragana)", "a", "🔤"), V("い", "i (hiragana)", "i", "🔤"), V("う", "u (hiragana)", "u", "🔤"), V("え", "e (hiragana)", "e", "🔤"), V("お", "o (hiragana)", "o", "🔤"), V("か", "ka (hiragana)", "ka", "🔤"), V("き", "ki (hiragana)", "ki", "🔤"), V("く", "ku (hiragana)", "ku", "🔤"), V("け", "ke (hiragana)", "ke", "🔤"), V("こ", "ko (hiragana)", "ko", "🔤"), V("さ", "sa (hiragana)", "sa", "🔤"), V("し", "shi (hiragana)", "shi", "🔤"), V("こんにちは", "Hello", "konnichiwa", "👋"), V("ありがとう", "Thank you", "arigatou", "🙏"), V("はい", "Yes", "hai", "✅"), V("いいえ", "No", "iie", "❌"), V("すみません", "Excuse me", "sumimasen", "🙇"), V("おはよう", "Good morning", "ohayou", "🌅")],
    2: [V("ア", "a (katakana)", "a", "🔤"), V("イ", "i (katakana)", "i", "🔤"), V("ウ", "u (katakana)", "u", "🔤"), V("エ", "e (katakana)", "e", "🔤"), V("オ", "o (katakana)", "o", "🔤"), V("カ", "ka (katakana)", "ka", "🔤"), V("キ", "ki (katakana)", "ki", "🔤"), V("ク", "ku (katakana)", "ku", "🔤"), V("ケ", "ke (katakana)", "ke", "🔤"), V("コ", "ko (katakana)", "ko", "🔤"), V("みず", "Water", "mizu", "💧"), V("パン", "Bread", "pan", "🍞"), V("りんご", "Apple", "ringo", "🍎"), V("ミルク", "Milk", "miruku", "🥛"), V("コーヒー", "Coffee", "koohii", "☕"), V("おちゃ", "Tea", "ocha", "🍵"), V("いち", "one", "ichi", "1️⃣"), V("に", "two", "ni", "2️⃣")],
    3: [V("人", "Person", "hito", "🧍"), V("日", "Day / sun", "hi", "☀️"), V("本", "Book", "hon", "📕"), V("大", "Big", "dai", "📦"), V("小", "Small", "shou", "🔍"), V("男", "Man", "otoko", "👨"), V("女", "Woman", "onna", "👩"), V("子", "Child", "ko", "🧒"), V("私", "I / me", "watashi", "🙋"), V("学生", "Student", "gakusei", "🎒"), V("先生", "Teacher", "sensei", "👩‍🏫"), V("ねこ", "Cat", "neko", "🐱"), V("いぬ", "Dog", "inu", "🐶"), V("これ", "This", "kore", "👉"), V("日本", "Japan", "nihon", "🇯🇵"), V("好き", "Like", "suki", "❤️"), V("ください", "Please (give me)", "kudasai", "✨"), V("水ください", "Water, please", "mizu kudasai", "💧")],
  },
};

// Fill-in-the-blank sentences: { s (___ = blank), a (answer), e (english) }
export const FILL_BLANKS = {
  de: [
    { s: "___ Morgen!", a: "Guten", e: "Good morning!" },
    { s: "Gute ___!", a: "Nacht", e: "Good night!" },
    { s: "Ich ___ Anna.", a: "bin", e: "I am Anna." },
    { s: "Das ist ___ Apfel.", a: "ein", e: "That is an apple." },
    { s: "___ geht's?", a: "Wie", e: "How are you?" },
    { s: "Ein Kaffee, ___.", a: "bitte", e: "A coffee, please." },
  ],
  nl: [
    { s: "___ morgen!", a: "Goede", e: "Good morning!" },
    { s: "___ je wel!", a: "Dank", e: "Thank you!" },
    { s: "Ik ___ Anna.", a: "ben", e: "I am Anna." },
    { s: "Dit is ___ boek.", a: "een", e: "This is a book." },
    { s: "Hoe ___ het?", a: "gaat", e: "How are you?" },
    { s: "Tot ___!", a: "ziens", e: "See you!" },
  ],
  es: [
    { s: "Buenos ___!", a: "días", e: "Good morning!" },
    { s: "___ noches!", a: "Buenas", e: "Good evening!" },
    { s: "Yo ___ Ana.", a: "soy", e: "I am Ana." },
    { s: "Esto es ___ libro.", a: "un", e: "This is a book." },
    { s: "¿Cómo ___?", a: "estás", e: "How are you?" },
    { s: "Un café, por ___.", a: "favor", e: "A coffee, please." },
  ],
  ko: [
    { s: "___ 주세요.", a: "커피", e: "A coffee, please." },
    { s: "___ 맛있어요.", a: "김치", e: "Kimchi is delicious." },
    { s: "저는 ___.", a: "학생", e: "I am a student." },
    { s: "이것은 ___.", a: "책", e: "This is a book." },
    { s: "___ 가세요.", a: "안녕히", e: "Goodbye." },
    { s: "___ 감사합니다.", a: "정말", e: "Thank you very much." },
  ],
  ja: [
    { s: "おはよう ___.", a: "ございます", e: "Good morning. (polite)" },
    { s: "ありがとう ___.", a: "ございます", e: "Thank you very much." },
    { s: "これは ___ です。", a: "本", e: "This is a book." },
    { s: "わたしは ___ です。", a: "学生", e: "I am a student." },
    { s: "___ ください。", a: "水", e: "Water, please." },
    { s: "ねこが ___.", a: "好き", e: "I like cats." },
  ],
};

// Lesson plans: 10 exercises each, rotating types for variety.
function planFor(lessonNo, cjk) {
  const LT = cjk ? "listening_choice" : "listening_type";
  if (lessonNo === 1) return ["mc_text", "word_bank", "mc_image", "mc_text", "listening_choice", "type_answer", "match", "fill_blank", "word_bank", "mc_text"];
  if (lessonNo === 2) return ["mc_image", "mc_text", "listening_choice", "word_bank", "type_answer", "mc_text", "fill_blank", "match", LT, "speaking"];
  return ["word_bank", "mc_text", "match", "listening_choice", "fill_blank", "type_answer", "mc_image", "word_bank", "mc_text", LT];
}

// Deterministic RNG so generated content is stable across builds.
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const j = (v) => JSON.stringify(v);

function distractors(pool, correct, n, rand, key) {
  const others = shuffled(pool.filter((x) => x[key] !== correct), rand);
  const out = [];
  for (const o of others) { if (!out.includes(o[key])) out.push(o[key]); if (out.length >= n) break; }
  return out;
}

function buildExercise(lang, type, item, unitItems, blanks, idx, rand) {
  const base = { type, prompt: "", question: "", questionLang: "en", answer: "", options: "[]", wordBank: "[]", pairs: "[]", audioText: "", readingAid: item.r || "", image: "", explanation: "", hint: "" };
  const dirTarget = idx % 2 === 0; // alternate EN→target / target→EN
  const expl = (extra = "") => `“${item.t}” means “${item.e}”.${item.r ? ` Pronounced “${item.r}”.` : ""}${extra}`;
  switch (type) {
    case "mc_text": {
      if (dirTarget) {
        base.prompt = `Choose the correct translation`;
        base.question = item.e; base.questionLang = "en"; base.answer = item.t;
        base.options = j(shuffled([item.t, ...distractors(unitItems, item.t, 3, rand, "t")], rand));
      } else {
        base.prompt = `What does this mean?`;
        base.question = item.t; base.questionLang = "target"; base.answer = item.e;
        base.options = j(shuffled([item.e, ...distractors(unitItems, item.e, 3, rand, "e")], rand));
      }
      base.explanation = expl(); base.hint = item.r ? `Pronounced “${item.r}”` : `It starts with “${(dirTarget ? item.t : item.e).slice(0, 2)}…”`;
      break;
    }
    case "mc_image": {
      base.prompt = "Which one matches the picture?";
      base.image = item.emoji || "💬"; base.question = item.e; base.questionLang = "en"; base.answer = item.t;
      base.options = j(shuffled([item.t, ...distractors(unitItems, item.t, 3, rand, "t")], rand));
      base.explanation = expl(); base.hint = item.r ? `Pronounced “${item.r}”` : "";
      break;
    }
    case "word_bank": {
      const words = item.t.split(" ");
      const extraPool = shuffled(unitItems.flatMap((x) => x.t.split(" ")).filter((w) => !words.includes(w)), rand).slice(0, 2);
      base.prompt = "Build the translation";
      base.question = item.e; base.questionLang = "en"; base.answer = j(words);
      base.wordBank = j(shuffled([...words, ...extraPool], rand));
      base.explanation = expl(); base.hint = `There ${words.length === 1 ? "is 1 word" : `are ${words.length} words`}.`;
      break;
    }
    case "type_answer": {
      base.prompt = `Type it in ${LANGUAGES.find((l) => l.id === lang).name}`;
      base.question = item.e; base.questionLang = "en"; base.answer = item.t;
      base.readingAid = item.r || "";
      base.explanation = expl(); base.hint = item.r ? `Sounds like “${item.r}”` : `It starts with “${item.t.slice(0, 2)}…”`;
      break;
    }
    case "listening_choice": {
      if (dirTarget) {
        base.prompt = "What do you hear?"; base.question = "🔊 Tap the speaker, then choose."; base.audioText = item.t;
        base.answer = item.t;
        base.options = j(shuffled([item.t, ...distractors(unitItems, item.t, 3, rand, "t")], rand));
      } else {
        base.prompt = "What does it mean?"; base.question = "🔊 Tap the speaker, then choose."; base.audioText = item.t;
        base.answer = item.e;
        base.options = j(shuffled([item.e, ...distractors(unitItems, item.e, 3, rand, "e")], rand));
      }
      base.explanation = expl(); base.hint = "Listen again as many times as you like.";
      break;
    }
    case "listening_type": {
      base.prompt = "Type what you hear";
      base.question = "🔊 Tap the speaker and type it out."; base.audioText = item.t; base.answer = item.t;
      base.explanation = expl(); base.hint = "Every replay is free — listen closely.";
      break;
    }
    case "match": {
      const start = idx % unitItems.length;
      const picks = [0, 1, 2, 3].map((k) => unitItems[(start + k) % unitItems.length]);
      base.prompt = "Match the pairs";
      base.question = "Tap a card from each side to match them.";
      base.pairs = j(picks.map((p) => [p.t, p.e]));
      base.answer = j(picks.map((p) => [p.t, p.e]));
      base.explanation = picks.map((p) => `“${p.t}” = “${p.e}”`).join(" · ");
      break;
    }
    case "fill_blank": {
      const b = blanks[idx % blanks.length];
      const bank = shuffled([b.a, ...distractors(unitItems, b.a, 3, rand, "t")], rand);
      base.prompt = `Complete the sentence — “${b.e}”`;
      base.question = b.s; base.questionLang = "target"; base.answer = b.a;
      base.wordBank = j(bank.length >= 2 ? bank : [b.a]);
      base.explanation = `The full sentence is “${b.s.replace("___", b.a)}” — “${b.e}”.`;
      base.hint = `It means “${b.e}”.`;
      break;
    }
    case "speaking": {
      base.prompt = "Say it out loud";
      base.question = item.t; base.questionLang = "target"; base.answer = item.t;
      base.audioText = item.t;
      base.explanation = expl();
      base.hint = item.r ? `Pronounced “${item.r}”. You can skip this on desktop.` : "You can skip this on desktop.";
      break;
    }
  }
  return base;
}

export function buildLanguageContent(langId) {
  const lang = LANGUAGES.find((l) => l.id === langId);
  const cjk = lang.script !== "latin";
  const blanks = FILL_BLANKS[langId];
  const units = [];
  for (let u = 1; u <= 3; u++) {
    const items = VOCAB[langId][u];
    const meta = VOCAB[langId].meta[u];
    const lessons = [];
    for (let l = 1; l <= 3; l++) {
      const slice = items.slice((l - 1) * 6, l * 6);
      const rand = mulberry32(hashStr(`${langId}-u${u}-l${l}`));
      const plan = planFor(l, cjk);
      const exercises = plan.map((type, i) => ({
        order: i + 1,
        ...buildExercise(langId, type, slice[i % slice.length], items, blanks, i, rand),
      }));
      lessons.push({ number: l, title: `Lesson ${l}`, skill: l === 1 ? meta.skill : ["Practice", "Patterns", "Review"][l - 1] || "Review", xpReward: 10, exercises });
    }
    units.push({ number: u, title: `Unit ${u}: ${meta.title}`, description: `${meta.skill} · Beginner (${meta.cefr})`, cefr: meta.cefr, color: meta.color, isPlaceholder: false, lessons });
  }
  for (const r of ROADMAP_UNITS) {
    units.push({
      number: r.number, title: `Unit ${r.number}: ${r.title}`, description: `${r.description} · ${r.cefr} — coming soon.`, cefr: r.cefr, color: r.color, isPlaceholder: true,
      lessons: [1, 2, 3, 4].map((l) => ({ number: l, title: `Lesson ${l}`, skill: "Locked", xpReward: 10, isPlaceholder: true, exercises: [] })),
    });
  }
  return { language: lang, units };
}

export function countExercises(content) {
  return content.units.flatMap((u) => u.lessons).reduce((n, l) => n + (l.exercises?.length || 0), 0);
}
