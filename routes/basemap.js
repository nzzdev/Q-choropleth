const Joi = require("joi");

module.exports = {
  path: "/basemap/{id}",
  method: "GET",
  options: {
    description: "Returns basemap for given id and version",
    tags: ["api"],
    validate: {
      params: {
        id: Joi.string().required(),
      },
      query: {
        version: Joi.string().required(),
        isWide: Joi.boolean().required(),
      },
    },
  },
  handler: async (request, h) => {
    const basemap = await request.server.methods.getBasemap(
      request.params.id,
      request.query.version,
      request.query.isWide,
    );
    return h
      .response(basemap)
      .type("application/json")
      .header("cache-control", `max-age=${60 * 60 * 24 * 7}, immutable`); // 1 week
  },
};
