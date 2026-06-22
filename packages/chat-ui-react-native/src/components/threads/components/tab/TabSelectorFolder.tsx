import React, {useCallback, useRef} from 'react';
import {
  Dimensions,
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {usePSDesignSystemContext} from '../../../../context';
import {PSFolderModel} from '../../../../types';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {useFolderContext} from '../../contexts';

type TabSelectorFolderProps = {
  tabs: PSFolderModel[];
  selectedColor: string;
  unSelectedColor: string;
  selectedTitleStyle?: StyleProp<TextStyle>;
  unselectedTitleStyle?: StyleProp<TextStyle>;
  tabStyle?: (isActive: boolean) => StyleProp<ViewStyle>;
  onTabSelected?: null | ((index: number, folderId: string) => void);
  isVisibleIndicator?: boolean;
  indicatorStyle?: (isActive: boolean) => StyleProp<ViewStyle>;
};
const {width} = Dimensions.get('window');
const WIDTH_TAB = (width - 32) / 3;

export const TabSelectorFolder = ({
  tabs,
  selectedColor,
  unSelectedColor,
  selectedTitleStyle,
  unselectedTitleStyle,
  tabStyle,
  onTabSelected,
  isVisibleIndicator,
  indicatorStyle,
}: TabSelectorFolderProps) => {
  const refScrollTab = useRef<FlatList>(null);
  const {colors} = usePSDesignSystemContext();

  const currentFolderAlias = useFolderContext().currentFolderAlias;

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

  const onTabPress = React.useCallback(
    (index: number) => {
      onTabSelected?.(index, tabs[index]!.id);
      _handleScrollTab(index);
    },
    [onTabSelected, _handleScrollTab, tabs],
  );

  // const widthTab = React.useMemo(() => {
  //   if (tabs.length > 3) {
  //     return WIDTH_TAB;
  //   }
  //   return (width - 32) / tabs.length;
  // }, [tabs]);

  const renderTabs = ({item, index}: {item: PSFolderModel; index: number}) => {
    return (
      <PSDebouncedPressable
        key={item.id}
        style={[
          styles.tab,
          // {width: widthTab},
          {
            backgroundColor:
              currentFolderAlias === item.id
                ? colors.Primary.bgBranding
                : undefined,
          },
          typeof tabStyle === 'function'
            ? tabStyle(currentFolderAlias === item.id)
            : tabStyle,
        ]}
        onPress={() => onTabPress(index)}>
        <Text
          style={[
            styles.textTab,
            currentFolderAlias === item.id
              ? selectedTitleStyle
              : unselectedTitleStyle,
          ]}>
          {item.name}
        </Text>
        {isVisibleIndicator === true ? (
          <View
            style={[
              styles.animatedView,
              {
                backgroundColor:
                  currentFolderAlias === item.id
                    ? selectedColor
                    : colors.Neutral.n50,
              },
              typeof indicatorStyle === 'function'
                ? indicatorStyle(currentFolderAlias === item.id)
                : indicatorStyle,
            ]}
          />
        ) : null}
      </PSDebouncedPressable>
    );
  };

  return (
    <FlatList
      ref={refScrollTab}
      data={tabs}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderTabs}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: (8).px(),
    paddingVertical: (4).px(),
    // paddingHorizontal: (12).px(),
    // marginBottom: (9).px(),
  },
  textTab: {
    marginHorizontal: (12).px(),
    flex: 1,
    textAlign: 'center',
  },
  animatedView: {
    position: 'absolute',
    height: 2,
    bottom: 0,
    left: 0,
    width: '100%',
  },
});
