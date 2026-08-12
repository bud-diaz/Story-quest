/**
 * The five character traits StoryQuest tracks. Content (dialogue, avatar
 * cosmetics, quests) can react to these, but there is no "correct" trait —
 * they exist purely to reflect the shape of the choices a player made.
 */
export const TRAIT_IDS = ['brave', 'curious', 'kind', 'clever', 'creative'] as const;

export type TraitId = (typeof TRAIT_IDS)[number];

export const TRAIT_MIN = 0;
export const TRAIT_MAX = 10;

export type TraitState = Record<TraitId, number>;

export function createInitialTraitState(): TraitState {
  return { brave: 0, curious: 0, kind: 0, clever: 0, creative: 0 };
}
