import { describe, expect, it } from 'vitest';
import { loadForestAdventurePack } from './forestAdventurePack';
import { checkContentIntegrity } from '@/engine/content/contentIntegrity';

describe('forest-adventure content pack', () => {
  it('has no dangling cross-references', () => {
    const pack = loadForestAdventurePack();
    expect(checkContentIntegrity(pack)).toEqual([]);
  });

  it('loads the expected ids', () => {
    const pack = loadForestAdventurePack();
    expect(pack.manifest.id).toBe('forest-adventure');
    expect(pack.npcs['beaver-benny']?.defaultDialogueId).toBe('beaver-intro');
    expect(pack.quests['fix-the-bridge']?.steps).toHaveLength(3);
    expect(pack.scenes['hub']?.signposts).toHaveLength(6);
    expect(pack.scenes['forest']?.interactables).toHaveLength(4);
    expect(Object.keys(pack.dialogues)).toEqual(
      expect.arrayContaining([
        'beaver-intro',
        'beaver-post-bridge-cross',
        'beaver-post-bridge-cave',
        'beaver-post-bridge-help',
        'beaver-idle-post-quest',
      ]),
    );
  });
});
