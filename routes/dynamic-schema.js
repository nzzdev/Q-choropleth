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
          "Schema 1 (Standard)",
          "Schema 2 (Standard-Alternative)",
          "Schema 3 (negative Bedeutung)",
          "Schema weiblich",
          "Schema männlich",
        ],
      },
    };
  }
  return {
    enum: ["one", "two", "three", "gender"],
    "Q:options": {
      enum_titles: [
        "Schema 1 (Standard negativ/positiv)",
        "Schema 2 (neutral)",
        "Schema 3 (Alternative negativ/positiv)",
        "Schema weiblich/männlich",
      ],
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
      maxItems: dataHelpers.getUniqueCategoriesCount(data),
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
  const categories = dataHelpers.getUniqueCategoriesObject(data).categories;
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

function getPredefinedContent(baseMapEntityCollection, baseMap, entityType) {
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
    const optionName = request.params.optionName;

    if (optionName === "scale") {
      return getScaleEnumWithTitles(item.options.numericalOptions);
    }

    if (optionName === "colorScheme") {
      return getColorSchemeEnumWithTitles(item.options.numericalOptions.scale);
    }

    if (optionName === "colorOverwrites") {
      if (item.options.choroplethType === "numerical") {
        return getMaxItemsNumerical(item.options.numericalOptions);
      } else {
        return getMaxItemsCategorical(item.data);
      }
    }

    if (optionName === "colorOverwritesItem") {
      if (item.options.choroplethType === "numerical") {
        return getColorOverwriteEnumAndTitlesNumerical(
          item.options.numericalOptions
        );
      } else {
        return getColorOverwriteEnumAndTitlesCategorical(item.data);
      }
    }

    if (optionName === "predefinedContent") {
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

    if (optionName === "entityType") {
      if (item.baseMap === "hexagonCHCantons") {
        return {
          enum: ["bfsNumber", "name", "code"],
          "Q:options": {
            enum_titles: ["BfS Nummer", "Name", "Abkürzung"],
          },
        };
      }

      return {};
    }

    return Boom.badRequest();
  },
};
