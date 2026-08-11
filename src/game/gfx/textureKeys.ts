/**
 * Phaser texture keys for everything rendered on the game canvas (world
 * sprites). Portraits and inventory icons are UI-only and rendered by
 * React as CSS swatches instead — see ui/components/shared/Swatch.tsx —
 * so they intentionally do not appear here.
 *
 * Swap point for real art: replace the generateTexture() calls in
 * textureFactory.ts with this.load.image(key, '/assets/...') in a real
 * preload(). Every consumer below only ever references the key string, so
 * nothing else needs to change.
 */
export const TEXTURE_KEYS = {
  playerBody: 'player-body',
  groundHub: 'ground-hub',
  groundForest: 'ground-forest',
  treeTuft: 'tree-tuft',
  grassTuft: 'grass-tuft',
  bridgeBroken: 'bridge-broken',
  bridgeFixed: 'bridge-fixed',
  signpostUnlocked: 'signpost-unlocked',
  signpostLocked: 'signpost-locked',
  caveClosed: 'cave-closed',
  caveOpen: 'cave-open',
  riverClosed: 'river-closed',
  riverOpen: 'river-open',
} as const;
