const Joi = require("@hapi/joi");

module.exports = {
  method: "POST",
  path: "/notification/hasValues",
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

      const values = item.data
        .filter((row) => row[1] !== null && row[1] !== undefined)
        .map((row) => {
          return row[1];
        });
      if (values.length > 0) {
        return {
          message: {
            title: "notifications.hasValues.title",
            body: "notifications.hasValues.body",
          },
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  },
};
