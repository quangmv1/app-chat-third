import {
  IPSChatApiClient,
  PSChatApiClient,
  PSChatApiClientOptions,
} from '@communi/chat-api-client-typescript';
import {PSGuestDto} from '@communi/chat-api-client-typescript/src/guest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isEmpty} from 'lodash';
import React, {PropsWithChildren} from 'react';
import {PSFlashMessage} from '../components';
import {useIsMountedRef} from '../hooks';
import {psLogger} from '../utils';
const PISCALE_TOKEN = '@piscale_guest_token_xyz';
const PISCALE_GUEST = '@piscale_guest_xyz';

const PSChatApiClientGuestContext = React.createContext<{
  guest?: PSGuestDto;
  // handleGetTokenGuest?: () => Promise<string>;
}>({});

const PSChatApiClientContext = React.createContext<
  IPSChatApiClient | undefined
>(undefined);

export const PSChatApiClientProvider = (
  props: PropsWithChildren<
    PSChatApiClientOptions & {isGuest?: boolean} & {userId?: string}
  >,
) => {
  const isMounted = useIsMountedRef();

  const [chatApiClient, setChatApiClient] = React.useState<
    IPSChatApiClient | undefined
  >();

  const [guest, setGuest] = React.useState<PSGuestDto | undefined>(undefined);

  const handleGetTokenGuest = React.useCallback(async () => {
    try {
      const oldToken = await AsyncStorage.getItem(PISCALE_TOKEN);
      const oldGuest = await AsyncStorage.getItem(PISCALE_GUEST);
      if (!isEmpty(oldToken) && !isEmpty(oldGuest)) {
        setGuest(JSON.parse(oldGuest!));
        return oldToken!;
      }

      const response: any = await PSChatApiClient.createGuest(
        props.appId,
        props.tenantId,
      );
      const token = response.data.data.token as string;
      if (!token || !token.length) {
        throw new Error('Invalid Token');
      }
      const guestTmp = response.data.data;
      AsyncStorage.setItem(PISCALE_TOKEN, token);
      AsyncStorage.setItem(PISCALE_GUEST, JSON.stringify(guestTmp));
      setGuest(guestTmp);
      return token;
    } catch (error: any) {
      setGuest(undefined);
      psLogger.error('PSChatApiClientProvider: handleGetTokenGuest', error);

      if (error.code === 'ERR_BAD_RESPONSE') {
        PSFlashMessage.show({
          type: 'error',
          text1: 'User has stopped working',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }

      let oldToken: string | null = null;
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_BAD_REQUEST') {
        oldToken = await AsyncStorage.getItem(PISCALE_TOKEN);
      }
      if (oldToken) {
        return oldToken;
      } else {
        await new Promise(resolve => {
          setTimeout(() => {
            resolve('');
          }, 5000);
        });
        oldToken = await AsyncStorage.getItem(PISCALE_TOKEN);
        if (oldToken && oldToken.length && isMounted.current) {
          return await handleGetTokenGuest();
        }
        return '';
      }
    }
  }, [props.appId, props.tenantId, props.isGuest, props.userId]);

  const handleShowMessageError = React.useCallback((message: string) => {
    PSFlashMessage.show({
      type: 'error',
      text1: message,
      position: 'bottom',
      visibilityTime: 2000,
    });
  }, []);

  React.useEffect(() => {
    let apiClient: IPSChatApiClient | undefined;
    const controller = new AbortController();
    const init = async () => {
      try {
        apiClient = await PSChatApiClient.createInstance({
          ...props,
          fetchToken: props.isGuest ? handleGetTokenGuest : props.fetchToken,
          mobile_sdk_version: '>= 3.0.10',
          handleShowMessageError: handleShowMessageError,
          signal: controller.signal,
        });
        if (isMounted.current) {
          setChatApiClient(apiClient);
        }
      } catch (error) {
        psLogger.error('PSChatApiClientProvider: init failed', error);
      }
    };
    init();
    return () => {
      controller.abort();
      setChatApiClient(undefined);
    };
  }, [props.isGuest, props.userId]); // props.fetchToken,

  const guestContextValue = React.useMemo(() => {
    return {
      guest,
      // handleGetTokenGuest,
    };
  }, [guest]);

  return (
    <PSChatApiClientContext.Provider value={chatApiClient}>
      <PSChatApiClientGuestContext.Provider value={guestContextValue}>
        {props.children}
      </PSChatApiClientGuestContext.Provider>
    </PSChatApiClientContext.Provider>
  );
};

export const usePSChatApiClientContext = () =>
  React.useContext(PSChatApiClientContext);

export const usePSChatApiClientGuestContext = () =>
  React.useContext(PSChatApiClientGuestContext);
