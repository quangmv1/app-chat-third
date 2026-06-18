import { createContext, PropsWithChildren, useContext } from 'react';
import { IconProps } from '../../../icons';
import React from 'react';

export enum PSMessageInputAttachmentItemType {
    GALLERY = 'GALLERY',
    CAMERA = 'CAMERA',
    FILE = 'FILE',
    POLL = 'POLL',
    CUSTOM = 'CUSTOM',
}

export type PSMessageInputAttachmentItem = {
    type: PSMessageInputAttachmentItemType
    label?: string;
    icon?: React.FC<IconProps>;
    onPress?: (() => void) | undefined;
};

type PSMessageInputAttachmentContextValue = {
    inputAttachmentItems: (items?: PSMessageInputAttachmentItem[])
        => PSMessageInputAttachmentItem[] | undefined;
};


const PSMessageInputAttachmentContext =
    createContext<PSMessageInputAttachmentContextValue>(
        {} as PSMessageInputAttachmentContextValue,
    );

export const PSMessageInputAttachmentProvider = (
    { items, children }:
        PropsWithChildren<{ items?: PSMessageInputAttachmentItem[] }>) => {

    const messageInputAttachmentItems = React.useCallback(
        () => items,
        [items],
    );

    const contextValue = React.useMemo(() => {
        return {
            inputAttachmentItems: messageInputAttachmentItems,
        } as PSMessageInputAttachmentContextValue;
    }, []);


    return (
        <PSMessageInputAttachmentContext.Provider value={contextValue}>
            {children}
        </PSMessageInputAttachmentContext.Provider>
    );
};

export const usePSMessageInputAttachmentContext = () =>
    useContext(PSMessageInputAttachmentContext);
