import { useGameStore, content } from '@/state/gameStore';
import { Button } from '@/ui/components/shared/Button';

export function QuestLog({ onClose }: { onClose: () => void }) {
  const quests = useGameStore((s) => s.quests);
  const entries = Object.values(quests);

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Quest Log</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className="panel__empty">No quests yet — go talk to someone!</p>
      ) : (
        entries.map((progress) => {
          const def = content.quests[progress.questId];
          if (!def) return null;
          const currentStep = def.steps[progress.currentStepIndex];
          return (
            <div key={def.id} className="quest-entry">
              <h3>{def.title}</h3>
              <p>{def.summary}</p>
              <p className="quest-entry__status">
                {progress.status === 'completed' ? 'Complete!' : (currentStep?.description ?? '')}
              </p>
              <ul className="quest-entry__steps">
                {def.steps.map((step) => (
                  <li key={step.id} className={progress.completedStepIds.includes(step.id) ? 'done' : ''}>
                    {step.description}
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
