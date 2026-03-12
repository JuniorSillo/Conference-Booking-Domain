import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // cancel the timer if value changes before delay completes
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}