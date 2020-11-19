const Joi = require("@hapi/joi");
const baseMapHelpers = require("../helpers/baseMap.js");

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
      return await baseMapHelpers.getBasemap(baseMap);
    }
    return {};
  },
};
