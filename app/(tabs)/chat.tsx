import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  PSChat,
  PSChatProps,
  PSThreads,
  PSMessages,
  PSKeyboard,
  SoftInputMode,
} from '@communi/chat-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

// --- PI SCALE CONFIG ---
const APP_ID = '2e0gjsomg3n';
const API_KEY = '113433f4acfca393fa75941bb4760d4a8d';
const USER_ID = 'quangmai' // ask BE to create your id
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

  const [targetThread, setTargetThread] = useState<
    | {
      threadId: string;
      messageId: number;
    }
    | undefined
  >();


  console.log('targetThread', targetThread)

  const onThreadPress = useCallback(
    (targetThreadId: string, targetMessageId: number) => {
      console.log('press check', {
        targetThreadId,
        targetMessageId,
      })
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
        `/user/v1.0/user/${USER_ID}/token`,
      );
      // Assuming the structure response.data.data.token as per your example
      const token = response.data?.data?.token ?? response.data?.token;

      if (!token || !token.length) {
        throw new Error('Invalid Token');
      }
      return token;
    } catch (e) {
      console.log('fetchToken error: ', e);
      // Demo retry logic as provided
      await new Promise(resolve => {
        setTimeout(() => {
          resolve('');
        }, 1000);
      });

      if (isMounted.current) {
        return await fetchToken();
      }
      return '';
    }
  }, [isMounted]);

  const chatProps = useMemo(() => {
    return {
      chatApiClientOptions: {
        appId: APP_ID,
        fetchToken: fetchToken,
        baseUrl: ENDPOINT,
      },
      userId: USER_ID,
      deviceId: 'device_id',
      areaInsets: {
        topInset: top,
        bottomInset: bottom,
      },
    } as PSChatProps;
  }, [top, bottom, fetchToken]);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <PSChat props={chatProps}>
        {/* {targetThread ? (
          <PSMessages
            targetThreadId={targetThread.threadId}
            targetMessageId={targetThread.messageId}
            onBackPress={onMessagesBackPress}
          />
        ) : (
          <PSThreads onThreadPress={onThreadPress} />
        )} */}


        <PSMessages
          targetThreadId={"41315818758984"}
        // targetMessageId={98}
        // onBackPress={onMessagesBackPress}
        />
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
