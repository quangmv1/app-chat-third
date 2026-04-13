import React, {memo} from 'react';
import {
  usePSDesignSystemContext,
  usePSIsDeskModeContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
} from '../../../../context';
import {View, StyleSheet} from 'react-native';
import {PSSearchThreadStyles} from '../../PSSearchThreadStyles';
import {TabSelectorSearch} from './TabSelectorSearch';
import isEqual from 'react-fast-compare';
import {useSetSearchThreadFilterFolderContext} from '../../contexts';
import {PSFolderEntity} from '../../../../types';

export enum TabSearchId {
  CHATS = 'chats',
  MESSAGES = 'messages',
  GLOBAL = 'global',
}

export type PSTabSearchItem = {
  id: string;
  name: string;
  visible: boolean;
};

const PSTabSelectorSearch = React.memo(
  () => {
    const {translator} = usePSTranslationContext();

    const {colors, typography} = usePSDesignSystemContext();

    const searchThreadStyles = usePSScreenStylesContext<PSSearchThreadStyles>();

    const isDeskMode = usePSIsDeskModeContext()?.isDeskMode ?? false;

    const setCurrentSearchThreadFilterAlias =
      useSetSearchThreadFilterFolderContext();

    const tabsValue = React.useMemo(() => {
      return [
        {
          id: PSFolderEntity.ALL,
          name: translator('ps_folder_all'),
          visible: true,
        },
        {
          id: TabSearchId.CHATS,
          name: translator('ps_chats'),
          visible: true,
        },
        {
          id: TabSearchId.MESSAGES,
          name: translator('ps_messages'),
          visible: true,
        },
        {
          id: TabSearchId.GLOBAL,
          name: translator('ps_global'),
          visible: true,
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
            searchThreadStyles.isVisibleFilterSearchSharedInbox ?? isDeskMode, //SDK MODE: OFF Inbox chung, ON tab Public
        },
        {
          id: PSFolderEntity.PCL,
          name: translator('ps_folder_pcl'),
          visible: searchThreadStyles.isVisibleFilterSearchPCL ?? !isDeskMode, // DESK MODE: OFF Public, ON Inbox Chung
        },
      ].filter(folder => folder.visible);
    }, [
      translator,
      isDeskMode,
      searchThreadStyles.isVisibleFilterSearchSharedInbox,
      searchThreadStyles.isVisibleFilterSearchPCL,
    ]);

    const onTabSelected = React.useCallback(
      (index: number, tabId: string) => {
        setCurrentSearchThreadFilterAlias(tabId);
      },
      [setCurrentSearchThreadFilterAlias],
    );

    return tabsValue.length > 1 ? (
      <View style={[styles.container, searchThreadStyles.searchTab?.style]}>
        <TabSelectorSearch
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
          tabStyle={searchThreadStyles.searchTab?.tabStyle}
          onTabSelected={onTabSelected}
        />
      </View>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const styles = StyleSheet.create({
  container: {
    // width: '60%',
    // flexDirection: 'row',
    height: (40).px(),
    // marginHorizontal: (16).px(),
    // marginHorizontal: (16).px(),
    // marginBottom: (8).px(),
    // marginTop: (12).px(),
    // backgroundColor: 'red',
  },
});

export default memo(PSTabSelectorSearch);
