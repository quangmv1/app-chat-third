/* eslint-disable no-extend-native */
Array.prototype.mapWithPreviousAndNext = function <T, S>(
  transform: (
    previous: T | undefined,
    current: T,
    currentIndex: number,
    next: T | undefined,
  ) => S,
): Array<S> {
  const results: S[] = [];
  this.forEach((item, index) => {
    const previous = index === 0 ? undefined : this[index - 1];
    const current = item;
    const next = index === this.length - 1 ? undefined : this[index + 1];

    const result = transform(previous, current, index, next);
    if (result) {
      results.push(result);
    }
  });
  return results;
};

Array.prototype.mapWithNext = function <T, S>(
  transform: (current: T, currentIndex: number, next: T | undefined) => S,
): Array<S> {
  const results: S[] = [];
  this.forEach((item, index) => {
    const current = item;
    const next = index === this.length - 1 ? undefined : this[index + 1];

    const result = transform(current, index, next);
    if (result) {
      results.push(result);
    }
  });
  return results;
};

Array.prototype.mapNotNull = function <T, S>(
  transform: (value: T, index: number) => S | null | undefined,
): Array<S> {
  const results: S[] = [];

  this.forEach((item, index) => {
    const result = transform(item, index);
    if (result) {
      results.push(result);
    }
  });

  return results;
};

Array.prototype.groupBy = function <T, K extends string | number | symbol, V>(
  getKey: (item: T) => K,
  getValue: (value: T) => V,
): Record<K, V[]> {
  return this.reduce(
    (previous, currentItem) => {
      const key = getKey(currentItem);
      if (!previous[key]) {
        previous[key] = [];
      }
      const value = getValue(currentItem);
      previous[key].push(value);
      return previous;
    },
    {} as Record<K, V[]>,
  );
};

export {};
