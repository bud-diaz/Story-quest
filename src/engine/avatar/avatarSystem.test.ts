import { describe, expect, it } from 'vitest';
import { checkForNewUnlocks, equipCosmetic, unlockCosmetic } from './avatarSystem';
import { createCtx, createEmptyContentPack, createEmptySnapshot } from '../../../test/fixtures';
import type { CosmeticDefinition } from '@/types';

const forestCloak: CosmeticDefinition = {
  id: 'forest-cloak',
  slot: 'back',
  name: 'Forest Cloak',
  description: '',
  unlockConditions: [{ type: 'trait', trait: 'curious', op: 'gte', value: 1 }],
  autoEquip: true,
  textureKey: 'cosmetic-forest-cloak',
};

describe('avatarSystem', () => {
  it('unlockCosmetic is idempotent', () => {
    const state = unlockCosmetic({ unlockedCosmetics: [], equipped: {} }, 'travelers-cap');
    expect(unlockCosmetic(state, 'travelers-cap').unlockedCosmetics).toEqual(['travelers-cap']);
  });

  it('equipCosmetic sets the slot to the cosmetic id', () => {
    const state = equipCosmetic({ unlockedCosmetics: [], equipped: {} }, { id: 'forest-cloak', slot: 'back' });
    expect(state.equipped.back).toBe('forest-cloak');
  });

  it('checkForNewUnlocks unlocks and auto-equips cosmetics whose conditions are newly met', () => {
    const content = createEmptyContentPack({ cosmetics: { 'forest-cloak': forestCloak } });
    const snapshot = createEmptySnapshot({ traits: { brave: 0, curious: 1, kind: 0, clever: 0, creative: 0 } });
    const ctx = createCtx(snapshot, content);

    const result = checkForNewUnlocks(snapshot, content.cosmetics, ctx);
    expect(result.newlyUnlocked).toEqual(['forest-cloak']);
    expect(result.avatar.unlockedCosmetics).toContain('forest-cloak');
    expect(result.avatar.equipped.back).toBe('forest-cloak');
  });

  it('does not re-report an already-unlocked cosmetic', () => {
    const content = createEmptyContentPack({ cosmetics: { 'forest-cloak': forestCloak } });
    const snapshot = createEmptySnapshot({
      traits: { brave: 0, curious: 1, kind: 0, clever: 0, creative: 0 },
      avatar: { unlockedCosmetics: ['forest-cloak'], equipped: { back: 'forest-cloak' } },
    });
    const ctx = createCtx(snapshot, content);
    const result = checkForNewUnlocks(snapshot, content.cosmetics, ctx);
    expect(result.newlyUnlocked).toEqual([]);
  });
});
