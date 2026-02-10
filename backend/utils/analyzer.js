// utils/analyzer.js

export const analyzeAndDiscard = (text = "") => {
  // simple deterministic score (can evolve later)
  const lengthScore = Math.min(text.length, 100);
  const randomness = Math.floor(Math.random() * 10);

  // IMPORTANT: text is never stored
  return lengthScore + randomness;
};
