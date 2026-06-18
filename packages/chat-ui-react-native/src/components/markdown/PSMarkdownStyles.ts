import {
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';

export interface PSMarkdownStyles {
  headingStyle?: TextStyle;
  heading1Style?: TextStyle;
  heading2Style?: TextStyle;
  heading3Style?: TextStyle;
  heading4Style?: TextStyle;
  heading5Style?: TextStyle;
  heading6Style?: TextStyle;
  linkStyle?: TextStyle;
  emailStyle?: TextStyle;
  blockQuoteSectionStyle?: ViewStyle;
  blockQuoteVerticalBarStyle?: ViewStyle;
  blockQuoteTextStyle?: TextStyle;
  codeBlockStyle?: TextStyle;
  delStyle?: TextStyle;
  emStyle?: TextStyle;
  hrStyle?: ViewStyle;
  inlineCodeStyle?: TextStyle;
  listStyle?: ViewStyle;
  listItemStyle?: ViewStyle;
  listItemTextStyle?: TextStyle;
  listItemBulletStyle?: TextStyle;
  listItemNumberStyle?: TextStyle;
  listRowStyle?: ViewStyle;
  paragraphStyle?: ViewStyle;
  paragraphCenterStyle?: ViewStyle;
  noMarginStyle?: ViewStyle;
  strongStyle?: TextStyle;
  textStyle?: TextStyle;
  strongAndEmStyle?: TextStyle;
  uStyle?: ViewStyle;
  brStyle?: TextStyle;
  newlineStyle?: TextStyle;
  sublistStyle?: ViewStyle;
}

export const psMarkdownStyles: PSMarkdownStyles = StyleSheet.create({
  blockQuoteSectionStyle: {
    flexDirection: 'row',
  },
  blockQuoteVerticalBarStyle: {
    width: (4).px(),
    backgroundColor: 'silver',
    marginRight: (8).px(),
    borderRadius: (1).px(),
  },
  codeBlockStyle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'Monospace',
    fontWeight: '500',
    backgroundColor: '#DDDDDD',
    padding: (4).px(),
  },
  delStyle: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  hrStyle: {
    backgroundColor: '#cccccc',
    height: 1,
  },
  inlineCodeStyle: {
    backgroundColor: '#eeeeee',
    borderColor: '#dddddd',
    borderRadius: (4).px(),
    borderWidth: (1).px(),
    fontWeight: 'bold',
  },
  listStyle: {},
  listItemStyle: {
    flexDirection: 'row',
  },
  listItemTextStyle: {
    flex: 1,
  },
  listRowStyle: {
    flexDirection: 'row',
  },
  paragraphStyle: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  paragraphCenterStyle: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  noMarginStyle: {
    marginTop: 0,
    marginBottom: 0,
  },
  uStyle: {
    borderColor: '#222222',
    borderBottomWidth: (1).px(),
  },
  sublistStyle: {
    paddingLeft: (20).px(),
    width: Dimensions.get('window').width - (60).px(),
  },
});
