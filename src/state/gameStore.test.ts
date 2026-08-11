import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

beforeEach(() => {
  useGameStore.getState().newGame();
});

describe('gameStore — initial state', () => {
  it('auto-equips the starting cosmetic and spawns in the hub', () => {
    const state = useGameStore.getState();
    expect(state.avatar.equipped.head).toBe('travelers-cap');
    expect(state.position).toEqual({ sceneId: 'hub', x: 400, y: 300 });
    expect(state.activeModal).toBeNull();
  });
});

describe('gameStore — full beaver bridge arc (help-gather branch)', () => {
  it('drives dialogue → math challenge (fail then succeed) → branch → outcome dialogue end-to-end', () => {
    const store = useGameStore;

    store.getState().travelToScene('forest', 'fromHub');
    expect(store.getState().position.sceneId).toBe('forest');

    store.getState().openDialogueForNpc('beaver-benny');
    expect(store.getState().activeModal).toEqual({ kind: 'dialogue', id: 'beaver-intro' });
    expect(store.getState().currentDialogue?.nodeId).toBe('greet');
    expect(store.getState().flags.metBenny).toBe(true);
    expect(store.getState().quests['fix-the-bridge']?.status).toBe('active');
    expect(store.getState().quests['fix-the-bridge']?.completedStepIds).toEqual(['talk-to-benny']);

    store.getState().continueDialogue(); // -> explain
    expect(store.getState().currentDialogue?.nodeId).toBe('explain');
    store.getState().continueDialogue(); // -> ask-help
    expect(store.getState().currentDialogue?.nodeId).toBe('ask-help');

    store.getState().chooseDialogueOption('yes-help'); // -> start-math-challenge
    expect(store.getState().currentDialogue?.nodeId).toBe('start-math-challenge');

    store.getState().continueDialogue(); // opens the challenge
    expect(store.getState().activeModal).toEqual({ kind: 'challenge', id: 'math-beaver-logs' });

    // Wrong answer routes back into dialogue for a gentle retry beat.
    store.getState().resolveChallenge({ type: 'math', selected: 4 });
    expect(store.getState().activeModal).toEqual({ kind: 'dialogue', id: 'beaver-intro' });
    expect(store.getState().currentDialogue?.nodeId).toBe('math-retry');
    expect(store.getState().flags.bridgeFixed).toBeUndefined();

    store.getState().continueDialogue(); // re-opens the challenge
    expect(store.getState().activeModal).toEqual({ kind: 'challenge', id: 'math-beaver-logs' });

    // Correct answer (7 - 4 = 3).
    store.getState().resolveChallenge({ type: 'math', selected: 3 });
    expect(store.getState().flags.bridgeFixed).toBe(true);
    expect(store.getState().currentDialogue?.nodeId).toBe('math-success');
    expect(store.getState().traits.clever).toBe(2); // +1 from the challenge, +1 from the math-success node

    store.getState().continueDialogue(); // hands off to the branch point
    expect(store.getState().activeModal).toEqual({ kind: 'branch', id: 'bridge-fork' });
    expect(store.getState().currentDialogue).toBeNull();

    store.getState().resolveBranch('help-gather');
    expect(store.getState().flags['branch:bridge-fork']).toBe('help-gather');
    expect(store.getState().traits.kind).toBe(1);
    expect(store.getState().inventory.stacks).toEqual([{ itemId: 'shiny-pebble', quantity: 1 }]);
    expect(store.getState().companions).toEqual({ recruited: ['turtle-tumble'], active: 'turtle-tumble' });
    // Branch resolution opens the outcome dialogue automatically.
    expect(store.getState().activeModal).toEqual({ kind: 'dialogue', id: 'beaver-post-bridge-help' });

    store.getState().continueDialogue(); // terminal node -> conversation ends
    expect(store.getState().activeModal).toBeNull();
    expect(store.getState().currentDialogue).toBeNull();

    const finalState = store.getState();
    expect(finalState.quests['fix-the-bridge']?.status).toBe('completed');
    expect(finalState.avatar.unlockedCosmetics).toEqual(
      expect.arrayContaining(['travelers-cap', 'helpers-badge']),
    );
    expect(finalState.avatar.unlockedCosmetics).not.toContain('forest-cloak');
    expect(finalState.avatar.equipped).toMatchObject({ head: 'travelers-cap', aura: 'helpers-badge' });
  });
});

describe('gameStore — reading challenge (standalone, not routed through dialogue)', () => {
  it('allows an inline retry on failure and unlocks the forest cloak on success', () => {
    const store = useGameStore;

    store.getState().openChallenge('reading-forest-sign');
    expect(store.getState().activeModal).toEqual({ kind: 'challenge', id: 'reading-forest-sign' });

    store.getState().resolveChallenge({ type: 'reading', selected: 'LAKE' });
    // No dialogue to route back to and retryAllowed is true: stays open for another try.
    expect(store.getState().activeModal).toEqual({ kind: 'challenge', id: 'reading-forest-sign' });
    expect(store.getState().flags.readSignpost).toBeUndefined();

    store.getState().resolveChallenge({ type: 'reading', selected: 'CAVE' });
    expect(store.getState().flags.readSignpost).toBe(true);
    expect(store.getState().traits.curious).toBe(1);
    expect(store.getState().inventory.stacks).toEqual([{ itemId: 'shiny-pebble', quantity: 1 }]);
    expect(store.getState().activeModal).toBeNull();
    expect(store.getState().avatar.unlockedCosmetics).toContain('forest-cloak');
    expect(store.getState().avatar.equipped.back).toBe('forest-cloak');
  });
});

describe('gameStore — save/load', () => {
  it('round-trips traits, flags, inventory, and position through save then load', () => {
    const store = useGameStore;

    store.getState().travelToScene('forest', 'fromHub');
    store.getState().applyEffects([
      { type: 'trait', trait: 'brave', delta: 2 },
      { type: 'flag', flag: 'metBenny', op: 'set', value: true },
    ]);
    store.getState().saveGame();

    store.getState().newGame(); // simulate a fresh session before loading
    expect(store.getState().traits.brave).toBe(0);

    const loaded = store.getState().loadGame();
    expect(loaded).toBe(true);
    expect(store.getState().traits.brave).toBe(2);
    expect(store.getState().flags.metBenny).toBe(true);
    expect(store.getState().position.sceneId).toBe('forest');
  });

  it('reports whether a save exists', () => {
    expect(useGameStore.getState().hasSaveGame()).toBe(true); // written by the previous test
  });
});
