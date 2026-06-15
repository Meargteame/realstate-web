import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay`ms
 * have passed without `value` changing. Useful for search inputs to avoid
 * firing a network request on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
