const geo = require("d3-geo");
const topojson = require("topojson");

function getGeoParameters(baseMap, width) {
  const featureCollection = getFeatureCollection(baseMap.entities, "features");
  const projection = geo.geoMercator().fitWidth(width, featureCollection);
  const path = geo.geoPath(projection);
  const bounds = path.bounds(featureCollection);
  return { path, bounds, featureCollection };
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
  getGeoParameters,
};
