import { useGameStore, content } from '@/state/gameStore';
import { IconSwatch } from '@/ui/components/shared/IconSwatch';
import { Button } from '@/ui/components/shared/Button';

export function InventoryPanel({ onClose }: { onClose: () => void }) {
  const stacks = useGameStore((s) => s.inventory.stacks);

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Inventory</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      {stacks.length === 0 ? (
        <p className="panel__empty">Nothing here yet — go explore!</p>
      ) : (
        <ul className="panel__grid">
          {stacks.map((stack) => {
            const item = content.items[stack.itemId];
            if (!item) return null;
            return (
              <li key={stack.itemId} className="panel__item">
                <IconSwatch name={item.name} textureKey={item.iconTextureKey} shape="square" size={40} />
                <span>
                  {item.name}
                  {item.stackable && stack.quantity > 1 ? ` ×${stack.quantity}` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
