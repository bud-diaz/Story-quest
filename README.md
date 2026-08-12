# StoryQuest

An interactive educational adventure for young children — story first,
learning woven into the fiction, never a quiz. This repository is a
production-quality **vertical slice**: a Hub area, a Forest level, one NPC
(Benny the Beaver), one math challenge, one reading challenge, one branching
story choice, an inventory, a companion framework, a basic quest system, and
save/load — all built on an architecture designed to grow into the full game
described in [`StoryQuest_Game_Design.md`](./StoryQuest_Game_Design.md).

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for how the codebase is layered,
and [`docs/CONTENT_AUTHORING.md`](./docs/CONTENT_AUTHORING.md) for how to
add new story content without touching engine code.

## Tech stack

- **TypeScript** throughout, `strict` + `noUncheckedIndexedAccess`.
- **React** for all UI (dialogue, challenges, panels, menus) as a DOM overlay.
- **Phaser 3** for the explorable world, rendered top-down/over-the-shoulder
  (the third-person option — see `ARCHITECTURE.md` for why Phaser over
  Three.js here).
- **Zustand** as the single shared game-state store, read by both React and
  Phaser.
- **Vite** for dev/build, **Vitest** for unit tests.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) then production build |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | ESLint over the whole project |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run format` | Prettier write |

## How a playthrough works

New Game (or Continue, if a save exists) → spawn in the **Hub**, a clearing
with six signposts (Forest is open; Village/Mountain/River/Castle/Ancient
Ruins are gently locked, hinting at the full world from the design doc
without needing to be built yet) → walk into the **Forest** → read a
signpost (reading challenge) → find **Benny the Beaver** at a broken bridge,
help him count how many more logs he needs (math challenge, embedded in the
scene's fiction, not a bare quiz) → the bridge visibly repairs itself → a
**branching choice** — cross the bridge, explore the cave, or stay and help
Benny gather more supplies — each option leaves a different, permanent mark
on your traits, inventory, and avatar's appearance. No XP bars: what you
did is reflected in what your explorer looks like and carries.

## Current scope & honest limitations

- **One content pack** (`forest-adventure`), loaded eagerly via
  `resolveJsonModule` rather than fetched at runtime — the natural next
  step once a second pack exists and packs need to be swapped without a
  rebuild (see `ARCHITECTURE.md`).
- **Placeholder art only** — every sprite, portrait, and icon is generated
  procedurally (Phaser `Graphics.generateTexture()` for the world, colored
  initials for UI icons/portraits) so the whole game runs with zero art
  assets. Swapping in real art is a localized change — see
  `ARCHITECTURE.md` § Art swap point.
- **Single save slot**, `localStorage`-backed.
- Six of the seven world regions in the design doc are stubbed as locked
  signposts — only Hub and Forest are actually built.
