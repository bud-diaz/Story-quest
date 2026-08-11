import { useState } from 'react';
import { useGameStore } from '@/state/gameStore';
import { DialogueBox } from '@/ui/components/DialogueBox/DialogueBox';
import { ChallengeModal } from '@/ui/components/ChallengeModal/ChallengeModal';
import { ChoicePrompt } from '@/ui/components/ChoicePrompt/ChoicePrompt';
import { InventoryPanel } from '@/ui/components/InventoryPanel/InventoryPanel';
import { AvatarPanel } from '@/ui/components/AvatarPanel/AvatarPanel';
import { QuestLog } from '@/ui/components/QuestLog/QuestLog';
import { SaveLoadMenu } from '@/ui/components/SaveLoadMenu/SaveLoadMenu';
import { HUD, type PanelKind } from '@/ui/components/HUD/HUD';
import { Toast } from '@/ui/components/shared/Toast';

/** The whole React overlay stacked above the Phaser canvas — pointer-events are re-enabled per-child in CSS. */
export function UIOverlay() {
  const [openPanel, setOpenPanel] = useState<PanelKind>(null);
  const activeModal = useGameStore((s) => s.activeModal);

  return (
    <div className="ui-overlay">
      <Toast />
      <HUD openPanel={openPanel} onTogglePanel={setOpenPanel} />

      {openPanel === 'inventory' && <InventoryPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === 'avatar' && <AvatarPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === 'quests' && <QuestLog onClose={() => setOpenPanel(null)} />}
      {openPanel === 'save' && <SaveLoadMenu onClose={() => setOpenPanel(null)} />}

      {activeModal?.kind === 'dialogue' && <DialogueBox />}
      {activeModal?.kind === 'challenge' && <ChallengeModal />}
      {activeModal?.kind === 'branch' && <ChoicePrompt />}
    </div>
  );
}
