export interface SceneSignpost {
  id: string;
  label: string;
  x: number;
  y: number;
  locked: boolean;
  lockedText?: string;
  targetSceneId?: string;
  targetSpawnPoint?: string;
}

export type SceneInteractableType = 'challenge' | 'bridge' | 'gate' | 'companionGate';

export interface SceneInteractable {
  id: string;
  type: SceneInteractableType;
  x: number;
  y: number;
  challengeId?: string;
  /** For type 'bridge'/'gate': the flag that must be truthy to be passable. */
  unlockedByFlag?: string;
  /** For type 'companionGate': the companion unlocksInteractions tag required. */
  requiresCompanionInteraction?: string;
  lockedText?: string;
}

export interface SceneDefinition {
  id: string;
  name: string;
  spawnPoints: Record<string, { x: number; y: number }>;
  signposts?: SceneSignpost[];
  npcs?: string[];
  interactables?: SceneInteractable[];
}
