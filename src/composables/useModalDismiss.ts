import { onUnmounted, watch, type MaybeRefOrGetter, toValue } from 'vue';

/**
 * Cierre de modal: ESC, botón explícito, o clic deliberado en el backdrop
 * (pointerdown y pointerup en el mismo overlay). No cierra si el arrastre
 * comenzó dentro del panel (p. ej. al seleccionar texto).
 */
export function useModalDismiss(
  onClose: () => void,
  isOpen?: MaybeRefOrGetter<boolean>,
) {
  let pressedOnBackdrop = false;

  function onBackdropPointerDown(event: PointerEvent) {
    pressedOnBackdrop = event.target === event.currentTarget;
  }

  function onBackdropPointerUp(event: PointerEvent) {
    if (pressedOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
    pressedOnBackdrop = false;
  }

  function onBackdropPointerCancel() {
    pressedOnBackdrop = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (isOpen === undefined || toValue(isOpen)) {
      event.preventDefault();
      onClose();
    }
  }

  function startListening() {
    document.addEventListener('keydown', handleKeydown);
  }

  function stopListening() {
    document.removeEventListener('keydown', handleKeydown);
  }

  if (isOpen !== undefined) {
    watch(
      () => toValue(isOpen),
      (open) => {
        stopListening();
        if (open) startListening();
      },
      { immediate: true },
    );
  } else {
    startListening();
  }

  onUnmounted(stopListening);

  return {
    onBackdropPointerDown,
    onBackdropPointerUp,
    onBackdropPointerCancel,
  };
}
