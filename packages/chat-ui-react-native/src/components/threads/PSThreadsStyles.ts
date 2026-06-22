import {StyleProp, TextProps, TextStyle, ViewStyle} from 'react-native';

export type PSThreadsStyles = {
  // container: {};
  // search: {};
  style?: StyleProp<ViewStyle>;
  foldersTab?: {
    isVisible?: boolean;
    // isVisiblePublicGroupFolderTab?: boolean;
    isVisibleUnReadFolderTab?: boolean;
    isVisibleSharedInboxFolderTab?: boolean;
    isVisiblePCLFolderTab?: boolean;
    style?: StyleProp<ViewStyle>;
    tabStyle?: (isActive: boolean) => StyleProp<ViewStyle>;
    isVisibleIndicator?: boolean;
    indicatorStyle?: (isActive: boolean) => StyleProp<ViewStyle>;
  };
  threadItem?: {
    style?: StyleProp<ViewStyle>;
    swipeStyle?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;

    text1Style?: StyleProp<TextStyle>;
    text1NumberOfLines?: number;
    text1Props?: TextProps;

    text2Style?: (isUnread: boolean) => StyleProp<TextStyle>;
    text2NumberOfLines?: number;
    text2Props?: TextProps;
  };
};
