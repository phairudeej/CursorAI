/** Whole-word, case-insensitive English terms. */
export const BLOCKED_ENGLISH_WORDS = ["gun"] as const;

/** Thai terms matched as words inside the text. */
export const BLOCKED_THAI_WORDS = ["ปืน", "เฮโรอีน"] as const;

const englishPatterns = BLOCKED_ENGLISH_WORDS.map(
  (word) => new RegExp(`\\b${word}\\b`, "i"),
);

export function findBlockedTerms(value: string): string[] {
  const found: string[] = [];
  for (const [index, pattern] of englishPatterns.entries()) {
    if (pattern.test(value)) found.push(BLOCKED_ENGLISH_WORDS[index]);
  }
  for (const word of BLOCKED_THAI_WORDS) {
    if (value.includes(word)) found.push(word);
  }
  return found;
}
