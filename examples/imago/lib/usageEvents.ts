import { EVENT_NAMES } from "./publicEnv";

const EVENT_NAME = EVENT_NAMES.usageUpdated;

export function emitUsageUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeUsageUpdate(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}