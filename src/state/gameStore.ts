/**
 * The single choke-point layer: the only module allowed to import both
 * engine/ and content/. Both game/ (Phaser) and ui/ (React) read and write
 * exclusively through this store — never through each other — via the
 * standard hook in React and via useGameStore.getState()/subscribe() in
 * Phaser. See ARCHITECTURE.md for the full rationale.
 */
import { create } from 'zustand';
import type {
  AvatarState,
  ChallengeResponse,
  CompanionState,
  ContentPack,
  DialogueNode,
  Effect,
  FlagState,
  GameStateSnapshot,
  InventoryState,
  QuestProgress,
  TraitState,
} from '@/types';
import {
  CURRENT_SAVE_VERSION,
  createInitialAvatarState,
  createInitialCompanionState,
  createInitialFlagState,
  createInitialInventoryState,
  createInitialTraitState,
} from '@/types';
import { applyEffects as applyEffectsPure } from '@/engine/effects';
import { checkForNewUnlocks } from '@/engine/avatar/avatarSystem';
import { reconcileQuests } from '@/engine/quest/questSystem';
import { getStartNode, getNode, findChoice } from '@/engine/dialogue/dialogueEngine';
import { resolveNpcDialogueId } from '@/engine/dialogue/npcDialogue';
import { resolveBranchOption } from '@/engine/narrative/branchEngine';
import { runChallenge } from '@/engine/challenge/challengeTypes';
import { contentRegistry } from '@/engine/content/contentRegistry';
import { readSave, serializeSaveGame, writeSave, type StorageLike } from '@/engine/save/saveManager';
import { loadForestAdventurePack } from '@/state/content/forestAdventurePack';

/** The active content pack. Static for the lifetime of the app in this MVP. */
export const content: ContentPack = loadForestAdventurePack();

export type ModalState =
  | { kind: 'dialogue'; id: string }
  | { kind: 'challenge'; id: string }
  | { kind: 'branch'; id: string };

interface DialoguePosition {
  treeId: string;
  nodeId: string;
}

interface PendingDialogueReturn {
  treeId: string;
  node: DialogueNode;
}

export interface GameState extends GameStateSnapshot {
  position: { sceneId: string; x: number; y: number };
  activeModal: ModalState | null;
  currentDialogue: DialoguePosition | null;
  pendingDialogueReturn: PendingDialogueReturn | null;
  meta: { contentPackId: string; contentPackVersion: string; saveVersion: number };

  openDialogueForNpc(npcId: string): void;
  openDialogue(dialogueId: string): void;
  continueDialogue(): void;
  chooseDialogueOption(choiceId: string): void;

  openChallenge(challengeId: string): void;
  resolveChallenge(response: ChallengeResponse): void;

  openBranch(branchId: string): void;
  resolveBranch(optionId: string): void;

  travelToScene(sceneId: string, spawnPointId: string): void;
  applyEffects(effects: Effect[]): void;
  closeModal(): void;

  newGame(): void;
  saveGame(): void;
  loadGame(): boolean;
  hasSaveGame(): boolean;
}

function createDefaultStorage(): StorageLike {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // Node/test fallback so save/load logic is exercisable without a DOM.
  const memory = new Map<string, string>();
  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => void memory.set(key, value),
    removeItem: (key) => void memory.delete(key),
  };
}

const storage = createDefaultStorage();

function getSnapshot(state: GameStateSnapshot): GameStateSnapshot {
  return {
    traits: state.traits,
    flags: state.flags,
    inventory: state.inventory,
    quests: state.quests,
    avatar: state.avatar,
    companions: state.companions,
  };
}

