# Architecture

StoryQuest is split into five layers with a strict, one-directional
dependency rule:

```
types/  →  engine/  →  state/  →  game/ (Phaser)
                          ↓            
                        ui/ (React)

content/ (JSON)  →  read only by state/
```

- **`src/types/`** — plain TypeScript contracts. No logic, no imports from
  anywhere else in the app. Everything else imports from here.
- **`src/engine/`** — pure, framework-agnostic game logic: the dialogue
  graph walker, the branching-narrative engine, trait/flag/inventory/
  quest/companion/avatar systems, challenge evaluators, save
  serialization, and content loading/validation. Every function here takes
  plain data in and returns plain data out — no Phaser, no React, no DOM,
  no `localStorage`. This is what makes it exhaustively unit-testable
  (`npm test` covers 60+ cases here with no browser) and what makes the
  engine portable to a completely different content pack later.
- **`src/content/packs/forest-adventure/`** — JSON only, zero code. NPCs,
  dialogue trees, challenges, quests, cosmetics, companions, and scene
  layouts. A new story (pirates, space, dinosaurs — see the design doc's
  "Long-Term Vision") is a new folder here, not a code change.
- **`src/state/`** — the one choke-point layer, and the *only* module
  allowed to import both `engine/` and `content/`. `state/gameStore.ts`
  holds a single Zustand store that is the one source of truth for
  everything that matters: traits, flags, inventory, quests, avatar,
  companions, position, and which modal (if any) is open. Both `game/`
  and `ui/` read and write **only** through this store — never through
  each other.
- **`src/game/`** — Phaser 3: scenes, entities (player/NPC/interactable
  visuals), and systems (input, camera, world-state sync). Imports
  `state/` and `engine/`, never `ui/`.
- **`src/ui/`** — React: the dialogue box, challenge modals, the branch
  choice prompt, inventory/avatar/quest panels, save/load, HUD. Imports
  `state/` and `engine/` (for pure lookups like filtering visible dialogue
  choices), and mounts the Phaser canvas via `PhaserMount` — but otherwise
  never reaches into `game/` internals.

An ESLint rule (`no-restricted-imports` in `.eslintrc.cjs`, scoped to
`src/engine/**`) mechanically blocks `engine/` from importing `state/`,
`game/`, or `ui/`, so this boundary can't quietly erode.

## Why one store, not two

Phaser's scene loop is imperative and runs outside React's render cycle;
React is declarative. If each kept its own copy of "is the bridge fixed,"
they would eventually disagree. Instead there is exactly one Zustand store
(`state/gameStore.ts`), consumed two ways:

- React components call the standard hook, `useGameStore(selector)`, for
  reactive, selective re-rendering.
- Phaser code (scenes, systems) calls `useGameStore.getState()` and
  `useGameStore.subscribe(listener)` directly — no React dependency needed.

The rule of thumb for what goes where:

- **Persistent / world-affecting state → the store.** Phaser's
  `SceneStateSync` (`game/systems/SceneStateSync.ts`) subscribes once per
  scene and *diffs* the new state against the old to react declaratively
  — e.g. `flags.bridgeFixed` flips → swap the bridge texture. There is no
  bespoke "bridge fixed" event; the world just re-renders from truth.
- **Ephemeral, one-shot signals → `state/eventBus.ts`** (a tiny `mitt`
  instance). The only thing on it today is `toast` — a transient message
  like a locked signpost's flavor text. Nothing that should "stick" ever
  goes through the bus.

`GameState.isInputLocked`-style logic is deliberately *not* stored
redundantly: `InputController` reads `activeModal !== null` straight off
the store every frame (see `state/selectors.ts#selectIsInputLocked`), so
movement-lock can never desync from what's actually on screen.

## The Condition / Effect backbone

Dialogue choices, branch options, quest step completion, avatar cosmetic
unlocks, and companion recruitment are all gated and driven by the same
two data types (`types/conditionsEffects.ts`):

