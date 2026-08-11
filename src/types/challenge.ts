import type { Effect } from './conditionsEffects';

export type ChallengeType = 'math' | 'reading';

export interface ChallengeBase {
  id: string;
  type: ChallengeType;
  /** In-fiction framing text shown before the question — never a bare quiz prompt. */
  promptText: string;
  successEffects: Effect[];
  failureEffects?: Effect[];
  retryAllowed: boolean;
}

export interface MathChallenge extends ChallengeBase {
  type: 'math';
  questionText: string;
  operands: { have: number; need: number };
  answer: number;
  choices: number[];
}

export interface ReadingChallenge extends ChallengeBase {
  type: 'reading';
  promptWord: string;
  targetWord: string;
  options: string[];
  correctOption: string;
}

export type ChallengeDefinition = MathChallenge | ReadingChallenge;

/** Discriminated-union response shapes, one per challenge type. */
export type ChallengeResponse =
  | { type: 'math'; selected: number }
  | { type: 'reading'; selected: string };

export interface ChallengeResult {
  success: boolean;
}
