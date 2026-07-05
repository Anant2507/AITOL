import { MRLLayerResult } from "../types";

const FILLER_PHRASES: string[] = [
  "it is important to note that",
  "it is worth noting that",
  "it should be noted that",
  "as mentioned previously",
  "as i mentioned before",
  "as previously mentioned",
  "needless to say",
  "with that being said",
  "having said that",
  "that being said",
  "as you may know",
  "first and foremost",
  "last but not least",
  "at the end of the day",
  "to make a long story short",
  "to put it simply",
  "to put it another way",
  "in other words",
  "due to the fact that",
  "in spite of the fact that",
  "despite the fact that",
  "the fact that",
  "in the context of",
  "for the purpose of",
  "for the purposes of",
  "in the event that",
  "in terms of",
  "with regard to",
  "with respect to",
  "in relation to",
  "at this point in time",
  "at the present time",
  "as of right now",
  "in today's world",
  "all things considered",
  "on the other hand",
  "long story short",
  "in a nutshell",
  "in any case",
  "pertaining to",
  "as far as",
  "along the lines of",
].sort((a, b) => b.length - a.length);

const FILLER_WORDS: string[] = [
  "basically",
  "essentially",
  "literally",
  "actually",
  "obviously",
  "clearly",
  "certainly",
  "definitely",
  "absolutely",
  "simply",
  "very",
  "really",
  "quite",
  "rather",
  "somewhat",
  "fairly",
  "pretty",
  "extremely",
  "highly",
  "totally",
  "completely",
  "entirely",
  "fully",
  "indeed",
  "furthermore",
  "moreover",
  "additionally",
  "consequently",
  "therefore",
  "thus",
  "hence",
  "accordingly",
  "subsequently",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function l2Stopwords(text: string): MRLLayerResult {
  const original = text;
  let result = text;

  for (const phrase of FILLER_PHRASES) {
    const regex = new RegExp(
      `(?:^|\\s)${escapeRegex(phrase)}(?:\\s|[,;.]|$)`,
      "gi"
    );
    result = result.replace(regex, (match) => {
      const trailing = match.match(/[,;.\s]*$/)?.[0]?.trim() ?? "";
      return trailing ? ` ${trailing}` : " ";
    });
  }

  for (const word of FILLER_WORDS) {
    const regex = new RegExp(`(?<=\\s|^)${escapeRegex(word)}(?=\\s|$)`, "gi");
    result = result.replace(regex, "");
  }

  result = result.replace(/ {2,}/g, " ").trim();

  const saved = Math.max(0, original.length - result.length);

  return {
    text: result,
    tokensSaved: Math.round(saved / 4),
    layerName: "L2-Stopwords",
  };
}