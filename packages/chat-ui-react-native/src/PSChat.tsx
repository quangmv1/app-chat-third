import React, { PropsWithChildren } from 'react';
import { ImageProps, LogBox } from 'react-native';
import Moment from 'react-moment';
import './utils/array.extensions';
import './utils/string.extensions';
import './utils/number.extensions';
import './utils/emoji';
import {
  PSChatApiClientProvider,
  PSTranslationProvider,
  PSAreaInsetsProvider,
  PSRealmProvider,
  PSSendMessageProvider,
  PSThreadUnreadProvider,
  PSLastOnlineTimeProvider,
  PSMqttClientProvider,
  PSAreaInsetsContextProps,
  PSIsOnlineProvider,
  PSImageComponentProvider,
  PSMessageFileSavedProvider,
  PSDesignSystemProvider,
  PSIsDeskModeProvider,
  PSThreadJoinInviteLinkOverlayProvider,
  PSCreateThreadDefaultProvider,
  PSSaveAssetsPickerProvider,
  PSConfigSettingsProvider,
} from './context';
import { PSi18n } from './translations';
import { PSColors, PSTypography } from './themes';
import { PSChatApiClientOptions } from '@communi/chat-api-client-typescript';
import {
  FolderProvider,
  PSToastProps,
  PSFlashMessage,
  PSFlashMessageProps,
  PSThreadJoinInviteLinkOverlay,
  PSMessageJsonPayloadProvider,
} from './components';
import { PSPopupProvider } from './context/PSPopupContext';

LogBox.ignoreLogs([
  'new NativeEventEmitter',
  '`-[RCTRootView cancelTouches]`',
  'Could not find image file:///',
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
  'ReactImageView: Image source "string" doesn\'t exist',
]); // Ignore log notification by message

Moment.startPooledTimer();

export type PSChatProps = {
  chatApiClientOptions: PSChatApiClientOptions;
  // userId: string;
  deviceId: string;
  i18n?: PSi18n;
  typography?: PSTypography;
  colors?: PSColors;
  areaInsets?: PSAreaInsetsContextProps;
  isEnabledFlashMessage?: boolean | undefined;
  isDeskMode?: boolean | undefined;
  ImageComponent?: React.ComponentType<ImageProps>;
  onFlashMessagePress?: ((threadId: string, messageId?: number) => void) | null;
  onJoinGroupInviteLinkSuccess?: ((threadId: string) => void) | null;
  botId?: string;
  flashMessageProps?: PSFlashMessageProps;
  errorToastProps?: PSToastProps;
  successToastProps?: PSToastProps;
} & ({ isGuest: true; userId?: never } | { isGuest?: false; userId: string });

export const PSChat = ({
  props,
  children,
}: PropsWithChildren<{ props: PSChatProps }>) => {
  if ((props.isGuest && props.userId) || (!props.isGuest && !props.userId)) {
    throw new Error(
      'PSChat: Không thể cung cấp cả isGuest và userId hoặc bỏ trống cả hai.',
    );
  }

  return (
    <PSIsOnlineProvider>
      <PSChatApiClientProvider
        {...props.chatApiClientOptions}
        isGuest={props.isGuest}
        userId={props.userId}>
        <PSRealmProvider userId={props.userId} deviceId={props.deviceId}>
          <PSTranslationProvider i18n={props.i18n}>
            <PSDesignSystemProvider
              typography={props.typography}
              colors={props.colors}>
              <PSMqttClientProvider
                appId={props.chatApiClientOptions.appId}
                onFlashMessagePress={props.onFlashMessagePress}>
                <PSLastOnlineTimeProvider>
                  <PSThreadUnreadProvider>
                    <PSConfigSettingsProvider>
                      <PSCreateThreadDefaultProvider userId={props.botId}>
                        <PSThreadJoinInviteLinkOverlayProvider
                          onJoinGroupInviteLinkSuccess={
                            props.onJoinGroupInviteLinkSuccess
                          }>
                          <PSMessageFileSavedProvider>
                            <PSSendMessageProvider>
                              <PSMessageJsonPayloadProvider>
                                <PSAreaInsetsProvider
                                  topInset={props.areaInsets?.topInset}
                                  bottomInset={props.areaInsets?.bottomInset}>
                                  <PSIsDeskModeProvider
                                    isDeskMode={props.isDeskMode}>
                                    <FolderProvider>
                                      <PSImageComponentProvider
                                        ImageComponent={props.ImageComponent}>
                                        <PSPopupProvider>
                                          <PSSaveAssetsPickerProvider>
                                            {children}
                                            <PSThreadJoinInviteLinkOverlay />
                                            {props.isEnabledFlashMessage ===
                                              false ? null : (
                                              <PSFlashMessage
                                                propsFlashMessage={
                                                  props.flashMessageProps
                                                }
                                                propsErrorToast={
                                                  props.errorToastProps
                                                }
                                                propsSuccessToast={
                                                  props.successToastProps
                                                }
                                              />
                                            )}
                                          </PSSaveAssetsPickerProvider>
                                        </PSPopupProvider>
                                      </PSImageComponentProvider>
                                    </FolderProvider>
                                  </PSIsDeskModeProvider>
                                </PSAreaInsetsProvider>
                              </PSMessageJsonPayloadProvider>
                            </PSSendMessageProvider>
                          </PSMessageFileSavedProvider>
                        </PSThreadJoinInviteLinkOverlayProvider>
                      </PSCreateThreadDefaultProvider>
                    </PSConfigSettingsProvider>
                  </PSThreadUnreadProvider>
                </PSLastOnlineTimeProvider>
              </PSMqttClientProvider>
            </PSDesignSystemProvider>
          </PSTranslationProvider>
        </PSRealmProvider>
      </PSChatApiClientProvider>
    </PSIsOnlineProvider>
  );
};
