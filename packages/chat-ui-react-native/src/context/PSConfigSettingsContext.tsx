import React, {PropsWithChildren} from 'react';
import {usePSChatApiClientContext} from './PSChatApiClientContext';
import {psLogger} from '../utils';
import {useIsMountedRef} from '../hooks';
import {PSThreadEntity, PSThreadScreenContextEntity} from '../types';
import {useRealm} from './PSRealmContext';

type PSSettingStringContextValue = {
  setStringContext: (userId: string, screenContext: string) => void;
};

const PSSettingStringContext = React.createContext<PSSettingStringContextValue>(
  {} as PSSettingStringContextValue,
);

type PSConfigSettingsContextValue = {
  maxUploadSize?: number | undefined;
};

const PSConfigSettingsContext = React.createContext(
  {} as PSConfigSettingsContextValue,
);

export const PSConfigSettingsProvider = ({children}: PropsWithChildren) => {
  const chatApiClient = usePSChatApiClientContext();

  const realm = useRealm();

  const [maxUploadSize, setMaxUploadSize] = React.useState<number | undefined>(
    undefined,
  );

  const [hasFetched, setHasFetched] = React.useState(false);

  const fetchedRef = React.useRef(false);

  const isMounted = useIsMountedRef();

  React.useEffect(() => {
    if (!chatApiClient || hasFetched) return;

    const fetchConfig = async () => {
      if (fetchedRef.current) return; // Nếu đã fetch rồi thì không fetch nữa
      fetchedRef.current = true;

      try {
        const res = await chatApiClient.configApi.getLimitFileSize('upload');

        if (res.data?.upload.max_upload_size && isMounted.current) {
          setMaxUploadSize(res.data.upload.max_upload_size);
          setHasFetched(true);
        }
      } catch (error) {
        psLogger.error('PSConfigSettingsProvider: fetchConfig => ', error);
      }
    };

    fetchConfig();

    // return () => {
    // };
  }, [chatApiClient, hasFetched]);

  const setStringContext = React.useCallback(
    async (userId: string, screenContext: string) => {
      if (!chatApiClient) return;
      try {
        const cachedThread = PSThreadEntity.getFirstByPartnerId(realm, userId);
        var threadId = '';
        if (!!cachedThread) {
          threadId = cachedThread.id;
        } else {
          const response =
            await chatApiClient.threadApi.fetchThreadByUserId(userId);
          threadId = response.data?.id ?? '';
        }
        if (threadId === undefined || threadId === '') return;
        await chatApiClient.threadApi.saveContext(threadId, screenContext);
        realm.write(() => {
          PSThreadScreenContextEntity.createOrUpdate(realm, {
            threadId: threadId,
            screenContext: screenContext,
          } as PSThreadScreenContextEntity);
        });
      } catch (error) {
        psLogger.error('PSSettingStringContext: setStringContext', error);
      }
    },
    [chatApiClient],
  );

  const stringContextValue = React.useMemo(() => {
    return {
      setStringContext: setStringContext,
    } as PSSettingStringContextValue;
  }, [maxUploadSize]);

  const value = React.useMemo(() => {
    return {
      maxUploadSize: maxUploadSize,
    } as PSConfigSettingsContextValue;
  }, [maxUploadSize]);

  return (
    <PSConfigSettingsContext.Provider value={value}>
      <PSSettingStringContext.Provider value={stringContextValue}>
        {children}
      </PSSettingStringContext.Provider>
    </PSConfigSettingsContext.Provider>
  );
};

export const usePSConfigSettingsContext = () =>
  React.useContext(PSConfigSettingsContext);

export const usePSSettingStringContext = () =>
  React.useContext(PSSettingStringContext);
