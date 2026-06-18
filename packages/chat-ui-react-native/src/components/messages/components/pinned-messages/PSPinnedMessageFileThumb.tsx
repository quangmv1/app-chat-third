import React from 'react';
import {PSMessageFileModel} from '../../../../types';
import {StyleSheet} from 'react-native';
import isEqual from 'react-fast-compare';
import {lookup} from 'mime-types';
import {mimeTypeToIcon} from '../../../../utils';

export const PSPinnedMessageFileThumb = React.memo(
  ({file, isVisible}: {file?: PSMessageFileModel; isVisible: boolean}) => {
    const mimeType = React.useMemo(() => {
      if (!file?.name) {
        return undefined;
      }
      const result = lookup(file.name);
      if (typeof result === 'string') {
        return result;
      } else {
        return undefined;
      }
    }, [file?.name]);

    const IconType = React.useMemo(() => mimeTypeToIcon(mimeType), [mimeType]);

    return isVisible && IconType ? (
      <IconType width={(40).px()} height={(40).px()} style={styles.icon} />
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  icon: {
    marginStart: (12).px(),
  },
});
