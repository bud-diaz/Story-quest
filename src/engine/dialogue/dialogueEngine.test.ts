import { describe, expect, it } from 'vitest';
import { findChoice, getNode, getStartNode, getVisibleChoices, isTerminalNode } from './dialogueEngine';
import { createCtx, createEmptySnapshot } from '../../../test/fixtures';
import type { DialogueTree } from '@/types';

const tree: DialogueTree = {
  id: 'beaver-intro',
  npcId: 'beaver-benny',
  startNode: 'greet',
  nodes: {
    greet: { id: 'greet', speakerId: 'beaver-benny', text: 'Oh dear!', next: 'ask-help' },
    'ask-help': {
      id: 'ask-help',
      speakerId: 'beaver-benny',
      text: 'Could you help?',
      choices: [
        { id: 'yes-help', text: 'Sure!', next: 'end' },
        { id: 'stall', text: 'Tell me more', next: 'lore', conditions: [{ type: 'flag', flag: 'askedLore', op: 'falsy' }] },
      ],
    },
    lore: { id: 'lore', speakerId: 'beaver-benny', text: 'Lore...', next: 'ask-help' },
    end: { id: 'end', speakerId: 'beaver-benny', text: 'Thanks!', next: null },
  },
};

describe('dialogueEngine', () => {
  it('resolves the start node', () => {
    expect(getStartNode(tree).id).toBe('greet');
  });

  it('throws a descriptive error for an unknown node', () => {
    expect(() => getNode(tree, 'nope')).toThrow(/beaver-intro/);
  });

  it('filters choices by their conditions', () => {
    const node = getNode(tree, 'ask-help');
    const visibleWhenNotAsked = getVisibleChoices(node, createCtx(createEmptySnapshot({ flags: { askedLore: false } })));
    expect(visibleWhenNotAsked.map((c) => c.id)).toEqual(['yes-help', 'stall']);

    const visibleWhenAsked = getVisibleChoices(node, createCtx(createEmptySnapshot({ flags: { askedLore: true } })));
    expect(visibleWhenAsked.map((c) => c.id)).toEqual(['yes-help']);
  });

  it('finds a choice by id', () => {
    expect(findChoice(getNode(tree, 'ask-help'), 'yes-help')?.next).toBe('end');
  });

  it('identifies terminal nodes', () => {
    expect(isTerminalNode(getNode(tree, 'end'))).toBe(true);
    expect(isTerminalNode(getNode(tree, 'greet'))).toBe(false);
  });
});
