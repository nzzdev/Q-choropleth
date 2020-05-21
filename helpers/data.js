function getUniqueCategories(data) {
  const values = data.map((row) => {
    return row[1];
  });
  return [...new Set(values)];
}

function getCustomBucketBorders(customBuckets) {
  const customBorderStrings = customBuckets.split(",");
  return customBorderStrings.map((borderValue) => {
    return parseFloat(borderValue.trim());
  });
}

function getValues(data) {
  return data.map((row) => {
    if (row[1] !== null) {
      return parseFloat(row[1]);
    }
    return row[1];
  });
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
  getValues,
  getNumberBuckets,
};
