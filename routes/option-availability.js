const Boom = require("@hapi/boom");
const Joi = require("../helpers/custom-joi.js");
const getChoroplethType = require("../helpers/data.js").getChoroplethType;

function isQuantitative(data) {
  return getChoroplethType(data) === "numerical";
}

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
    if (request.params.optionName === "hasBuckets") {
      return {
        available: isQuantitative(item.data),
      };
    }
    if (request.params.optionName === "customBuckets") {
      return {
        available: hasCustomBuckets(item.options.bucketOptions.bucketType),
      };
    }
    if (request.params.optionName === "numberBuckets") {
      return {
        available: !hasCustomBuckets(item.options.bucketOptions.bucketType),
      };
    }

    if (request.params.optionName === "customColors") {
      return {
        available:
          !isQuantitative(item.data) ||
          item.options.bucketOptions.scale === "sequential",
      };
    }
    return Boom.badRequest();
  },
};
