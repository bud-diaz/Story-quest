/**
 * One-shot, non-persisted signals only. Anything that should "stick" (a
 * flag flip, a trait change, quest progress) goes through gameStore state
 * instead, so Phaser and React never need to reconcile two copies of the
 * same fact. This bus is for the rest: transient UI cues like a toast.
 */
import mitt from 'mitt';

export type AppEvents = {
  toast: { message: string };
};

export const eventBus = mitt<AppEvents>();
