export const formatFileSizeToText = (
  size?: number | string,
): string | undefined => {
  if (!size) {
    return undefined;
  }
  if (typeof size === 'string') {
    size = parseFloat(size);
  }

  if (size < 1000) {
    return `${size} bytes`;
  }

  if (size < 1000 * 1000) {
    return `${Math.floor(Math.floor(size / 10) / 100)} KB`;
  }

  return `${Math.floor(Math.floor(size / 10000) / 100)} MB`;
};
