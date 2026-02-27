// Daily inspirational quotes based on mood

export interface Quote {
  text: string;
  author?: string;
  moodRange: [number, number]; // [min, max] mood score
}

const quotesEn: Quote[] = [
  { text: "This too shall pass.", moodRange: [1, 3] },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo", moodRange: [1, 3] },
  { text: "You are stronger than you think.", moodRange: [1, 3] },
  { text: "Small progress is still progress.", moodRange: [4, 6] },
  { text: "Balance is not something you find, it's something you create.", moodRange: [4, 6] },
  { text: "You are creating your own story.", moodRange: [7, 8] },
  { text: "The best view comes after the hardest climb.", moodRange: [7, 8] },
  { text: "You are glowing today.", moodRange: [9, 10] },
  { text: "Happiness is the secret to all beauty.", author: "Christian Dior", moodRange: [9, 10] },
];

const quotesZh: Quote[] = [
  { text: "这一切终将过去。", moodRange: [1, 3] },
  { text: "纵使黑夜漫长，黎明终将到来。", author: "维克多·雨果", moodRange: [1, 3] },
  { text: "你比你想象的更强大。", moodRange: [1, 3] },
  { text: "微小的进步也是进步。", moodRange: [4, 6] },
  { text: "平衡不是找来的，而是创造出来的。", moodRange: [4, 6] },
  { text: "你正在书写属于自己的故事。", moodRange: [7, 8] },
  { text: "最美的风景总是在最艰辛的攀登之后。", moodRange: [7, 8] },
  { text: "今天的你闪闪发光。", moodRange: [9, 10] },
  { text: "快乐是所有美丽的秘诀。", author: "克里斯汀·迪奥", moodRange: [9, 10] },
];

export function getQuoteForMood(mood: number, lang: 'en' | 'zh' = 'en'): Quote {
  const list = lang === 'zh' ? quotesZh : quotesEn;
  const matchingQuotes = list.filter(
    q => mood >= q.moodRange[0] && mood <= q.moodRange[1]
  );
  
  if (matchingQuotes.length === 0) return list[0];
  return matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
}

export function getRandomQuote(lang: 'en' | 'zh' = 'en'): Quote {
  const list = lang === 'zh' ? quotesZh : quotesEn;
  return list[Math.floor(Math.random() * list.length)];
}
