import { WorldScene } from './WorldScene';
import { TEXTURE_KEYS } from '@/game/gfx/textureKeys';

export class ForestScene extends WorldScene {
  constructor() {
    super('forest', TEXTURE_KEYS.groundForest, TEXTURE_KEYS.treeTuft);
  }
}
