const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const dataHelpers = require("../helpers/data.js");
const baseMapHelpers = require("../helpers/baseMap.js");
const { getGeodataEntry } = require("../helpers/baseMap.js");

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

function getFeatureNames(baseMapEntityCollection, entityType) {
  const features = baseMapEntityCollection.features.objects.features.geometries;
  if (entityType === "name") {
    return features
      .sort((featureA, featureB) =>
        featureA.properties.name.localeCompare(featureB.properties.name)
      )
      .map((feature) => {
        return [{ value: feature.properties.name, readOnly: true }];
      });
  } else if (entityType === "id") {
    return features
      .sort(
        (featureA, featureB) => featureA.properties.id - featureB.properties.id
      )
      .map((feature) => {
        return [{ value: feature.properties.id, readOnly: true }];
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
  } else if (baseMap.includes("geographic")) {
    const predefinedContent = getFeatureNames(
      baseMapEntityCollection,
      entityType
    );
    return {
      "Q:options": {
        predefinedContent: {
          allowOverwrites: false,
          data: [["ID", "Wert"]].concat(predefinedContent),
        },
      },
    };
  }
}

async function getVersion(baseMap) {
  const geoDataEntry = await getGeodataEntry(baseMap);
  const versions = geoDataEntry.versions.map((version) => version.validFrom);
  const versionTitles = versions.map((version) =>
    new Date(version).getFullYear()
  );

  return {
    enum: versions,
    "Q:options": {
      enum_titles: versionTitles,
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

    if (
      optionName === "predefinedContent" &&
      item.baseMap &&
      item.version &&
      item.entityType
    ) {
      const baseMapEntityCollection = await request.server.methods.getBasemap(
        item.baseMap,
        item.version
      );

      if (baseMapEntityCollection) {
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
      } else if (item.baseMap === "geographicDELandkreise") {
        return {
          enum: ["id", "name"],
          "Q:options": {
            enum_titles: ["AGS Nummer", "Name"],
          },
        };
      }

      return {};
    }

    if (optionName === "version") {
      return await getVersion(item.baseMap);
    }

    return Boom.badRequest();
  },
};
