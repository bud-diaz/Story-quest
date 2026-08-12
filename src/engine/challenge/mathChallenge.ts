/** Pure, framework-agnostic. Must not import from state/, game/, or ui/. */
import type { ChallengeResult, MathChallenge } from '@/types';

export function evaluateMathChallenge(def: MathChallenge, selected: number): ChallengeResult {
  return { success: selected === def.answer };
}
