export function findMissingNumbersDescending(
  numbers: number[],
  sum: number,
): number[] {
  // Sắp xếp mảng theo thứ tự giảm dần (để đảm bảo)
  numbers.sort((a, b) => b - a);

  const max = numbers[0]!;
  const min = max - sum + 1;
  const missingNumbers: number[] = [];

  let expectedNumber = max;
  let index = 0;

  while (expectedNumber >= min) {
    if (index < numbers.length && numbers[index] === expectedNumber) {
      index++;
    } else {
      missingNumbers.push(expectedNumber);
    }
    expectedNumber--;
  }

  return missingNumbers;
}

export function findMissingNumbersAscending(
  numbers: number[],
  sum: number,
): number[] {
  // Sắp xếp mảng theo thứ tự tăng dần (để đảm bảo)
  numbers.sort((a, b) => a - b);

  const min = numbers[0]!;
  const max = min + sum - 1;
  const missingNumbers: number[] = [];

  let expectedNumber = min;
  let index = 0;

  while (expectedNumber <= max) {
    if (index < numbers.length && numbers[index] === expectedNumber) {
      index++;
    } else {
      missingNumbers.push(expectedNumber);
    }
    expectedNumber++;
  }

  return missingNumbers;
}
