import { useEffect } from 'react';
import { eventBus, type AppEvents } from '@/state/eventBus';

/** Subscribes to a one-shot eventBus signal for the lifetime of the component. */
export function useEventBus<K extends keyof AppEvents>(
  event: K,
  handler: (payload: AppEvents[K]) => void,
): void {
  useEffect(() => {
    eventBus.on(event, handler);
    return () => eventBus.off(event, handler);
  }, [event, handler]);
}
