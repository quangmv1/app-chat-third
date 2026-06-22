import React, {createContext, PropsWithChildren, useContext} from 'react';
import {useRealm} from '../../../context';
import {PSSearchThreadRecentlyEntity} from '../../../types';
import {psLogger} from '../../../utils';

type PSSearchThreadRecentlyContextValue = {
  onSaveThreadSearchRecentlyPress?: (
    targetThreadId?: string,
    targetUserId?: string,
  ) => void;
};

const PSSearchThreadRecentlyContext = createContext(
  {} as PSSearchThreadRecentlyContextValue,
);

export const PSSearchThreadRecentlyProvider = ({
  children,
}: PropsWithChildren) => {
  const realm = useRealm();

  const onSaveThreadSearchRecentlyPress = React.useCallback(
    (targetThreadId?: string, targetUserId?: string) => {
      try {
        realm.write(() => {
          PSSearchThreadRecentlyEntity.createOrUpdate(realm, {
            primaryKey: `${targetThreadId}_${targetUserId}`,
            threadId: targetThreadId,
            userId: targetUserId,
            searchAt: new Date().getTime(),
          } as PSSearchThreadRecentlyEntity);
        });
      } catch (e) {
        psLogger.error(
          'PSSearchThreadRecentlyProvider: onSaveThreadSearchRecentlyPress => ',
          e,
        );
      }
    },
    [realm],
  );

  const value = React.useMemo(() => {
    return {
      onSaveThreadSearchRecentlyPress: onSaveThreadSearchRecentlyPress,
    } as PSSearchThreadRecentlyContextValue;
  }, [onSaveThreadSearchRecentlyPress]);

  return (
    <PSSearchThreadRecentlyContext.Provider value={value}>
      {children}
    </PSSearchThreadRecentlyContext.Provider>
  );
};

export const usePSSearchThreadRecentlyContext = () =>
  useContext(PSSearchThreadRecentlyContext);
