const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const dataHelpers = require("../helpers/data.js");
const array2d = require("array2d");

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

function getPredefinedContent(baseMap, item) {
  let predefinedContent = [];

  if (item.baseMap.includes("hexagon")) {
    array2d.eachCell(baseMap.entities, (cell) => {
      if (cell !== null) {
        const value = cell[item.entityType];
        predefinedContent.push([{ value: value, readOnly: true }]);
      }
    });
  } else if (item.baseMap.includes("geographic")) {
    predefinedContent = baseMap.entities.objects.features.geometries.map(
      (feature) => {
        return [{ value: feature.properties[item.entityType], readOnly: true }];
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

async function getVersions(document) {
  const versions = document.versions.map((version) => version.validFrom);
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
      item.baseMap !== undefined &&
      item.version !== undefined &&
      item.entityType !== undefined
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
        enum: Object.keys(baseMap.config.entityTypes),
        "Q:options": {
          enum_titles: Object.values(baseMap.config.entityTypes),
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
