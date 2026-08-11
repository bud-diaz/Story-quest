/**
 * Story flags are the durable record of what has happened in the world —
 * booleans, strings, or numbers keyed by an arbitrary content-defined id
 * (e.g. "bridgeFixed", "bridgeChoice"). They are the backbone the branching
 * narrative engine, quest system, and avatar unlocks all read from.
 */
export type FlagValue = boolean | string | number;

export type FlagState = Record<string, FlagValue>;

export function createInitialFlagState(): FlagState {
  return {};
}
