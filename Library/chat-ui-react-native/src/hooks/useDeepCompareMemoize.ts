import React from 'react';
import isEqual from 'react-fast-compare';

export const useDeepCompareMemoize = function <T>(value: T): T {
  const ref = React.useRef<T>(value);

  const [signal, setSignal] = React.useState<number>(0);

  let areEqual = false;
  try {
    areEqual = isEqual(value, ref.current);
  } catch (error) {
    // Khi một object (như tin nhắn, user) bị xóa khỏi Realm database,
    // bản lưu cũ (ref.current) sẽ trở thành 'invalidated'.
    // Hàm isEqual cố gắng đọc thuộc tính của object đã bị xóa này sẽ gây ra crash.
    // Nếu bắt được lỗi này, chứng tỏ dữ liệu đã bị thay đổi -> coi như không bằng nhau.
    areEqual = false;
  }

  if (!areEqual) {
    ref.current = value;
    setSignal(prev => (prev += 1));
  }

  return React.useMemo(() => {
    signal;
    return ref.current;
  }, [signal]);
};
