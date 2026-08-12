import { describe, expect, it } from 'vitest';
import { applyEffects } from './effects';
import { createEmptyContentPack, createEmptySnapshot } from '../../test/fixtures';

describe('applyEffects', () => {
  it('applies a mixed batch of effects touching trait, flag, item, quest, companion, avatar', () => {
    const content = createEmptyContentPack({
      items: { 'shiny-pebble': { id: 'shiny-pebble', name: 'Pebble', description: '', stackable: true, iconTextureKey: 'icon-pebble' } },
      cosmetics: {
        'forest-cloak': {
          id: 'forest-cloak',
          slot: 'back',
          name: 'Forest Cloak',
          description: '',
          unlockConditions: [],
          textureKey: 'cosmetic-forest-cloak',
        },
      },
      companions: {
        'turtle-tumble': { id: 'turtle-tumble', species: 'turtle', name: 'Tumble', description: '', unlocksInteractions: [] },
      },
    });
    const snapshot = createEmptySnapshot();

    const result = applyEffects(
      snapshot,
      [
        { type: 'trait', trait: 'kind', delta: 1 },
        { type: 'flag', flag: 'bridgeFixed', op: 'set', value: true },
        { type: 'item', itemId: 'shiny-pebble', op: 'add', quantity: 2 },
        { type: 'companion', companionId: 'turtle-tumble', op: 'recruit' },
        { type: 'avatar', op: 'unlock', cosmeticId: 'forest-cloak' },
        { type: 'avatar', op: 'equip', cosmeticId: 'forest-cloak' },
      ],
      content,
    );

    expect(result.traits.kind).toBe(1);
    expect(result.flags.bridgeFixed).toBe(true);
    expect(result.inventory.stacks).toEqual([{ itemId: 'shiny-pebble', quantity: 2 }]);
    expect(result.companions).toEqual({ recruited: ['turtle-tumble'], active: 'turtle-tumble' });
    expect(result.avatar.unlockedCosmetics).toContain('forest-cloak');
    expect(result.avatar.equipped.back).toBe('forest-cloak');
  });

  it('ignores item/avatar effects referencing unknown content ids rather than throwing', () => {
    const content = createEmptyContentPack();
    const snapshot = createEmptySnapshot();
    const result = applyEffects(
      snapshot,
      [
        { type: 'item', itemId: 'ghost-item', op: 'add' },
        { type: 'avatar', op: 'unlock', cosmeticId: 'ghost-cosmetic' },
      ],
      content,
    );
    expect(result).toEqual(snapshot);
  });

  it('is left-to-right sequential so later effects see earlier ones', () => {
    const content = createEmptyContentPack();
    const snapshot = createEmptySnapshot();
    const result = applyEffects(
      snapshot,
      [
        { type: 'trait', trait: 'brave', delta: 5 },
        { type: 'trait', trait: 'brave', delta: 5 },
        { type: 'trait', trait: 'brave', delta: 5 },
      ],
      content,
    );
    // clamps at TRAIT_MAX (10) rather than reaching 15
    expect(result.traits.brave).toBe(10);
  });
});
