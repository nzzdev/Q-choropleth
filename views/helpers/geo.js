const geo = require("d3-geo");
const topojson = require("topojson");

function fitProjection(width, featureCollection) {
  const projection = geo.geoMercator().fitWidth(width, featureCollection);
  const path = geo.geoPath(projection);
  const height = Math.ceil(path.bounds(featureCollection)[1][1]);
  return { path, height };
}

function getFeatureCollection(topojsonObject, objectName) {
  if (topojsonObject && topojsonObject.objects[objectName]) {
    return topojson.feature(topojsonObject, topojsonObject.objects[objectName]);
  }
  return makeFeatureCollection([]);
}

function makeFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features,
  };
}

module.exports = {
  fitProjection,
  getFeatureCollection,
};
