import { useState } from 'react';
import { useGameStore } from '@/state/gameStore';
import { GameRoot } from '@/ui/GameRoot';
import { StartScreen } from '@/ui/StartScreen';

/**
 * Gates mounting the Phaser game behind a New Game / Continue choice: a
 * loaded save must land in the store *before* BootScene reads the current
 * position to decide which scene to start.
 */
export function App() {
  const [started, setStarted] = useState(false);
  const [hasSave] = useState(() => useGameStore.getState().hasSaveGame());

  if (!started) {
    return (
      <StartScreen
        hasSave={hasSave}
        onNewGame={() => {
          useGameStore.getState().newGame();
          setStarted(true);
        }}
        onContinue={() => {
          useGameStore.getState().loadGame();
          setStarted(true);
        }}
      />
    );
  }

  return <GameRoot />;
}
