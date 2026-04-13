import React from 'react';
import isEqual from 'react-fast-compare';

import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { useRenderCounter } from '../../../../hooks';
import {
    usePSDesignSystemContext,
} from '../../../../context';
import Moment from 'react-moment';

export const PSMessageTrailingTime = React.memo(
    ({
        createdAt,
        containerStyle,
    }: {
        createdAt: number;
        containerStyle: StyleProp<TextStyle>;
    }) => {
        useRenderCounter(
            'MessageTrailingTime',
            createdAt !== undefined && createdAt > 0,
        );

        const { typography, colors } = usePSDesignSystemContext();

        const textStyles = React.useMemo(() => {
            return [
                styles.text,
                containerStyle,
                typography.bodyMediumR,
                { color: colors.Primary.disable },
            ];
        }, [colors.Primary.subText, containerStyle, typography.bodyMediumR]);

        return (
            <Moment
                format={'HH:mm'}
                toNow
                unix
                element={Text}
                // @ts-ignore
                style={textStyles}>
                {createdAt / 1000}
            </Moment>
        )
    },
    (prev, next) => {
        return isEqual(prev, next);
    },
);

const styles = StyleSheet.create({
    text: {},
});
