export function shouldLock(
  lastActivityAt: number,
  now: number,
  timeoutMs: number,
): boolean {
  return now - lastActivityAt >= timeoutMs;
}

export function resolveRestoredLock(
  lastActivityAt: number | null,
  lockedFlag: boolean,
  now: number,
  timeoutMs: number,
): { lastActivityAt: number; sessionLocked: boolean } {
  if (lockedFlag) {
    return {
      lastActivityAt:
        lastActivityAt != null && Number.isFinite(lastActivityAt)
          ? lastActivityAt
          : now,
      sessionLocked: true,
    };
  }
  if (lastActivityAt == null || !Number.isFinite(lastActivityAt)) {
    return { lastActivityAt: now, sessionLocked: false };
  }
  return {
    lastActivityAt,
    sessionLocked: shouldLock(lastActivityAt, now, timeoutMs),
  };
}

export function remainingMs(
  lastActivityAt: number,
  now: number,
  timeoutMs: number,
): number {
  return Math.max(0, timeoutMs - (now - lastActivityAt));
}

export function createThrottled<T extends (...args: never[]) => void>(
  fn: T,
  intervalMs: number,
  now: () => number = Date.now,
): T {
  let last = 0;
  return ((...args: never[]) => {
    const t = now();
    if (t - last >= intervalMs) {
      last = t;
      fn(...args);
    }
  }) as T;
}
