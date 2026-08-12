import {
  createInitialAvatarState,
  createInitialCompanionState,
  createInitialFlagState,
  createInitialInventoryState,
  createInitialTraitState,
  type ContentPack,
  type EvaluationContext,
  type GameStateSnapshot,
} from '@/types';

export function createEmptySnapshot(overrides: Partial<GameStateSnapshot> = {}): GameStateSnapshot {
  return {
    traits: createInitialTraitState(),
    flags: createInitialFlagState(),
    inventory: createInitialInventoryState(),
    quests: {},
    avatar: createInitialAvatarState(),
    companions: createInitialCompanionState(),
    ...overrides,
  };
}

export function createEmptyContentPack(overrides: Partial<ContentPack> = {}): ContentPack {
  return {
    manifest: {
      id: 'test-pack',
      version: '0.0.0',
      title: 'Test Pack',
      description: '',
      startSceneId: 'hub',
      startSpawnPoint: 'default',
    },
    npcs: {},
    dialogues: {},
    branches: {},
    challenges: {},
    quests: {},
    items: {},
    cosmetics: {},
    companions: {},
    scenes: {},
    ...overrides,
  };
}

export function createCtx(
  snapshot: GameStateSnapshot = createEmptySnapshot(),
  content: ContentPack = createEmptyContentPack(),
): EvaluationContext {
  return { snapshot, content };
}
