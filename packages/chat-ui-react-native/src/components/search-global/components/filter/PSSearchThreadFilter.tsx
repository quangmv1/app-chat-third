import React, {PropsWithChildren, useCallback, useRef} from 'react';
import isEqual from 'react-fast-compare';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSIsDeskModeContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
} from '../../../../context';
import {PSFolderEntity, PSFolderModel} from '../../../../types';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {useSetSearchThreadFilterFolderContext} from '../../contexts';
import {PSSearchThreadStyles} from '../../PSSearchThreadStyles';

const SearchThreadFilterItem = React.memo(
  ({
    children,
    title,
    isActive,
    onPress,
  }: PropsWithChildren<{
    title: string;
    isActive: boolean;
    onPress?: null | (() => void);
  }>) => {
    const {colors, typography} = usePSDesignSystemContext();
    return (
      <PSDebouncedPressable
        style={[
          styles.containerItem,
          {
            borderColor: colors.Branding.b600,
            backgroundColor: isActive
              ? colors.Primary.bgBranding
              : colors.Neutral.n0,
          },
        ]}
        onPress={onPress}>
        {children}
        <Text
          style={[
            styles.textItem,
            typography.bodyXLargeR,
            {color: colors.Branding.b600},
          ]}>
          {title}
        </Text>
      </PSDebouncedPressable>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const SearchThreadFilter = () => {
  const {translator} = usePSTranslationContext();
  // const {colors} = usePSDesignSystemContext();
  const [posActive, setPosActive] = React.useState(PSFolderEntity.ALL);
  const setCurrentSearchThreadFilterAlias =
    useSetSearchThreadFilterFolderContext();
  const searchThreadStyles = usePSScreenStylesContext<PSSearchThreadStyles>();
  const refScrollTab = useRef<FlatList>(null);
  const isDeskMode = usePSIsDeskModeContext()?.isDeskMode ?? false;

  const _handleScrollTab = useCallback(
    (index: number) => {
      refScrollTab.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    },
    [refScrollTab],
  );

  const onFilterPress = React.useCallback(
    (index: number, id: string) => {
      setPosActive(id);
      setCurrentSearchThreadFilterAlias(id);
      _handleScrollTab(index);
    },
    [setCurrentSearchThreadFilterAlias, _handleScrollTab],
  );

  const tabsValue = React.useMemo(() => {
    return [
      {
        id: PSFolderEntity.ALL,
        name: translator('ps_folder_all'),
        visible: true,
      },
      // {
      //   id: PSFolderEntity.UNREAD,
      //   name: translator('ps_folder_unread'),
      //   visible: true, // threadsStyles.foldersTab?.isVisibleUnReadFolderTab ?? true,
      // },
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
    isDeskMode,
    searchThreadStyles.isVisibleFilterSearchSharedInbox,
    searchThreadStyles.isVisibleFilterSearchPCL,
  ]);

  const renderTabs = ({item, index}: {item: PSFolderModel; index: number}) => {
    return (
      <SearchThreadFilterItem
        key={item.id}
        title={item.name}
        isActive={posActive === item.id}
        onPress={() => {
          onFilterPress(index, item.id);
        }}
      />
    );
  };

  return (
    <View style={{height: (40).px()}}>
      <FlatList
        style={{height: 60}}
        ref={refScrollTab}
        data={tabsValue}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderTabs}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export const PSSearchThreadFilter = React.memo(
  SearchThreadFilter,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  containerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (16).px(),
    paddingVertical: (8).px(),
    borderWidth: (1).px(),
    borderRadius: (12).px(),
    marginEnd: (12).px(),
  },
  textItem: {
    marginStart: (4).px(),
  },
});
