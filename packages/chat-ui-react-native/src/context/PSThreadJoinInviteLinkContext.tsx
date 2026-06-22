import {
  PSThreadDto,
  PSThreadJoinByLinkStatus,
} from '@communi/chat-api-client-typescript';
import React from 'react';
import {PSFlashMessage} from '../components';
import {useDeepCompareMemoize} from '../hooks';
import {psLogger} from '../utils';
import {usePSChatApiClientContext} from './PSChatApiClientContext';
import {
  usePSThreadJoinInviteLinkOverlayContext,
  usePSThreadJoinInviteLinkOverlayActionContext,
} from './PSThreadJoinInviteLinkOverlayContext';

type PSThreadJoinInviteLinkContextValue = {
  isLoading: boolean;
  joinInvitationLinks: () => Promise<void>;
  threadByLink?: PSThreadDto;
  errorLink?: string;
};

const PSThreadJoinInviteLinkContext =
  React.createContext<PSThreadJoinInviteLinkContextValue>(
    {} as PSThreadJoinInviteLinkContextValue,
  );

export const PSThreadJoinInviteLinkProvider = ({
  children,
  onJoinGroupInviteLinkSuccess,
}: React.PropsWithChildren<{
  onJoinGroupInviteLinkSuccess?: ((threadId: string) => void) | null;
}>) => {
  const {linkId} = usePSThreadJoinInviteLinkOverlayContext();
  const {hideThreadJoinInviteLinkOverlay} =
    usePSThreadJoinInviteLinkOverlayActionContext();
  const chatApiClient = usePSChatApiClientContext();
  const [isLoading, setLoading] = React.useState(false);
  const [threadByLink, setThreadByLink] = React.useState<
    PSThreadDto | undefined
  >(undefined);

  const [errorLink, setErrorLink] = React.useState<string | undefined>(
    undefined,
  );

  const joinInvitationLinks = React.useCallback(async () => {
    if (!chatApiClient || !linkId || !threadByLink?.id) {
      return;
    }

    try {
      setLoading(true);
      await chatApiClient.threadApi.joinInvitationLinks(linkId);
      setLoading(false);
      hideThreadJoinInviteLinkOverlay();
      onJoinGroupInviteLinkSuccess?.(threadByLink.id);
    } catch (e) {
      psLogger.error(
        'PSThreadJoinInviteLinkProvider: joinInvitationLinks => ',
        e,
      );
      setLoading(false);
      hideThreadJoinInviteLinkOverlay();
      PSFlashMessage.show({
        type: 'error',
        position: 'bottom',
        text1: `${e}`,
      });
    }
  }, [
    chatApiClient,
    hideThreadJoinInviteLinkOverlay,
    linkId,
    onJoinGroupInviteLinkSuccess,
    threadByLink?.id,
  ]);

  const fetchThreadByLinkId = async (linkId: string | undefined) => {
    if (chatApiClient && linkId) {
      try {
        setLoading(true);
        const response =
          await chatApiClient.threadApi.fetchThreadByLinkId(linkId);
        setLoading(false);
        if (response.data?.status === PSThreadJoinByLinkStatus.JOINED) {
          hideThreadJoinInviteLinkOverlay();
          onJoinGroupInviteLinkSuccess?.(response.data.id);
        }
        return response.data;
      } catch (e) {
        psLogger.error(
          'PSThreadJoinInviteLinkProvider: fetchThreadByLinkId ',
          e,
        );
        setLoading(false);
        // @ts-ignore
        const error = e?.response?.data?.message ?? false;
        if (error) {
          PSFlashMessage.show({text1: `${error}`});
          setErrorLink(`${error}`);
        }
        return undefined;
      }
    } else {
      setLoading(false);
      return undefined;
    }
  };

  React.useEffect(() => {
    const fetch = async () => {
      const threadDto = await fetchThreadByLinkId(linkId);

      setThreadByLink(threadDto);
    };

    fetch();
  }, [chatApiClient, linkId]);

  const value = React.useMemo(() => {
    return {
      isLoading: isLoading,
      threadByLink: threadByLink,
      errorLink,
      joinInvitationLinks: joinInvitationLinks,
    } as PSThreadJoinInviteLinkContextValue;
  }, [
    isLoading,
    joinInvitationLinks,
    useDeepCompareMemoize(threadByLink),
    errorLink,
  ]);

  return (
    <PSThreadJoinInviteLinkContext.Provider value={value}>
      {children}
    </PSThreadJoinInviteLinkContext.Provider>
  );
};

export const usePSThreadJoinInviteLinkContext = () =>
  React.useContext(PSThreadJoinInviteLinkContext);
