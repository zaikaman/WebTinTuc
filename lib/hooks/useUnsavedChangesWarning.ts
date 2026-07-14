import { useEffect } from "react";

/**
 * Custom hook to show native browser confirmation dialog when unloading the page
 * (F5, refresh, back/forward buttons, closing tab) if there are unsaved changes.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers require setting returnValue to show the dialog
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
}
