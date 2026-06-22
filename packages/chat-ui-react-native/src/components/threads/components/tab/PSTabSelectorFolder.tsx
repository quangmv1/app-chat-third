import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSIsDeskModeContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSFolderEntity} from '../../../../types';
import {PSThreadsStyles} from '../../PSThreadsStyles';
import {useSetFolderContext} from '../../contexts';
import {TabSelectorFolder} from './TabSelectorFolder';

const PSTabSelectorFolder = () => {
  const {translator} = usePSTranslationContext();

  const setCurrentFolderAlias = useSetFolderContext();

  const {colors, typography} = usePSDesignSystemContext();

  const threadsStyles = usePSScreenStylesContext<PSThreadsStyles>();

  const isDeskMode = usePSIsDeskModeContext()?.isDeskMode ?? false;

  const onTabSelected = React.useCallback(
    (index: number, folderId: string) => {
      setCurrentFolderAlias(folderId);
    },
    [setCurrentFolderAlias],
  );

  const tabsValue = React.useMemo(() => {
    return [
      {
        id: PSFolderEntity.ALL,
        name: translator('ps_folder_all'),
        visible: true,
      },
      {
        id: PSFolderEntity.UNREAD,
        name: translator('ps_folder_unread'),
        visible: threadsStyles.foldersTab?.isVisibleUnReadFolderTab ?? true,
      },
      {
        id: PSFolderEntity.PUBLIC_GROUP,
        name: translator('ps_folder_public_group'),
        visible: false,
      },
      {
        id: PSFolderEntity.SHARED_INBOX,
        name: translator('ps_folder_shared_inbox'),
        visible:
          threadsStyles.foldersTab?.isVisibleSharedInboxFolderTab ?? isDeskMode, //SDK MODE: OFF Inbox chung, ON tab Public
      },
      {
        id: PSFolderEntity.PCL,
        name: translator('ps_folder_pcl'),
        visible: threadsStyles.foldersTab?.isVisiblePCLFolderTab ?? !isDeskMode, // DESK MODE: OFF Public, ON Inbox Chung
      },
    ].filter(folder => folder.visible);
  }, [
    // threadsStyles.foldersTab?.isVisiblePublicGroupFolderTab,
    threadsStyles.foldersTab?.isVisibleUnReadFolderTab,
    threadsStyles.foldersTab?.isVisibleSharedInboxFolderTab,
    threadsStyles.foldersTab?.isVisiblePCLFolderTab,
    translator,
    isDeskMode,
  ]);

  return tabsValue.length > 1 ? (
    <View
      style={[
        styles.container,
        {borderBottomColor: colors.Primary.linerBorder},
        threadsStyles.foldersTab?.style,
      ]}>
      <TabSelectorFolder
        tabs={tabsValue}
        selectedColor={colors.Primary.branding}
        unSelectedColor={colors.Primary.subText}
        selectedTitleStyle={[
          {color: colors.Primary.branding},
          typography.bodyXLargeS,
        ]}
        unselectedTitleStyle={[
          {color: colors.Primary.subText},
          typography.bodyXLargeS,
        ]}
        tabStyle={threadsStyles.foldersTab?.tabStyle}
        onTabSelected={onTabSelected}
        isVisibleIndicator={threadsStyles.foldersTab?.isVisibleIndicator}
        indicatorStyle={threadsStyles.foldersTab?.indicatorStyle}
      />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    // width: '60%',
    // flexDirection: 'row',
    height: (40).px(),
    paddingHorizontal: (16).px(),
    // marginHorizontal: (16).px(),
    // marginBottom: (8).px(),
    // marginTop: (12).px(),
    borderBottomWidth: (1).px(),
    paddingBottom: (6).px(),
    // backgroundColor: 'red',
  },
});

export default memo(PSTabSelectorFolder);
