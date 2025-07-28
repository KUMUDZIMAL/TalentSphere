import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Example list of banned/inappropriate keywords (customize as needed)
const bannedKeywords = [
  'hate',
  'violence',
  'abuse',
  'kill',
  'racist',
  'sexist',
  'plagiarize',
  'stupid',
  'idiot',
  'dumb',
  'fool',
  'nonsense',
  // Add more as needed
];

export interface ModerationResult {
  isFlagged: boolean;
  reasons: string[];
  score: number; // Sentiment score
}

export function moderateContent(text: string): ModerationResult {
  const reasons: string[] = [];
  let isFlagged = false;

  // Check for banned keywords (case-insensitive)
  const lowerText = text.toLowerCase();
  const foundKeywords = bannedKeywords.filter(word => lowerText.includes(word));
  if (foundKeywords.length > 0) {
    isFlagged = true;
    reasons.push(`Banned keywords detected: ${foundKeywords.join(', ')}`);
  }

  // Sentiment analysis
  const sentimentResult = sentiment.analyze(text);
  if (sentimentResult.score < -2) { // Threshold for negative/toxic content
    isFlagged = true;
    reasons.push(`Negative sentiment detected (score: ${sentimentResult.score})`);
  }

  return {
    isFlagged,
    reasons,
    score: sentimentResult.score,
  };
} 