import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../../context';
import {PSTagModel} from '../../../../../types';
import {PSLabelTag} from '../../../../PSLabelTag';

export const PSThreadItemTags = React.memo(
  ({tags}: {tags: PSTagModel[]}) => {
    const {typography} = usePSDesignSystemContext();

    return tags.length > 0 ? (
      <View style={styles.container}>
        {tags.map(tag => {
          return (
            <PSLabelTag
              key={tag.id}
              title={tag.name}
              textStyle={[typography.bodyXLargeR, {color: tag.colorCode}]}
              style={[
                styles.tag,
                {
                  borderColor: tag.colorCode,
                  backgroundColor: `${tag.colorCode}1A`,
                },
              ]}
              disabled={true}
            />
          );
        })}
      </View>
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: (4).px(),
  },
  tag: {
    marginEnd: (4).px(),
  },
});
