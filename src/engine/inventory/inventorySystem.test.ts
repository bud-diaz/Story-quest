import { describe, expect, it } from 'vitest';
import { addItem, getQuantity, hasItem, removeItem } from './inventorySystem';
import type { InventoryState, ItemDefinition } from '@/types';

const pebble: ItemDefinition = { id: 'shiny-pebble', name: 'Pebble', description: '', stackable: true, iconTextureKey: 'icon-pebble' };
const key: ItemDefinition = { id: 'brass-key', name: 'Key', description: '', stackable: false, iconTextureKey: 'icon-key' };

describe('inventorySystem', () => {
  it('merges quantities for stackable items', () => {
    let state: InventoryState = { stacks: [] };
    state = addItem(state, pebble, 1);
    state = addItem(state, pebble, 2);
    expect(getQuantity(state, 'shiny-pebble')).toBe(3);
    expect(state.stacks).toHaveLength(1);
  });

  it('creates separate stacks for non-stackable items', () => {
    let state: InventoryState = { stacks: [] };
    state = addItem(state, key, 1);
    state = addItem(state, key, 1);
    expect(state.stacks).toHaveLength(2);
  });

  it('removes quantity and drops the stack once empty', () => {
    let state: InventoryState = { stacks: [{ itemId: 'shiny-pebble', quantity: 2 }] };
    state = removeItem(state, 'shiny-pebble', 1);
    expect(getQuantity(state, 'shiny-pebble')).toBe(1);
    state = removeItem(state, 'shiny-pebble', 1);
    expect(hasItem(state, 'shiny-pebble')).toBe(false);
  });

  it('is a no-op removing an item that is not present', () => {
    const state: InventoryState = { stacks: [] };
    expect(removeItem(state, 'nope', 1)).toBe(state);
  });
});
