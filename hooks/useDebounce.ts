import { useCallback, useEffect, useState } from "react";

export function useDebounceHandler<T extends (...args: any[]) => any>(callback: T, delay: number, immediate?: boolean): T {
	var timeout;
	return function(args) {
    
    var later = function() {
      timeout = null;
			if (!immediate) callback(args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, delay);
		if (callNow) callback(args);
	} as any
};

export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export function useDebounceState<T>(initialValue: T, delay: number) : [T, React.Dispatch<React.SetStateAction<T>>, T]{
  const [value, setValue] = useState<T>(initialValue);
  const debounceValue = useDebounce<T>(value, delay);
  return [value, setValue, debounceValue];
};