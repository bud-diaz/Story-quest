import { useState } from 'react';
import type { ReadingChallenge } from '@/types';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/ui/components/shared/Button';

export function ReadingChallengeView({ def }: { def: ReadingChallenge }) {
  const [feedback, setFeedback] = useState<'idle' | 'wrong'>('idle');

  function handleSelect(selected: string): void {
    useGameStore.getState().resolveChallenge({ type: 'reading', selected });
    const modal = useGameStore.getState().activeModal;
    const stillOnThisChallenge = modal?.kind === 'challenge' && modal.id === def.id;
    setFeedback(stillOnThisChallenge ? 'wrong' : 'idle');
  }

  return (
    <div className="challenge-view">
      <p className="challenge-view__prompt">{def.promptText}</p>
      <p className="challenge-view__question challenge-view__question--reading">{def.promptWord}</p>
      <div className="challenge-view__choices">
        {def.options.map((option) => (
          <Button key={option} onClick={() => handleSelect(option)}>
            {option}
          </Button>
        ))}
      </div>
      {feedback === 'wrong' && <p className="challenge-view__hint">Not quite — let's try again!</p>}
    </div>
  );
}
