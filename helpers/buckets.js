const simpleStatistics = require("simple-statistics");
const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;

function getBuckets(filteredValues, bucketOptions, minValue, maxValue) {
  const bucketType = bucketOptions.bucketType;
  const numberBuckets = bucketOptions.numberBuckets;
  // TODO add diverging scale and bucketing

  // TODO add checks (maybe also add notifications and don't render graphic otherwiese):
  // a) numberBuckets <= filteredValues.length
  // b) if custom buckets, are values within borders
  if (bucketType === "ckmeans") {
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
        colorClass: `s-viz-color-sequential-one-${numberBuckets}-${numberBuckets -
          index}`
      };
    });
  } else if (bucketType === "quantile") {
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
        colorClass: `s-viz-color-sequential-one-${numberBuckets}-${numberBuckets -
          index}`
      };
    });
  } else if (bucketType === "equal") {
    const portion = 1 / numberBuckets;
    const range = maxValue - minValue;
    let equalBuckets = [];
    for (let i = 0; i < numberBuckets; i++) {
      const from = i === 0 ? minValue : minValue + range * portion * i;
      const to = minValue + range * portion * (i + 1);
      equalBuckets.push({
        from,
        to,
        colorClass: `s-viz-color-sequential-one-${numberBuckets}-${numberBuckets -
          i}`
      });
    }
    return equalBuckets;
  } else if (bucketType === "custom") {
    if (bucketOptions.customBuckets !== undefined) {
      const customBorderStrings = bucketOptions.customBuckets.split(",");
      const customBorderValues = customBorderStrings.map(borderValue => {
        return parseFloat(borderValue.trim());
      });

      const minBorder = customBorderValues.shift();
      let customBuckets = [];
      customBorderValues.forEach((borderValue, index) => {
        customBuckets.push({
          from: index === 0 ? minBorder : customBorderValues[index - 1],
          to: borderValue,
          colorClass: `s-viz-color-sequential-one-${
            customBorderValues.length
          }-${customBorderValues.length - index}`
        });
      });
      return customBuckets;
    }
  }
  return [];
}

module.exports = {
  getBuckets
};
