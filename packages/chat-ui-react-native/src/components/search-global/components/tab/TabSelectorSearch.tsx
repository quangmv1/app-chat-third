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
import {PSTabSearchItem} from './PSTabSelectorSearch';
import {usePSDesignSystemContext} from '../../../../context';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSSearchThreadFilterContext} from '../../contexts';

type TabSelectorFolderProps = {
  tabs: PSTabSearchItem[];
  selectedColor: string;
  unSelectedColor: string;
  selectedTitleStyle?: StyleProp<TextStyle>;
  unselectedTitleStyle?: StyleProp<TextStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  onTabSelected?: null | ((index: number, folderId: string) => void);
};
const {width} = Dimensions.get('window');
const WIDTH_TAB = width / 3;

export const TabSelectorSearch = ({
  tabs,
  selectedColor,
  unSelectedColor,
  selectedTitleStyle,
  unselectedTitleStyle,
  tabStyle,
  onTabSelected,
}: TabSelectorFolderProps) => {
  const refScrollTab = useRef<FlatList>(null);
  const {colors} = usePSDesignSystemContext();

  const currentSearchThreadFilterAlias =
    usePSSearchThreadFilterContext().currentSearchThreadFilterAlias;

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

  const widthTab = React.useMemo(() => {
    if (tabs.length > 3) {
      return WIDTH_TAB;
    }
    return width / tabs.length;
  }, [tabs]);

  const renderTabs = ({
    item,
    index,
  }: {
    item: PSTabSearchItem;
    index: number;
  }) => {
    return (
      <PSDebouncedPressable
        key={item.id}
        style={[styles.tab, tabStyle]}
        onPress={() => onTabPress(index)}>
        <Text
          style={[
            styles.textTab,
            currentSearchThreadFilterAlias === item.id
              ? selectedTitleStyle
              : unselectedTitleStyle,
          ]}>
          {item.name}
        </Text>
        <View
          style={[
            styles.animatedView,
            {
              backgroundColor:
                currentSearchThreadFilterAlias === item.id
                  ? selectedColor
                  : colors.Neutral.n50,
            },
          ]}
        />
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
