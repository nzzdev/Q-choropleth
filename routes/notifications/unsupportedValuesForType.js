const Joi = require("../../helpers/custom-joi.js");
const dataHelpers = require("../../helpers/data.js");

module.exports = {
  method: "POST",
  path: "/notification/unsupportedValuesForType",
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

      if (item.options.choroplethType === "numerical") {
        try {
          const numericalValues = dataHelpers.getNumericalValues(item.data);
        } catch (e) {
          return {
            message: {
              title: "notifications.unsupportedValuesForType.title",
              body: "notifications.unsupportedValuesForType.body",
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
