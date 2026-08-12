import { useGameStore, content } from '@/state/gameStore';
import { selectSnapshot } from '@/state/selectors';
import { getNode, getVisibleChoices } from '@/engine/dialogue/dialogueEngine';
import { IconSwatch } from '@/ui/components/shared/IconSwatch';
import { Button } from '@/ui/components/shared/Button';

function resolveSpeakerName(speakerId: string): string {
  if (speakerId === 'player') return 'You';
  if (speakerId === 'narrator') return 'Narrator';
  return content.npcs[speakerId]?.name ?? speakerId;
}

export function DialogueBox() {
  const currentDialogue = useGameStore((s) => s.currentDialogue);
  const snapshot = useGameStore(selectSnapshot);

  if (!currentDialogue) return null;
  const tree = content.dialogues[currentDialogue.treeId];
  if (!tree) return null;
  const node = getNode(tree, currentDialogue.nodeId);
  const choices = getVisibleChoices(node, { snapshot, content });
  const speakerName = resolveSpeakerName(node.speakerId);

  return (
    <div className="modal-backdrop">
      <div className="dialogue-box">
        <div className="dialogue-box__speaker">
          <IconSwatch name={speakerName} textureKey={node.portrait ?? node.speakerId} size={56} />
          <span className="dialogue-box__speaker-name">{speakerName}</span>
        </div>
        <p className="dialogue-box__text">{node.text}</p>
        <div className="dialogue-box__actions">
          {choices.length > 0 ? (
            choices.map((choice) => (
              <Button key={choice.id} onClick={() => useGameStore.getState().chooseDialogueOption(choice.id)}>
                {choice.text}
              </Button>
            ))
          ) : (
            <Button onClick={() => useGameStore.getState().continueDialogue()}>Continue</Button>
          )}
        </div>
      </div>
    </div>
  );
}
