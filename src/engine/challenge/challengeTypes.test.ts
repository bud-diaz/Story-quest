import { describe, expect, it } from 'vitest';
import { runChallenge } from './challengeTypes';
import type { MathChallenge, ReadingChallenge } from '@/types';

const mathChallenge: MathChallenge = {
  id: 'math-beaver-logs',
  type: 'math',
  promptText: '',
  questionText: 'How many more logs?',
  operands: { have: 4, need: 7 },
  answer: 3,
  choices: [2, 3, 4, 5],
  retryAllowed: true,
  successEffects: [],
};

const readingChallenge: ReadingChallenge = {
  id: 'reading-forest-sign',
  type: 'reading',
  promptText: '',
  promptWord: 'Tap the word that says: CAVE',
  targetWord: 'CAVE',
  options: ['CAVE', 'LAKE', 'TREE'],
  correctOption: 'CAVE',
  retryAllowed: true,
  successEffects: [],
};

describe('runChallenge', () => {
  it('evaluates a math challenge correctly', () => {
    expect(runChallenge(mathChallenge, { type: 'math', selected: 3 })).toEqual({ success: true });
    expect(runChallenge(mathChallenge, { type: 'math', selected: 4 })).toEqual({ success: false });
  });

  it('evaluates a reading challenge correctly', () => {
    expect(runChallenge(readingChallenge, { type: 'reading', selected: 'CAVE' })).toEqual({ success: true });
    expect(runChallenge(readingChallenge, { type: 'reading', selected: 'LAKE' })).toEqual({ success: false });
  });

  it('throws on a mismatched response type', () => {
    expect(() => runChallenge(mathChallenge, { type: 'reading', selected: 'CAVE' })).toThrow(/mismatched/);
  });
});
