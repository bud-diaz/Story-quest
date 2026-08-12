import { useGameStore, content } from '@/state/gameStore';
import { TRAIT_IDS, type TraitId } from '@/types';
import { IconSwatch } from '@/ui/components/shared/IconSwatch';
import { Button } from '@/ui/components/shared/Button';

const TRAIT_EMOJI: Record<TraitId, string> = {
  brave: '🦁',
  curious: '🔍',
  kind: '💛',
  clever: '🧠',
  creative: '🎨',
};

export function AvatarPanel({ onClose }: { onClose: () => void }) {
  const avatar = useGameStore((s) => s.avatar);
  const traits = useGameStore((s) => s.traits);

  const equippedCosmetics = Object.values(avatar.equipped)
    .filter((id): id is string => Boolean(id))
    .map((id) => content.cosmetics[id])
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Your Explorer</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <ul className="panel__grid">
        {equippedCosmetics.map((cosmetic) => (
          <li key={cosmetic.id} className="panel__item">
            <IconSwatch name={cosmetic.name} textureKey={cosmetic.textureKey} shape="square" size={40} />
            <span>{cosmetic.name}</span>
          </li>
        ))}
      </ul>
      <h3 className="panel__subheading">How you've grown</h3>
      <ul className="trait-list">
        {TRAIT_IDS.map((trait) => (
          <li key={trait} className="trait-list__item">
            <span className="trait-list__emoji">{TRAIT_EMOJI[trait]}</span>
            <span className="trait-list__name">{trait}</span>
            <span className="trait-list__count">{traits[trait]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
