/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * Walks every cross-reference in a ContentPack (dialogue node transitions,
 * challenge/branch/quest/item/cosmetic/companion ids mentioned in effects
 * and conditions, scene NPC/interactable references) and reports any that
 * don't resolve. Intended to run as a test against every content pack so a
 * typo in JSON fails CI instead of breaking silently at runtime.
 */
import type { Condition, ContentPack, Effect } from '@/types';

export interface ContentIntegrityIssue {
  path: string;
  message: string;
}

export function checkContentIntegrity(pack: ContentPack): ContentIntegrityIssue[] {
  const issues: ContentIntegrityIssue[] = [];
  const push = (path: string, message: string) => issues.push({ path, message });

  const checkEffects = (path: string, effects: Effect[] | undefined) => {
    for (const [i, effect] of (effects ?? []).entries()) {
      const p = `${path}[${i}]`;
      if (effect.type === 'item' && !pack.items[effect.itemId]) push(p, `unknown item "${effect.itemId}"`);
      if (effect.type === 'companion' && !pack.companions[effect.companionId])
        push(p, `unknown companion "${effect.companionId}"`);
      if (effect.type === 'quest' && !pack.quests[effect.questId]) push(p, `unknown quest "${effect.questId}"`);
      if (effect.type === 'avatar' && !pack.cosmetics[effect.cosmeticId])
        push(p, `unknown cosmetic "${effect.cosmeticId}"`);
    }
  };

  const checkConditions = (path: string, conditions: Condition[] | undefined) => {
    for (const [i, condition] of (conditions ?? []).entries()) {
      const p = `${path}[${i}]`;
      if (condition.type === 'item' && !pack.items[condition.itemId]) push(p, `unknown item "${condition.itemId}"`);
      if (condition.type === 'companion' && condition.companionId && !pack.companions[condition.companionId])
        push(p, `unknown companion "${condition.companionId}"`);
      if (condition.type === 'quest' && !pack.quests[condition.questId])
        push(p, `unknown quest "${condition.questId}"`);
      if (condition.type === 'all' || condition.type === 'any') checkConditions(p, condition.conditions);
      if (condition.type === 'not') checkConditions(p, [condition.condition]);
    }
  };

  for (const dialogue of Object.values(pack.dialogues)) {
    if (!dialogue.nodes[dialogue.startNode]) {
      push(`dialogues.${dialogue.id}`, `startNode "${dialogue.startNode}" does not exist`);
    }
    for (const node of Object.values(dialogue.nodes)) {
      const path = `dialogues.${dialogue.id}.nodes.${node.id}`;
      checkEffects(`${path}.effects`, node.effects);
      if (node.next && !dialogue.nodes[node.next]) push(path, `next "${node.next}" does not exist`);
      if (node.onSuccessNext && !dialogue.nodes[node.onSuccessNext])
        push(path, `onSuccessNext "${node.onSuccessNext}" does not exist`);
      if (node.onFailureNext && !dialogue.nodes[node.onFailureNext])
        push(path, `onFailureNext "${node.onFailureNext}" does not exist`);
      if (node.challengeId && !pack.challenges[node.challengeId])
        push(path, `challengeId "${node.challengeId}" does not exist`);
      if (node.triggersBranch && !pack.branches[node.triggersBranch])
        push(path, `triggersBranch "${node.triggersBranch}" does not exist`);
      for (const choice of node.choices ?? []) {
        const cp = `${path}.choices.${choice.id}`;
        checkConditions(`${cp}.conditions`, choice.conditions);
        checkEffects(`${cp}.effects`, choice.effects);
        if (choice.next && !dialogue.nodes[choice.next]) push(cp, `next "${choice.next}" does not exist`);
      }
    }
  }

  for (const branch of Object.values(pack.branches)) {
    for (const option of branch.options) {
      const path = `branches.${branch.id}.options.${option.id}`;
      checkConditions(`${path}.conditions`, option.conditions);
      checkEffects(`${path}.effects`, option.effects);
      if (option.outcomeDialogueId && !pack.dialogues[option.outcomeDialogueId]) {
        push(path, `outcomeDialogueId "${option.outcomeDialogueId}" does not exist`);
      }
    }
  }

  for (const challenge of Object.values(pack.challenges)) {
    checkEffects(`challenges.${challenge.id}.successEffects`, challenge.successEffects);
    checkEffects(`challenges.${challenge.id}.failureEffects`, challenge.failureEffects);
  }

  for (const quest of Object.values(pack.quests)) {
    checkConditions(`quests.${quest.id}.startCondition`, quest.startCondition ? [quest.startCondition] : []);
    for (const step of quest.steps) {
      checkConditions(`quests.${quest.id}.steps.${step.id}`, [step.completionCondition]);
    }
  }

  for (const cosmetic of Object.values(pack.cosmetics)) {
    checkConditions(`cosmetics.${cosmetic.id}.unlockConditions`, cosmetic.unlockConditions);
  }

  for (const companion of Object.values(pack.companions)) {
    checkConditions(`companions.${companion.id}.recruitConditions`, companion.recruitConditions);
  }

  for (const scene of Object.values(pack.scenes)) {
    for (const npcId of scene.npcs ?? []) {
      if (!pack.npcs[npcId]) push(`scenes.${scene.id}.npcs`, `unknown npc "${npcId}"`);
    }
    for (const interactable of scene.interactables ?? []) {
      const path = `scenes.${scene.id}.interactables.${interactable.id}`;
      if (interactable.challengeId && !pack.challenges[interactable.challengeId]) {
        push(path, `unknown challenge "${interactable.challengeId}"`);
      }
    }
    for (const signpost of scene.signposts ?? []) {
      if (signpost.targetSceneId && !pack.scenes[signpost.targetSceneId]) {
        push(`scenes.${scene.id}.signposts.${signpost.id}`, `unknown target scene "${signpost.targetSceneId}"`);
      }
    }
  }

  for (const npc of Object.values(pack.npcs)) {
    if (!pack.dialogues[npc.defaultDialogueId]) {
      push(`npcs.${npc.id}`, `defaultDialogueId "${npc.defaultDialogueId}" does not exist`);
    }
  }

  return issues;
}
