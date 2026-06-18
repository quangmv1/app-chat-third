import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  usePSDesignSystemContext,
  usePSTranslationContext,
} from '../../../../context';
import {useDeepCompareMemoize} from '../../../../hooks';
import {PSFolderEntity, PSThreadListPCLEntity} from '../../../../types';
import PSDropDown from '../../../drop-down/PSDropDown';
import {
  useFolderContext,
  usePSPaginatedThreadsContext,
  usePSThreadListPCLContext,
} from '../../contexts';
import {isEqual} from 'lodash';
const LAST_ID_DEFAULT = '0';
const DropDownPCL = React.memo(
  () => {
    const styles = useStyleDropDownPCL();
    const refUserTypeId = useRef<string>();

    const {currentFolderAlias} = useFolderContext();
    const {translator} = usePSTranslationContext();

    const dataUserType = usePSThreadListPCLContext().dataUserType ?? [];
    const handleChangeUserType =
      usePSThreadListPCLContext().handleChangeUserType;

    const userTypeSelected = usePSThreadListPCLContext().userTypeSelected ?? {};

    const fetchThreads = usePSPaginatedThreadsContext().fetchThreads;

    useEffect(() => {
      if (
        userTypeSelected?.[currentFolderAlias] ||
        ![PSFolderEntity.PCL, PSFolderEntity.SHARED_INBOX].includes(
          currentFolderAlias,
        )
      )
        return;
      if (dataUserType && dataUserType.length) {
        handleChangeUserType({
          type: dataUserType[0]?.type,
          id: dataUserType[0]?.id,
        });
      }
    }, [
      useDeepCompareMemoize(dataUserType),
      useDeepCompareMemoize(userTypeSelected),
      handleChangeUserType,
      currentFolderAlias,
    ]);

    const value = useMemo(() => {
      if (userTypeSelected?.[currentFolderAlias]) {
        return dataUserType.filter(
          ite => ite.id === userTypeSelected?.[currentFolderAlias],
        )[0];
      }
      return dataUserType[0];
    }, [
      useDeepCompareMemoize(userTypeSelected),
      useDeepCompareMemoize(dataUserType),
      currentFolderAlias,
    ]);

    const _onChangeDropDown = useCallback(
      (ite: PSThreadListPCLEntity) => {
        handleChangeUserType({
          type: ite.type,
          id: ite.id,
        });
        if (refUserTypeId.current !== ite.id) {
          refUserTypeId.current = ite.id;
          fetchThreads(LAST_ID_DEFAULT, ite.id);
        }
      },
      [handleChangeUserType, fetchThreads],
    );

    if (
      ![PSFolderEntity.PCL, PSFolderEntity.SHARED_INBOX].includes(
        currentFolderAlias,
      ) ||
      dataUserType?.length <= 1
    )
      return null;

    return (
      <View style={styles.contain}>
        <Text style={styles.styTxtTitle}>
          {currentFolderAlias === PSFolderEntity.SHARED_INBOX
            ? translator('ps_cs_team')
            : translator('ps_thread_list')}
        </Text>
        <PSDropDown
          data={dataUserType}
          labelField={'name'}
          valueField={'id'}
          value={value}
          placeholder="None"
          disable={!dataUserType.length}
          placeholderStyle={styles.styPlace}
          style={styles.styWrapDropDown}
          itemTextStyle={styles.itemTextStyle}
          selectedTextStyle={styles.selectedTextStyle}
          selectedTextProps={{numberOfLines: 1}}
          containerStyle={styles.containerStyle}
          onChange={_onChangeDropDown}
        />
      </View>
    );
  },
  (prev, next) => isEqual(prev, next),
);

export default DropDownPCL;

const useStyleDropDownPCL = () => {
  const {colors, typography} = usePSDesignSystemContext();

  return useMemo(
    () =>
      StyleSheet.create({
        contain: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.Primary.linerBorder,
          // marginHorizontal: (16).px(),
          // marginTop: (16).px(),
          // paddingTop: (16).px(),
          backgroundColor: colors.Primary.white,
          // paddingBottom: (8).px(),
        },
        styTxtTitle: {
          marginRight: (38).px(),
          color: colors.Primary.subText,
          ...typography.bodyMediumR,
        },
        styWrapDropDown: {
          flex: 1,
          borderColor: colors.Primary.linerBorder,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        itemTextStyle: {
          color: colors.Primary.mainText,
          ...typography.bodyMediumR,
        },
        selectedTextStyle: {
          color: colors.Primary.mainText,
          ...typography.bodyLargeS,
        },
        styPlace: {
          ...typography.headingMediumM,
          color: colors.Neutral.n200,
        },
        containerStyle: {
          borderRadius: 8,
        },
      }),
    [typography, colors],
  );
};
