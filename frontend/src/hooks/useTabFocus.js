import { useEffect } from "react";

function useTabFocus(onViolation) {
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        onViolation("tab_switch");
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onViolation]);
}

export default useTabFocus;