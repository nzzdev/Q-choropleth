const dataHelpers = require("../helpers/data.js");
const mappings = require("../helpers/mappings.js");
const simpleStatistics = require("simple-statistics");

const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;

function getColor(numberBuckets, index, scale, colorOptions) {
  const colorScheme = colorOptions.colorScheme;
  const customColor = colorOptions.colorOverwrites.get(index);

  if (scale === "sequential") {
    return {
      colorClass: `s-viz-color-sequential-${colorScheme}-${numberBuckets}-${
        numberBuckets - index
      }`,
      customColor:
        customColor !== undefined && customColor.color !== undefined
          ? customColor.color
          : "",
      customTextColor:
        customColor !== undefined && customColor.textColor !== undefined
          ? customColor.textColor
          : "",
    };
  } else {
    // if we have a diverging scale we deal with two cases:
    // a) diverging value = one of bucket border values,
    //    i.e. we do not have a bucket with a neutral color value
    // b) diverging value = one of the buckets,
    //    i.e. this bucket has a neutral color value
    // scale values could be e.g. border-1, border-2 or bucket-1, bucket-2
    const divergingSpecification = scale.split("-");
    const divergingIndex = parseInt(divergingSpecification[1]);

    // in order to know which diverging scale size we have to use,
    // we have to check which side is bigger first and then calculate
    // the size depending on the number of buckets of the bigger side
    const numberBucketsLeft = divergingIndex;
    let numberBucketsRight = numberBuckets - divergingIndex;

    if (divergingSpecification[0] === "bucket") {
      numberBucketsRight -= 1;
    }

    const numberBucketsBiggerSide = Math.max(
      numberBucketsLeft,
      numberBucketsRight
    );

    let scaleSize = numberBucketsBiggerSide * 2;
    if (divergingSpecification[0] === "bucket") {
      scaleSize += 1;
    }

    // if the left side is smaller we cannot start with scale position 1
    // instead we have to calculate the position depending on scale size
    // and number of buckets
    let scalePosition;
    if (numberBucketsLeft < numberBucketsRight) {
      scalePosition = scaleSize - numberBuckets + index + 1;
    } else {
      scalePosition = index + 1;
    }

    return {
      colorClass: `s-viz-color-diverging-${colorScheme}-${scaleSize}-${scalePosition}`,
      customColor:
        customColor !== undefined && customColor.color !== undefined
          ? customColor.color
          : "",
      customTextColor:
        customColor !== undefined && customColor.textColor !== undefined
          ? customColor.textColor
          : "",
    };
  }
}

function getBucketsForLegend(
  filteredValues,
  options,
  minValue,
  maxValue,
  customColorMap
) {
  const bucketType = options.bucketOptions.bucketType;
  const numberBuckets = options.bucketOptions.numberBuckets;
  const scale = options.bucketOptions.scale;
  const colorOptions = {
    colorScheme: options.colorScheme,
    colorOverwrites: customColorMap,
  }; // TODO tbd how to deal with custom colors!

  // TODO add checks (maybe also add notifications and don't render graphic otherwiese):
  // a) numberBuckets <= filteredValues.length
  // b) if custom buckets, are values within borders
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
      color: getColor(numberBuckets, index, scale, colorOptions),
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
      color: getColor(numberBuckets, index, scale, colorOptions),
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
      color: getColor(numberBuckets, i, scale, colorOptions),
    });
  }
  return equalBuckets;
}

function getCustomBuckets(options, scale, colorOptions) {
  if (options.bucketOptions.customBuckets !== undefined) {
    const customBorderValues = dataHelpers.getCustomBucketBorders(
      options.bucketOptions.customBuckets
    );

    const numberBuckets = customBorderValues.length;

    const minBorder = customBorderValues.shift();
    let customBuckets = [];
    customBorderValues.forEach((borderValue, index) => {
      customBuckets.push({
        from: index === 0 ? minBorder : customBorderValues[index - 1],
        to: borderValue,
        color: getColor(numberBuckets, index, scale, colorOptions),
      });
    });
    return customBuckets;
  }
}

function getLegend(item) {
  const data = item.data;
  const choroplethType = dataHelpers.getChoroplethType(data);
  const legendData = {
    type: choroplethType,
  };

  if (item.options.colorOverwrites === undefined) {
    item.options.colorOverwrites = [];
  }

  const customColorMap = new Map(
    item.options.colorOverwrites.map(({ position, color, textColor }) => [
      position - 1,
      { color, textColor },
    ])
  );

  if (choroplethType === "categorical") {
    const categoryLabels = dataHelpers.getUniqueCategories(data);
    let categories = [];
    categoryLabels.forEach((label, index) => {
      const customColor = customColorMap.get(index);
      categories.push({
        label,
        color: {
          colorClass: `s-viz-color-${mappings.digitWords[index]}-5`,
          customColor:
            customColor !== undefined && customColor.color !== undefined
              ? customColor.color
              : "",
          customTextColor:
            customColor !== undefined && customColor.textColor !== undefined
              ? customColor.textColor
              : "",
        },
      });
    });
    legendData.categories = categories;
  } else if (choroplethType === "numerical") {
    const values = dataHelpers.getValues(data);
    const filteredValues = values.filter(
      (value) => value !== null && value !== 0
    );
    const minValue = Math.min(...filteredValues);
    const maxValue = Math.max(...filteredValues);

    legendData.hasNullValues =
      values.find((value) => value === null) !== undefined;
    legendData.hasZeroValues =
      values.find((value) => value === 0) !== undefined;
    legendData.maxValue = maxValue;
    legendData.minValue = minValue;

    legendData.buckets = getBucketsForLegend(
      filteredValues,
      item.options,
      minValue,
      maxValue,
      customColorMap
    );

    if (item.options.bucketOptions.bucketType === "custom") {
      const minBucketValue = legendData.buckets[0].from;
      if (minValue > minBucketValue) {
        legendData.minValue = minBucketValue;
      }
      const maxBucketValue =
        legendData.buckets[legendData.buckets.length - 1].to;
      if (maxValue < maxBucketValue) {
        legendData.maxValue = maxBucketValue;
      }
    }
  }
  return legendData;
}

module.exports = {
  getLegend,
};
