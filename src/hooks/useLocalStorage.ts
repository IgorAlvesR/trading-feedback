import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | null) {
  const [state, setState] = useState<T | null>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      if (state === null || state === undefined) {
        localStorage.removeItem(key);
        return;
      }

      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}
