import { useGameStore, content } from '@/state/gameStore';
import { selectSnapshot } from '@/state/selectors';
import { getVisibleOptions } from '@/engine/narrative/branchEngine';
import { Button } from '@/ui/components/shared/Button';

/**
 * A world-state fork, visually distinct from DialogueBox: this is where
 * the story actually branches, not just where a line of dialogue varies.
 */
export function ChoicePrompt() {
  const activeModal = useGameStore((s) => s.activeModal);
  const snapshot = useGameStore(selectSnapshot);
  if (!activeModal || activeModal.kind !== 'branch') return null;

  const branch = content.branches[activeModal.id];
  if (!branch) return null;
  const options = getVisibleOptions(branch, { snapshot, content });

  return (
    <div className="modal-backdrop">
      <div className="choice-prompt">
        <p className="choice-prompt__prompt">{branch.prompt}</p>
        <div className="choice-prompt__options">
          {options.map((option) => (
            <Button key={option.id} onClick={() => useGameStore.getState().resolveBranch(option.id)}>
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
