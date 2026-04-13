import React, { Fragment, PropsWithChildren } from 'react';
import isEqual from 'react-fast-compare';
import { StyleSheet, View } from 'react-native';
import {
  PSScreenStylesProvider,
  usePSDesignSystemContext,
  usePSPartitioningPathContext,
  usePSScreenStylesContext,
  usePSTranslationContext,
} from '../../context';
import { useRenderCounter } from '../../hooks';
import { PSNetInfoStatus } from '../PSNetInfoStatus';
import { PSTabSelectorFolder, PSThreadsList } from './components';
import {
  ActionThreadsProvider,
  // FolderProvider,
  PSPaginatedThreadsProvider,
  PSThreadNavigationProvider,
  ThreadActionsDeleteOverlayProvider,
  ThreadActionsOverlayProvider,
} from './contexts';
import { PSThreadsStyles } from './PSThreadsStyles';

// const PSThreadsSearch = React.memo(() => {
//   const {onPressSearch} = usePSThreadNavigationContext();

//   const {colors} = usePSDesignSystemContext();

//   const {translator} = usePSTranslationContext();

//   return (
//     <PSDebouncedPressable onPress={onPressSearch} style={styles.search}>
//       <PSSearch
//         style={[{backgroundColor: colors.Primary.background}]}
//         placeholder={translator('ps_search')}
//         placeholderTextColor={colors.Neutral.n50}
//         searchIconColor={colors.Neutral.n200}
//         editable={false}
//       />
//     </PSDebouncedPressable>
//   );
// });

const PSThreadsProvider = ({
  threadsStyles,
  onThreadPress,
  children,
}: PropsWithChildren<PSThreadsProps>) => {

  console.log("done init")
  return (
    <PSThreadNavigationProvider onPressThread={onThreadPress}>
      <PSScreenStylesProvider styles={threadsStyles}>
        {/* <FolderProvider> */}
        <ActionThreadsProvider>
          <ThreadActionsOverlayProvider>
            <ThreadActionsDeleteOverlayProvider>
              <PSPaginatedThreadsProvider>
                {children}
              </PSPaginatedThreadsProvider>
            </ThreadActionsDeleteOverlayProvider>
          </ThreadActionsOverlayProvider>
        </ActionThreadsProvider>
        {/* </FolderProvider> */}
      </PSScreenStylesProvider>
    </PSThreadNavigationProvider>
  );
};

const PSThreadsUI = React.memo(() => {
  useRenderCounter('PSThreadsUI');

  const { translator } = usePSTranslationContext();

  const { colors, typography } = usePSDesignSystemContext();

  const foldersTabIsVisible =
    usePSScreenStylesContext<PSThreadsStyles>().foldersTab?.isVisible;

  const style = usePSScreenStylesContext<PSThreadsStyles>().style;

  return (
    <View style={[styles.container, { backgroundColor: colors.Primary.background }, style]}>
      <PSNetInfoStatus
        offlineText={translator('ps_no_internet_connection')}
        offlineTextStyle={[typography.bodyXLargeR, { color: colors.Primary.subText }]}
        offlineBackgroundColor={colors.Neutral.n50}
      />
      {/* <PSThreadsSearch /> */}
      {foldersTabIsVisible ?? true ? <PSTabSelectorFolder /> : null}
      <PSThreadsList />
    </View>
  );
});

type PSThreadsProps = {
  threadsStyles?: PSThreadsStyles;
  onThreadPress?:
  | null
  | ((targetThreadId: string, targetMessageId: number) => void);
};

export const PSThreads = React.memo(
  ({ threadsStyles, onThreadPress }: PSThreadsProps) => {
    useRenderCounter('PSThreads');
    const pathDB = usePSPartitioningPathContext();
    return (
      <Fragment key={pathDB}>
        <PSThreadsProvider
          threadsStyles={threadsStyles}
          onThreadPress={onThreadPress}>
          <PSThreadsUI />
        </PSThreadsProvider>
      </Fragment>
    );
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignContent: 'flex-start',
  },
  search: { marginHorizontal: (32).px(), marginVertical: (8).px() },
});
