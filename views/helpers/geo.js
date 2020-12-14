const geo = require("d3-geo");
const topojson = require("topojson");

function getGeoParameters(baseMap, width, maxHeight) {
  const features = getFeatureCollection(baseMap.entities, "features");
  const outlines = getFeatureCollection(baseMap.entities, "outlines");
  let projection = geo.geoMercator().fitWidth(width, features);
  let path = geo.geoPath(projection);
  let bounds = path.bounds(features);
  const height = bounds[1][1];

  if (height > maxHeight) {
    projection = geo.geoMercator().fitHeight(maxHeight, features);
    path = geo.geoPath(projection);
    bounds = path.bounds(features);
  }
  return { path, bounds, features, outlines };
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
