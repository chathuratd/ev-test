import { useEffect, useState } from 'react';

/**
 * Returns a debounced value that only updates after the specified delay
 *
 * @param value value to debounce
 * @param delay milliseconds to wait after last change
 */
const useDebounce = <T,>(value: T, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
