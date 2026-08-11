import { useGameStore, content } from '@/state/gameStore';
import { MathChallengeView } from './MathChallengeView';
import { ReadingChallengeView } from './ReadingChallengeView';

export function ChallengeModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  if (!activeModal || activeModal.kind !== 'challenge') return null;

  const def = content.challenges[activeModal.id];
  if (!def) return null;

  return (
    <div className="modal-backdrop">
      <div className="challenge-modal">
        {def.type === 'math' ? <MathChallengeView def={def} /> : <ReadingChallengeView def={def} />}
      </div>
    </div>
  );
}
