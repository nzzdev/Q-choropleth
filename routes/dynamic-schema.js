const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const dataHelpers = require("../helpers/data.js");

function getScaleEnumWithTitles(numericalOptions) {
  let enumValues = ["sequential"];
  let enumTitles = ["Sequentiell"];

  let bucketNumber = 0;
  if (numericalOptions.bucketType === "custom") {
    if (numericalOptions.customBuckets) {
      const buckets = numericalOptions.customBuckets.split(",");
      bucketNumber = buckets.length - 1;
    }
  } else {
    bucketNumber = numericalOptions.numberBuckets;
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

function getMaxItemsNumerical(numericalOptions) {
  return {
    maxItems: dataHelpers.getNumberBuckets(numericalOptions),
  };
}

function getMaxItemsCategorical(data) {
  try {
    return {
      maxItems: dataHelpers.getUniqueCategories(data).length,
    };
  } catch {
    return {
      maxItems: undefined,
    };
  }
}

function getColorOverwriteEnumAndTitlesNumerical(numericalOptions) {
  try {
    let enumValues = [null];
    const numberItems = dataHelpers.getNumberBuckets(numericalOptions);
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
  } catch {
    return {};
  }
}

function getColorOverwriteEnumAndTitlesCategorical(data) {
  data = dataHelpers.getDataWithoutHeaderRow(data);
  let enumValues = [null];
  const categories = dataHelpers.getUniqueCategories(data);
  const numberItems = categories.length;
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
}

function getCantons(baseMapEntityCollection, entityType) {
  const cantons = baseMapEntityCollection.cantons;
  if (entityType === "name") {
    return cantons
      .sort((cantonA, cantonB) => cantonA.name.localeCompare(cantonB.name))
      .map((canton) => {
        return [{ value: canton.name, readOnly: true }];
      });
  } else if (entityType === "bfsNumber") {
    return cantons
      .sort((cantonA, cantonB) => cantonA.id - cantonB.id)
      .map((canton) => {
        return [{ value: canton.id, readOnly: true }];
      });
  } else if (entityType === "code") {
    return cantons
      .sort((cantonA, cantonB) => cantonA.code.localeCompare(cantonB.code))
      .map((canton) => {
        return [{ value: canton.code, readOnly: true }];
      });
  }
  return undefined;
}

async function getPredefinedContent(
  baseMapEntityCollection,
  baseMap,
  entityType
) {
  if (baseMap === "hexagonCHCantons") {
    const predefinedContent = getCantons(baseMapEntityCollection, entityType);
    return {
      "Q:options": {
        predefinedContent: {
          allowOverwrites: false,
          data: [["Kanton", "Wert"]].concat(predefinedContent),
        },
      },
    };
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
  handler: async function (request, h) {
    const item = request.payload.item;

    // TODO: add entityType as dynamic schema instead of fixed enum
    // in prep for other base maps with other entityTypes

    if (request.params.optionName === "scale") {
      return getScaleEnumWithTitles(item.options.numericalOptions);
    }

    if (request.params.optionName === "colorScheme") {
      return getColorSchemeEnumWithTitles(item.options.numericalOptions.scale);
    }

    if (request.params.optionName === "colorOverwrites") {
      if (item.options.choroplethType === "numerical") {
        return getMaxItemsNumerical(item.options.numericalOptions);
      } else {
        return getMaxItemsCategorical(item.data);
      }
    }

    if (request.params.optionName === "colorOverwritesItem") {
      if (item.options.choroplethType === "numerical") {
        return getColorOverwriteEnumAndTitlesNumerical(
          item.options.numericalOptions
        );
      } else {
        return getColorOverwriteEnumAndTitlesCategorical(item.data);
      }
    }

    if (request.params.optionName === "predefinedContent") {
      const baseMapEntityCollectionResponse = await request.server.inject({
        method: "GET",
        url: `/entityCollection/${item.baseMap}`,
      });

      if (baseMapEntityCollectionResponse.statusCode === 200) {
        const baseMapEntityCollection = baseMapEntityCollectionResponse.result;
        return getPredefinedContent(
          baseMapEntityCollection,
          item.baseMap,
          item.entityType
        );
      }
    }

    return Boom.badRequest();
  },
};
