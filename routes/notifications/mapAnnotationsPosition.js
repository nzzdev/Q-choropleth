const Joi = require("joi");

module.exports = {
  method: "POST",
  path: "/notification/mapAnnotationsPosition",
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
      if (item.mapAnnotations.length > 0) {
        return {
          message: {
            title: "notifications.mapAnnotationsPosition.title",
            body: "notifications.mapAnnotationsPosition.body",
          },
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  },
};
