// Daily inspirational quotes based on mood

export interface Quote {
  text: string;
  author?: string;
  moodRange: [number, number]; // [min, max] mood score
}

const quotes: Quote[] = [
  // Low mood (1-3)
  { text: "This too shall pass.", moodRange: [1, 3] },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo", moodRange: [1, 3] },
  { text: "You are stronger than you think.", moodRange: [1, 3] },
  { text: "It's okay to not be okay.", moodRange: [1, 3] },
  { text: "It doesn't matter how slow you go, as long as you keep moving.", moodRange: [1, 3] },
  
  // Medium-low mood (4-6)
  { text: "Small progress is still progress.", moodRange: [4, 6] },
  { text: "Every accomplishment starts with the decision to try.", moodRange: [4, 6] },
  { text: "Today, you care for yourself better than yesterday.", moodRange: [4, 6] },
  { text: "Balance is not something you find, it's something you create.", moodRange: [4, 6] },
  { text: "Rest is not a waste of time, it recharges you for the journey ahead.", moodRange: [4, 6] },
  
  // Medium-high mood (7-8)
  { text: "You are creating your own story.", moodRange: [7, 8] },
  { text: "The best view comes after the hardest climb.", moodRange: [7, 8] },
  { text: "Keep going, you are doing great.", moodRange: [7, 8] },
  { text: "Progress, not perfection.", moodRange: [7, 8] },
  { text: "Every day is a fresh start.", moodRange: [7, 8] },
  
  // High mood (9-10)
  { text: "You are glowing today.", moodRange: [9, 10] },
  { text: "Happiness is the secret to all beauty.", author: "Christian Dior", moodRange: [9, 10] },
  { text: "Remember this feeling, it belongs to you.", moodRange: [9, 10] },
  { text: "Joy is the simplest form of gratitude.", moodRange: [9, 10] },
  { text: "You deserve all things beautiful.", moodRange: [9, 10] },
];

export function getQuoteForMood(mood: number): Quote {
  const matchingQuotes = quotes.filter(
    q => mood >= q.moodRange[0] && mood <= q.moodRange[1]
  );
  
  if (matchingQuotes.length === 0) {
    return quotes[0];
  }
  
  // Return a random quote from matching ones
  return matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
}

export function getRandomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
