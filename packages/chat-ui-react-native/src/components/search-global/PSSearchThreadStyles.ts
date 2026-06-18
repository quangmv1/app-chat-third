import {StyleProp, ViewStyle} from 'react-native';

export type PSSearchThreadStyles = {
  container: {};
  actionBar: {};
  searchTab: {
    style?: StyleProp<ViewStyle>;
    tabStyle?: StyleProp<ViewStyle>;
  };
  isVisibleFilterSearchTab?: boolean;

  // isVisibleFilterSearchPublicGroup?: boolean;
  isVisibleFilterSearchSharedInbox?: boolean;
  isVisibleFilterSearchPCL?: boolean;

  isSearchOnlyJoinedThreads?: boolean;
};
