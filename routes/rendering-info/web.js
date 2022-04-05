const Boom = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");

const legendHelpers = require("../../helpers/legend.js");
const dataHelpers = require("../../helpers/data.js");
const methodBoxHelpers = require("../../helpers/methodBox");

const getExactPixelWidth = require("../../helpers/toolRuntimeConfig.js").getExactPixelWidth;
const getScript = require("../../helpers/renderingInfoScript.js").getScript;

const stylesDir = path.join(__dirname, "/../../styles/");
const styleHashMap = require(path.join(stylesDir, "hashMap.json"));
const scriptsDir = "../../scripts/";
const scriptHashMap = require(`${scriptsDir}/hashMap.json`);
const viewsDir = `${__dirname}/../../views/`;

// setup svelte
require("svelte/register");
const staticTemplate = require(viewsDir + "App.svelte").default;

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
      const toolRuntimeConfig = request.payload.toolRuntimeConfig;

      // since we do not need header row for further processing we remove it here first
      item.data = dataHelpers.getDataWithoutHeaderRow(item.data);

      // basic context information
      const context = {
        id: `q_choropleth_${toolRuntimeConfig.requestId}`,
        displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
      };
      context.isStatic = toolRuntimeConfig.noInteraction;

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
      context.showBubbleMap = item.baseMap.includes("world-countries-geographic") && !item.options.hideBubbleMap;

      const exactPixelWidth = getExactPixelWidth(
        request.payload.toolRuntimeConfig
      );

      // if we have the exact pixel width we add it to context
      // if not the client side script will handle client side measuring
      if (typeof exactPixelWidth === "number") {
        context.contentWidth = exactPixelWidth;
      }

      const baseMapUrl = `${toolRuntimeConfig.toolBaseUrl}/basemap/${item.baseMap}?version=${item.version}`;
      const staticTemplateRender = staticTemplate.render(context);
      const renderingInfo = {
        polyfills: [
          "fetch",
          "Promise",
          "Element.prototype.classList",
          "CustomEvent",
        ],
        stylesheets: [
          {
            content: staticTemplateRender.css.code,
          },
          {
            name: styleHashMap["default"],
          },
        ],
        scripts: [
          {
            name: scriptHashMap["default"],
          },
          {
            content: UglifyJS.minify(
              getScript(
                context.id,
                baseMapUrl,
                context,
              )
            ).code,
          },
        ],
        markup: staticTemplateRender.html,
      };

      return renderingInfo;
    } catch (e) {
      throw new Boom.Boom(e);
    }
  },
};
