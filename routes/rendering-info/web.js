const Boom = require("@hapi/boom");
const fs = require("fs");
const path = require("path");

const legendHelpers = require("../../helpers/legend.js");
const dataHelpers = require("../../helpers/data.js");
const methodBoxHelpers = require("../../helpers/methodBox");

const getExactPixelWidth = require("../../helpers/toolRuntimeConfig.js")
  .getExactPixelWidth;

const stylesDir = path.join(__dirname, "/../../styles/");
const styleHashMap = require(path.join(stylesDir, "hashMap.json"));
const scriptsDir = "../../scripts/";
const scriptHashMap = require(`${scriptsDir}/hashMap.json`);
const viewsDir = `${__dirname}/../../views/`;

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
    try {
      const item = request.payload.item;

      // we need a copy of the unchanged item to hand it over to client side script
      // in case no width is given we call rendering info route again with this item
      // and client side measured width of container
      const originalItem = { ...item };
      const toolRuntimeConfig = request.payload.toolRuntimeConfig;

      // since we do not need header row for further processing we remove it here first
      item.data = dataHelpers.getDataWithoutHeaderRow(item.data);

      // basic context information
      const context = {
        id: `q_choropleth_${toolRuntimeConfig.requestId}`,
        displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
      };
      context.baseMap = await request.server.methods.getBasemap(
        item.baseMap,
        item.version
      );

      if (item.options.choroplethType === "numerical") {
        const divisor = dataHelpers.getDivisor(item.data);
        if (divisor > 1) {
          item.data = dataHelpers.getDividedData(item.data, divisor);
          item.subtitleSuffix = dataHelpers.getSubtitleSuffix(
            divisor,
            item.subtitle
          );
        }

        context.formattingOptions = {
          maxDigitsAfterComma: dataHelpers.getMaxDigitsAfterCommaInData(
            item.data
          ),
          roundingBucketBorders:
            item.options.numericalOptions.bucketType !== "custom"
              ? true
              : false,
        };

        context.legendData = legendHelpers.getNumericalLegend(
          item.data,
          item.options.numericalOptions,
          context.formattingOptions.maxDigitsAfterComma
        );

        context.valuesOnMap = !item.options.numericalOptions.noValuesOnMap;
        context.isStatic = toolRuntimeConfig.noInteraction;
        context.methodBox = methodBoxHelpers.getMethodBoxInfo(
          item.options.numericalOptions.bucketType
        );
      } else {
        context.legendData = legendHelpers.getCategoricalLegend(
          item.data,
          item.options.categoricalOptions
        );
        context.valuesOnMap = item.options.categoricalOptions.valuesOnMap;
      }

      context.item = item;

      const exactPixelWidth = getExactPixelWidth(
        request.payload.toolRuntimeConfig
      );

      // if we have the exact pixel width we add it to context
      // if not the client side script will handle client side measuring
      if (typeof exactPixelWidth === "number") {
        context.contentWidth = exactPixelWidth;
      }

      const renderingInfo = {
        polyfills: ["Promise", "Element.prototype.classList", "CustomEvent"],
        stylesheets: [
          {
            name: styleHashMap["default"],
          },
        ],
        markup: staticTemplate.render(context).html,
      };

      renderingInfo.scripts = [];

      // if the graphic will be deployed static, as in screenshot or Q-to-print, no scripts shall be loaded
      if (!toolRuntimeConfig.isStatic) {
        renderingInfo.scripts.push(
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
              width: context.contentWidth,
              item: originalItem,
              toolRuntimeConfig: toolRuntimeConfig,
            })})`,
          }
        );
      }

      return renderingInfo;
    } catch (e) {
      throw new Boom.Boom(e);
    }
  },
};
