/** Pure, framework-agnostic. Must not import from state/, game/, or ui/. */
import type { InventoryState, ItemDefinition } from '@/types';

export function addItem(
  state: InventoryState,
  item: ItemDefinition,
  quantity: number,
): InventoryState {
  if (item.stackable) {
    const existing = state.stacks.find((s) => s.itemId === item.id);
    if (existing) {
      return {
        stacks: state.stacks.map((s) =>
          s.itemId === item.id ? { ...s, quantity: s.quantity + quantity } : s,
        ),
      };
    }
  }
  return { stacks: [...state.stacks, { itemId: item.id, quantity }] };
}

export function removeItem(state: InventoryState, itemId: string, quantity: number): InventoryState {
  const existing = state.stacks.find((s) => s.itemId === itemId);
  if (!existing) return state;
  const remaining = existing.quantity - quantity;
  if (remaining > 0) {
    return { stacks: state.stacks.map((s) => (s.itemId === itemId ? { ...s, quantity: remaining } : s)) };
  }
  return { stacks: state.stacks.filter((s) => s.itemId !== itemId) };
}

export function getQuantity(state: InventoryState, itemId: string): number {
  return state.stacks.find((s) => s.itemId === itemId)?.quantity ?? 0;
}

export function hasItem(state: InventoryState, itemId: string): boolean {
  return getQuantity(state, itemId) > 0;
}
