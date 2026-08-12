export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  stackable: boolean;
  iconTextureKey: string;
}

export interface InventoryStack {
  itemId: string;
  quantity: number;
}

export interface InventoryState {
  stacks: InventoryStack[];
}

export function createInitialInventoryState(): InventoryState {
  return { stacks: [] };
}
