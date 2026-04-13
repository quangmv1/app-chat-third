import {Platform, StyleSheet, TextStyle} from 'react-native';

export type PSTypography = {
  Heading1: TextStyle;
  Heading2: TextStyle;
  Heading3: TextStyle;
  Heading4: TextStyle;
  Heading5: TextStyle;
  Heading6: TextStyle;
  // DS V2
  headingXLargeS: TextStyle;
  headingLargeB: TextStyle;
  headingLargeM: TextStyle;
  headingMediumS: TextStyle;
  headingMediumM: TextStyle;
  headingSmallM: TextStyle;
  headingSmallS: TextStyle;
  headingXSmallS: TextStyle;
  headingXSmallM: TextStyle;
  headingXXSmallS: TextStyle;
  headingXXSmallM: TextStyle;
  bodyXXXLargeS: TextStyle;
  bodyXXXLargeR: TextStyle;
  bodyXXLargeS: TextStyle;
  bodyXXLargeR: TextStyle;
  bodyXLargeS: TextStyle;
  bodyXLargeR: TextStyle;
  bodyXLargeSunderline: TextStyle;
  bodyLargeS: TextStyle;
  bodyLargeR: TextStyle;
  bodyMediumS: TextStyle;
  bodyMediumM: TextStyle;
  bodyMediumR: TextStyle;
  bodyMediumSunderline: TextStyle;
  bodyXMediumM: TextStyle;
  bodyXMediumR: TextStyle;
  bodySmallS: TextStyle;
  bodySmallR: TextStyle;
  bodyXSmallM: TextStyle;
  bodyXSmallR: TextStyle;
  bodyXXSmallM: TextStyle;
  bodyXXXSmallM: TextStyle;
};

const ROBOTO_REGULAR = 'Roboto-Regular';
const ROBOTO_ITALIC = 'Roboto-Italic';
const ROBOTO_MEDIUM = 'Roboto-Medium';
const ROBOTO_MEDIUM_ITALIC = 'Roboto-MediumItalic';
const ROBOTO_BOLD = 'Roboto-Bold';
const ROBOTO_BOLD_ITALIC = 'Roboto-BoldItalic';

const SF_PRO_TEXT_REGULAR = 'SFProText-Regular';
const SF_PRO_TEXT_ITALIC = 'SFProText-RegularItalic';
const SF_PRO_TEXT_MEDIUM = 'SFProText-Medium';
const SF_PRO_TEXT_MEDIUM_ITALIC = 'SFProText-MediumItalic';
const SF_PRO_TEXT_BOLD = 'SFProText-Bold';
const SF_PRO_TEXT_BOLD_ITALIC = 'SFProText-BoldItalic';
const SF_PRO_TEXT_SEMI_BOLD = 'SFProText-Semibold';
const SF_PRO_TEXT_SEMI_BOLD_ITALIC = 'SFProText-SemiboldItalic';

