import { PhaserMount } from '@/ui/PhaserMount';
import { UIOverlay } from '@/ui/UIOverlay';

/** Canvas and UI overlay as CSS-stacked siblings — neither imports the other's internals. */
export function GameRoot() {
  return (
    <div className="game-root">
      <PhaserMount />
      <UIOverlay />
    </div>
  );
}
