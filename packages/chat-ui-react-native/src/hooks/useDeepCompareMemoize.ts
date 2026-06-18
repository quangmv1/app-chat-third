import React from 'react';
import isEqual from 'react-fast-compare';

export const useDeepCompareMemoize = function <T>(value: T): T {
  const ref = React.useRef<T>(value);

  const [signal, setSignal] = React.useState<number>(0);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
    setSignal(prev => (prev += 1));
  }

  return React.useMemo(() => {
    signal;
    return ref.current;
  }, [signal]);
};
