const Joi = require("../../helpers/custom-joi.js");
const dataHelpers = require("../../helpers/data.js");

module.exports = {
  method: "POST",
  path: "/notification/numberBucketsTooLarge",
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: Joi.object().required(),
    },
    cors: true,
    tags: ["api"],
  },
  handler: function (request, h) {
    try {
      const item = request.payload.item;

      if (
        item.options.choroplethType === "numerical" &&
        item.options.numericalOptions.bucketType !== "custom"
      ) {
        const numberUniqueValues = dataHelpers.getUniqueCategories(item.data);
        const numberBuckets = item.options.numericalOptions.numberBuckets;

        if (numberBuckets > numberUniqueValues.length) {
          return {
            message: {
              title: "notifications.numberBucketsTooLarge.title",
              body: "notifications.numberBucketsTooLarge.body",
            },
          };
        }
      }
      return null;
    } catch (err) {
      return null;
    }
  },
};
