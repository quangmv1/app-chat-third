import React from 'react';
import isEqual from 'react-fast-compare';
import {StyleSheet, Text, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../context';
import {PSIcAddCircleDash32} from '../../../../icons';
import {
  mapTagEntityToModel,
  PSTagCategoryModel,
  PSTagModel,
} from '../../../../types';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {PSLabelTag} from '../../../PSLabelTag';
import {useThreadProfileActionContext} from '../../contexts';
import {usePSThreadDeskTagCategoriesActionContext} from '../contexts';

const TagCategory = React.memo(
  ({category, tags}: {category: PSTagCategoryModel; tags: PSTagModel[]}) => {
    const {colors, typography} = usePSDesignSystemContext();

    const {show} = usePSThreadDeskTagCategoriesActionContext();

    const handlePress = React.useCallback(() => {
      show(category, tags);
    }, [category, tags]);

    return (
      <PSDebouncedPressable
        style={styles.containerCategory}
        onPress={handlePress}>
        <Text style={[styles.text, typography.headingMediumM, {color: colors.Primary.subText}]}>
          {category.name}
        </Text>
        <View>
          {tags?.map(tag => {
            return (
              <PSLabelTag
                key={`${tag.id}_${category.name}`}
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
          }) ?? null}
        </View>

        <PSIcAddCircleDash32
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const ThreadDeskTagCategories = () => {
  const {tagCategories, tags} = useThreadProfileActionContext();

  const categoryNotIsPredefined = React.useMemo(() => {
    return tagCategories?.filter(category => !category.isPredefined) ?? [];
  }, [tagCategories]);

  return categoryNotIsPredefined && categoryNotIsPredefined.length > 0 ? (
    <View style={styles.container}>
      {categoryNotIsPredefined.map(category => (
        <TagCategory
          key={category.id}
          category={category}
          tags={
            tags
              ?.filter(tag => tag.categoryId === category.id)
              .map(tag => mapTagEntityToModel(tag)) ?? []
          }
        />
      ))}
    </View>
  ) : null;
};

export const PSThreadDeskTagCategories = React.memo(
  ThreadDeskTagCategories,
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  containerCategory: {
    flexDirection: 'row',
    marginVertical: (8).px(),
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  tag: {
    marginEnd: (4).px(),
  },
});
