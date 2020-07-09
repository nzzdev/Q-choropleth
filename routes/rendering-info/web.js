const Boom = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const legendHelpers = require("../../helpers/legend.js");
const dataHelpers = require("../../helpers/data.js");
const getExactPixelWidth = require("../../helpers/toolRuntimeConfig.js")
  .getExactPixelWidth;
const methodBoxConfig = require("../../helpers/methodBox");

const stylesDir = path.join(__dirname, "/../../styles/");
const styleHashMap = require(path.join(stylesDir, "hashMap.json"));
const scriptsDir = "../../scripts/";
const scriptHashMap = require(`${scriptsDir}/hashMap.json`);
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
const methodBoxTextConfig = require("../../helpers/methodBox");
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
    const toolRuntimeConfig = request.payload.toolRuntimeConfig;

    // TODO: add display options

    // since we do not need header row for further processing we remove it here first
    let data = dataHelpers.getDataWithoutHeaderRow(item.data);

    const context = {
      item,
      id: `q_choropleth_${toolRuntimeConfig.requestId}`,
      displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
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

    const divisor = dataHelpers.getDivisor(data);
    if (divisor > 1) {
      //data = dataHelpers.getDividedData(data, divisor);
      if (item.subtitle && item.subtitle !== "") {
        item.subtitleSuffix = ` (in ${dataHelpers.getDivisorString(divisor)})`;
      } else {
        item.subtitleSuffix = `in ${dataHelpers.getDivisorString(divisor)}`;
      }
    }

    if (item.options.choroplethType === "numerical") {
      try {
        context.legendData = legendHelpers.getNumericalLegend(
          data,
          item.options.numericalOptions
        );
        context.valuesOnMap = !item.options.numericalOptions.noValuesOnMap;
        context.legendData.labelLegend =
          item.options.numericalOptions.labelLegend;
<<<<<<< HEAD

        const methodBoxText =
          methodBoxTextConfig[item.options.numericalOptions.bucketType];
        context.methodBoxText = methodBoxText || "";
=======
>>>>>>> check for floating numbers
      } catch (e) {
        throw new Boom.Boom(e);
      }
    } else {
      context.legendData = legendHelpers.getCategoricalLegend(
        data,
        item.options.categoricalOptions
      );
      context.valuesOnMap = item.options.categoricalOptions.valuesOnMap;
    }

    context.hasFloatingNumbers = dataHelpers.getNumberType(
      context.legendData,
      data
    );

    const exactPixelWidth = getExactPixelWidth(
      request.payload.toolRuntimeConfig
    );
    if (typeof exactPixelWidth === "number") {
      context.contentWidth = exactPixelWidth;
    } else {
      context.contentWidth = 600;
    } // add script here to meassure

    context.methodBoxArticle = process.env.METHOD_BOX_ARTICLE
      ? JSON.parse(process.env.METHOD_BOX_ARTICLE)
      : null;

    const renderingInfo = {
      polyfills: ["Promise", "Element.prototype.classList", "CustomEvent"],
      stylesheets: [
        {
          name: styleHashMap["default"],
        },
      ],
      scripts: [
        {
          name: scriptHashMap["default"],
        },
        {
          content: `
          new window._q_choropleth.Choropleth(document.querySelector('#${
            context.id
          }_container'), ${JSON.stringify({
            qId: context.item.id,
            requestId: context.id,
            choroplethType: context.item.options.choroplethType,
          })})`,
        },
      ],
      markup: staticTemplate.render(context).html,
    };

    return renderingInfo;
  },
};
