const geo = require("d3-geo");
const topojson = require("topojson");

function getGeoParameters(baseMap, width, maxHeight) {
  const featureCollection = getFeatureCollection(baseMap.entities, "features");
  let projection = geo.geoMercator().fitWidth(width, featureCollection);
  let path = geo.geoPath(projection);
  let bounds = path.bounds(featureCollection);
  const height = bounds[1][1];

  if (height > maxHeight) {
    projection = geo.geoMercator().fitHeight(maxHeight, featureCollection);
    path = geo.geoPath(projection);
    bounds = path.bounds(featureCollection);
  }
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
