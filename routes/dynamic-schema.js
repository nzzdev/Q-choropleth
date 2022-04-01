const Boom = require("@hapi/boom");
const Joi = require("joi");
const dataHelpers = require("../helpers/data.js");
const array2d = require("array2d");
const d3 = require("d3-time-format");
const formatDate = d3.timeFormat("%d.%m.%Y");

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
    // removing the header row first
    data = dataHelpers.getDataWithoutHeaderRow(data);

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

function getColorOverwriteEnumAndTitlesCategorical(
  data,
  customCategoriesOrder
) {
  data = dataHelpers.getDataWithoutHeaderRow(data);
  let enumValues = [null];
  const categories = dataHelpers.getUniqueCategoriesObject(
    data,
    customCategoriesOrder
  ).categories;
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

function getCustomCategoriesOrderEnumAndTitlesCategorical(data) {
  try {
    // removing the header row first
    data = dataHelpers.getDataWithoutHeaderRow(data);
    const categories = dataHelpers.getUniqueCategoriesObject(data).categories;

    return {
      enum: categories,
      "Q:options": {
        enum_titles: categories,
      },
    };
  } catch {
    return {};
  }
}

function getPredefinedContent(baseMap, item) {
  let predefinedContent = [];

  if (item.baseMap.includes("hexagon")) {
    array2d.eachCell(baseMap.data.entities, (cell) => {
      if (cell !== null) {
        let value;
        if (item.entityType !== undefined) {
          value = cell[item.entityType];
        } else {
          value = cell[baseMap.data.config.defaultEntityType];
        }
        predefinedContent.push([{ value: value, readOnly: true }]);
      }
    });
  } else if (item.baseMap.includes("geographic")) {
    predefinedContent = filterFeaturesByStatus(baseMap.data.entities.objects.features.geometries).map(feature => {
        let value;
        if (item.entityType !== "") {
          value = feature.properties[item.entityType];
        } else {
          value = feature.properties[baseMap.data.config.defaultEntityType];
        }
        return [{ value: value, readOnly: true }];
      }
    );
  }
  predefinedContent.sort((a, b) => {
    let valueA = a[0].value;
    let valueB = b[0].value;

    if (!isNaN(parseInt(valueA)) && !isNaN(parseInt(valueB))) {
      valueA = parseInt(valueA);
      valueB = parseInt(valueB);
      return valueA - valueB;
    } else if (typeof valueA === "string" && typeof valueB === "string") {
      return valueA.localeCompare(valueB);
    }
  });

  return {
    "Q:options": {
      predefinedContent: {
        allowOverwrites: false,
        data: [["ID", "Wert"]].concat(predefinedContent),
      },
    },
  };
}

function getAnnotationRegions(baseMap, item) {
  try {
    let dropDownItems = [];

    if (item.baseMap.includes("hexagon")) {
      array2d.eachCell(baseMap.data.entities, (cell) => {
        if (cell !== null) {
          dropDownItems.push({
            value: cell[baseMap.data.config.displayEntityType],
            title: cell[baseMap.data.config.defaultEntityType],
          });
        }
      });
    } else if (item.baseMap.includes("geographic")) {
      filterFeaturesByStatus(baseMap.data.entities.objects.features.geometries).forEach((feature) => {
        let value;
        if (item.entityType !== "") {
          value = feature.properties[item.entityType];
        } else {
          value = feature.properties[baseMap.data.config.defaultEntityType];
        }
        dropDownItems.push({
          value: value,
          title: feature.properties["name"],
        });
      });
    }

    // Sort titles from a-z
    dropDownItems.sort(function (a, b) {
      return ("" + a.title).localeCompare(b.title);
    });

    return {
      enum: Object.values(dropDownItems).map((item) => item.value),
      "Q:options": {
        enum_titles: Object.values(dropDownItems).map((item) => item.title),
      },
    };
  } catch {
    return {};
  }
}

function filterFeaturesByStatus(features, status = "accepted") {
  if (!features) return [];
  return features.filter((feature) => {
    if (feature.properties.status && feature.properties.status === status) return true;
    return false;
  });
}

async function getVersions(document) {
  const versions = document.versions.map((version) => version.validFrom);
  const versionTitles = versions.map((version) =>
    formatDate(new Date(version))
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
  },
  handler: async function (request, h) {
    const item = request.payload.item;
    const roles = request.payload.roles;
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
        return getColorOverwriteEnumAndTitlesCategorical(
          item.data,
          item.options.categoricalOptions.customCategoriesOrder
        );
      }
    }

    if (optionName === "customCategoriesOrder") {
      return getMaxItemsCategorical(item.data);
    }

    if (optionName === "customCategoriesOrderItem") {
      return getCustomCategoriesOrderEnumAndTitlesCategorical(item.data);
    }

    if (
      optionName === "annotationRegions" &&
      item.baseMap !== undefined &&
      item.version !== undefined
    ) {
      const baseMap = await request.server.methods.getBasemap(
        item.baseMap,
        item.version
      );

      if (baseMap) {
        return getAnnotationRegions(baseMap, item);
      }
    }

    if (
      optionName === "predefinedContent" &&
      item.baseMap !== undefined &&
      item.version !== undefined
    ) {
      const baseMap = await request.server.methods.getBasemap(
        item.baseMap,
        item.version
      );

      if (baseMap) {
        return getPredefinedContent(baseMap, item);
      }
    }

    if (
      optionName === "entityType" &&
      item.baseMap !== undefined &&
      item.version !== undefined
    ) {
      const baseMap = await request.server.methods.getBasemap(
        item.baseMap,
        item.version
      );

      return {
        default: baseMap.data.config.defaultEntityType,
        enum: Object.keys(baseMap.data.config.entityTypes),
        "Q:options": {
          enum_titles: Object.values(baseMap.data.config.entityTypes),
        },
      };
    }

    if (optionName === "version") {
      const document = await request.server.methods.getDocument(item.baseMap);

      return await getVersions(document);
    }

    if (optionName === "baseMap") {
      const documents = await request.server.methods.getAllDocuments();
      return {
        enum: documents.map((document) => document.doc._id),
        "Q:options": {
          enum_titles: documents.map((document) => document.doc.title),
        },
      };
    }

    return Boom.badRequest();
  },
};
