import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IDLE_ACTIVITY_THROTTLE_MS,
  IDLE_TIMEOUT_MS,
  STORAGE_KEY_LAST_ACTIVITY,
  STORAGE_KEY_SESSION_LOCKED,
} from '../constants/session';
import { useAuthStore } from '../store/auth';
import { createThrottled, remainingMs, shouldLock } from '../utils/session-idle';

export function useSessionIdleLock(): void {
  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  let timer: ReturnType<typeof setTimeout> | null = null;

  const isProtectedRoute = computed(() =>
    route.matched.some((record) => record.meta?.requiresAuth),
  );

  const shouldTrack = computed(
    () =>
      authStore.isAuthenticated &&
      isProtectedRoute.value &&
      !authStore.sessionLocked,
  );

  function clearTimer(): void {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function evaluate(): void {
    if (!authStore.isAuthenticated || !isProtectedRoute.value) {
      clearTimer();
      return;
    }
    const last = authStore.lastActivityAt ?? 0;
    if (shouldLock(last, Date.now(), IDLE_TIMEOUT_MS)) {
      authStore.lockSession();
      clearTimer();
      return;
    }
    schedule();
  }

  function schedule(): void {
    clearTimer();
    if (!shouldTrack.value) {
      return;
    }
    const last = authStore.lastActivityAt ?? Date.now();
    const wait = remainingMs(last, Date.now(), IDLE_TIMEOUT_MS);
    timer = setTimeout(evaluate, wait);
  }

  const recordActivity = createThrottled(() => {
    if (!authStore.isAuthenticated || !isProtectedRoute.value) {
      return;
    }
    if (authStore.sessionLocked) {
      return;
    }
    const last = authStore.lastActivityAt ?? 0;
    if (shouldLock(last, Date.now(), IDLE_TIMEOUT_MS)) {
      authStore.lockSession();
      clearTimer();
      return;
    }
    authStore.touchActivity(Date.now());
    schedule();
  }, IDLE_ACTIVITY_THROTTLE_MS);

  function onVisibility(): void {
    if (document.visibilityState === 'visible') {
      evaluate();
    }
  }

  function onStorage(event: StorageEvent): void {
    if (event.key === STORAGE_KEY_LAST_ACTIVITY && event.newValue) {
      const ts = Number(event.newValue);
      if (Number.isFinite(ts)) {
        authStore.syncLastActivityFromStorage(ts);
        if (!authStore.sessionLocked) {
          schedule();
        }
      }
    }
    if (event.key === STORAGE_KEY_SESSION_LOCKED) {
      if (!authStore.accessToken) {
        return;
      }
      authStore.syncLockedFromStorage(event.newValue === '1');
      if (authStore.sessionLocked) {
        clearTimer();
      } else {
        void authStore.hydrateAfterUnlock();
        schedule();
      }
    }
  }

  const stopAfterEach = router.afterEach(() => {
    recordActivity();
  });

  watch(shouldTrack, (track) => {
    if (track) {
      schedule();
    } else {
      clearTimer();
    }
  });

  onMounted(() => {
    window.addEventListener('pointerdown', recordActivity, true);
    window.addEventListener('keydown', recordActivity, true);
    window.addEventListener('touchstart', recordActivity, { capture: true, passive: true });
    window.addEventListener('wheel', recordActivity, { capture: true, passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', evaluate);
    window.addEventListener('pageshow', evaluate);
    window.addEventListener('storage', onStorage);
    evaluate();
  });

  onUnmounted(() => {
    stopAfterEach();
    clearTimer();
    window.removeEventListener('pointerdown', recordActivity, true);
    window.removeEventListener('keydown', recordActivity, true);
    window.removeEventListener('touchstart', recordActivity, true);
    window.removeEventListener('wheel', recordActivity, true);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('focus', evaluate);
    window.removeEventListener('pageshow', evaluate);
    window.removeEventListener('storage', onStorage);
  });
}
