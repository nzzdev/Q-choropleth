const Joi = require("joi");
const dataHelpers = require("../../helpers/data.js");

module.exports = {
  method: "POST",
  path: "/notification/predefinedContent",
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
      // removing the header row first
      item.data = dataHelpers.getDataWithoutHeaderRow(item.data);

      const values = item.data
        .filter((row) => row[1] !== null && row[1] !== undefined)
        .map((row) => {
          return row[1];
        });
      if (values.length === 0) {
        return {
          message: {
            title: "notifications.predefinedContent.title",
            body: "notifications.predefinedContent.body",
          },
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  },
};
