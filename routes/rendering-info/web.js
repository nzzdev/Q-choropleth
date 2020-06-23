const Boom = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const legendHelpers = require("../../helpers/legend.js");
const dataHelpers = require("../../helpers/data.js");

const stylesDir = path.join(__dirname, "/../../styles/");
const styleHashMap = require(path.join(stylesDir, "hashMap.json"));
const viewsDir = `${__dirname}/../../views/`;

const baseMapHelpers = require("../../helpers/baseMap.js");

// setup svelte
require("svelte/register");
const staticTemplate = require(viewsDir + "Choropleth.svelte").default;

// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../resources/", "schema.json"), {
    encoding: "utf-8",
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

module.exports = {
  method: "POST",
  path: "/rendering-info/web",
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: validatePayload,
    },
  },
  handler: async function (request, h) {
    const item = request.payload.item;

    const context = {
      item,
    };

    const baseMapEntityCollectionResponse = await request.server.inject({
      method: "GET",
      url: `/entityCollection/${item.baseMap}`,
    });

    if (baseMapEntityCollectionResponse.statusCode === 200) {
      const baseMapEntityCollection = baseMapEntityCollectionResponse.result;
      if (baseMapEntityCollection.type === "Geometry") {
        context.entityMapping = baseMapHelpers.getGeometryMapping(
          baseMapEntityCollection,
          item.baseMap,
          item.entityType
        );
      }
    }

    if (item.options.choroplethType === "numerical") {
      try {
        context.legendData = legendHelpers.getNumericalLegend(
          item.data,
          item.options.numericalOptions
        );
      } catch (e) {
        throw new Boom.Boom(e);
      }
    } else {
      context.legendData = legendHelpers.getCategoricalLegend(
        item.data,
        item.options.categoricalOptions
      );
    }

    console.log(context.legendData);
    const renderingInfo = {
      polyfills: ["Promise"],
      stylesheets: [
        {
          name: styleHashMap["default"],
        },
      ],
      markup: staticTemplate.render(context).html,
    };

    return renderingInfo;
  },
};
