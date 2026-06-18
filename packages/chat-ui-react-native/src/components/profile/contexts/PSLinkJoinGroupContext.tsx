import {PSRoleThreadType} from '@communi/chat-api-client-typescript';
import React from 'react';
import {
  usePSChatApiClientContext,
  usePSTranslationContext,
  useQuery,
} from '../../../context';
import {useIsMountedRef} from '../../../hooks';
import {PSThreadEntity, PSThreadPermissionsEntity} from '../../../types';
import {psLogger} from '../../../utils';
import {PSFlashMessage} from '../../flash-message';
type PSLinkJoinGroupActionsContextValue = {
  createInvitationLinks: () => Promise<void>;
  deleteInvitationLinks: (link: string) => Promise<void>;
};

const PSLinkJoinGroupActionsContext =
  React.createContext<PSLinkJoinGroupActionsContextValue>(
    {} as PSLinkJoinGroupActionsContextValue,
  );

type PSLinkJoinGroupContextValue = {
  isLoading: boolean;
  link?: string;
  role?: PSRoleThreadType;
  permissions?: PSThreadPermissionsEntity[];
};

const PSLinkJoinGroupContext = React.createContext<PSLinkJoinGroupContextValue>(
  {} as PSLinkJoinGroupContextValue,
);

export const PSLinkJoinGroupProvider = ({
  threadId,
  domainLinkJoin,
  children,
}: React.PropsWithChildren<{
  threadId: string;
  domainLinkJoin?: string | undefined;
}>) => {
  const {translator} = usePSTranslationContext();
  const chatApiClient = usePSChatApiClientContext();
  const [isLoading, setLoading] = React.useState(false);
  const isMounted = useIsMountedRef();
  const [link, setLink] = React.useState<string | undefined>(undefined);

  const threadQuery = useQuery(PSThreadEntity);

  const currentThread = React.useMemo(() => {
    try {
      if (!threadId) {
        return undefined;
      }
      let query: string;
      if (threadId) {
        query = PSThreadEntity.filteredById(threadId);
      } else {
        return undefined;
      }
      return threadQuery.filtered(query)[0];
    } catch (error) {
      psLogger.error('PSLinkJoinGroupProvider: currentThread', error);
      return undefined;
    }
  }, [threadQuery, threadId]);

  const deleteInvitationLinks = React.useCallback(
    async (invitationLink: string) => {
      if (!chatApiClient) {
        return;
      }

      try {
        setLoading(true);
        await chatApiClient.threadApi.deleteInvitationLinks(
          threadId,
          invitationLink,
        );

        const fetch = async () => {
          const linkInvitation = await fetchInvitationLinks(threadId);
          if (isMounted.current) {
            setLink(linkInvitation);
          }
        };

        fetch();
        setLoading(false);
      } catch (e) {
        psLogger.error('PSLinkJoinGroup: deleteInvitationLinks => ', e);
        setLoading(false);
        PSFlashMessage.show({
          type: 'error',
          position: 'bottom',
          text1: `${translator('ps_error_general')}`,
        });
      }
    },
    [chatApiClient, threadId, translator],
  );

  const createInvitationLinks = React.useCallback(async () => {
    if (!chatApiClient) {
      return;
    }

    try {
      setLoading(true);
      const response =
        await chatApiClient.threadApi.createInvitationLinks(threadId);
      if (isMounted.current && response.data?.link) {
        setLink(
          response.data?.link
            ? `${domainLinkJoin ?? response.data?.path}/${response.data?.link}`
            : response.data?.link,
        );
      }
      setLoading(false);
    } catch (e) {
      psLogger.error('PSLinkJoinGroup: createInvitationLinks => ', e);
      setLoading(false);
      PSFlashMessage.show({
        type: 'error',
        position: 'bottom',
        text1: `${translator('ps_error_general')}`,
      });
    }
  }, [chatApiClient, threadId, domainLinkJoin, translator]);

  const fetchInvitationLinks = async (id: string | undefined) => {
    if (chatApiClient) {
      try {
        setLoading(true);
        if (id) {
          const response =
            await chatApiClient.threadApi.fetchInvitationLinks(id);
          setLoading(false);
          return response.data?.[0]?.link
            ? `${domainLinkJoin ?? response.data?.[0]?.path}/${response.data?.[0]?.link}`
            : response.data?.[0]?.link;
        } else {
          setLoading(false);
          return undefined;
        }
      } catch (e) {
        psLogger.error('PSLinkJoinGroupProvider: fetchInvitationLinks ', e);
        setLoading(false);
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  React.useEffect(() => {
    if (chatApiClient) {
      const fetch = async () => {
        const linkInvitation = await fetchInvitationLinks(threadId);
        if (isMounted.current) {
          setLink(linkInvitation);
        }
      };

      fetch();
    }
  }, [chatApiClient, threadId]);

  const actionsContextValue = React.useMemo(() => {
    return {
      createInvitationLinks: createInvitationLinks,
      deleteInvitationLinks: deleteInvitationLinks,
    } as PSLinkJoinGroupActionsContextValue;
  }, [createInvitationLinks, deleteInvitationLinks]);

  const contextValue = React.useMemo(() => {
    return {
      isLoading: isLoading,
      link: link,
      role: currentThread?.role,
      permissions: currentThread?.setting?.permissions,
    } as PSLinkJoinGroupContextValue;
  }, [isLoading, link, currentThread?.role]);

  return (
    <PSLinkJoinGroupActionsContext.Provider value={actionsContextValue}>
      <PSLinkJoinGroupContext.Provider value={contextValue}>
        {children}
      </PSLinkJoinGroupContext.Provider>
    </PSLinkJoinGroupActionsContext.Provider>
  );
};

export const usePSLinkJoinGroupActionsContext = () =>
  React.useContext(PSLinkJoinGroupActionsContext);

export const usePSLinkJoinGroupContext = () =>
  React.useContext(PSLinkJoinGroupContext);
