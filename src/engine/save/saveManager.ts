/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * Storage access is dependency-injected via StorageLike rather than a
 * direct `localStorage` reference, so this module is testable without a
 * DOM and the state/ layer can swap in a different backend later without
 * touching serialization logic.
 */
import {
  CURRENT_SAVE_VERSION,
  SAVE_STORAGE_KEY,
  type AvatarState,
  type CompanionState,
  type FlagState,
  type InventoryState,
  type QuestProgress,
  type SaveGame,
  type TraitState,
} from '@/types';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SerializeInput {
  contentPackId: string;
  contentPackVersion: string;
  traits: TraitState;
  flags: FlagState;
  inventory: InventoryState;
  quests: Record<string, QuestProgress>;
  avatar: AvatarState;
  companions: CompanionState;
  position: { sceneId: string; x: number; y: number };
}

export function serializeSaveGame(input: SerializeInput, now: Date = new Date()): SaveGame {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    contentPackId: input.contentPackId,
    contentPackVersion: input.contentPackVersion,
    savedAt: now.toISOString(),
    traits: input.traits,
    flags: input.flags,
    inventory: input.inventory,
    quests: input.quests,
    avatar: input.avatar,
    companions: input.companions,
    position: input.position,
  };
}

export interface DeserializeResult {
  save: SaveGame | null;
  error?: string;
}

export function deserializeSaveGame(raw: string): DeserializeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { save: null, error: 'Save data is not valid JSON.' };
  }
  if (!isPlainObject(parsed) || typeof parsed.saveVersion !== 'number') {
    return { save: null, error: 'Save data is missing a saveVersion.' };
  }
  if (parsed.saveVersion !== CURRENT_SAVE_VERSION) {
    // Migration seam: a future SaveGameV2 would add explicit migrate steps here.
    return { save: null, error: `Unsupported save version ${String(parsed.saveVersion)}.` };
  }
  return { save: parsed as unknown as SaveGame };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function writeSave(storage: StorageLike, save: SaveGame): void {
  storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
}

export function readSave(storage: StorageLike): DeserializeResult {
  const raw = storage.getItem(SAVE_STORAGE_KEY);
  if (!raw) return { save: null, error: 'No save data found.' };
  return deserializeSaveGame(raw);
}

export function clearSave(storage: StorageLike): void {
  storage.removeItem(SAVE_STORAGE_KEY);
}
