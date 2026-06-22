import React, {useRef, createContext, useContext, useCallback} from 'react';
import isEqual from 'react-fast-compare';
import {useSyncExternalStoreWithSelector} from 'use-sync-external-store/with-selector';

export default function createFastContext<Store>(initialState: Store) {
  function useStoreData(): {
    get: () => Store;
    set: (value: Partial<Store>) => void;
    subscribe: (callback: () => void) => () => void;
  } {
    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set = useCallback((value: Partial<Store>) => {
      store.current = {...store.current, ...value};
      subscribers.current.forEach(callback => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(null);

  function Provider({children}: {children: React.ReactNode}) {
    return (
      <StoreContext.Provider value={useStoreData()}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useStore<SelectorOutput>(
    selector: (store: Store) => SelectorOutput,
  ): [SelectorOutput, (value: Partial<Store>) => void] {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('Store not found');
    }

    const state = useSyncExternalStoreWithSelector(
      store.subscribe,
      () => store.get(),
      () => initialState,
      selector,
      (a, b) => isEqual(a, b),
    );

    return [state, store.set];
  }

  return {
    Provider,
    useStore,
  };
}

// const {Provider, useStore} = createFastContext({
//   left: 0,
//   right: 0,
// });
