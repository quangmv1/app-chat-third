import React from 'react';
import Svg, {
  G,
  GProps,
  Mask,
  MaskProps,
  Path,
  PathProps,
  SvgProps,
  Rect,
  RectProps,
  ClipPath,
  ClipPathProps,
} from 'react-native-svg';

export type IconProps = Partial<SvgProps> &
  Omit<RootPathProps, 'd'> & {
    height?: number;
    width?: number;
    viewBox?: string;
  };

export const RootSvg: React.FC<IconProps> = props => {
  const {children, width = 24, height = 24, viewBox = '0 0 24 24'} = props;
  return (
    <Svg
      {...{
        width,
        height,
        viewBox,
      }}
      {...props}>
      {children}
    </Svg>
  );
};

export const RootG: React.FC<GProps> = props => {
  return <G {...props} />;
};

export const RootMask: React.FC<MaskProps> = props => {
  return <Mask {...props} />;
};

export type RootPathProps = Pick<PathProps, 'd'> & {
  fill?: SvgProps['fill'];
  pathOpacity?: PathProps['opacity'];
  stroke?: PathProps['stroke'];
};

export const RootPath: React.FC<RootPathProps> = props => {
  const {d, fill, pathOpacity, stroke} = props;
  return (
    <Path
      {...{
        clipRule: 'evenodd',
        d,
        fill: fill,
        fillRule: 'evenodd',
        opacity: pathOpacity,
        stroke: stroke,
      }}
    />
  );
};

export const RootRect: React.FC<RectProps> = props => {
  return <Rect {...props} />;
};

export const RootClipPath: React.FC<ClipPathProps> = props => {
  return <ClipPath {...props} />;
};
