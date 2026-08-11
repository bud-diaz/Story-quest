import { virtualInput } from '@/state/virtualInput';
import { Button } from '@/ui/components/shared/Button';

export type PanelKind = 'inventory' | 'avatar' | 'quests' | 'save' | null;

interface HUDProps {
  openPanel: PanelKind;
  onTogglePanel: (panel: PanelKind) => void;
}

function press(direction: 'up' | 'down' | 'left' | 'right', pressed: boolean): void {
  virtualInput.setDirection(direction, pressed);
}

export function HUD({ openPanel, onTogglePanel }: HUDProps) {
  const toggle = (panel: PanelKind) => onTogglePanel(openPanel === panel ? null : panel);

  return (
    <>
      <div className="hud-bar">
        <Button variant="secondary" onClick={() => toggle('inventory')}>
          🎒 Items
        </Button>
        <Button variant="secondary" onClick={() => toggle('avatar')}>
          🧑 You
        </Button>
        <Button variant="secondary" onClick={() => toggle('quests')}>
          📜 Quests
        </Button>
        <Button variant="secondary" onClick={() => toggle('save')}>
          💾 Save
        </Button>
      </div>

      <div className="touch-controls">
        <div className="touch-dpad">
          <button
            className="touch-dpad__btn touch-dpad__btn--up"
            onPointerDown={() => press('up', true)}
            onPointerUp={() => press('up', false)}
            onPointerLeave={() => press('up', false)}
            aria-label="Move up"
          >
            ▲
          </button>
          <div className="touch-dpad__row">
            <button
              className="touch-dpad__btn"
              onPointerDown={() => press('left', true)}
              onPointerUp={() => press('left', false)}
              onPointerLeave={() => press('left', false)}
              aria-label="Move left"
            >
              ◀
            </button>
            <button
              className="touch-dpad__btn"
              onPointerDown={() => press('down', true)}
              onPointerUp={() => press('down', false)}
              onPointerLeave={() => press('down', false)}
              aria-label="Move down"
            >
              ▼
            </button>
            <button
              className="touch-dpad__btn"
              onPointerDown={() => press('right', true)}
              onPointerUp={() => press('right', false)}
              onPointerLeave={() => press('right', false)}
              aria-label="Move right"
            >
              ▶
            </button>
          </div>
        </div>
        <button className="touch-interact" onPointerDown={() => virtualInput.pressInteract()}>
          Talk / Act
        </button>
      </div>
    </>
  );
}
