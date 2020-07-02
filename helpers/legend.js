const dataHelpers = require("../helpers/data.js");
const colorHelpers = require("../helpers/color.js");
const simpleStatistics = require("simple-statistics");

const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;

function getBucketsForLegend(
  filteredValues,
  options,
  minValue,
  maxValue,
  customColorMap
) {
  const bucketType = options.bucketType;
  const numberBuckets = options.numberBuckets;
  const scale = options.scale;
  const colorOptions = {
    colorScheme: options.colorScheme,
    colorOverwrites: customColorMap,
  };

  if (bucketType === "ckmeans") {
    return getCkMeansBuckets(
      filteredValues,
      numberBuckets,
      scale,
      colorOptions
    );
  } else if (bucketType === "quantile") {
    return getQuantileBuckets(
      filteredValues,
      numberBuckets,
      minValue,
      scale,
      colorOptions
    );
  } else if (bucketType === "equal") {
    return getEqualBuckets(
      numberBuckets,
      minValue,
      maxValue,
      scale,
      colorOptions
    );
  } else if (bucketType === "custom") {
    return getCustomBuckets(options, scale, colorOptions);
  }
  return [];
}

function getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions) {
  const ckmeansBuckets = ckmeans(filteredValues, numberBuckets);

  return ckmeansBuckets.map((bucket, index) => {
    const from =
      index === 0
        ? Math.min(...bucket)
        : Math.max(...ckmeansBuckets[index - 1]);
    const to = Math.max(...bucket);
    return {
      from,
      to,
      color: colorHelpers.getBucketColor(
        numberBuckets,
        index,
        scale,
        colorOptions
      ),
    };
  });
}

function getQuantileBuckets(
  filteredValues,
  numberBuckets,
  minValue,
  scale,
  colorOptions
) {
  const quantilePortion = 1 / numberBuckets;
  let quantiles = [];
  for (let i = 1; i <= numberBuckets; i++) {
    quantiles.push(i * quantilePortion);
  }
  const quantileUpperBorders = quantile(filteredValues, quantiles);
  return quantileUpperBorders.map((quantileBorder, index) => {
    const from = index === 0 ? minValue : quantileUpperBorders[index - 1];
    return {
      from,
      to: quantileBorder,
      color: colorHelpers.getBucketColor(
        numberBuckets,
        index,
        scale,
        colorOptions
      ),
    };
  });
}

function getEqualBuckets(
  numberBuckets,
  minValue,
  maxValue,
  scale,
  colorOptions
) {
  const portion = 1 / numberBuckets;
  const range = maxValue - minValue;
  let equalBuckets = [];
  for (let i = 0; i < numberBuckets; i++) {
    const from = i === 0 ? minValue : minValue + range * portion * i;
    const to = minValue + range * portion * (i + 1);
    equalBuckets.push({
      from,
      to,
      color: colorHelpers.getBucketColor(numberBuckets, i, scale, colorOptions),
    });
  }
  return equalBuckets;
}

function getCustomBuckets(numericalOptions, scale, colorOptions) {
  if (numericalOptions.customBuckets !== undefined) {
    const customBorderValues = dataHelpers.getCustomBucketBorders(
      numericalOptions.customBuckets
    );

    const numberBuckets = customBorderValues.length - 1;

    const minBorder = customBorderValues.shift();
    let customBuckets = [];
    customBorderValues.forEach((borderValue, index) => {
      customBuckets.push({
        from: index === 0 ? minBorder : customBorderValues[index - 1],
        to: borderValue,
        color: colorHelpers.getBucketColor(
          numberBuckets,
          index,
          scale,
          colorOptions
        ),
      });
    });
    return customBuckets;
  }
}

function getCustomColorMap(colorOverwrites) {
  if (colorOverwrites === undefined) {
    colorOverwrites = [];
  }

  return new Map(
    colorOverwrites.map(({ position, color, textColor }) => [
      position - 1,
      { color, textColor },
    ])
  );
}

function hasSingleValueBucket(legendData) {
  const firstBucket = legendData.buckets[0];
  return firstBucket.from === firstBucket.to;
}

function getNumericalLegend(data, options) {
  const customColorMap = getCustomColorMap(options.colorOverwrites);
  const values = dataHelpers.getNumericalValues(data);
  const nonNullValues = dataHelpers.getNonNullNumericalValues(values);
  const metaData = dataHelpers.getMetaData(values, nonNullValues);

  const legendData = {
    type: "numerical",
    ...metaData,
  };

  legendData.buckets = getBucketsForLegend(
    nonNullValues,
    options,
    legendData.minValue,
    legendData.maxValue,
    customColorMap
  );

  legendData.hasSingleValueBucket = hasSingleValueBucket(legendData);

  // for all bucket types we calculate the resulting buckets out of given data set
  // custom bucketing need a special handling of min/max values because the first and the last
  // custom bucket value could be lower/higher than min/max
  if (options.bucketType === "custom") {
    // if first custom bucket value is less than min value in given data set
    // we set min value of legend to starting value of custom buckets
    const minBucketValue = legendData.buckets[0].from;
    if (legendData.minValue > minBucketValue) {
      legendData.minValue = minBucketValue;
    }
    // if last custom bucket value is higher that max value in given data set
    // we set max value of legend to last custom bucket value
    const maxBucketValue = legendData.buckets[legendData.buckets.length - 1].to;
    if (legendData.maxValue < maxBucketValue) {
      legendData.maxValue = maxBucketValue;
    }
  }
  return legendData;
}

function getCategoricalLegend(data, options) {
  const legendData = {
    type: "categorical",
  };

  const customColorMap = getCustomColorMap(options.colorOverwrites);
  const categoryLabels = dataHelpers.getUniqueCategories(data);
  let categories = [];
  categoryLabels.forEach((label, index) => {
    categories.push({
      label,
      color: colorHelpers.getCategoryColor(index, customColorMap),
    });
  });
  legendData.categories = categories;
  return legendData;
}

module.exports = {
  getNumericalLegend,
  getCategoricalLegend,
};
