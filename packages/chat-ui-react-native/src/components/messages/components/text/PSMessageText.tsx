import React from 'react';
import isEqual from 'react-fast-compare';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import {
  usePSChatApiClientContext,
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import { useRenderCounter } from '../../../../hooks';
import { PSMessageEntity } from '../../../../types';
import { setClipboardString } from '../../../../utils';
import { PSRichText } from '../../../PSRichText';
import { PSFlashMessage } from '../../../flash-message';
import { PSMarkdown } from '../../../markdown';
import {
  usePSMessageCurrentThreadPartnerIdContext,
  usePSMessageGetUserIdContext,
  usePSMessageNavigationContext,
} from '../../contexts';
import { usePSMessageItemContext } from '../PSMessageItem';

// const DEMO = `# This is Heading 1
// ## This is Heading 2
// ### This is Heading 3
// #### This is Heading 4
// ##### This is Heading 5
// ###### This is Heading 6

// Đây là tin nhắn thường,\n_đây là italic_,\n~~đã thế còn bị gạch ngang~~,\n~~_có khi vừa chéo vừa gạch_~~\n**còn đây là bold**,\n~~**có lúc bị gạch ngang**~~,\n**_còn có lúc thì nghiêng_**,\n~~**_gạch ngang qua chữ_**~~,

// 👉 [Đây là deeplink](https://gitlab.piscale.com/piscale-sdk)

// 1. Công chức-viên chức được nghỉ Tết Âm lịch năm 2024 từ thứ năm, **ngày 8/2/2024** Dương lịch _(tức ngày 29 tháng Chạp năm Quý Mão)_ đến hết thứ tư, **ngày 14/2/2024** Dương lịch _(tức ngày mùng 5 tháng Giêng năm Giáp Thìn)_.
// 2. **Còn nghỉ tết dương:**
// Do ngày **1/1/2024** là thứ hai, cộng với hai ngày cuối tuần, nên dịp ~~_Tết Dương lịch 2024 người lao động được nghỉ ba ngày liên tiếp_~~.

// [👉 Xem chi tiết đây nhé](ps://app/sdk)

// You can also put some url as a link [like This](https://www.google.com) or [@KienHT:70] write it as a plain text:
// https://www.google.com
// <mailme@gmail.com>

// ---

// **Quy định khu nhà trọ**

// * Về nhà phải tắt điện
// * Không ~~_bật tivi_~~ sau **11h30 tối**
// * Không vứt rác bừa bãi trước cửa nhà
// * Tối về muộn phải tắt điện cầu thang

// **_Lưu ý:_** _Ra ngoài nhớ tắt nước và điều hòa._

// `;

const LIMIT_TEXT = 500;

export const PSMessageText = React.memo(
  ({
    text,
    mentionIds,
    isRtf,
    containerStyle,
  }: {
    text?: string;
    mentionIds?: string[];
    isRtf: boolean;
    containerStyle: StyleProp<ViewStyle>;
  }) => {
    // isRtf = true;
    // text = DEMO;

    const { typography, colors } = usePSDesignSystemContext();

    const currentThreadPartnerId = usePSMessageCurrentThreadPartnerIdContext();

    const chatApiClient = usePSChatApiClientContext();

    const { translator } = usePSTranslationContext();

    const {
      onUrlPress: openLink,
      onEmailPress: openEmail,
      onPhoneNumberPress: openPhoneCaller,
      onUserPress,
    } = usePSMessageNavigationContext();

    const { getUserId } = usePSMessageGetUserIdContext();

    const { isMyMessage, onMessagePress, onMessageLongPress } =
      usePSMessageItemContext();

    const onEmailPress = React.useCallback(
      (email: string) => {
        openEmail?.(email);
      },
      [openEmail],
    );

    const onEmailLongPress = React.useCallback((email: string) => {
      setClipboardString(email);
      PSFlashMessage.show({
        type: 'success',
        text1: `${email} copied`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    }, []);

    const onPhoneNumberPress = React.useCallback(
      (phoneNumber: string) => {
        openPhoneCaller?.(phoneNumber);
      },
      [openPhoneCaller],
    );

    const onPhoneNumberLongPress = React.useCallback((phoneNumber: string) => {
      setClipboardString(phoneNumber);
      PSFlashMessage.show({
        type: 'success',
        text1: `${phoneNumber} copied`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    }, []);

    const onUrlPress = React.useCallback(
      (url: string) => {
        openLink?.(url);
      },
      [openLink],
    );

    const onUrlLongPress = React.useCallback((url: string) => {
      setClipboardString(url);
      PSFlashMessage.show({
        type: 'success',
        text1: `${url} copied`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    }, []);

    const onMentionPress = React.useCallback(
      async (mentionId: string) => {
        if (
          mentionId !== PSMessageEntity.MENTION_ALL_ID &&
          mentionId !== chatApiClient?.userId
        ) {
          const userId = await getUserId(mentionId);
          onUserPress?.(mentionId, currentThreadPartnerId, userId);
        }
      },
      [onUserPress, currentThreadPartnerId],
    );
    useRenderCounter('PSMessageText', text !== undefined && text.length > 0);

    const textColor = React.useMemo(
      () => (isMyMessage ? colors.Primary.mainText : colors.Primary.mainText),
      [isMyMessage, colors.Primary.mainText],
    );

    const richTextColor = React.useMemo(
      () => (isMyMessage ? colors.Primary.branding : colors.Primary.branding),
      [isMyMessage, colors.Primary.branding],
    );

    const richTextContainer = React.useMemo(() => {
      return [
        styles.text,
        typography.bodyXXXLargeR,
        { color: textColor },
        containerStyle,
      ];
    }, [containerStyle, textColor, typography.bodyXXXLargeR]);

    const richTextStyle = React.useMemo(() => {
      return {
        ...typography.bodyXXXLargeS,
        color: richTextColor,
      };
    }, [richTextColor, typography.bodyXXXLargeS]);

    const textStyle = React.useMemo(() => {
      return {
        ...typography.bodyXXXLargeR,
        color: textColor,
        // fontSize: 17,
      };
    }, [textColor, typography.bodyXXXLargeR]);

    const [isMoreText, setIsMoreText] = React.useState(true);

    const textLess = React.useMemo(() => {
      if (!text) return '';
      if (isMoreText && text?.length > LIMIT_TEXT) {
        const regex = /\[(@[^:]+):([^\]]+)\]/gi;
        const match = text.match(regex);
        const startIndex = 0;

        if (mentionIds?.length && match?.length) {
          let endIndex = LIMIT_TEXT;
          for (let i = 0; i < match.length; i++) {
            const lastIndex = text?.indexOf(match[i]!);
            if (lastIndex > LIMIT_TEXT) {
              endIndex = lastIndex;
              break;
            }
          }
          return text?.substring(startIndex, endIndex);
        }

        return text?.substring(startIndex, LIMIT_TEXT);
      }
      return text;
    }, [text, isMoreText, mentionIds]);

    const handleMore = React.useCallback(() => {
      setIsMoreText(prev => !prev);
    }, []);

    return text ? (
      isRtf ? (
        <PSMarkdown
          text={text}
          containerStyle={[containerStyle, styles.markdownContainer]}
          mentionStyle={richTextStyle}
          heading1Style={typography.Heading1}
          heading2Style={typography.Heading2}
          heading3Style={typography.Heading3}
          heading4Style={typography.Heading4}
          heading5Style={typography.Heading5}
          heading6Style={typography.Heading6}
          textStyle={textStyle}
          emStyle={typography.bodyXXLargeR} // bodyXXLargeRI
          strongAndEmStyle={typography.headingLargeB} // headingLargeBI
          strongStyle={typography.headingLargeB}
          linkStyle={richTextStyle}
          emailStyle={richTextStyle}
          listStyle={styles.markdownList}
          listItemNumberStyle={richTextStyle}
          listItemBulletStyle={richTextStyle}
          listRowStyle={styles.markdownListRow}
          onMentionPress={onMentionPress}
          onEmailPress={onEmailPress}
          onEmailLongPress={onEmailLongPress}
          onUrlPress={onUrlPress}
          onUrlLongPress={onUrlLongPress}
        />
      ) : (
        <Text style={richTextContainer}>
          <PSRichText
            text={textLess}
            onPress={onMessagePress}
            onLongPress={onMessageLongPress}
            mentionIds={mentionIds ?? []}
            mentionEnabled
            emailEnabled
            phoneNumberEnabled
            urlEnabled
            parentStyle={richTextContainer}
            mentionStyle={richTextStyle}
            urlStyle={richTextStyle}
            emailStyle={richTextStyle}
            phoneNumberStyle={richTextStyle}
            hashtagStyle={richTextStyle}
            onMentionPress={onMentionPress}
            onEmailPress={onEmailPress}
            onEmailLongPress={onEmailLongPress}
            onPhoneNumberPress={onPhoneNumberPress}
            onPhoneNumberLongPress={onPhoneNumberLongPress}
            onUrlPress={onUrlPress}
            onUrlLongPress={onUrlLongPress}
          />
          {text?.length > LIMIT_TEXT ? (
            <>
              <Text>{` `}</Text>
              <Text
                onPress={handleMore}
                style={[
                  typography.bodyXLargeR, // bodyXLargeRI
                  { color: richTextColor },
                  styles.styTxtLess,
                ]}>
                {isMoreText
                  ? translator('ps_view_more')
                  : translator('ps_view_less')}
              </Text>
            </>
          ) : null}
        </Text>
      )
    ) : null;
  },
  (prev, next) => {
    return isEqual(prev, next);
  },
);

const styles = StyleSheet.create({
  text: {
    flexShrink: 1,
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  mention: {
    borderRadius: (8).px(),
    padding: (1).px(),
  },
  markdownContainer: {
    alignSelf: 'stretch',
    gap: (24).px(),
  },
  markdownList: {},
  markdownListRow: { flexDirection: 'row', minWidth: '100%' },
  styTxtLess: {
    textDecorationLine: 'underline',
  },
});
