const Joi = require("joi");
const dataHelpers = require("../../helpers/data.js");

const sequentialScaleMax = 7;
const divergingScaleMax = sequentialScaleMax * 2;

module.exports = {
  method: "POST",
  path: "/notification/numberBucketsOutOfColorScale",
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: Joi.object().required(),
    },
    tags: ["api"],
  },
  handler: function (request, h) {
    try {
      const item = request.payload.item;

      if (item.options.choroplethType === "numerical") {
        const scale = item.options.numericalOptions.scale;

        let numberBuckets = dataHelpers.getNumberBuckets(
          item.options.numericalOptions
        );

        if (scale === "sequential") {
          if (numberBuckets > sequentialScaleMax) {
            return {
              message: {
                title: "notifications.numberBucketsOutOfColorScale.title",
                body: "notifications.numberBucketsOutOfColorScale.body",
              },
            };
          }
        } else {
          const divergingSpecification = scale.split("-");
          const divergingIndex = parseInt(divergingSpecification[1]);

          const numberBucketsLeft = divergingIndex;
          let numberBucketsRight = numberBuckets - divergingIndex;

          if (divergingSpecification[0] === "bucket") {
            numberBucketsRight -= 1;
          }

          const numberBucketsBiggerSide = Math.max(
            numberBucketsLeft,
            numberBucketsRight
          );

          let scaleSize = numberBucketsBiggerSide * 2;
          if (divergingSpecification[0] === "bucket") {
            scaleSize += 1;
          }

          if (scaleSize > divergingScaleMax) {
            return {
              message: {
                title: "notifications.numberBucketsOutOfColorScale.title",
                body: "notifications.numberBucketsOutOfColorScale.body",
              },
            };
          }
        }
      }

      return null;
    } catch (err) {
      return null;
    }
  },
};
