import { useState } from 'react';
import { useGameStore } from '@/state/gameStore';
import { eventBus } from '@/state/eventBus';
import { Button } from '@/ui/components/shared/Button';

export function SaveLoadMenu({ onClose }: { onClose: () => void }) {
  const [hasSave, setHasSave] = useState(() => useGameStore.getState().hasSaveGame());

  function handleSave(): void {
    useGameStore.getState().saveGame();
    setHasSave(true);
    eventBus.emit('toast', { message: 'Game saved!' });
  }

  function handleLoad(): void {
    const loaded = useGameStore.getState().loadGame();
    eventBus.emit('toast', { message: loaded ? 'Game loaded!' : 'No save found.' });
    if (loaded) onClose();
  }

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Save &amp; Load</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="panel__actions">
        <Button onClick={handleSave}>Save Game</Button>
        <Button onClick={handleLoad} disabled={!hasSave}>
          Load Game
        </Button>
      </div>
    </div>
  );
}
