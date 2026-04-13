import React, {PropsWithChildren} from 'react';
import {usePSChatApiClientContext, useRealm} from '../../../context';
import {PSUserEntity} from '../../../types';
import {psLogger} from '../../../utils';

type PSMessageGetUserIdContextValue = {
  getUserId: (psUserId: string) => Promise<string> | undefined;
};

const PSMessageGetUserIdContext =
  React.createContext<PSMessageGetUserIdContextValue>(
    {} as PSMessageGetUserIdContextValue,
  );

export const PSMessageGetUserIdProvider = ({
  isExportUserId,
  children,
}: PropsWithChildren<{
  isExportUserId?: boolean;
}>) => {
  const realm = useRealm();

  const chatApiClient = usePSChatApiClientContext();

  const getUserId = React.useCallback(
    async (psUserId: string) => {
      if (!isExportUserId || !chatApiClient) {
        return undefined;
      }
      try {
        const user = PSUserEntity.getFirstByExtUserId(realm, psUserId);

        if (user) return user.userId;

        const response = await chatApiClient.userApi.fetchUserById(psUserId);

        return response.data?.user_id;
      } catch (e) {
        psLogger.error('PSMessageGetUserIdProvider: getUserId', e);
        return undefined;
      }
    },
    [isExportUserId, realm, chatApiClient],
  );

  const contextValue = React.useMemo(() => {
    return {
      getUserId: getUserId,
    } as PSMessageGetUserIdContextValue;
  }, []);

  return (
    <PSMessageGetUserIdContext.Provider value={contextValue}>
      {children}
    </PSMessageGetUserIdContext.Provider>
  );
};

export const usePSMessageGetUserIdContext = () =>
  React.useContext(PSMessageGetUserIdContext);
