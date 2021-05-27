const Joi = require("joi");
const dataHelpers = require("../../helpers/data.js");

const numberMainColors = require("../../helpers/color").digitWords.length;

module.exports = {
  method: "POST",
  path: "/notification/numberCategoriesOutOfColorScale",
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
      if (item.options.choroplethType === "categorical") {
        // removing the header row first
        item.data = dataHelpers.getDataWithoutHeaderRow(item.data);
        const numberCategories = dataHelpers.getUniqueCategoriesCount(
          item.data
        );

        if (numberCategories > numberMainColors) {
          return {
            message: {
              title: "notifications.numberCategoriesOutOfColorScale.title",
              body: "notifications.numberCategoriesOutOfColorScale.body",
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
