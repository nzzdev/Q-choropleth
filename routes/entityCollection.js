const Joi = require("@hapi/joi");

module.exports = {
  method: "GET",
  path: "/entityCollection/{baseMap}",
  options: {
    description: "returns entity collection information for base map",
    tags: ["api"],
    validate: {
      params: {
        baseMap: Joi.string().required(),
      },
    },
  },
  handler: async (request, h) => {
    const baseMap = request.params.baseMap;

    if (baseMap.includes("hexagon")) {
      return require(`../geometricBaseMaps/${baseMap}.json`);
    } else if (baseMap.includes("geographic")) {
      return await request.server.methods.getBasemap(baseMap);
    }
    return {};
  },
};
