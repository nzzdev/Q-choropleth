const Joi = require("../../helpers/custom-joi.js");

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
    cors: true,
    tags: ["api"],
  },
  handler: function (request, h) {
    try {
      const item = request.payload.item;
      const data = item.data.splice(1); // exclude header row
      const values = data
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
