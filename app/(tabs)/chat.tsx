import {
  PSBusEvent,
  PSChat,
  PSChatProps,
  PSEventBus,
  PSKeyboard,
  PSMessages,
  PSThreads,
  SoftInputMode,
} from '@communi/chat-react-native';
import axios from 'axios';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- PI SCALE CONFIG ---
const APP_ID = '2e0v57o9zeg';
const API_KEY = '14cbd109c217f0a3665ad158bc943991ae';
// const APP_ID = '2e0gjsomg3n';
// const API_KEY = '113433f4acfca393fa75941bb4760d4a8d';
const DEFAULT_USER_ID = '6a1e9844461e70ffcf80199a' // ask BE to create your id
const ENDPOINT = `https://${APP_ID}.api.piscale.com`;

const axiosInstance = axios.create({
  baseURL: ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY, // Standard header for PiScale API Key
  },
  timeout: 10000,
  withCredentials: false,
});

// Helper hook to track if the screen is still mounted during async retries
const useIsMountedRef = () => {
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};

export default function ChatScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const isMounted = useIsMountedRef();

  const [currentUserId, setCurrentUserId] = useState(DEFAULT_USER_ID);

  const [targetThread, setTargetThread] = useState<
    | {
      threadId: string;
      messageId: number;
    }
    | undefined
  >();

  // Listen for user switch events from the library
  useEffect(() => {
    const subscription = PSEventBus.getInstance().subscribe(
      PSBusEvent.SWITCH_USER,
      (newUserId: string) => {
        if (newUserId && newUserId !== currentUserId) {
          console.log('DEBUG: Switching user to:', newUserId);
          // setTargetThread(undefined); // Reset view
          setCurrentUserId(newUserId);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [currentUserId]);

  const onThreadPress = useCallback(
    (targetThreadId: string, targetMessageId: number) => {
      setTargetThread({
        threadId: targetThreadId,
        messageId: targetMessageId,
      });
    },
    [],
  );

  const onMessagesBackPress = useCallback(() => {
    setTargetThread(undefined);
  }, []);

  // Android Keyboard Adjustment
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (targetThread !== undefined) {
        PSKeyboard.setWindowSoftInputMode(
          SoftInputMode.SOFT_INPUT_ADJUST_NOTHING,
        );
      } else {
        PSKeyboard.setWindowSoftInputMode(
          SoftInputMode.SOFT_INPUT_ADJUST_RESIZE,
        );
      }
    }
  }, [targetThread]);

  const fetchToken = useCallback(async (): Promise<string> => {
    try {
      const response = await axiosInstance.post<any, any>(
        `/user/v1.0/user/${currentUserId}/token`,
      );
      const token = response.data?.data?.token ?? response.data?.token;

      if (!token || !token.length) {
        throw new Error('Invalid Token');
      }
      return token;
    } catch (e) {
      console.log('fetchToken error: ', e);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isMounted.current) {
        return await fetchToken();
      }
      return '';
    }
  }, [isMounted, currentUserId]);

  const chatProps = useMemo(() => {
    return {
      chatApiClientOptions: {
        appId: APP_ID,
        fetchToken: fetchToken,
        baseUrl: ENDPOINT,
      },
      userId: currentUserId,
      deviceId: 'quang_dev_' + Date.now(),
      areaInsets: {
        topInset: top,
        bottomInset: bottom,
      },
    } as PSChatProps;
  }, [top, bottom, fetchToken, currentUserId]);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <PSChat props={chatProps}>
        {targetThread ? (
          <PSMessages
            targetThreadId={targetThread.threadId}
            targetMessageId={targetThread.messageId}
            onBackPress={onMessagesBackPress}
          />
        ) : (
          <PSThreads onThreadPress={onThreadPress} />
        )}

      </PSChat>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
