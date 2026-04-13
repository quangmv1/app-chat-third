import React, {PropsWithChildren} from 'react';
import {usePSChatApiClientContext} from '../../../context';
import {psLogger} from '../../../utils';
import {PSMessagePreviewLinkModel} from '../../../types';
import {usePSEditMessageContext} from './PSEditMessageContext';
import {useIsMountedRef, useDeepCompareMemoize} from '../../../hooks';

const PSMessagePreviewLinkContext = React.createContext<
  PSMessagePreviewLinkModel | undefined
>(undefined);

type PSMessagePreviewLinkActionContextValue = {
  setFetchPreviewLinkEnabled: (isEnabled: boolean) => void;
  setUrlsToFetchPreviewLink: React.Dispatch<React.SetStateAction<string[]>>;
};

const PSMessagePreviewLinkActionContext =
  React.createContext<PSMessagePreviewLinkActionContextValue>(
    {} as PSMessagePreviewLinkActionContextValue,
  );

export const PSMessagePreviewLinkProvider = ({children}: PropsWithChildren) => {
  const isMounted = useIsMountedRef();

  const chatApiClient = usePSChatApiClientContext();

  const fetchEnabledRef = React.useRef(true);

  const [urlsToFetchPreview, setUrlsToFetchPreview] = React.useState<string[]>(
    [],
  );

  const currentUrlRef = React.useRef<string | undefined>();

  const [previewLink, setPreviewLink] = React.useState<
    PSMessagePreviewLinkModel | undefined
  >();

  const messageToEdit = usePSEditMessageContext();

  const setFetchPreviewLinkEnabled = React.useCallback((isEnabled: boolean) => {
    fetchEnabledRef.current = isEnabled;
    if (!isEnabled) {
      currentUrlRef.current = undefined;
      setPreviewLink(undefined);
    }
  }, []);

  React.useEffect(() => {
    const url = urlsToFetchPreview[0];
    if (!chatApiClient || !fetchEnabledRef.current || !url) {
      currentUrlRef.current = undefined;
      setPreviewLink(undefined);
      return;
    }

    const messageToEditPreviewLink = messageToEdit?.body?.previewLink;

    if (messageToEditPreviewLink && messageToEditPreviewLink.url === url) {
      currentUrlRef.current = messageToEditPreviewLink.url;
      setPreviewLink(messageToEditPreviewLink);
      return;
    }

    if (currentUrlRef.current === url) {
      return;
    }

    currentUrlRef.current = url;

    setPreviewLink({
      url: url,
      isLoading: true,
    });
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await chatApiClient.previewLinkApi.fetchPreviewLink(
          url,
          {
            signal: controller.signal,
          },
        );
        if (isMounted.current && fetchEnabledRef.current && response) {
          setPreviewLink({
            url: response.sourceUrl,
            title: response.title,
            sitename: response.sitename,
            description: response.description,
            image: response.image,
            width: response.width,
            height: response.height,
            isLoading: false,
          });
        }
      } catch (e) {
        psLogger.error('PSMessagePreviewLinkProvider: fetchData => ', e);
      }
    };
    fetchData();
    return () => {
      controller.abort();
    };
  }, [chatApiClient, useDeepCompareMemoize(urlsToFetchPreview)]);

  const actionContext = React.useMemo<PSMessagePreviewLinkActionContextValue>(
    () => ({
      setFetchPreviewLinkEnabled: setFetchPreviewLinkEnabled,
      setUrlsToFetchPreviewLink: setUrlsToFetchPreview,
    }),
    [setFetchPreviewLinkEnabled],
  );

  return (
    <PSMessagePreviewLinkContext.Provider value={previewLink}>
      <PSMessagePreviewLinkActionContext.Provider value={actionContext}>
        {children}
      </PSMessagePreviewLinkActionContext.Provider>
    </PSMessagePreviewLinkContext.Provider>
  );
};

export const usePSMessagePreviewLinkContext = () =>
  React.useContext(PSMessagePreviewLinkContext);

export const usePSMessagePreviewLinkActionContext = () =>
  React.useContext(PSMessagePreviewLinkActionContext);
