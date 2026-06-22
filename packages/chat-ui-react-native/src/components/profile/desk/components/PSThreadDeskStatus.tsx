import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, View, Text} from 'react-native';
import {usePSDesignSystemContext} from '../../../../context';
import {mapTagEntityToModel, PSTagModel} from '../../../../types';
import {PSLabelTag} from '../../../PSLabelTag';
import {usePSTagsPickerActionContext} from '../../../tags';
import {useThreadProfileActionContext} from '../../contexts';

const ThreadDeskStatus = () => {
  const {typography, colors} = usePSDesignSystemContext();

  const {tagCategories, tags} = useThreadProfileActionContext();

  const {openTagsPicker} = usePSTagsPickerActionContext();

  const categoryIsPredefined = React.useMemo(() => {
    return tagCategories?.filter(category => category.isPredefined) ?? [];
  }, [tagCategories]);

  const tagsIsPredefined = React.useMemo(() => {
    return tags?.filter(tag => tag.isPredefined) ?? [];
  }, [tags]);

  const onPress = React.useCallback(
    (tag: PSTagModel) => {
      openTagsPicker(categoryIsPredefined[0]!, tag);
    },
    [categoryIsPredefined[0], openTagsPicker],
  );

  return categoryIsPredefined.length > 0 ? (
    <View style={styles.container}>
      <Text style={[styles.text, typography.headingMediumM, {color: colors.Primary.subText}]}>
        {categoryIsPredefined[0]?.name}
      </Text>

      {tagsIsPredefined.map(tag => {
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
            visibleDropDown={true}
            colorDropDown={tag.colorCode}
            onPress={() => {
              onPress(mapTagEntityToModel(tag));
            }}
          />
        );
      }) ?? null}
    </View>
  ) : null;
};

export const PSThreadDeskStatus = React.memo(ThreadDeskStatus, (prev, next) => {
  return isEqual(prev, next);
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: (8).px(),
  },
  text: {
    flex: 1,
  },
  tag: {
    marginEnd: (4).px(),
  },
});
