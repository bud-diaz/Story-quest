/** Pure, framework-agnostic. Must not import from state/, game/, or ui/. */
import type { ChallengeResult, ReadingChallenge } from '@/types';

export function evaluateReadingChallenge(def: ReadingChallenge, selected: string): ChallengeResult {
  return { success: selected === def.correctOption };
}
