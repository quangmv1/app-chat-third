import React, {useMemo} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {usePSDesignSystemContext} from '../../../../context';
import {PSUserModel} from '../../../../types';
import {PSAvatarImage} from '../../../PSAvatarImage';
import {PSDebouncedPressable} from '../../../PSDebouncedPressable';
import {usePSMessageSuggestionMentionsContext} from '../../../messages';
import {usePSDescriptionInputMentionUserPressContext} from '../../contexts/PSThreadProfileDesInputContext';
import {PSIcVerified} from '../../../../icons';
import {ScrollView} from 'react-native-gesture-handler';

export const PSDescriptionSuggestUser = () => {
  const styles = useStylePSDescriptionSuggestUser();

  const {suggestedMentionUsers} = usePSMessageSuggestionMentionsContext();

  const onSuggestedMentionUserPress =
    usePSDescriptionInputMentionUserPressContext();

  const onPress = (user: PSUserModel) => {
    onSuggestedMentionUserPress(user);
  };

  if (suggestedMentionUsers && suggestedMentionUsers.length)
    return (
      <View style={[styles.styOverlayout]}>
        <View style={styles.container}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {suggestedMentionUsers?.map((user, index) => {
              return (
                <PSDebouncedPressable
                  key={`${index}_suggestedMentionUsers`}
                  style={styles.styWrapName}
                  onPress={() => onPress(user)}>
                  <PSAvatarImage url={user.avatar} displayName={user.name} />
                  <Text style={styles.styTxtName}>{user.name}</Text>
                  {user.verified ? (
                    <PSIcVerified style={{marginLeft: (4).px()}} />
                  ) : null}
                </PSDebouncedPressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  return null;
};

const useStylePSDescriptionSuggestUser = () => {
  const {colors, typography} = usePSDesignSystemContext();
  const {width, height} = Dimensions.get('window');
  return useMemo(
    () =>
      StyleSheet.create({
        styOverlayout: {
          position: 'absolute',
          width,
          height,
          top: (200).px(),
          transform: [
            {
              translateX: 90,
            },
          ],
        },
        container: {
          width: '70%',
          minHeight: (70).px(),
          maxHeight: (250).px(),
          padding: (12).px(),
          backgroundColor: colors.Primary.background,
          borderRadius: (12).px(),

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 5,
          zIndex: 99,
        },
        styTxtName: {
          ...typography.bodyMediumS,
          color: colors.Primary.subText,
          marginStart: (8).px(),
        },
        styWrapName: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: (8).px(),
        },
      }),
    [colors, typography],
  );
};
