import { describe, expect, it } from 'vitest';
import { resolveNpcDialogueId } from './npcDialogue';
import type { NpcDefinition } from '@/types';

const benny: NpcDefinition = {
  id: 'beaver-benny',
  name: 'Benny',
  sceneId: 'forest',
  spawnPoint: { x: 0, y: 0 },
  portraitTextureKey: 'portrait-beaver',
  spriteTextureKey: 'sprite-beaver',
  defaultDialogueId: 'beaver-intro',
  postDialogue: { flag: 'branch:bridge-fork', dialogueId: 'beaver-idle-post-quest' },
};

describe('resolveNpcDialogueId', () => {
  it('opens the default dialogue before the flag is set', () => {
    expect(resolveNpcDialogueId(benny, {})).toBe('beaver-intro');
  });

  it('opens the post dialogue once the flag is truthy', () => {
    expect(resolveNpcDialogueId(benny, { 'branch:bridge-fork': 'cross-bridge' })).toBe('beaver-idle-post-quest');
  });

  it('falls back to defaultDialogueId when no postDialogue is configured', () => {
    const npc: NpcDefinition = { ...benny, postDialogue: undefined };
    expect(resolveNpcDialogueId(npc, { anything: true })).toBe('beaver-intro');
  });
});
