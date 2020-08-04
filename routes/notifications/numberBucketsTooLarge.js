const Joi = require("@hapi/joi");
const dataHelpers = require("../../helpers/data.js");

module.exports = {
  method: "POST",
  path: "/notification/numberBucketsTooLarge", // TODO: maybe rename so that there is no confusion with tooManyBuckets notification
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
      // removing the header row first
      item.data = dataHelpers.getDataWithoutHeaderRow(item.data);

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
