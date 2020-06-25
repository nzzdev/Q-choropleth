const Joi = require("../helpers/custom-joi.js");

const geometricBaseMaps = ["hexagonCHCantons"];

// idea for the future with geographical base maps:
// store base maps in database as TopoJSON
// fetch suitable TopoJSON here and transform it
// to collection of features with right projection

module.exports = {
  method: "GET",
  path: "/entityCollection/{baseMap}",
  options: {
    description: "todo: describe",
    tags: ["api"],
    validate: {
      params: {
        baseMap: Joi.string().required(),
      },
    },
  },
  handler: (request, h) => {
    const baseMap = request.params.baseMap;

    if (geometricBaseMaps.includes(baseMap)) {
      return require(`../geometricBaseMaps/${baseMap}.json`);
    }
    return {};
  },
};
