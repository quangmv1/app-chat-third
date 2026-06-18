import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PSIcClose24, PSIcLink24} from '../../../../icons';
import {
  usePSMessagePreviewLinkActionContext,
  usePSMessagePreviewLinkContext,
} from '../../contexts';
import {useRenderCounter} from '../../../../hooks';
import isEqual from 'react-fast-compare';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';

const Sperator = React.memo(() => {
  const {colors} = usePSDesignSystemContext();

  const containerStyles = React.useMemo(() => {
    return [styles.sperator, {backgroundColor: colors.Branding.b400}];
  }, [colors.Branding.b400]);

  return <View style={containerStyles} />;
});

const Title = React.memo(
  ({title}: {title: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [styles.textTitle, typography.bodyMediumS, {color: colors.Primary.subText}];
    }, [colors.Primary.subText, typography.bodyMediumS]);

    return (
      <Text style={textStyles} numberOfLines={1}>
        {title.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

const Description = React.memo(
  ({description}: {description: string}) => {
    const {typography, colors} = usePSDesignSystemContext();

    const textStyles = React.useMemo(() => {
      return [
        styles.textDescription,
        typography.bodySmallR,
        {color: colors.Neutral.n400},
      ];
    }, [colors.Neutral.n400, typography.bodySmallR]);

    return (
      <Text numberOfLines={1} style={textStyles}>
        {description.workAroundTextOneLineContainsNewLineIOS()}
      </Text>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export const PSMessageInputPreviewLink = React.memo(() => {
  const {translator} = usePSTranslationContext();

  const {colors} = usePSDesignSystemContext();

  const previewLink = usePSMessagePreviewLinkContext();

  const {setFetchPreviewLinkEnabled} = usePSMessagePreviewLinkActionContext();

  const onClosePressed = () => {
    setFetchPreviewLinkEnabled(false);
  };

  const title =
    previewLink && previewLink.isLoading
      ? translator('ps_message_input_preview_link_loading')
      : previewLink?.title ?? '';

  const description =
    previewLink && previewLink.isLoading
      ? previewLink.url
      : previewLink?.description ?? '';

  useRenderCounter('PSMessageInputPreviewLink', previewLink !== undefined);

  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: colors.Primary.bgBranding,
        borderBottomColor: colors.Neutral.n400,
      },
    ];
  }, [colors.Primary.bgBranding, colors.Neutral.n400]);

  return previewLink ? (
    <View style={containerStyles}>
      <PSIcLink24
        width={(32).px()}
        height={(32).px()}
        fill={colors.Branding.b400}
      />
      <Sperator />
      <View style={styles.contentContainer}>
        <Title title={title} />
        <Description description={description} />
      </View>
      <PSDebouncedPressable style={styles.buttonClose} onPress={onClosePressed}>
        <PSIcClose24
          width={(24).px()}
          height={(24).px()}
          fill={colors.Primary.subText}
        />
      </PSDebouncedPressable>
    </View>
  ) : null;
});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: (8).px(),
    paddingHorizontal: (16).px(),
    height: (56).px(),
    borderBottomWidth: (0.5).px(),
  },
  sperator: {
    height: '100%',
    width: (4).px(),
    marginStart: (12).px(),
    borderRadius: (33).px(),
  },
  contentContainer: {flex: 1, flexDirection: 'column', marginStart: (12).px()},
  textTitle: {},
  textDescription: {marginTop: (2).px()},
  buttonClose: {paddingStart: (16).px()},
});
