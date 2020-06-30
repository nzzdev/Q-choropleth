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

function getMetaData(values, numberValues) {
  return {
    hasNullValues: values.find((value) => value === null) !== undefined,
    hasZeroValues: numberValues.find((value) => value === 0) !== undefined,
    maxValue: Math.max(...numberValues),
    minValue: Math.min(...numberValues),
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

module.exports = {
  getUniqueCategories,
  getCustomBucketBorders,
  getNumericalValues,
  getNonNullNumericalValues,
  getMetaData,
  getNumberBuckets,
};
