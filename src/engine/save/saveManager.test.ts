import { describe, expect, it } from 'vitest';
import { clearSave, deserializeSaveGame, readSave, serializeSaveGame, writeSave, type StorageLike } from './saveManager';
import {
  createInitialAvatarState,
  createInitialCompanionState,
  createInitialFlagState,
  createInitialInventoryState,
  createInitialTraitState,
} from '@/types';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}

const baseInput = {
  contentPackId: 'forest-adventure',
  contentPackVersion: '0.1.0',
  traits: createInitialTraitState(),
  flags: createInitialFlagState(),
  inventory: createInitialInventoryState(),
  quests: {},
  avatar: createInitialAvatarState(),
  companions: createInitialCompanionState(),
  position: { sceneId: 'hub', x: 400, y: 300 },
};

describe('saveManager', () => {
  it('round-trips through write/read via injected storage', () => {
    const storage = createMemoryStorage();
    const save = serializeSaveGame(baseInput);
    writeSave(storage, save);
    const result = readSave(storage);
    expect(result.save).toEqual(save);
  });

  it('reports missing save data', () => {
    const result = readSave(createMemoryStorage());
    expect(result.save).toBeNull();
    expect(result.error).toMatch(/No save data/);
  });

  it('rejects malformed JSON', () => {
    const result = deserializeSaveGame('{not json');
    expect(result.save).toBeNull();
    expect(result.error).toMatch(/not valid JSON/);
  });

  it('rejects a mismatched save version', () => {
    const result = deserializeSaveGame(JSON.stringify({ saveVersion: 99 }));
    expect(result.save).toBeNull();
    expect(result.error).toMatch(/Unsupported save version/);
  });

  it('clearSave removes the entry', () => {
    const storage = createMemoryStorage();
    writeSave(storage, serializeSaveGame(baseInput));
    clearSave(storage);
    expect(readSave(storage).save).toBeNull();
  });
});
