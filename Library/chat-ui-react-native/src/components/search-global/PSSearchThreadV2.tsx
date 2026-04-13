import React from 'react';
import {View, StyleSheet} from 'react-native';
import {PSBackButton} from '../PSActionBar';
import {
  usePSDesignSystemContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
} from '../../context';
import {
  usePSSearchThreadFilterContext,
  usePSSearchThreadNavigationContext,
} from './contexts';
import {PSSearch} from '../PSSearch';
import {PSSearchThreadStyles} from './PSSearchThreadStyles';
import PSTabSelectorSearch, {
  TabSearchId,
} from './components/tab/PSTabSelectorSearch';
import {useDebounce} from '../../hooks';
import {PSFolderEntity} from '../../types';
import {
  PSSearchAllResult,
  PSSearchMessageResult,
  PSSearchThreadResult,
} from './components';

export const PSSearchThreadV2 = () => {
  const {translator} = usePSTranslationContext();
  const {colors, typography} = usePSDesignSystemContext();
  const searchThreadStyles = usePSScreenStylesContext<PSSearchThreadStyles>();
  const {currentSearchThreadFilterAlias} = usePSSearchThreadFilterContext();
  const {onBackPress, onThreadPress} = usePSSearchThreadNavigationContext();

  const [keySearch, setKeySearch] = React.useState('');
  const debouncedValue = useDebounce<string>(keySearch, 500);

  return (
    <View style={styles.container}>
      <View style={styles.container_action_bar}>
        <PSBackButton
          onBackPress={onBackPress}
          fillColor={colors.Primary.subText}
        />
        <PSSearch
          value={keySearch}
          onChangeText={newText => {
            setKeySearch(newText);
          }}
          placeholder={translator('ps_search')}
          placeholderTextColor={colors.Primary.disable}
          searchIconColor={colors.Primary.disable}
          style={[styles.search, {backgroundColor: colors.Primary.white}]}
          textStyle={[{color: colors.Primary.mainText}, typography.bodyXLargeR]}
          autoFocus={true}
          onCleanPress={() => {
            setKeySearch('');
          }}
        />
      </View>
      {(searchThreadStyles.isVisibleFilterSearchTab === undefined ||
        searchThreadStyles.isVisibleFilterSearchTab) && <PSTabSelectorSearch />}
      {/* <Text>{`keySearch = ${keySearch} / page = ${page}`}</Text> */}
      {currentSearchThreadFilterAlias !== PSFolderEntity.ALL &&
        currentSearchThreadFilterAlias !== TabSearchId.MESSAGES && (
          <PSSearchThreadResult debouncedValue={debouncedValue} />
        )}
      {currentSearchThreadFilterAlias === TabSearchId.MESSAGES && (
        <PSSearchMessageResult debouncedValue={debouncedValue} />
      )}
      {currentSearchThreadFilterAlias === PSFolderEntity.ALL && (
        <PSSearchAllResult debouncedValue={debouncedValue} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_action_bar: {
    flexDirection: 'row',
    paddingHorizontal: (12).px(),
    paddingVertical: (16).px(),
  },
  search: {flex: 1, marginLeft: (12).px()},
});