```ts
type Condition = { type: 'trait' | 'flag' | 'item' | 'companion' | 'companionUnlocks' | 'quest' | 'all' | 'any' | 'not'; ... };
type Effect    = { type: 'trait' | 'flag' | 'item' | 'companion' | 'quest' | 'avatar'; ... };
```

One evaluator (`engine/conditions.ts#evaluateCondition`) and one applier
(`engine/effects.ts#applyEffects`) back every one of those systems, instead
of five bespoke ad-hoc checks. `applyEffects()` is the single mutation path
inside `gameStore`; after every call it runs a reconciliation pass:

- `engine/quest/questSystem.ts#reconcileQuests` — auto-starts a quest once
  its `startCondition` is met, and auto-advances/completes steps whose
  `completionCondition` just became true. Content never calls "advance
  quest" — quests just watch the world.
- `engine/avatar/avatarSystem.ts#checkForNewUnlocks` — auto-unlocks (and
  optionally auto-equips) cosmetics whose `unlockConditions` just became
  true. This is what makes "avatar evolves" automatic and data-driven
  rather than special-cased per event, and why there are no XP bars: the
  only feedback loop is what your explorer now looks like.

Companion gating uses a `companionUnlocks` Condition against an
**interaction tag** (e.g. `"river-shortcut"`), not a specific companion id
— so a new companion species can unlock the same interaction later without
touching the content that gates it.

## Dialogue vs. the branching narrative engine

These are deliberately two different systems:

- A `DialogueChoice` (`types/dialogue.ts`) picks the next line *within one
  conversation*.
- A `BranchPoint` (`types/narrative.ts`) is a **world-state fork**. It is
  rendered in its own UI (`ChoicePrompt`, never `DialogueBox`), and
  resolving it records `flags['branch:<branchPointId>'] = optionId`
  generically (`engine/narrative/branchEngine.ts`) — a fact that outlives
  the conversation that triggered it and can gate content anywhere else in
  the pack (see `bridge-fork` gating `helpers-badge`, `turtle-tumble`, and
  the `river-shortcut` interactable).

## Save/load

`SaveGameV1` (`types/saveGame.ts`) is explicitly versioned
(`CURRENT_SAVE_VERSION`) and records `contentPackId` / `contentPackVersion`
alongside the game data, so loading a save against a mismatched pack can be
detected and rejected (`gameStore.loadGame()`) instead of silently
corrupting state. `engine/save/saveManager.ts` takes its storage backend as
an injected `StorageLike` interface rather than reaching for
`window.localStorage` directly, which is what makes it unit-testable
without a DOM (a future `SaveGameV2` would add an explicit migration step
in `deserializeSaveGame`, keyed off `saveVersion`).

## Art swap point

There are no image files in this repo. `game/gfx/textureFactory.ts` bakes
every world sprite once, in `BootScene.create()`, from Phaser's
`Graphics.generateTexture()`. Cosmetic and NPC textures are generated
generically from the content pack's ids (not hardcoded per cosmetic), so
adding a new cosmetic or NPC in JSON gets a placeholder sprite for free.
Every consumer (scenes, `PlayerAvatar`, `InteractableZone`) only ever
references a texture **key string** — swapping in real art later means
replacing the `generateTexture()` calls with `this.load.image(key, '/assets/...')`
in a real `preload()`, with no change needed anywhere else.

UI-side portraits/icons (`ui/components/shared/IconSwatch.tsx`) are a
separate, much simpler placeholder: initials on a color hashed from the
same texture-key string (`utils/rng.ts#colorForId`). They're intentionally
decoupled from Phaser's canvas — replacing them with real art later is a
one-component change (render `<img src>` instead) that doesn't touch
`game/` at all.

## Non-goals for this MVP (by design)

- Multiple content packs loaded/hot-swapped at runtime (single pack,
  imported eagerly — see README § Current scope).
- Full content for every branch outcome (three outcomes exist as distinct
  narrative beats and permanent state changes, not three new levels — this
  was an explicit scope decision to prioritize depth of architecture over
  breadth of content).
- Multiple save slots, cloud saves, or auto-save.
- Any of Village/Mountain/River/Castle/Ancient Ruins beyond a locked
  signpost stub.
