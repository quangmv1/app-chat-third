import {Linking, Platform} from 'react-native';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {psLogger} from './logger';
import {Alert} from 'react-native';

dayjs.extend(duration);

const handleOpenSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

export const handlePermissionDenied = (permissionName?: string) => {
  Alert.alert(
    `Permission ${permissionName + ' '}Granted.`,
    `Please open Settings to allow ${permissionName + ' '}permissions.`,
    [
      {
        text: 'OK',
        onPress: () => {
          handleOpenSettings();
        },
      },
    ],
  );
};

const ONE_HOUR_IN_SECONDS = 3600;

export const formatVideoDuration = (value?: number) => {
  try {
    if (value) {
      const isDurationLongerThanHour = value / ONE_HOUR_IN_SECONDS >= 1;
      const formattedDurationParam = isDurationLongerThanHour
        ? 'HH:mm:ss'
        : 'mm:ss';
      return dayjs.duration(value, 'second').format(formattedDurationParam);
    } else {
      return '00:00';
    }
  } catch (error) {
    psLogger.error('formatVideoDuration', error);
    return '00:00';
  }
};
