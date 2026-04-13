import _ from 'lodash';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  usePSChatApiClientContext,
  usePSIsDeskModeContext,
  usePSScreenStylesContext,
  useQuery,
  useRealm,
} from '../../../context';
import {PSFolderEntity, PSThreadListPCLEntity} from '../../../types';
import {psLogger} from '../../../utils';
import {useFolderContext} from './PSFolderContext';
import {PSThreadsStyles} from '../PSThreadsStyles';

type PSThreadListUserTypePCLContextValue = {
  dataUserType: PSThreadListPCLEntity[];
  isDataSharedBox: boolean;
  isDataPCL: boolean;
  userTypeSelected?: {[x: string]: string};
  handleChangeUserType: ({type, id}: {type?: string; id?: string}) => void;
};

const PSThreadListUserTypePCLContext =
  createContext<PSThreadListUserTypePCLContextValue>(
    {} as PSThreadListUserTypePCLContextValue,
  );

export const PSThreadListUserTypePCLProvider = ({
  children,
}: PropsWithChildren) => {
  const realm = useRealm();
  const {isDeskMode} = usePSIsDeskModeContext();

  const isVisibleSharedInboxFolderTab =
    usePSScreenStylesContext<PSThreadsStyles>()?.foldersTab
      ?.isVisibleSharedInboxFolderTab ?? isDeskMode; //SDK MODE: ko hiển thị Inbox chung, chỉ hiển thị tab Public
  const isVisiblePCLFolderTab =
    usePSScreenStylesContext<PSThreadsStyles>()?.foldersTab
      ?.isVisiblePCLFolderTab ?? !isDeskMode; // DESK MODE: ko hiển thị Public, chỉ hiển thị tab Inbox Chung

  const [userTypeSelected, setUserTypeSelected] = useState<{
    [x: string]: string;
  }>({});

  const chatApiClient = usePSChatApiClientContext();

  const {currentFolderAlias} = useFolderContext();

  const [loading, setLoading] = useState(true);

  const handleChangeUserType = useCallback(
    ({type, id}: {type?: string; id?: string}) => {
      if (!type || !id) return;
      setUserTypeSelected(prev => {
        return {
          ...prev,
          [type]: id,
        };
      });
    },
    [],
  );

  const fetchingDataUserTypePCL = useCallback(async () => {
    try {
      if (!chatApiClient) return;
      setLoading(true);
      const dto = await chatApiClient.threadApi.fetchPublicChatList(
        [PSFolderEntity.SHARED_INBOX, PSFolderEntity.PCL].toString(),
      );
      if (!dto.data) return;
      await PSThreadListPCLEntity.createThreadListPCL(realm, dto.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      psLogger.error(`PSTabSelectorFolder: fetchingDataUserTypePCL:`, error);
    }
  }, [chatApiClient, realm]);

  // call api lấy list data user type PCL
  useEffect(() => {
    if (isVisibleSharedInboxFolderTab || isVisiblePCLFolderTab)
      fetchingDataUserTypePCL();
  }, [
    fetchingDataUserTypePCL,
    isVisibleSharedInboxFolderTab,
    isVisiblePCLFolderTab,
  ]);

  const isDataSharedBox = useMemo(() => {
    try {
      const data = PSThreadListPCLEntity.filteredByType(
        realm,
        parseInt(PSFolderEntity.SHARED_INBOX),
      );
      return !_.isEmpty(data);
    } catch (error) {
      psLogger.error('PSThreadListUserTypePCLContext isDataSharedBox', error);
      return false;
    }
  }, [realm, loading]);

  const isDataPCL = useMemo(() => {
    try {
      const data = PSThreadListPCLEntity.filteredByType(
        realm,
        parseInt(PSFolderEntity.PCL),
      );
      return !_.isEmpty(data);
    } catch (error) {
      psLogger.error('PSThreadListUserTypePCLContext isDataPCL', error);
      return false;
    }
  }, [realm, loading]);

  const cachedDataPCL = useQuery(
    PSThreadListPCLEntity,
    threads => {
      let result = threads.filtered(
        PSThreadListPCLEntity.filteredByNameNotNull(),
      );
      if (currentFolderAlias === PSFolderEntity.SHARED_INBOX) {
        result = threads.filtered(
          PSThreadListPCLEntity.filteredByTypeString(
            PSFolderEntity.SHARED_INBOX,
          ),
        );
      } else if (currentFolderAlias === PSFolderEntity.PCL) {
        result = threads.filtered(
          PSThreadListPCLEntity.filteredByTypeString(PSFolderEntity.PCL),
        );
      }
      return result ?? [];
    },
    [currentFolderAlias],
  );

  return (
    <PSThreadListUserTypePCLContext.Provider
      value={{
        isDataPCL,
        isDataSharedBox,
        dataUserType: [...cachedDataPCL],
        handleChangeUserType,
        userTypeSelected,
      }}>
      {children}
    </PSThreadListUserTypePCLContext.Provider>
  );
};

export const usePSThreadListPCLContext = () =>
  React.useContext(PSThreadListUserTypePCLContext);
