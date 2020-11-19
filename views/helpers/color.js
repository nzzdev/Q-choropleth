function getColor(value, legendData) {
  if (value === null || value === undefined) {
    return {
      colorClass: "s-color-gray-4",
      customColor: "",
      textColor: "s-color-gray-6",
    };
  }
  if (legendData.type === "numerical") {
    const buckets = legendData.buckets;
    const bucket = buckets.find((bucket, index) => {
      if (index === 0) {
        return value <= bucket.to;
      } else if (index === buckets.length - 1) {
        return bucket.from < value;
      } else {
        return bucket.from < value && value <= bucket.to;
      }
    });
    if (bucket) {
      return {
        colorClass: bucket.color.colorClass,
        customColor: bucket.color.customColor,
        textColor: bucket.color.textColor,
      };
    } else {
      return {
        colorClass: "s-color-gray-4",
        customColor: "",
        textColor: "s-color-gray-6",
      };
    }
  } else {
    const categories = legendData.categories;
    const category = categories.find((category) => category.label === value);
    if (category) {
      return {
        colorClass: category.color.colorClass,
        customColor: category.color.customColor,
        textColor: category.color.textColor,
      };
    } else {
      return {
        colorClass: "s-color-gray-4",
        customColor: "",
      };
    }
  }
}

module.exports = { getColor };
