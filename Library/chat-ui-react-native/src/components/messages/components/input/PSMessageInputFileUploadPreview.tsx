import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  // FlatList
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {useRenderCounter} from '../../../../hooks';
import {usePSMessageInputFileContext} from '../../contexts';
import isEqual from 'react-fast-compare';
import {PSIcClose14} from '../../../../icons';
import {formatFileSizeToText, mimeTypeToIcon} from '../../../../utils';
import {PSMessageFileModel} from '../../../../types';
import {lookup} from 'mime-types';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSDesignSystemContext} from '../../../../context';

const MemoizeTypeIcon = React.memo(
  ({mimeType}: {mimeType?: string | null}) => {
    useRenderCounter('PSMessageInputFileUploadPreview.MemoizeTypeIcon');

    const IconType = React.useMemo(() => mimeTypeToIcon(mimeType), [mimeType]);

    return IconType ? <IconType width={(40).px()} height={(40).px()} /> : null;
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeNameText = React.memo(
  ({name}: {name?: string | null}) => {
    const {typography, colors} = usePSDesignSystemContext();

    useRenderCounter('PSMessageInputFileUploadPreview.MemoizeNameText');

    const textStyles = React.useMemo(() => {
      return [typography.headingXSmallM, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.headingXSmallM]);

    return (
      <Text numberOfLines={1} ellipsizeMode="middle" style={textStyles}>
        {name?.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const MemoizeSizeText = React.memo(
  ({size}: {size?: number | null}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const fileSize = React.useMemo(() => {
      return size ? formatFileSizeToText(size) : null;
    }, [size]);

    useRenderCounter('PSMessageInputFileUploadPreview.MemoizeSizeText');

    const textStyles = React.useMemo(() => {
      return [
        styles.fileItemSizeText,
        typography.bodySmallR,
        {color: colors.Neutral.n400},
      ];
    }, [colors.Neutral.n400, typography.bodySmallR]);

    return fileSize ? (
      <Text numberOfLines={1} style={textStyles}>
        {fileSize}
      </Text>
    ) : null;
  },
  (prev, next) => isEqual(prev, next),
);

const FileUploadPreviewItem = React.memo(
  ({
    item,
    index,
    onPress,
  }: {
    item: PSMessageFileModel;
    index: number;
    onPress: (uri: string, index: number) => void;
  }) => {
    useRenderCounter('PSMessageInputFileUploadPreview.FileUploadPreviewItem');
    const {colors} = usePSDesignSystemContext();

    const mimeType = React.useMemo(() => {
      const result = lookup(item.name);
      if (typeof result === 'string') {
        return result;
      } else {
        return undefined;
      }
    }, [item.name]);

    const onClosePressed = () => {
      onPress(item.srcUrl, index);
    };

    const containerStyles = React.useMemo(() => {
      return [
        styles.fileItemContainer,
        {
          backgroundColor: colors.Primary.background,
        },
      ];
    }, [colors.Neutral.n0]);

    return (
      <View style={containerStyles}>
        <MemoizeTypeIcon mimeType={mimeType} />
        <View style={styles.fileItemTextContainer}>
          <MemoizeNameText name={item.name} />
          <MemoizeSizeText size={item.size} />
        </View>
        <PSDebouncedPressable
          style={styles.fileItemCloseButton}
          onPress={onClosePressed}>
          <PSIcClose14 width={20} height={20} />
        </PSDebouncedPressable>
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessageInputFileUploadPreview = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const {selectedFiles, setSelectedFiles} = usePSMessageInputFileContext();

  const flatListRef = React.useRef<FlatList>(null);

  const deleteRef = React.useRef(false);

  const onPress = React.useCallback((uri: string, index: number) => {
    deleteRef.current = true;
    setSelectedFiles(files => {
      return files.filter((file, i) => file.srcUrl !== uri || i !== index);
    });
  }, []);

  const keyExtractor = React.useCallback(
    (item: PSMessageFileModel, index: number) => item.srcUrl + index.toString(),
    [],
  );

  const renderItem = React.useCallback(
    ({item, index}: {item: PSMessageFileModel; index: number}) => (
      <FileUploadPreviewItem item={item} index={index} onPress={onPress} />
    ),
    [onPress],
  );

  const renderSeparator = React.useCallback(() => {
    return (
      <View style={[styles.sperator, {backgroundColor: colors.Neutral.n50}]} />
    );
  }, [colors.Neutral.n50]);

  const onContentSizeChange = React.useCallback(() => {
    if (deleteRef.current) {
      deleteRef.current = false;
    } else {
      flatListRef.current?.scrollToEnd({animated: true});
    }
  }, []);

  useRenderCounter('PSMessageInputFileUploadPreview', selectedFiles.length > 0);

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.white,
        borderBottomColor: colors.Neutral.n200,
      },
    ];
  }, [colors.Primary.linerBorder, colors.Neutral.n200]);

  return selectedFiles.length ? (
    <View style={containerStyles}>
      <FlatList
        ref={flatListRef}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={selectedFiles}
        style={styles.fileListContainer}
        contentContainerStyle={styles.fileListContentContainer}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        onContentSizeChange={onContentSizeChange}
      />
    </View>
  ) : null;
});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    borderBottomWidth: (0.5).px(),
  },
  fileListContainer: {maxHeight: (120).px()},
  fileListContentContainer: {},
  sperator: {height: (0.5).px()},
  fileItemContainer: {
    width: (220).px(),
    borderRadius: (16).px(),
    paddingVertical: (10).px(),
    paddingHorizontal: (12).px(),
    marginStart: (12).px(),
    marginVertical: (8).px(),
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileItemTextContainer: {
    flexDirection: 'column',
    flex: 1,
    marginHorizontal: (8).px(),
  },
  fileItemSizeText: {
    marginTop: (2).px(),
  },
  fileItemCloseButton: {
    position: 'absolute',
    right: (-5).px(),
    top: (-5).px(),
  },
});
