import { describe, expect, it } from 'vitest';
import { buildContentPack, type RawContentPackInputs } from './contentLoader';
import { checkContentIntegrity } from './contentIntegrity';

const inputs: RawContentPackInputs = {
  manifest: { id: 'p', version: '0.0.0', title: '', description: '', startSceneId: 'hub', startSpawnPoint: 'default' },
  npcs: [
    {
      id: 'beaver-benny',
      name: 'Benny',
      sceneId: 'forest',
      spawnPoint: { x: 0, y: 0 },
      portraitTextureKey: 'portrait-beaver',
      spriteTextureKey: 'sprite-beaver',
      defaultDialogueId: 'beaver-intro',
    },
  ],
  dialogues: [
    {
      id: 'beaver-intro',
      npcId: 'beaver-benny',
      startNode: 'greet',
      nodes: { greet: { id: 'greet', speakerId: 'beaver-benny', text: 'Hi', next: null } },
    },
  ],
  branches: [],
  challenges: [],
  quests: [],
  items: [],
  cosmetics: [],
  companions: [],
  scenes: [{ id: 'hub', name: 'Hub', spawnPoints: { default: { x: 0, y: 0 } } }],
};

describe('buildContentPack', () => {
  it('indexes each array by id', () => {
    const pack = buildContentPack(inputs);
    expect(pack.npcs['beaver-benny']?.name).toBe('Benny');
    expect(pack.dialogues['beaver-intro']?.startNode).toBe('greet');
    expect(pack.scenes['hub']?.name).toBe('Hub');
  });

  it('passes integrity checks when every reference resolves', () => {
    const pack = buildContentPack(inputs);
    expect(checkContentIntegrity(pack)).toEqual([]);
  });

  it('reports a broken cross-reference', () => {
    const broken = buildContentPack({
      ...inputs,
      npcs: [{ ...inputs.npcs[0]!, defaultDialogueId: 'does-not-exist' }],
    });
    const issues = checkContentIntegrity(broken);
    expect(issues.some((i) => i.message.includes('does-not-exist'))).toBe(true);
  });
});
