import React from 'react';
import type {PSThreadModel} from '../../../../types/thread/model/PSThreadModel';
import isEqual from 'react-fast-compare';
import {
  PSThreadItemProvider,
  PSThreadSwipeRowProvider,
  useFolderContext,
} from '../../contexts';
import {PSThreadItemContent} from './PSThreadItemContent';
import {PSThreadPublicGroupItemContent} from './PSThreadPublicGroupItemContent';
import {PSFolderEntity} from '../../../../types';

export const THREAD_AVATAR_SIZE = (48).px();
export const THREAD_MARGIN_HORIZONTAL = (12).px();
export const THREAD_MARGIN_TOP = (12).px();
export const THREAD_MARGIN_BOTTOM = (12).px();

type ThreadItemProps = {
  item: PSThreadModel;
};

export const PSThreadItem = React.memo(
  (props: ThreadItemProps) => {
    const {item} = props;
    const {currentFolderAlias} = useFolderContext();
    return [PSFolderEntity.PUBLIC_GROUP, PSFolderEntity.PCL].includes(
      currentFolderAlias,
    ) ? (
      <PSThreadPublicGroupItemContent item={item} />
    ) : (
      <PSThreadItemProvider threadId={item.id}>
        <PSThreadSwipeRowProvider>
          <PSThreadItemContent item={item} />
        </PSThreadSwipeRowProvider>
      </PSThreadItemProvider>
    );
  },
  (prev: ThreadItemProps, next: ThreadItemProps) => {
    // Tạo bản sao của lastMessage mà không có thuộc tính id
    const prevLastMessageCopy = {...prev.item.lastMessage};
    const nextLastMessageCopy = {...next.item.lastMessage};
    // k cần so sánh điều kiện lastMessage.id, delete để tránh rerender k cần thiết
    // @ts-ignore
    delete prevLastMessageCopy.id;
    // @ts-ignore
    delete nextLastMessageCopy.id;

    // So sánh tất cả các thuộc tính con ngoại trừ id của lastMessage
    const isLastMessageEqual = isEqual(
      prevLastMessageCopy,
      nextLastMessageCopy,
    );
    const isOtherPropsEqual = isEqual(
      {
        ...prev.item,
        lastMessage: undefined,
      },
      {
        ...next.item,
        lastMessage: undefined,
      },
    );

    return isLastMessageEqual && isOtherPropsEqual;
  },
);
