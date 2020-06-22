const Boom = require("@hapi/boom");
const Joi = require("../helpers/custom-joi.js");
const dataHelpers = require("../helpers/data.js");

function getScaleEnumWithTitles(numericalOptions) {
  let enumValues = ["sequential"];
  let enumTitles = ["Sequentiell"];

  let bucketNumber = 0;
  if (numericalOptions.bucketType === "custom") {
    const buckets = numericalOptions.customBuckets.split(",");
    bucketNumber = buckets.length - 1;
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

    // TODO: remove test baseMap

    if (request.params.optionName === "baseMap") {
      const baseMapEntityCollectionResponse = await request.server.inject({
        method: "GET",
        url: `/entityCollection/${item.baseMap}`,
      });

      if (baseMapEntityCollectionResponse.statusCode === 200) {
        const baseMapEntityCollection = baseMapEntityCollectionResponse.result;

        if (item.baseMap === "hexagonCHCantons") {
          const cantons = baseMapEntityCollection.cantons;
          let predefinedValues;
          if (item.entityType === "name") {
            predefinedValues = cantons
              .sort((cantonA, cantonB) =>
                cantonA.name.localeCompare(cantonB.name)
              )
              .map((canton) => {
                return [canton.name];
              });
          } else if (item.entityType === "bfsNumber") {
            predefinedValues = cantons
              .sort((cantonA, cantonB) => cantonA.id - cantonB.id)
              .map((canton) => {
                return [canton.id];
              });
          }
          return {
            "Q:options": {
              predefinedContent: { values: predefinedValues },
            },
          };
        } else {
          if (item.entityType === "name") {
            return {
              "Q:options": {
                predefinedContent: {
                  values: [["Aeugst am Albis"], ["Affoltern am Albis"]],
                },
              },
            };
          } else {
            return {
              "Q:options": {
                predefinedContent: { values: [[1], [2]] },
              },
            };
          }
        }
      }
    }

    return Boom.badRequest();
  },
};
