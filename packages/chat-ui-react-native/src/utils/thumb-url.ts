export const generateThumbUrl = ({
  srcUrl,
  srcThumbUrl,
  width,
  height,
}: {
  srcUrl: string;
  srcThumbUrl?: string;
  width: number;
  height: number;
}) => {
  if (srcUrl.endsWith('.gif') || srcUrl.endsWith('.webp')) {
    return (
      srcUrl?.replace(
        '<width>x<height>',
        `${Math.round(width)}x${Math.round(height)}`,
      ) ?? srcUrl
    );
  } else {
    return (
      srcThumbUrl?.replace(
        '<width>x<height>',
        `${Math.round(width)}x${Math.round(height)}`,
      ) ?? srcUrl
    );
  }
};
