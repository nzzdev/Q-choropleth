const clone = require("clone");
const array2d = require("array2d");

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

function getRoundedValue(value, maxDigitsAfterComma) {
  let roundingFactor = 100; // default: round to two digits after comma
  // if data contains more precise float numbers we round to max number of digits after comma
  if (maxDigitsAfterComma !== undefined && maxDigitsAfterComma > 2) {
    roundingFactor = Math.pow(10, maxDigitsAfterComma);
  }
  return Math.round(value * roundingFactor) / roundingFactor;
}

function getMedian(values) {
  let middleIndex = Math.floor(values.length / 2);
  let sortedNumbers = [...values].sort((a, b) => a - b);
  if (values.length % 2 !== 0) {
    return sortedNumbers[middleIndex];
  }
  return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
}

function getRoundedMedian(values, maxDigitsAfterComma) {
  const medianValue = getMedian(values);
  return getRoundedValue(medianValue, maxDigitsAfterComma);
}

function getAverage(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getRoundedAverage(values, maxDigitsAfterComma) {
  const averageValue = getAverage(values);
  return getRoundedValue(averageValue, maxDigitsAfterComma);
}

function getMetaData(values, numberValues, maxDigitsAfterComma) {
  return {
    hasNullValues: values.find((value) => value === null) !== undefined,
    hasZeroValues: numberValues.find((value) => value === 0) !== undefined,
    maxValue: Math.max(...numberValues),
    minValue: Math.min(...numberValues),
    averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
    medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma),
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
    return 0;
  } catch (e) {
    return 0; // if something goes wrong we just return 0 digits after comma
  }
}

function getMaxDigitsAfterCommaInData(data) {
  let maxDigitsAfterComma = 0;
  data.forEach((row) => {
    const digitsAfterComma = getDigitsAfterComma(row[1]);
    maxDigitsAfterComma = Math.max(maxDigitsAfterComma, digitsAfterComma);
  });
  return maxDigitsAfterComma;
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

function getSubtitleSuffix(divisor, subtitle) {
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

  if (subtitle && subtitle !== "") {
    return `(in ${divisorString})`;
  }
  return `in ${divisorString}`;
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
  getSubtitleSuffix,
  getDividedData,
};
