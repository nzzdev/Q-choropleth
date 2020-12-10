const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");

function hasCustomBuckets(bucketType) {
  return bucketType === "custom";
}

module.exports = {
  method: "POST",
  path: "/option-availability/{optionName}",
  options: {
    validate: {
      payload: Joi.object(),
    },
    cors: true,
  },
  handler: function (request, h) {
    const item = request.payload.item;
    const optionName = request.params.optionName;

    if (optionName === "isNumerical") {
      return {
        available: item.options.choroplethType === "numerical",
      };
    }
    if (optionName === "isCategorical") {
      return {
        available: item.options.choroplethType === "categorical",
      };
    }
    if (optionName === "customBuckets") {
      return {
        available: hasCustomBuckets(item.options.numericalOptions.bucketType),
      };
    }
    if (optionName === "numberBuckets") {
      return {
        available: !hasCustomBuckets(item.options.numericalOptions.bucketType),
      };
    }

    if (optionName === "customColors") {
      return {
        available: item.options.numericalOptions.scale === "sequential",
      };
    }

    if (optionName === "noValuesOnMap" || optionName === "valuesOnMap") {
      return {
        available: item.baseMap.includes("hexagon"),
      };
    }

    return Boom.badRequest();
  },
};
