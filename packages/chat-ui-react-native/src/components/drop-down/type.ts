import type {
  FlatListProps,
  ImageStyle,
  StyleProp,
  TextProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

export type IDropdownRef = {
  open: () => void;
  close: () => void;
};

export interface DropdownProps<T> {
  ref?:
    | React.RefObject<IDropdownRef>
    | React.MutableRefObject<IDropdownRef>
    | null
    | undefined;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  selectedTextProps?: TextProps;
  itemContainerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  maxHeight?: number;
  minHeight?: number;
  fontFamily?: string;
  iconColor?: string;
  activeColor?: string;
  data: T[];
  value?: T | string | null | undefined;
  placeholder?: string;
  labelField: keyof T;
  valueField: keyof T;
  disable?: boolean;
  autoScroll?: boolean;
  showsVerticalScrollIndicator?: boolean;
  dropdownPosition?: 'auto' | 'top' | 'bottom';
  flatListProps?: Omit<FlatListProps<any>, 'renderItem' | 'data'>;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  confirmSelectItem?: boolean;
  accessibilityLabel?: string;
  itemAccessibilityLabelField?: string;
  inverted?: boolean;
  onChange: (item: T) => void;
  renderLeftIcon?: (visible?: boolean) => JSX.Element | null | undefined;
  renderRightIcon?: (visible?: boolean) => JSX.Element | null | undefined;
  renderItem?: (item: T, selected?: boolean) => JSX.Element | null | undefined;
  renderInputSearch?: (
    onSearch: (text: string) => void,
  ) => JSX.Element | null | undefined;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (search: string) => void;
  onConfirmSelectItem?: (item: T) => void;
}