export const PSTypographyDefault: PSTypography = StyleSheet.create({
  Heading1: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (40).px(), ios: (40).px()}),
    lineHeight: Platform.select({
      android: (48).px(),
      ios: (48).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  Heading2: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (32).px(), ios: (32).px()}),
    lineHeight: Platform.select({
      android: (40).px(),
      ios: (40).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  Heading3: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (28).px(), ios: (28).px()}),
    lineHeight: Platform.select({
      android: (36).px(),
      ios: (36).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  Heading4: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (24).px(), ios: (24).px()}),
    lineHeight: Platform.select({
      android: (32).px(),
      ios: (32).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  Heading5: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (20).px(), ios: (20).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  Heading6: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (18).px(), ios: (18).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  // DS V2
  headingXLargeS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (20).px(), ios: (20).px()}),
    lineHeight: Platform.select({
      android: (30).px(),
      ios: (30).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  headingLargeB: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_BOLD,
    }),
    fontSize: Platform.select({android: (18).px(), ios: (18).px()}),
    lineHeight: Platform.select({
      android: (28).px(),
      ios: (28).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingLargeM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (18).px(), ios: (18).px()}),
    lineHeight: Platform.select({
      android: (28).px(),
      ios: (28).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingMediumS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (16).px(), ios: (16).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingMediumM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (16).px(), ios: (16).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingSmallM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (14).px(), ios: (14).px()}),
    lineHeight: Platform.select({
      android: (20).px(),
      ios: (20).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingSmallS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (14).px(), ios: (14).px()}),
    lineHeight: Platform.select({
      android: (20).px(),
      ios: (20).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingXSmallS: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (12).px(), ios: (12).px()}),
    lineHeight: Platform.select({
      android: (16).px(),
      ios: (16).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingXSmallM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (12).px(), ios: (12).px()}),
    lineHeight: Platform.select({
      android: (16).px(),
      ios: (16).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: 0}),
  },
  headingXXSmallS: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (10).px(), ios: (10).px()}),
    lineHeight: Platform.select({
      android: (12).px(),
      ios: (12).px(),
    }),
    letterSpacing: Platform.select({android: (0.4).px(), ios: (0.4).px()}),
  },
  headingXXSmallM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (10).px(), ios: (10).px()}),
    lineHeight: Platform.select({
      android: (12).px(),
      ios: (12).px(),
    }),
    letterSpacing: Platform.select({android: (0.4).px(), ios: (0.4).px()}),
  },
  bodyXXXLargeS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (18).px(), ios: (18).px()}),
    lineHeight: Platform.select({
      android: (28).px(),
      ios: (28).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyXXXLargeR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (18).px(), ios: (18).px()}),
    lineHeight: Platform.select({
      android: (28).px(),
      ios: (28).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyXXLargeS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (17).px(), ios: (17).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyXXLargeR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (17).px(), ios: (17).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyXLargeS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (16).px(), ios: (16).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyXLargeR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (16).px(), ios: (16).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyXLargeSunderline: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (16).px(), ios: (16).px()}),
    lineHeight: Platform.select({
      android: (24).px(),
      ios: (24).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
    textDecorationLine: 'underline',
  },
  bodyLargeS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (15).px(), ios: (15).px()}),
    lineHeight: Platform.select({
      android: (22).px(),
      ios: (22).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyLargeR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (15).px(), ios: (15).px()}),
    lineHeight: Platform.select({
      android: (22).px(),
      ios: (22).px(),
    }),
    letterSpacing: Platform.select({android: -(0.4).px(), ios: -(0.4).px()}),
  },
  bodyMediumS: {
    fontFamily: Platform.select({
      android: ROBOTO_BOLD,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (14).px(), ios: (14).px()}),
    lineHeight: Platform.select({
      android: (20).px(),
      ios: (20).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.2).px()}),
  },
  bodyMediumM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (14).px(), ios: (14).px()}),
    lineHeight: Platform.select({
      android: (20).px(),
      ios: (20).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.2).px()}),
  },
  bodyMediumR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (14).px(), ios: (14).px()}),
    lineHeight: Platform.select({
      android: (20).px(),
      ios: (20).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.2).px()}),
  },
  bodyMediumSunderline: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (14).px(), ios: (14).px()}),
    lineHeight: Platform.select({
      android: (20).px(),
      ios: (20).px(),
    }),
    letterSpacing: Platform.select({android: -(0.2).px(), ios: -(0.2).px()}),
    textDecorationLine: 'underline',
  },
  bodyXMediumM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (13).px(), ios: (13).px()}),
    lineHeight: Platform.select({
      android: (18).px(),
      ios: (18).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.2).px()}),
  },
  bodyXMediumR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (13).px(), ios: (13).px()}),
    lineHeight: Platform.select({
      android: (18).px(),
      ios: (18).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.2).px()}),
  },
  bodySmallS: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_SEMI_BOLD,
    }),
    fontSize: Platform.select({android: (12).px(), ios: (12).px()}),
    lineHeight: Platform.select({
      android: (16).px(),
      ios: (16).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.1).px()}),
  },
  bodySmallR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (12).px(), ios: (12).px()}),
    lineHeight: Platform.select({
      android: (16).px(),
      ios: (16).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.1).px()}),
  },
  bodyXSmallM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (10).px(), ios: (10).px()}),
    lineHeight: Platform.select({
      android: (16).px(),
      ios: (16).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.1).px()}),
  },
  bodyXSmallR: {
    fontFamily: Platform.select({
      android: ROBOTO_REGULAR,
      ios: SF_PRO_TEXT_REGULAR,
    }),
    fontSize: Platform.select({android: (10).px(), ios: (10).px()}),
    lineHeight: Platform.select({
      android: (16).px(),
      ios: (16).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.1).px()}),
  },
  bodyXXSmallM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (8).px(), ios: (8).px()}),
    lineHeight: Platform.select({
      android: (14).px(),
      ios: (14).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.1).px()}),
  },
  bodyXXXSmallM: {
    fontFamily: Platform.select({
      android: ROBOTO_MEDIUM,
      ios: SF_PRO_TEXT_MEDIUM,
    }),
    fontSize: Platform.select({android: (6).px(), ios: (6).px()}),
    lineHeight: Platform.select({
      android: (12).px(),
      ios: (12).px(),
    }),
    letterSpacing: Platform.select({android: 0, ios: -(0.1).px()}),
  },
});
