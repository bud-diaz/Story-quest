/**
 * A tiny, plain (non-Zustand) mutable input buffer — not persisted, not
 * reactive. It exists purely so React's on-screen touch controls (HUD) can
 * feed Phaser's InputController without either layer importing the other's
 * internals; both only touch this shared, framework-agnostic object.
 */
export interface VirtualInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
}

const state: VirtualInputState = { up: false, down: false, left: false, right: false, interact: false };

export const virtualInput = {
  get(): Readonly<VirtualInputState> {
    return state;
  },
  setDirection(direction: 'up' | 'down' | 'left' | 'right', pressed: boolean): void {
    state[direction] = pressed;
  },
  pressInteract(): void {
    state.interact = true;
  },
  /** Reads and clears the interact flag in one step, so a tap is consumed exactly once. */
  consumeInteract(): boolean {
    const value = state.interact;
    state.interact = false;
    return value;
  },
};
