const Joi = require("joi");
const dataHelpers = require("../../helpers/data.js");

module.exports = {
  method: "POST",
  path: "/notification/moreThanTwoColumns",
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

      if (item.data[0] && item.data[0].length > 2) {
        return {
          message: {
            title: "notifications.moreThanTwoColumns.title",
            body: "notifications.moreThanTwoColumns.body",
          },
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  },
};
