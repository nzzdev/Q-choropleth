const Boom = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const dataHelpers = require("../../helpers/data.js");
const mappings = require("../../helpers/mappings.js");
const bucketHelpers = require("../../helpers/buckets.js");

const stylesDir = path.join(__dirname, "/../../styles/");
const styleHashMap = require(path.join(stylesDir, "hashMap.json"));
const viewsDir = `${__dirname}/../../views/`;

// setup svelte
require("svelte/register");
const staticTemplate = require(viewsDir + "Choropleth.svelte").default;

// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../resources/", "schema.json"), {
    encoding: "utf-8"
  })
);
const Ajv = require("ajv");
const ajv = new Ajv();

const validate = ajv.compile(schemaString);
function validateAgainstSchema(item, options) {
  if (validate(item)) {
    return item;
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors));
  }
}

async function validatePayload(payload, options, next) {
  if (typeof payload !== "object") {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.item !== "object") {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.toolRuntimeConfig !== "object") {
    return next(Boom.badRequest(), payload);
  }
  await validateAgainstSchema(payload.item, options);
}

function getLegendData(item) {
  const data = item.data;
  const choroplethType = dataHelpers.getChoroplethType(data);
  const legendData = {
    type: choroplethType
  };

  if (choroplethType === "qualitative") {
    const values = data.map(row => {
      return row[1];
    });
    const categoryLabels = [...new Set(values)];
    let categories = [];
    categoryLabels.forEach((label, index) => {
      categories.push({
        label,
        sophieColor: `s-viz-color-${mappings.digitWords[index]}-5` // has to be extended with custom colors
      });
    });
    legendData.categories = categories;
  } else if (choroplethType === "quantitative") {
    const values = dataHelpers.getValues(item.data);
    // most probably empty cells are stored as "" -> add this
    const filteredValues = values.filter(
      value => value !== null && value !== 0
    );
    const minValue = Math.min(...filteredValues);
    const maxValue = Math.max(...filteredValues);

    legendData.hasNullValues =
      values.find(value => value === null) !== undefined;
    legendData.hasZeroValues = values.find(value => value === 0) !== undefined;
    legendData.maxValue = maxValue;
    legendData.minValue = minValue;

    legendData.buckets = bucketHelpers.getBuckets(
      filteredValues,
      item.options.bucketOptions,
      minValue,
      maxValue
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
  method: "POST",
  path: "/rendering-info/web",
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: validatePayload
    }
  },
  handler: async function(request, h) {
    const item = request.payload.item;

    const context = {
      item,
      legendData: getLegendData(item)
    };

    console.log(context.legendData);
    const renderingInfo = {
      polyfills: ["Promise"],
      stylesheets: [
        {
          name: styleHashMap["default"]
        }
      ],
      markup: staticTemplate.render(context).html
    };

    return renderingInfo;
  }
};
