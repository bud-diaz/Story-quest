/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * A tiny registry keyed by challenge type lets callers (state/gameStore,
 * ui/ChallengeModal) stay generic: runChallenge(def, response) works the
 * same way regardless of whether it's a math or reading challenge, and
 * adding a new challenge type later means adding one case here.
 */
import type { ChallengeDefinition, ChallengeResponse, ChallengeResult } from '@/types';
import { evaluateMathChallenge } from './mathChallenge';
import { evaluateReadingChallenge } from './readingChallenge';

export function runChallenge(def: ChallengeDefinition, response: ChallengeResponse): ChallengeResult {
  if (def.type === 'math' && response.type === 'math') {
    return evaluateMathChallenge(def, response.selected);
  }
  if (def.type === 'reading' && response.type === 'reading') {
    return evaluateReadingChallenge(def, response.selected);
  }
  throw new Error(`Challenge "${def.id}" (${def.type}) received a mismatched response type "${response.type}"`);
}
