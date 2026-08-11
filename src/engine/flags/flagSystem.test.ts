import { describe, expect, it } from 'vitest';
import { applyFlagOp } from './flagSystem';

describe('applyFlagOp', () => {
  it('sets a flag, defaulting to true when no value given', () => {
    expect(applyFlagOp({}, 'metBenny', 'set').metBenny).toBe(true);
    expect(applyFlagOp({}, 'bridgeChoice', 'set', 'cross-bridge').bridgeChoice).toBe('cross-bridge');
  });

  it('toggles a boolean-ish flag', () => {
    expect(applyFlagOp({ a: true }, 'a', 'toggle').a).toBe(false);
    expect(applyFlagOp({}, 'a', 'toggle').a).toBe(true);
  });

  it('increments a numeric flag, defaulting the step to 1', () => {
    expect(applyFlagOp({ count: 2 }, 'count', 'increment').count).toBe(3);
    expect(applyFlagOp({}, 'count', 'increment', 5).count).toBe(5);
  });
});