/** Runs every reconciliation pass (quests, then avatar unlocks) in one go. */
function reconcileAll(snapshot: GameStateSnapshot): GameStateSnapshot {
  const quests = reconcileQuests(snapshot, content.quests, { snapshot, content });
  const afterQuests: GameStateSnapshot = { ...snapshot, quests };
  const avatarResult = checkForNewUnlocks(afterQuests, content.cosmetics, {
    snapshot: afterQuests,
    content,
  });
  return { ...afterQuests, avatar: avatarResult.avatar };
}

function createInitialSlice(): Pick<
  GameState,
  keyof GameStateSnapshot | 'position' | 'activeModal' | 'currentDialogue' | 'pendingDialogueReturn' | 'meta'
> {
  const base: GameStateSnapshot = {
    traits: createInitialTraitState(),
    flags: createInitialFlagState(),
    inventory: createInitialInventoryState(),
    quests: {},
    avatar: createInitialAvatarState(),
    companions: createInitialCompanionState(),
  };
  const reconciled = reconcileAll(base);
  const startScene = contentRegistry.scene(content, content.manifest.startSceneId);
  const startSpawn = startScene.spawnPoints[content.manifest.startSpawnPoint];
  if (!startSpawn) {
    throw new Error(
      `Content pack "${content.manifest.id}" has no spawn point "${content.manifest.startSpawnPoint}" in scene "${startScene.id}"`,
    );
  }
  return {
    ...reconciled,
    position: { sceneId: startScene.id, x: startSpawn.x, y: startSpawn.y },
    activeModal: null,
    currentDialogue: null,
    pendingDialogueReturn: null,
    meta: {
      contentPackId: content.manifest.id,
      contentPackVersion: content.manifest.version,
      saveVersion: CURRENT_SAVE_VERSION,
    },
  };
}

