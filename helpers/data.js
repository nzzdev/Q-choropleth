function getChoroplethType(data) {
  // first column contains base map entities
  // second column contains values
  // we do not support more than one value column
  if (data.length > 0 && data[0].length < 3) {
    // if at least one of the values is not a number we have a
    // categorical choropleth
    for (let i = 0; i < data.length; i++) {
      if (i !== 0 && data[i].length > 1 && isNaN(data[i][1])) {
        return "categorical";
      }
    }
  }
  return "numerical";
}

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

function getNumberBuckets(bucketOptions) {
  try {
    if (bucketOptions.bucketType !== "custom") {
      return bucketOptions.numberBuckets;
    } else {
      const bucketBorderValues = getCustomBucketBorders(
        bucketOptions.customBuckets
      );
      return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
    }
  } catch {
    return 0;
  }
}

module.exports = {
  getChoroplethType,
  getUniqueCategories,
  getCustomBucketBorders,
  getValues,
  getNumberBuckets,
};
