import { WorldScene } from './WorldScene';
import { TEXTURE_KEYS } from '@/game/gfx/textureKeys';

export class HubScene extends WorldScene {
  constructor() {
    super('hub', TEXTURE_KEYS.groundHub, TEXTURE_KEYS.grassTuft);
  }
}
