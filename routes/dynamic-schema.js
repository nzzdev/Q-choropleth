const Boom = require("@hapi/boom");
const Joi = require("../helpers/custom-joi.js");
const dataHelpers = require("../helpers/data.js");

function getScaleEnumWithTitles(bucketOptions) {
  let enumValues = ["sequential"];
  let enumTitles = ["Sequentiell"];

  let bucketNumber = 0;
  if (bucketOptions.bucketType === "custom") {
    const buckets = bucketOptions.customBuckets.split(",");
    bucketNumber = buckets.length - 1;
  } else {
    bucketNumber = bucketOptions.numberBuckets;
  }

  // Add valid bucket borders to enum as diverging values
  for (let i = 1; i < bucketNumber; i++) {
    enumValues.push(`border-${i}`);
    enumTitles.push(`Divergierend ab Grenze ${i}`);
  }

  // Add valid buckets to enum as diverging values
  for (let i = 1; i < bucketNumber - 1; i++) {
    enumValues.push(`bucket-${i}`);
    enumTitles.push(`Divergierend ab Bucket ${i + 1}`);
  }

  return {
    enum: enumValues,
    "Q:options": {
      enum_titles: enumTitles,
    },
  };
}

function getColorSchemeEnumWithTitles(scale) {
  if (scale === "sequential") {
    return {
      enum: ["one", "two", "three", "female", "male"],
      "Q:options": {
        enum_titles: [
          "Skala 1",
          "Skala 2",
          "Skala 3",
          "Skala Weiblich",
          "Skala Männlich",
        ],
      },
    };
  }
  return {
    enum: ["one", "two", "three", "gender"],
    "Q:options": {
      enum_titles: ["Skala 1", "Skala 2", "Skala 3", "Skala Weiblich/Männlich"],
    },
  };
}

function getTitleAndMaxItems(data, bucketOptions) {
  const choroplethType = dataHelpers.getChoroplethType(data);
  const colorOverwritesSchema = {
    title: choroplethType === "categorical" ? "Kategorienfarbe" : "Bucketfarbe",
  };

  try {
    if (choroplethType === "categorical") {
      const categories = dataHelpers.getUniqueCategories(data);
      colorOverwritesSchema.maxItems = categories.length;
    } else {
      colorOverwritesSchema.maxItems = dataHelpers.getNumberBuckets(
        bucketOptions
      );
    }
  } catch {
    // we just do not set maxItems if anything goes wrong
  }
  return colorOverwritesSchema;
}

function getColorOverwriteEnumAndTitles(data, bucketOptions) {
  try {
    const choroplethType = dataHelpers.getChoroplethType(data);

    let numberItems = 0;
    let enumValues = [null];

    if (choroplethType === "categorical") {
      const categories = dataHelpers.getUniqueCategories(data);
      numberItems = categories.length;
      for (let index = 0; index < numberItems; index++) {
        enumValues.push(index + 1);
      }
      return {
        enum: enumValues,
        "Q:options": {
          enum_titles: [""].concat(
            categories.map((category, index) => `${index + 1} - ${category}`)
          ),
        },
      };
    } else {
      numberItems = dataHelpers.getNumberBuckets(bucketOptions);
      for (let index = 0; index < numberItems; index++) {
        enumValues.push(index + 1);
      }
      return {
        enum: enumValues,
        "Q:options": {
          enum_titles: enumValues.map((value) =>
            value === null ? "" : `${value}. Bucket `
          ),
        },
      };
    }
  } catch {
    return {};
  }
}

module.exports = {
  method: "POST",
  path: "/dynamic-schema/{optionName}",
  options: {
    validate: {
      payload: Joi.object(),
    },
    cors: true,
  },
  handler: function (request, h) {
    const item = request.payload.item;
    if (request.params.optionName === "scale") {
      return getScaleEnumWithTitles(item.options.bucketOptions);
    }

    if (request.params.optionName === "colorScheme") {
      return getColorSchemeEnumWithTitles(item.options.bucketOptions.scale);
    }

    if (request.params.optionName === "colorOverwrites") {
      return getTitleAndMaxItems(item.data, item.options.bucketOptions);
    }

    if (request.params.optionName === "colorOverwritesItem") {
      return getColorOverwriteEnumAndTitles(
        item.data,
        item.options.bucketOptions
      );
    }

    if (request.params.optionName === "baseMap") {
      return {
        "Q:options": {
          defaultArrayValues: [["Aargau"], ["Zürich"]],
        },
      };
    }

    return Boom.badRequest();
  },
};
