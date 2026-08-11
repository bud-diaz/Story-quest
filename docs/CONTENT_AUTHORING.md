# Content Authoring Guide

Everything a story needs — NPCs, dialogue, challenges, quests, cosmetics,
companions, scene layouts — lives as JSON under
`src/content/packs/<pack-id>/`, with **zero TypeScript**. This guide covers
extending the existing `forest-adventure` pack and standing up a new one.
The schema source of truth is always `src/types/*.ts` — when in doubt, read
the type.

Before opening a PR with new content, run `npm test`: the content pack
loader (`src/state/content/forestAdventurePack.test.ts`) runs
`engine/content/contentIntegrity.ts#checkContentIntegrity` against the pack
and fails with a precise path if any id you referenced (a dialogue node, a
challenge, an item, a cosmetic, a companion, a quest, a scene) doesn't
actually exist. This catches typos automatically, before they'd otherwise
surface as a runtime crash three layers away in a Phaser scene.

## Adding a new NPC + dialogue

1. Add an `NpcDefinition` under `npcs/` (see `types/npc.ts`): `id`,
   `sceneId`, `spawnPoint`, a `portraitTextureKey` / `spriteTextureKey`
   (any string — the texture factory will bake a placeholder for it
   automatically, keyed by the npc's `id`), and `defaultDialogueId`.
2. Add a `DialogueTree` under `dialogues/` (see `types/dialogue.ts`): a
   `startNode` and a map of `DialogueNode`s. Each node needs `speakerId`
   (an npc id, `'player'`, or `'narrator'`) and `text`, plus **one** of:
   - `choices: DialogueChoice[]` — branches within this conversation.
     Each choice can carry `conditions` (only shown if met) and `effects`.
   - `challengeId` — hands off to a challenge; route `onSuccessNext` /
     `onFailureNext` back into this tree (or leave unset to end there).
   - `triggersBranch` — hands off to a `BranchPoint` (see below).
   - `next` — a plain linear continuation (or `null`/omitted to end).
3. Every node can carry `effects: Effect[]`, applied the moment the node is
   reached (see "Conditions & Effects" below).

Want an NPC to say something different after a certain point in the story?
Give it `postDialogue: { flag, dialogueId }` (see `beaver.json`) — once
that flag is truthy, re-interacting opens `dialogueId` instead of
`defaultDialogueId`. No code change needed.

## Adding a challenge (math or reading)

Add a file under `challenges/`. Both extend `ChallengeBase` (`type/challenge.ts`):
`promptText` (in-fiction framing — write it as part of the scene, never as
a bare question), `successEffects`, optional `failureEffects`, and
`retryAllowed`.

- **Math**: `questionText`, `operands: {have, need}`, `answer`, `choices`
  (the multiple-choice options shown).
- **Reading**: `promptWord` (the instruction shown, e.g. "Tap the word
  that says: CAVE"), `targetWord`, `options`, `correctOption`.

Wire it in either by referencing `challengeId` from a `DialogueNode`, or by
adding a scene `interactable` with `"type": "challenge"` (see
`scenes/forest.json`'s `forest-signpost`) for a standalone puzzle not tied
to any NPC.

## Adding a branching choice

A `BranchPoint` (`branches/`, see `types/narrative.ts`) is a **world-state
fork** — not the same thing as a `DialogueChoice`. Use it when the decision
should leave a lasting, generically-queryable mark on the story, not just
pick the next line. Each `BranchOption` needs `effects` (traits, flags,
items, companions, quest progress, avatar unlocks — anything from the
`Effect` union); resolving the branch also automatically sets
`flags['branch:<branchPointId>'] = optionId`, so later content can gate on
`{ type: 'flag', flag: 'branch:your-branch-id', op: 'eq', value: 'your-option-id' }`
without you wiring that flag by hand. Trigger it from a `DialogueNode` via
`triggersBranch`.

## Adding a quest

A `QuestDefinition` (`quests/`, `types/quest.ts`) needs a `startCondition`
and an ordered `steps` array, each with a `completionCondition`. Both are
plain `Condition`s — most quests just check flags set elsewhere in your
dialogue/challenge/branch content. The quest system watches these
automatically (`engine/quest/questSystem.ts#reconcileQuests`, run after
every state change) — you never call "start quest" or "advance quest"
directly from content.

## Adding an item, cosmetic, or companion

- **Item** (`items/`, `types/inventory.ts`): `id`, `name`, `description`,
  `stackable`, `iconTextureKey`. Grant it via an `Effect` of
  `{ type: 'item', itemId, op: 'add', quantity }`.
- **Cosmetic** (`avatar/cosmetics.json`, `types/avatar.ts`): pick a `slot`
  (`head` | `body` | `back` | `aura` | `companionSlot`), an
  `unlockConditions: Condition[]` (empty = unlocked from the start), and
  whether it `autoEquip`s once unlocked. No XP bars — cosmetics are the
  entire feedback loop for player choices, so give players something
  visibly new on branches you care about.
- **Companion** (`companions/companions.json`, `types/companion.ts`): give
  it `unlocksInteractions: string[]` — arbitrary tags, not specific scene
  ids. Gate a scene interactable on one via
  `{ type: 'companionUnlocks', interactionTag: 'your-tag' }`, so any
  companion (present or future) that lists that tag can unlock it. A
  companion with an intentionally-unreachable `recruitConditions` (see
  `fox-scout`) is a fine way to stub out a "coming soon" character without
  building content for it yet.

## Adding a scene

A `SceneDefinition` (`scenes/`, `types/scene.ts`) lists `spawnPoints`,
`npcs` (ids), `signposts` (travel to another scene, or `locked: true` with
flavor `lockedText` for a "not built yet" region — see `hub.json`), and
`interactables` (`bridge` / `gate` / `companionGate` / `challenge` — each
keyed off a flag or companion tag that toggles its world texture and
flavor text; see `game/systems/SceneStateSync.ts` for how that's read).
Register the new scene as a Phaser scene by adding a two-line subclass of
`game/scenes/WorldScene.ts` (see `HubScene.ts` / `ForestScene.ts`) and
listing it in `game/PhaserGame.ts`.

## Standing up a new content pack

Duplicate `src/content/packs/forest-adventure/` as
`src/content/packs/<new-pack-id>/`, write a new `pack.json` manifest, then
write a loader alongside `src/state/content/forestAdventurePack.ts` that
imports the new pack's JSON and calls `buildContentPack(...)`. Point
`state/gameStore.ts`'s `content` export at the new loader. Everything
downstream (`engine/`, `game/`, `ui/`) only ever sees the assembled
`ContentPack` shape, so nothing else changes.