export const useGameStore = create<GameState>()((set, get) => {
  function applyAndReconcile(effects: Effect[]): void {
    const snapshot = getSnapshot(get());
    const applied = applyEffectsPure(snapshot, effects, content);
    set(reconcileAll(applied));
  }

  function enterDialogueNode(treeId: string, nodeId: string): void {
    const tree = contentRegistry.dialogue(content, treeId);
    const node = getNode(tree, nodeId);
    applyAndReconcile(node.effects ?? []);
    set({
      currentDialogue: { treeId, nodeId },
      activeModal: { kind: 'dialogue', id: treeId },
      pendingDialogueReturn: null,
    });
  }

  return {
    ...createInitialSlice(),

    openDialogueForNpc(npcId) {
      const npc = contentRegistry.npc(content, npcId);
      const dialogueId = resolveNpcDialogueId(npc, get().flags);
      get().openDialogue(dialogueId);
    },

    openDialogue(dialogueId) {
      const tree = contentRegistry.dialogue(content, dialogueId);
      enterDialogueNode(dialogueId, getStartNode(tree).id);
    },

    continueDialogue() {
      const { currentDialogue } = get();
      if (!currentDialogue) return;
      const tree = contentRegistry.dialogue(content, currentDialogue.treeId);
      const node = getNode(tree, currentDialogue.nodeId);
      if (node.choices?.length) return; // must go through chooseDialogueOption instead

      if (node.challengeId) {
        set({
          activeModal: { kind: 'challenge', id: node.challengeId },
          pendingDialogueReturn: { treeId: currentDialogue.treeId, node },
        });
        return;
      }
      if (node.triggersBranch) {
        set({ activeModal: { kind: 'branch', id: node.triggersBranch }, currentDialogue: null });
        return;
      }
      if (node.next) {
        enterDialogueNode(currentDialogue.treeId, node.next);
        return;
      }
      set({ activeModal: null, currentDialogue: null, pendingDialogueReturn: null });
    },

    chooseDialogueOption(choiceId) {
      const { currentDialogue } = get();
      if (!currentDialogue) return;
      const tree = contentRegistry.dialogue(content, currentDialogue.treeId);
      const node = getNode(tree, currentDialogue.nodeId);
      const choice = findChoice(node, choiceId);
      if (!choice) return;

      applyAndReconcile(choice.effects ?? []);

      if (choice.next) {
        enterDialogueNode(currentDialogue.treeId, choice.next);
      } else {
        set({ activeModal: null, currentDialogue: null, pendingDialogueReturn: null });
      }
    },

    openChallenge(challengeId) {
      set({ activeModal: { kind: 'challenge', id: challengeId }, currentDialogue: null, pendingDialogueReturn: null });
    },

    resolveChallenge(response) {
      const state = get();
      if (!state.activeModal || state.activeModal.kind !== 'challenge') return;
      const def = contentRegistry.challenge(content, state.activeModal.id);
      const { success } = runChallenge(def, response);
      const effects = success ? def.successEffects : (def.failureEffects ?? []);
      applyAndReconcile(effects);

      const pending = get().pendingDialogueReturn;

      if (!success && def.retryAllowed && !pending) {
        // Stay on the same challenge so the player can simply try again.
        return;
      }

      set({ pendingDialogueReturn: null });
      if (pending) {
        const nextId = success ? pending.node.onSuccessNext : pending.node.onFailureNext;
        if (nextId) {
          enterDialogueNode(pending.treeId, nextId);
        } else {
          set({ activeModal: null, currentDialogue: null });
        }
      } else {
        set({ activeModal: null });
      }
    },

    openBranch(branchId) {
      set({ activeModal: { kind: 'branch', id: branchId }, currentDialogue: null, pendingDialogueReturn: null });
    },

    resolveBranch(optionId) {
      const state = get();
      if (!state.activeModal || state.activeModal.kind !== 'branch') return;
      const branch = contentRegistry.branch(content, state.activeModal.id);
      const resolved = resolveBranchOption(branch, optionId);
      if (!resolved) return;

      applyAndReconcile(resolved.effects);

      if (resolved.option.outcomeDialogueId) {
        get().openDialogue(resolved.option.outcomeDialogueId);
      } else {
        set({ activeModal: null });
      }
    },

    travelToScene(sceneId, spawnPointId) {
      const scene = contentRegistry.scene(content, sceneId);
      const spawn = scene.spawnPoints[spawnPointId];
      if (!spawn) throw new Error(`Scene "${sceneId}" has no spawn point "${spawnPointId}"`);
      set({ position: { sceneId, x: spawn.x, y: spawn.y } });
    },

    applyEffects(effects) {
      applyAndReconcile(effects);
    },

    closeModal() {
      set({ activeModal: null, currentDialogue: null, pendingDialogueReturn: null });
    },

    newGame() {
      set(createInitialSlice());
    },

    saveGame() {
      const state = get();
      const save = serializeSaveGame({
        contentPackId: content.manifest.id,
        contentPackVersion: content.manifest.version,
        traits: state.traits,
        flags: state.flags,
        inventory: state.inventory,
        quests: state.quests,
        avatar: state.avatar,
        companions: state.companions,
        position: state.position,
      });
      writeSave(storage, save);
    },

    loadGame() {
      const result = readSave(storage);
      if (!result.save) return false;
      if (result.save.contentPackId !== content.manifest.id) return false;
      applyLoadedSave(set, result.save);
      return true;
    },

    hasSaveGame() {
      return readSave(storage).save !== null;
    },
  };
});

function applyLoadedSave(
  set: (partial: Partial<GameState>) => void,
  save: {
    traits: TraitState;
    flags: FlagState;
    inventory: InventoryState;
    quests: Record<string, QuestProgress>;
    avatar: AvatarState;
    companions: CompanionState;
    position: { sceneId: string; x: number; y: number };
  },
): void {
  set({
    traits: save.traits,
    flags: save.flags,
    inventory: save.inventory,
    quests: save.quests,
    avatar: save.avatar,
    companions: save.companions,
    position: save.position,
    activeModal: null,
    currentDialogue: null,
    pendingDialogueReturn: null,
  });
}
