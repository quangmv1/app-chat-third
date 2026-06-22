import _ from 'lodash';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  I18nManager,
  Keyboard,
  KeyboardEvent,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {useStylePSDropDown} from './styles';
import {DropdownProps} from './type';
import {PSIcSortDown} from '../../icons';
import {usePSDesignSystemContext} from '../../context';

const statusBarHeight: number = StatusBar.currentHeight || 0;

const PSDropDown = React.forwardRef((props: DropdownProps<any>, currentRef) => {
  const {colors} = usePSDesignSystemContext();
  const styles = useStylePSDropDown();
  const {
    onChange,
    style = {},
    containerStyle,
    placeholderStyle,
    selectedTextStyle,
    itemContainerStyle,
    itemTextStyle,
    iconStyle,
    selectedTextProps = {},
    data = [],
    labelField,
    valueField,
    value,
    activeColor = colors.Neutral.n25,
    fontFamily,
    iconColor = colors.Neutral.n100,
    placeholder = '',
    maxHeight = 340,
    minHeight = 0,
    disable = false,
    keyboardAvoiding = true,
    inverted = true,
    renderLeftIcon,
    renderRightIcon,
    renderItem,
    onFocus,
    onBlur,
    autoScroll = true,
    showsVerticalScrollIndicator = true,
    dropdownPosition = 'auto',
    flatListProps,
    backgroundColor,
    onChangeText,
    confirmSelectItem,
    onConfirmSelectItem,
    accessibilityLabel,
    itemAccessibilityLabelField,
  } = props;

  const ref = useRef<View>(null);
  const refList = useRef<FlatList>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<any>(null);
  const [listData, setListData] = useState<any[]>(data);
  const [position, setPosition] = useState<any>();
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [searchText, setSearchText] = useState('');

  const {width: W, height: H} = Dimensions.get('window');
  const styleContainerVertical: ViewStyle = useMemo(() => {
    return {
      backgroundColor: colors.Primary.subText,
      alignItems: 'center',
    };
  }, []);
  const styleHorizontal: ViewStyle = useMemo(() => {
    return {
      width: '100%',
      alignSelf: 'center',
    };
  }, [W]);

  useImperativeHandle(currentRef, () => {
    return {open: eventOpen, close: eventClose};
  });

  useEffect(() => {
    return eventClose;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventOpen = () => {
    if (!disable) {
      setVisible(true);
      if (onFocus) {
        onFocus();
      }

      scrollIndex();
    }
  };

  const eventClose = useCallback(() => {
    if (!disable) {
      setVisible(false);
      if (onBlur) {
        onBlur();
      }
    }
  }, [disable, onBlur]);

  const font = useCallback(() => {
    if (fontFamily) {
      return {
        fontFamily: fontFamily,
      };
    } else {
      return {};
    }
  }, [fontFamily]);

  const _measure = useCallback(() => {
    if (ref && ref?.current) {
      ref.current.measureInWindow((pageX, pageY, width, height) => {
        let isFull = false;
        const top = isFull ? 20 : height + pageY + 2;
        const bottom = H - top + height;
        const left = I18nManager.isRTL ? W - width - pageX : pageX;

        setPosition({
          isFull,
          width: Math.floor(width),
          top: Math.floor(top + statusBarHeight),
          bottom: Math.floor(bottom - statusBarHeight),
          left: Math.floor(left),
          height: Math.floor(height),
        });
      });
    }
  }, [H, W]);

  const onKeyboardDidShow = useCallback(
    (e: KeyboardEvent) => {
      _measure();
      setKeyboardHeight(e.endCoordinates.height);
    },
    [_measure],
  );

  const onKeyboardDidHide = useCallback(() => {
    setKeyboardHeight(0);
    _measure();
  }, [_measure]);

  useEffect(() => {
    const susbcriptionKeyboardDidShow = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardDidShow,
    );
    const susbcriptionKeyboardDidHide = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardDidHide,
    );

    return () => {
      if (typeof susbcriptionKeyboardDidShow?.remove === 'function') {
        susbcriptionKeyboardDidShow.remove();
      }

      if (typeof susbcriptionKeyboardDidHide?.remove === 'function') {
        susbcriptionKeyboardDidHide.remove();
      }
    };
  }, [onKeyboardDidHide, onKeyboardDidShow]);

  const getValue = useCallback(() => {
    const defaultValue =
      typeof value === 'object' ? _.get(value, valueField) : value;

    const getItem = data.filter(e =>
      _.isEqual(defaultValue, _.get(e, valueField)),
    );

    if (getItem.length > 0) {
      setCurrentValue(getItem[0]);
    } else {
      setCurrentValue(null);
    }
  }, [data, value, valueField]);

  useEffect(() => {
    getValue();
  }, [value, data, getValue]);

  const scrollIndex = useCallback(() => {
    if (autoScroll && data.length > 0 && listData.length === data.length) {
      setTimeout(() => {
        if (refList && refList?.current) {
          const defaultValue =
            typeof value === 'object' ? _.get(value, valueField) : value;

          const index = _.findIndex(listData, (e: any) =>
            _.isEqual(defaultValue, _.get(e, valueField)),
          );
          if (
            listData.length > 0 &&
            index > -1 &&
            index <= listData.length - 1
          ) {
            refList?.current?.scrollToIndex({
              index: index,
              animated: true,
            });
          }
        }
      }, 200);
    }
  }, [autoScroll, data.length, listData, value, valueField]);

  const showOrClose = useCallback(() => {
    if (!disable) {
      if (keyboardHeight > 0 && visible) {
        return Keyboard.dismiss();
      }

      _measure();
      setVisible(!visible);
      setListData(data);

      if (!visible) {
        if (onFocus) {
          onFocus();
        }
      } else {
        if (onBlur) {
          onBlur();
        }
      }

      scrollIndex();
    }
  }, [
    disable,
    keyboardHeight,
    visible,
    _measure,
    data,
    searchText,
    scrollIndex,
    onFocus,
    onBlur,
  ]);

  const onSelect = useCallback(
    (item: any) => {
      if (confirmSelectItem && onConfirmSelectItem) {
        return onConfirmSelectItem(item);
      }

      if (onChangeText) {
        setSearchText('');
        onChangeText('');
      }
      setCurrentValue(item);
      onChange(item);
      eventClose();
    },
    [
      confirmSelectItem,
      eventClose,
      onChange,
      onChangeText,
      onConfirmSelectItem,
    ],
  );

  const _renderDropdown = () => {
    const isSelected = currentValue && _.get(currentValue, valueField);
    return (
      <TouchableWithoutFeedback
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
        onPress={showOrClose}>
        <View style={styles.dropdown}>
          {renderLeftIcon?.(visible)}
          <Text
            style={[
              styles.textItem,
              isSelected !== null ? selectedTextStyle : placeholderStyle,
              font(),
            ]}
            {...selectedTextProps}>
            {isSelected !== null
              ? _.get(currentValue, labelField)
              : placeholder}
          </Text>
          {renderRightIcon ? renderRightIcon(visible) : <PSIcSortDown />}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const _renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => {
      const isSelected = currentValue && _.get(currentValue, valueField);
      const selected = _.isEqual(_.get(item, valueField), isSelected);
      _.assign(item, {_index: index});
      return (
        <TouchableHighlight
          key={index.toString()}
          accessible={!!accessibilityLabel}
          accessibilityLabel={_.get(
            item,
            itemAccessibilityLabelField || labelField,
          )}
          underlayColor={activeColor}
          onPress={() => onSelect(item)}>
          <View
            style={StyleSheet.flatten([
              itemContainerStyle,
              selected && {
                backgroundColor: activeColor,
              },
            ])}>
            {renderItem ? (
              renderItem(item, selected)
            ) : (
              <View style={styles.item}>
                <Text
                  style={StyleSheet.flatten([
                    styles.textItem,
                    itemTextStyle,
                    font(),
                  ])}>
                  {_.get(item, labelField)}
                </Text>
              </View>
            )}
          </View>
        </TouchableHighlight>
      );
    },
    [
      accessibilityLabel,
      activeColor,
      currentValue,
      font,
      itemAccessibilityLabelField,
      itemContainerStyle,
      itemTextStyle,
      labelField,
      onSelect,
      renderItem,
      valueField,
    ],
  );

  const _renderList = useCallback(
    (isTopPosition: boolean) => {
      const isInverted = !inverted ? false : isTopPosition;

      const _renderListHelper = () => {
        return (
          <FlatList
            accessibilityLabel={accessibilityLabel + ' flatlist'}
            style={{backgroundColor: colors.Primary.background, borderRadius: 8}}
            {...flatListProps}
            keyboardShouldPersistTaps="handled"
            ref={refList}
            onScrollToIndexFailed={scrollIndex}
            data={listData}
            inverted={isTopPosition ? inverted : false}
            renderItem={_renderItem}
            keyExtractor={(_item, index) => index.toString()}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          />
        );
      };

      return (
        <TouchableWithoutFeedback>
          <View style={styles.flexShrink}>
            {isInverted && _renderListHelper()}
            {!isInverted && _renderListHelper()}
          </View>
        </TouchableWithoutFeedback>
      );
    },
    [
      _renderItem,
      accessibilityLabel,
      flatListProps,
      listData,
      inverted,
      scrollIndex,
      showsVerticalScrollIndicator,
    ],
  );

  const _renderModal = useCallback(() => {
    if (visible && position) {
      const {isFull, width, height, top, bottom, left} = position;

      const onAutoPosition = () => {
        if (keyboardHeight > 0) {
          return bottom < keyboardHeight + height;
        }

        return bottom < 100;
      };

      if (width && top && bottom) {
        const styleVertical: ViewStyle = {
          left: left,
          maxHeight: maxHeight,
          minHeight: minHeight,
        };
        const isTopPosition =
          dropdownPosition === 'auto'
            ? onAutoPosition()
            : dropdownPosition === 'top';

        let keyboardStyle: ViewStyle = {};

        let extendHeight = !isTopPosition ? top : bottom;
        if (
          keyboardAvoiding &&
          keyboardHeight > 0 &&
          isTopPosition &&
          dropdownPosition === 'auto'
        ) {
          extendHeight = keyboardHeight;
        }

        return (
          <Modal
            transparent
            statusBarTranslucent
            visible={visible}
            supportedOrientations={['landscape', 'portrait']}
            onRequestClose={showOrClose}>
            <TouchableWithoutFeedback onPress={showOrClose}>
              <View
                style={StyleSheet.flatten([
                  styles.flex1,
                  isFull && styleContainerVertical,
                  backgroundColor && {backgroundColor: backgroundColor},
                  keyboardStyle,
                ])}>
                <View
                  style={StyleSheet.flatten([
                    styles.flex1,
                    !isTopPosition
                      ? {paddingTop: extendHeight}
                      : {
                          justifyContent: 'flex-end',
                          paddingBottom: extendHeight,
                        },
                    isFull && styles.fullScreen,
                  ])}>
                  <View
                    style={StyleSheet.flatten([
                      styles.container,
                      isFull ? styleHorizontal : styleVertical,
                      {
                        width,
                      },
                      containerStyle,
                    ])}>
                    {_renderList(isTopPosition)}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        );
      }
      return null;
    }
    return null;
  }, [
    visible,
    position,
    keyboardHeight,
    maxHeight,
    minHeight,
    dropdownPosition,
    keyboardAvoiding,
    showOrClose,
    styleContainerVertical,
    backgroundColor,
    containerStyle,
    styleHorizontal,
    _renderList,
  ]);

  return (
    <View
      style={StyleSheet.flatten([styles.mainWrap, style])}
      ref={ref}
      onLayout={_measure}>
      {_renderDropdown()}
      {_renderModal()}
    </View>
  );
});

export default PSDropDown;
