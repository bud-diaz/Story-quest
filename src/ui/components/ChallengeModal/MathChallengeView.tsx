import { useState } from 'react';
import type { MathChallenge } from '@/types';
import { useGameStore } from '@/state/gameStore';
import { Button } from '@/ui/components/shared/Button';

export function MathChallengeView({ def }: { def: MathChallenge }) {
  const [feedback, setFeedback] = useState<'idle' | 'wrong'>('idle');

  function handleSelect(selected: number): void {
    useGameStore.getState().resolveChallenge({ type: 'math', selected });
    const modal = useGameStore.getState().activeModal;
    const stillOnThisChallenge = modal?.kind === 'challenge' && modal.id === def.id;
    setFeedback(stillOnThisChallenge ? 'wrong' : 'idle');
  }

  return (
    <div className="challenge-view">
      <p className="challenge-view__prompt">{def.promptText}</p>
      <p className="challenge-view__question">{def.questionText}</p>
      <div className="challenge-view__choices">
        {def.choices.map((choice) => (
          <Button key={choice} onClick={() => handleSelect(choice)}>
            {choice}
          </Button>
        ))}
      </div>
      {feedback === 'wrong' && <p className="challenge-view__hint">Not quite — let's try again!</p>}
    </div>
  );
}
