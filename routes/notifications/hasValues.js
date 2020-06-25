const Joi = require("../../helpers/custom-joi.js");

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
      if (item.data[0].length > 1) {
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
