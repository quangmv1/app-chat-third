declare global {
  export interface Array<T> {
    mapWithPreviousAndNext<S>(
      transform: (
        previous: T | undefined,
        current: T,
        currentIndex: number,
        next: T | undefined,
      ) => S,
    ): Array<S>;

    mapWithNext<S>(
      transform: (current: T, currentIndex: number, next: T | undefined) => S,
    ): Array<S>;

    mapNotNull<S>(
      callback: (current: T, index) => S | null | undefined,
    ): Array<S>;

    groupBy<T, K extends string | number | symbol, V>(
      getKey: (item: T) => K,
      getValue: (value: T) => V,
    ): Record<K, V[]>;
  }

  export interface String {
    hashCode(): number;

    workAroundTextOneLineContainsNewLineIOS(): String;

    removeDiacritics(): String;
  }

  export interface Number {
    px(): number;
  }
}

export {};
