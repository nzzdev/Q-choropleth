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
    if (request.params.optionName === "isNumerical") {
      return {
        available: item.options.choroplethType === "numerical",
      };
    }
    if (request.params.optionName === "isCategorical") {
      return {
        available: item.options.choroplethType === "categorical",
      };
    }
    if (request.params.optionName === "customBuckets") {
      return {
        available: hasCustomBuckets(item.options.numericalOptions.bucketType),
      };
    }
    if (request.params.optionName === "numberBuckets") {
      return {
        available: !hasCustomBuckets(item.options.numericalOptions.bucketType),
      };
    }

    if (request.params.optionName === "customColors") {
      return {
        available: item.options.numericalOptions.scale === "sequential",
      };
    }
    return Boom.badRequest();
  },
};
