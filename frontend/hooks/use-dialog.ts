'use client';
import { useEffect, useRef } from 'react';

/** Trap keyboard focus in open dialogs and restore it to the trigger on close. */
export function useDialog(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    const selector = 'button:not([disabled]), a[href], input, select, [tabindex="0"]';
    const controls = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(selector) || []);
    controls()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function trap(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    dialog?.addEventListener('keydown', trap);
    return () => {
      dialog?.removeEventListener('keydown', trap);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);
  return ref;
}
