/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {Image, ImageProps} from 'react-native';
import {usePSImageComponentContext} from '../context';
import isEqual from 'react-fast-compare';

export const PSImage = React.memo(
  (props: ImageProps) => {
    const {ImageComponent} = usePSImageComponentContext();

    const ComponentType = React.useMemo(() => {
      // @ts-ignore
      const uri = props.source.uri;
      if (typeof uri === 'string' && uri.startsWith('http')) {
        return ImageComponent;
      } else {
        return Image as React.ComponentType<ImageProps>;
      }
    }, [
      // @ts-ignore
      props.source.uri,
    ]);

    return <ComponentType {...props} />;
  },
  (prev, next) => isEqual(prev, next),
);
