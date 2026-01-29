exports.analyzeAndDiscard = (text) => {
  if (!text) return 0;
  // Deterministic score based on "release effort" (word count/length)
  const score = Math.min(100, text.trim().split(/\s+/).length * 5);
  return score; // The 'text' variable goes out of scope and is GC'd here.
};