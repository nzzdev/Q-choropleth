const clone = require("clone");
const array2d = require("array2d");
const { to_number } = require("svelte/internal");

function getDataWithoutHeaderRow(data) {
  return data.slice(1);
}

function getUniqueCategories(data) {
  const values = data
    .map((row) => {
      return row[1];
    })
    .filter((value) => value !== null);
  return [...new Set(values)];
}

function getCustomBucketBorders(customBuckets) {
  const customBorderStrings = customBuckets.split(",");
  return customBorderStrings.map((borderValue) => {
    return parseFloat(borderValue.trim());
  });
}

function getMedian(values, maxDigits) {
  let middleIndex = Math.floor(values.length / 2);
  let sortedNumbers = [...values].sort((a, b) => a - b);
  if (values.length % 2 !== 0) {
    return sortedNumbers[middleIndex];
  } else {
    const median =
      (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
    if (maxDigits === undefined || maxDigits < 2) {
      return Math.round(median * 100) / 100;
    } else {
      const roundingFactor = Math.pow(10, maxDigits);
      Math.round(median * roundingFactor) / roundingFactor;
    }
  }
  return values.length % 2 !== 0
    ? sortedNumbers[middleIndex]
    : (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
}

function getAverage(values, maxDigits) {
  if (maxDigits === undefined || maxDigits < 2) {
    return (
      Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) /
      100
    );
  }
  const roundingFactor = Math.pow(10, maxDigits);
  return (
    Math.round(
      (values.reduce((a, b) => a + b, 0) / values.length) * roundingFactor
    ) / roundingFactor
  );
}

function getMetaData(values, numberValues, maxDigits) {
  return {
    hasNullValues: values.find((value) => value === null) !== undefined,
    hasZeroValues: numberValues.find((value) => value === 0) !== undefined,
    maxValue: Math.max(...numberValues),
    minValue: Math.min(...numberValues),
    averageValue: getAverage(numberValues, maxDigits),
    medianValue: getMedian(numberValues, maxDigits),
  };
}

function getNumericalValues(data) {
  return data.map((row) => {
    if (row[1] !== null) {
      if (row[1].match(/^[+-]?\d+(\.\d+)?$/) === null) {
        throw new Error("value is not a valid floating point number");
      }
      return parseFloat(row[1]);
    }
    return row[1];
  });
}

function getNonNullNumericalValues(values) {
  return values.filter((value) => value !== null);
}

function getNumberBuckets(numericalOptions) {
  try {
    if (numericalOptions.bucketType !== "custom") {
      return numericalOptions.numberBuckets;
    } else {
      const bucketBorderValues = getCustomBucketBorders(
        numericalOptions.customBuckets
      );
      return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
    }
  } catch {
    return 0;
  }
}

function getDigitsAfterComma(value) {
  try {
    if (value !== undefined && value !== null) {
      const valueParts = value.toString().split(".");
      if (valueParts.length > 1) {
        return valueParts[1].length;
      }
    }
  } catch (e) {
    return 0;
  }
  return 0;
}

function getMaxDigitsAfterCommaInData(data) {
  let maxDigits = 0;
  data.forEach((row) => {
    const digitsAfterComma = getDigitsAfterComma(row[1]);
    maxDigits = Math.max(maxDigits, digitsAfterComma);
  });
  return maxDigits;
}

function getFlatData(data) {
  const dataOnly = array2d.crop(
    clone(data),
    0,
    1,
    array2d.width(data) - 1,
    array2d.height(data) - 1
  );
  const flatData = array2d.flatten(dataOnly);
  return flatData;
}

function getMaxValue(data) {
  const flatData = getFlatData(data).filter((value) => {
    return value !== null && value !== undefined;
  });
  return flatData.reduce((a, b) => {
    return Math.max(a, b);
  });
}

function getMinValue(data) {
  const flatData = getFlatData(data).filter((value) => {
    return value !== null && value !== undefined;
  });
  return flatData.reduce((a, b) => {
    return Math.min(a, b);
  });
}

function getDivisorString(divisor) {
  let divisorString = "";
  switch (divisor) {
    case Math.pow(10, 9):
      divisorString = "Milliarden";
      break;
    case Math.pow(10, 6):
      divisorString = "Millionen";
      break;
    case Math.pow(10, 3):
      divisorString = "Tausend";
      break;
    default:
      divisorString = "";
      break;
  }
  return divisorString;
}

function getDivisorForMinMax(minValue, maxValue) {
  let divisor = 1;

  if (maxValue >= Math.pow(10, 9) && minValue >= Math.pow(10, 8)) {
    divisor = Math.pow(10, 9);
  } else if (maxValue >= Math.pow(10, 6) && minValue >= Math.pow(10, 5)) {
    divisor = Math.pow(10, 6);
  } else if (maxValue >= Math.pow(10, 4) && minValue >= Math.pow(10, 3)) {
    divisor = Math.pow(10, 3);
  }
  return divisor;
}

function getDivisor(data) {
  try {
    const minValue = getMinValue(data);
    const maxValue = getMaxValue(data);
    return getDivisorForMinMax(Math.abs(minValue), maxValue);
  } catch (err) {
    // if something goes wrong, the divisor is just 1
    return 1;
  }
}

function getDividedData(data, divisor) {
  return data.map((row) => {
    row[1] = parseFloat(row[1] / divisor).toFixed(1);
    return row;
  });
}

module.exports = {
  getDataWithoutHeaderRow,
  getUniqueCategories,
  getCustomBucketBorders,
  getNumericalValues,
  getNonNullNumericalValues,
  getMetaData,
  getNumberBuckets,
  getMaxDigitsAfterCommaInData,
  getDivisor,
  getDivisorString,
  getDividedData,
};
